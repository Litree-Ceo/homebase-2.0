"""
Natural Language Processing Engine for App Builder
Handles intent recognition and entity extraction from user input
"""

import re
from enum import Enum
from typing import Optional
from pydantic import BaseModel
from dataclasses import dataclass, field


class Intent(str, Enum):
    """Recognized intents for application development"""

    CREATE_APP = "create_app"
    ADD_FEATURE = "add_feature"
    MODIFY_UI = "modify_ui"
    ADD_API = "add_api"
    ADD_DATABASE = "add_database"
    DEBUG = "debug"
    EXPLAIN = "explain"
    DEPLOY = "deploy"
    ADD_AUTH = "add_auth"
    ADD_CRUD = "add_crud"
    ADD_FORM = "add_form"
    ADD_DASHBOARD = "add_dashboard"
    UNKNOWN = "unknown"


class Framework(str, Enum):
    """Supported frontend frameworks"""

    REACT = "react"
    VUE = "vue"
    ANGULAR = "angular"
    NEXT_JS = "next.js"
    SVELTE = "svelte"
    VANILLA = "vanilla"


class BackendFramework(str, Enum):
    """Supported backend frameworks"""

    NODE_EXPRESS = "node-express"
    DJANGO = "django"
    FLASK = "flask"
    FASTAPI = "fastapi"
    GO = "go"
    SPRING = "spring"


class DatabaseType(str, Enum):
    """Supported databases"""

    POSTGRESQL = "postgresql"
    MYSQL = "mysql"
    MONGODB = "mongodb"
    SQLITE = "sqlite"
    REDIS = "redis"


class Feature(str, Enum):
    """Recognized features"""

    AUTHENTICATION = "authentication"
    USER_AUTH = "user_auth"
    OAUTH = "oauth"
    JWT = "jwt"
    CRUD = "crud"
    API = "api"
    REST_API = "rest_api"
    WEBSOCKET = "websocket"
    REAL_TIME = "real_time"
    FILE_UPLOAD = "file_upload"
    EMAIL = "email"
    PAGINATION = "pagination"
    SEARCH = "search"
    FILTERING = "filtering"
    SORTING = "sorting"
    PAGINATION_UI = "pagination_ui"
    CHARTS = "charts"
    DASHBOARD = "dashboard"
    ADMIN_PANEL = "admin_panel"
    USER_ROLES = "user_roles"
    PERMISSIONS = "permissions"


@dataclass
class ExtractedEntities:
    """Extracted entities from user input"""

    frameworks: list[str] = field(default_factory=list)
    backend: Optional[str] = None
    database: Optional[str] = None
    features: list[str] = field(default_factory=list)
    data_models: list[str] = field(default_factory=list)
    ui_components: list[str] = field(default_factory=list)
    page_names: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "frameworks": self.frameworks,
            "backend": self.backend,
            "database": self.database,
            "features": self.features,
            "data_models": self.data_models,
            "ui_components": self.ui_components,
            "page_names": self.page_names,
        }


@dataclass
class ParsedRequest:
    """Complete parsed user request"""

    intent: Intent
    entities: ExtractedEntities
    raw_input: str
    confidence: float = 0.0

    def to_dict(self) -> dict:
        return {
            "intent": self.intent.value,
            "entities": self.entities.to_dict(),
            "raw_input": self.raw_input,
            "confidence": self.confidence,
        }


# Pattern-based keyword matching
INTENT_PATTERNS = {
    Intent.CREATE_APP: [
        r"create\s+(?:a\s+)?(.+\s+)?app",
        r"build\s+(?:a\s+)?(.+\s+)?app",
        r"make\s+(?:a\s+)?(.+\s+)?app",
        r"develop\s+(?:a\s+)?(.+\s+)?app",
        r"new\s+project",
        r"start\s+(?:a\s+)?new\s+app",
    ],
    Intent.ADD_FEATURE: [
        r"add\s+.+feature",
        r"add\s+.+to\s+the\s+app",
        r"implement\s+.+feature",
        r"include\s+.+feature",
    ],
    Intent.MODIFY_UI: [
        r"change\s+.+ui",
        r"modify\s+.+interface",
        r"update\s+.+design",
        r"redesign",
        r"improve\s+.+ui",
        r"make\s+.+look",
    ],
    Intent.ADD_API: [
        r"add\s+api",
        r"create\s+api",
        r"build\s+api",
        r"add\s+endpoints?",
    ],
    Intent.ADD_DATABASE: [
        r"add\s+database",
        r"connect\s+to\s+database",
        r"add\s+data\s+model",
        r"create\s+schema",
    ],
    Intent.DEBUG: [r"fix\s+.+bug", r"debug", r"error", r"not\s+working", r"issue"],
    Intent.EXPLAIN: [r"explain", r"how\s+does", r"what\s+does", r"tell\s+me\s+about"],
    Intent.ADD_AUTH: [
        r"add\s+auth",
        r"user\s+auth",
        r"login",
        r"signup",
        r"register",
        r"password",
    ],
    Intent.ADD_CRUD: [
        r"crud",
        r"create.*read.*update.*delete",
        r"manage\s+data",
        r"add.*edit.*delete",
    ],
    Intent.ADD_DASHBOARD: [r"dashboard", r"admin\s+panel", r"analytics", r"charts?"],
}

FRAMEWORK_PATTERNS = {
    "react": [r"react", r"react\.js"],
    "vue": [r"\bvue\b", r"vue\.js"],
    "angular": [r"angular"],
    "next.js": [r"next\.?js", r"nextjs"],
    "svelte": [r"svelte"],
    "vanilla": [r"vanilla\s*(?:js|javascript)"],
}

BACKEND_PATTERNS = {
    "node-express": [r"node\.?js", r"express", r"node"],
    "django": [r"django"],
    "flask": [r"flask"],
    "fastapi": [r"fastapi"],
    "go": [r"\bgo\b", r"\bgolang\b"],
    "spring": [r"spring"],
}

DATABASE_PATTERNS = {
    "postgresql": [r"postgresql", r"postgres"],
    "mysql": [r"mysql"],
    "mongodb": [r"mongodb", r"mongo"],
    "sqlite": [r"sqlite"],
    "redis": [r"redis"],
}

FEATURE_PATTERNS = {
    "authentication": [r"auth", r"authentication", r"login", r"signup"],
    "oauth": [r"oauth", r"google\s+login", r"facebook\s+login"],
    "jwt": [r"jwt", r"token\s+auth"],
    "crud": [r"crud", r"create.*read.*update.*delete"],
    "rest_api": [r"rest\s*api", r"api\s+endpoint"],
    "websocket": [r"websocket", r"real[\s-]?time"],
    "file_upload": [r"file\s*upload", r"upload"],
    "email": [r"email", r"mail"],
    "pagination": [r"pagination", r"paginate"],
    "search": [r"search"],
    "filtering": [r"filter"],
    "charts": [r"chart", r"graph", r"analytics"],
    "dashboard": [r"dashboard"],
    "admin_panel": [r"admin", r"admin\s*panel"],
    "user_roles": [r"user\s*role", r"roles?"],
    "permissions": [r"permission", r"authorization"],
}

UI_COMPONENT_PATTERNS = {
    "navigation": [r"navigation", r"nav", r"navbar", r"menu"],
    "sidebar": [r"sidebar", r"side\s*bar"],
    "header": [r"header"],
    "footer": [r"footer"],
    "cards": [r"card"],
    "tables": [r"table", r"data\s*table"],
    "forms": [r"form", r"input", r"field"],
    "modals": [r"modal", r"popup", r"dialog"],
    "buttons": [r"button"],
    "dropdowns": [r"dropdown", r"select"],
    "tabs": [r"tab"],
}

DATA_MODEL_PATTERNS = {
    "user": [r"\buser\b", r"users?", r"account"],
    "product": [r"product", r"items?"],
    "order": [r"order", r"purchase"],
    "task": [r"task", r"todo"],
    "post": [r"post", r"article", r"blog"],
    "comment": [r"comment"],
    "category": [r"category", r"tag"],
    "message": [r"message", r"chat"],
    "notification": [r"notification"],
    "profile": [r"profile"],
}


class NLPEngine:
    """Core NLP processing engine"""

    def __init__(self, llm_client=None):
        self.llm_client = llm_client
        self._compile_patterns()

    def _compile_patterns(self):
        """Pre-compile all regex patterns for performance"""
        self._intent_patterns = {
            intent: [re.compile(p, re.IGNORECASE) for p in patterns]
            for intent, patterns in INTENT_PATTERNS.items()
        }
        self._framework_patterns = {
            k: [re.compile(p, re.IGNORECASE) for p in patterns]
            for k, patterns in FRAMEWORK_PATTERNS.items()
        }
        self._backend_patterns = {
            k: [re.compile(p, re.IGNORECASE) for p in patterns]
            for k, patterns in BACKEND_PATTERNS.items()
        }
        self._database_patterns = {
            k: [re.compile(p, re.IGNORECASE) for p in patterns]
            for k, patterns in DATABASE_PATTERNS.items()
        }
        self._feature_patterns = {
            k: [re.compile(p, re.IGNORECASE) for p in patterns]
            for k, patterns in FEATURE_PATTERNS.items()
        }
        self._ui_patterns = {
            k: [re.compile(p, re.IGNORECASE) for p in patterns]
            for k, patterns in UI_COMPONENT_PATTERNS.items()
        }
        self._model_patterns = {
            k: [re.compile(p, re.IGNORECASE) for p in patterns]
            for k, patterns in DATA_MODEL_PATTERNS.items()
        }

    def recognize_intent(self, text: str) -> tuple[Intent, float]:
        """Recognize the primary intent from text"""
        best_intent = Intent.UNKNOWN
        best_score = 0.0

        for intent, patterns in self._intent_patterns.items():
            for pattern in patterns:
                if pattern.search(text):
                    # Calculate confidence based on pattern specificity
                    score = 1.0 - (len(patterns) * 0.05)
                    if score > best_score:
                        best_score = score
                        best_intent = intent

        return best_intent, best_score

    def extract_entities(self, text: str) -> ExtractedEntities:
        """Extract all entities from text"""
        entities = ExtractedEntities()

        # Extract frameworks
        for fw, patterns in self._framework_patterns.items():
            for pattern in patterns:
                if pattern.search(text) and fw not in entities.frameworks:
                    entities.frameworks.append(fw)

        # Extract backend
        for backend, patterns in self._backend_patterns.items():
            for pattern in patterns:
                if pattern.search(text):
                    entities.backend = backend
                    break

        # Extract database
        for db, patterns in self._database_patterns.items():
            for pattern in patterns:
                if pattern.search(text):
                    entities.database = db
                    break

        # Extract features
        for feature, patterns in self._feature_patterns.items():
            for pattern in patterns:
                if pattern.search(text):
                    if feature not in entities.features:
                        entities.features.append(feature)

        # Extract UI components
        for ui, patterns in self._ui_patterns.items():
            for pattern in patterns:
                if pattern.search(text):
                    if ui not in entities.ui_components:
                        entities.ui_components.append(ui)

        # Extract data models
        for model, patterns in self._model_patterns.items():
            for pattern in patterns:
                if pattern.search(text):
                    if model not in entities.data_models:
                        entities.data_models.append(model)

        # Extract page names (e.g., "home page", "dashboard page")
        page_pattern = re.compile(r"(\w+)\s+page", re.IGNORECASE)
        for match in page_pattern.finditer(text):
            page_name = match.group(1)
            if page_name not in entities.page_names:
                entities.page_names.append(page_name)

        return entities

    async def parse(self, text: str) -> ParsedRequest:
        """Parse user input and return structured request"""
        intent, confidence = self.recognize_intent(text)
        entities = self.extract_entities(text)

        # Use LLM for better parsing if available
        if self.llm_client and confidence < 0.8:
            try:
                llm_result = await self._llm_parse(text)
                if llm_result:
                    intent = llm_result.get("intent", intent)
                    entities = llm_result.get("entities", entities)
                    confidence = max(confidence, 0.85)
            except Exception:
                pass  # Fall back to pattern matching

        return ParsedRequest(
            intent=intent, entities=entities, raw_input=text, confidence=confidence
        )

    async def _llm_parse(self, text: str) -> Optional[dict]:
        """Use LLM for advanced parsing"""
        if not self.llm_client:
            return None

        prompt = f"""Parse this application development request and extract:
1. Intent (create_app, add_feature, modify_ui, add_api, add_database, debug, explain, deploy, add_auth, add_crud, add_form, add_dashboard)
2. Entities: frameworks, backend, database, features, data_models, ui_components, page_names

Request: "{text}"

Return as JSON with keys: intent, entities (object with arrays for each type)"""

        response = await self.llm_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
        )

        import json

        try:
            result = json.loads(response.choices[0].message.content)
            return result
        except:
            return None


# Factory function to create NLP engine
def create_nlp_engine(llm_client=None) -> NLPEngine:
    """Create and configure NLP engine"""
    return NLPEngine(llm_client=llm_client)
