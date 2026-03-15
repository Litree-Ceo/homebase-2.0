"""
Manual-assist Upwork helper:
- Searches jobs via Upwork API
- Generates tailored proposal drafts with OpenAI
- Sends drafts to your console (and optional webhook) for human submission

Compliance: does NOT auto-submit on Upwork.
"""

from __future__ import annotations

import json
import logging
import os
import time
from dataclasses import dataclass, field
from typing import Iterable, List, Optional

import requests
from openai import OpenAI

# ---- Configurable defaults ---- #
DEFAULT_QUERY = "python developer"           # Upwork search query
DEFAULT_SKILLS = {"python", "fastapi"}       # Only keep jobs that mention any of these skills
MIN_BUDGET = 200                             # Skip gigs below this budget
MAX_RESULTS = 20                             # How many jobs to fetch per run
MAX_SNIPPET_LEN = 2000                       # Truncate long descriptions
PAUSE_SECONDS = 1.5                          # Delay between proposal generations

# Optional Slack/Teams webhook for notifications
NOTIFY_WEBHOOK = os.getenv("NOTIFY_WEBHOOK")

# Required: Upwork OAuth bearer token and OpenAI API key
UPWORK_TOKEN = os.getenv("UPWORK_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

UPWORK_SEARCH_URL = "https://www.upwork.com/api/v3/jobs/search"

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")


@dataclass
class Job:
    title: str
    snippet: str
    budget: Optional[float]
    skills: List[str] = field(default_factory=list)
    url: Optional[str] = None


def require_env() -> None:
    missing = [name for name, val in {"UPWORK_TOKEN": UPWORK_TOKEN, "OPENAI_API_KEY": OPENAI_API_KEY}.items() if not val]
    if missing:
        raise SystemExit(f"Missing required env vars: {', '.join(missing)}")


def parse_filters_from_env() -> dict:
    """
    Optional raw filters passed straight to Upwork search.
    Example env: UPWORK_FILTERS='{"category2":"Web Development","job_type":"fixed","duration":"ongoing"}'
    """
    raw = os.getenv("UPWORK_FILTERS")
    if not raw:
        return {}
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        logging.warning("Failed to parse UPWORK_FILTERS JSON; ignoring.")
    return {}


def search_jobs(query: str, skills: Iterable[str], min_budget: int, limit: int, extra_filters: Optional[dict] = None) -> List[Job]:
    headers = {"Authorization": f"Bearer {UPWORK_TOKEN}"}
    params = {"q": query, "paging": f"0;{limit}"}
    if extra_filters:
        params.update(extra_filters)
    resp = requests.get(UPWORK_SEARCH_URL, headers=headers, params=params, timeout=15)
    resp.raise_for_status()
    raw_jobs = resp.json().get("jobs", [])

    skill_set = set(s.lower() for s in skills)
    filtered: List[Job] = []

    for job in raw_jobs:
        budget = job.get("budget") or 0
        job_skills = [s.lower() for s in job.get("skills", [])]
        if budget < min_budget:
            continue
        if skill_set and not (skill_set.intersection(job_skills)):
            continue

        snippet = (job.get("snippet") or "").strip()
        if len(snippet) > MAX_SNIPPET_LEN:
            snippet = snippet[:MAX_SNIPPET_LEN] + "..."

        filtered.append(
            Job(
                title=job.get("title") or "Untitled",
                snippet=snippet,
                budget=budget,
                skills=job_skills,
                url=job.get("url"),
            )
        )

    return filtered


def generate_proposal(job: Job, client: OpenAI) -> str:
    prompt = f"""
You are an Upwork freelancer writing a concise, human proposal (manual submission only).
- Job title: {job.title}
- Budget: {job.budget}
- Description: {job.snippet}
Constraints:
- 110-140 words
- 3 bullets: outcome + approach + timeline
- 1 proof point from prior similar work (generic but credible)
- 1 clarifying question
- Close with a short CTA
Tone: confident, pragmatic, not salesy.
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )
    return resp.choices[0].message.content.strip()


def notify(job: Job, proposal: str) -> None:
    message = f"Job: {job.title}\nBudget: {job.budget}\nURL: {job.url or 'n/a'}\n\nProposal draft:\n{proposal}\n{'-'*60}"
    logging.info(message)
    if NOTIFY_WEBHOOK:
        try:
            requests.post(NOTIFY_WEBHOOK, json={"text": message}, timeout=10)
        except Exception as exc:  # noqa: BLE001
            logging.warning("Webhook notify failed: %s", exc)


def main() -> None:
    require_env()
    client = OpenAI(api_key=OPENAI_API_KEY)

    extra_filters = parse_filters_from_env()

    jobs = search_jobs(
        query=os.getenv("UPWORK_QUERY", DEFAULT_QUERY),
        skills=os.getenv("UPWORK_SKILLS", ",".join(DEFAULT_SKILLS)).split(","),
        min_budget=int(os.getenv("UPWORK_MIN_BUDGET", MIN_BUDGET)),
        limit=int(os.getenv("UPWORK_MAX_RESULTS", MAX_RESULTS)),
        extra_filters=extra_filters,
    )

    if not jobs:
        logging.info("No jobs found matching filters.")
        return

    for job in jobs:
        try:
            proposal = generate_proposal(job, client)
            notify(job, proposal)
            time.sleep(PAUSE_SECONDS)
        except Exception as exc:  # noqa: BLE001
            logging.error("Error processing job '%s': %s", job.title, exc)


if __name__ == "__main__":
    main()
