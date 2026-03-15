# Upwork Manual-Assist Helper (No Auto-Bidding)

Script: `scripts/upwork_assist.py`

What it does:
- Searches Upwork for jobs (query/skills/budget filters)
- Generates concise proposal drafts with OpenAI
- Outputs to console and optional webhook (Slack/Teams/email)
- **Never auto-submits on Upwork**

Env vars (required):
- `UPWORK_TOKEN` – Upwork OAuth bearer token from your app
- `OPENAI_API_KEY` – OpenAI key

Env vars (optional):
- `NOTIFY_WEBHOOK` – Slack/Teams/email webhook to receive drafts
- `UPWORK_QUERY` – override search query (default: `python developer`)
- `UPWORK_SKILLS` – comma list of skills to match (default: `python,fastapi`)
- `UPWORK_MIN_BUDGET` – minimum budget to keep (default: `200`)
- `UPWORK_MAX_RESULTS` – number of jobs to fetch (default: `20`)
- `UPWORK_FILTERS` – JSON passed directly to Upwork search (e.g. `{"category2":"IT & Networking","job_type":"fixed","budget":"100-500"}`)

Run locally:
```bash
cd /mnt/e/VSCode/HomeBase\ 2.0
UPWORK_TOKEN=xxx OPENAI_API_KEY=xxx python scripts/upwork_assist.py
```

Compliance:
- Keeps a human in the loop; you manually submit proposals.
- Includes polite pacing (sleep between proposals). Adjust if needed.
