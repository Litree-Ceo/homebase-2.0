"""
Application Schema and Component Library
Defines the internal representation of application components
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID, uuid4


class ProjectStatus(str, Enum):
    """Project generation status"""

    DRAFT = "draft"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"
    DEPLOYED = "deployed"


class FrameworkType(str, Enum):
    """Frontend framework types"""

    REACT = "react"
    VUE = "vue"
    ANGULAR = "angular"
    NEXT_JS = "next.js"
    SVELTE = "svelte"


class BackendType(str, Enum):
    """Backend framework types"""

    NODE_EXPRESS = "node-express"
    DJANGO = "django"
    FLASK = "flask"
    FASTAPI = "fastapi"
    GO = "go"


class DatabaseType(str, Enum):
    """Database types"""

    POSTGRESQL = "postgresql"
    MYSQL = "mysql"
    MONGODB = "mongodb"
    SQLITE = "sqlite"


# ============ Data Models ============


class FieldSchema(BaseModel):
    """Database field definition"""

    name: str
    type: str = "string"
    required: bool = True
    unique: bool = False
    default: Optional[str] = None
    description: Optional[str] = None
    foreign_key: Optional[str] = None
    ref_model: Optional[str] = None


class ModelSchema(BaseModel):
    """Database model/schema definition"""

    name: str
    fields: list[FieldSchema] = Field(default_factory=list)
    description: Optional[str] = None

    def to_sql(self) -> str:
        """Generate SQL CREATE TABLE statement"""
        lines = [f"CREATE TABLE {self.name} ("]
        field_defs = []
        for field in self.fields:
            f_def = f"  {field.name} {field.type.upper()}"
            if not field.required:
                f_def += " NULL"
            else:
                f_def += " NOT NULL"
            if field.unique:
                f_def += " UNIQUE"
            if field.default:
                f_def += f" DEFAULT {field.default}"
            if field.foreign_key:
                f_def += f" REFERENCES {field.foreign_key}"
            field_defs.append(f_def)

        # Add primary key
        field_defs.append("  id SERIAL PRIMARY KEY")

        lines.append(",\n".join(field_defs))
        lines.append(");")
        return "\n".join(lines)


# ============ Component Models ============


class ComponentType(str, Enum):
    """Component types"""

    PAGE = "page"
    LAYOUT = "layout"
    FORM = "form"
    TABLE = "table"
    CARD = "card"
    BUTTON = "button"
    INPUT = "input"
    MODAL = "modal"
    CHART = "chart"
    NAVIGATION = "navigation"
    AUTH = "auth"
    API_CLIENT = "api_client"


class ComponentSchema(BaseModel):
    """Component definition"""

    name: str
    type: ComponentType
    props: dict = Field(default_factory=dict)
    children: list[str] = Field(default_factory=list)
    imports: list[str] = Field(default_factory=list)
    code: Optional[str] = None


class PageSchema(BaseModel):
    """Page definition"""

    name: str
    route: str
    title: str
    components: list[str] = Field(default_factory=list)
    api_endpoints: list[str] = Field(default_factory=list)
    requires_auth: bool = False


# ============ API Models ============


class HTTPMethod(str, Enum):
    """HTTP methods"""

    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"


class EndpointSchema(BaseModel):
    """API endpoint definition"""

    path: str
    method: HTTPMethod = HTTPMethod.GET
    model: str
    operations: list[str] = ["read"]  # create, read, update, delete
    auth_required: bool = False
    description: Optional[str] = None


# ============ Project Model ============


class ProjectConfig(BaseModel):
    """Project configuration"""

    name: str
    description: Optional[str] = None
    frontend_framework: FrameworkType = FrameworkType.REACT
    backend_framework: BackendType = BackendType.NODE_EXPRESS
    database: Optional[DatabaseType] = DatabaseType.POSTGRESQL
    ui_library: str = "tailwindcss"  # tailwindcss, material-ui, bootstrap
    state_management: str = "zustand"  # redux, zustand, context
    package_manager: str = "npm"


class Project(BaseModel):
    """Complete project definition"""

    id: UUID = Field(default_factory=uuid4)
    name: str
    description: Optional[str] = None
    config: ProjectConfig
    pages: list[PageSchema] = Field(default_factory=list)
    components: list[ComponentSchema] = Field(default_factory=list)
    models: list[ModelSchema] = Field(default_factory=list)
    endpoints: list[EndpointSchema] = Field(default_factory=list)
    status: ProjectStatus = ProjectStatus.DRAFT
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    generated_code: dict = Field(default_factory=dict)


# ============ Social Media Models ============


class PostType(str, Enum):
    """Types of posts in the social network"""

    APP = "app"
    VISUALIZER = "visualizer"
    TEXT = "text"
    CODE = "code"


class SocialPost(BaseModel):
    """A post in the social network"""

    id: UUID = Field(default_factory=uuid4)
    project_id: Optional[UUID] = None  # Link to the generated app
    author_name: str
    title: str
    content: str  # Markdown or description
    post_type: PostType = PostType.APP
    code_snapshot: Optional[dict] = None  # The runnable code at time of posting
    likes: int = 0
    tags: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PostComment(BaseModel):
    """Comment on a social post"""

    id: UUID = Field(default_factory=uuid4)
    post_id: UUID
    author_name: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============ Component Library ============


class ComponentLibrary:
    """Library of pre-built reusable components"""

    # Pre-built authentication components
    AUTH_COMPONENTS = {
        "login_form": {
            "type": ComponentType.FORM,
            "template": "auth/login_form.tsx",
            "props": {
                "fields": ["email", "password"],
                "providers": ["email", "google", "github"],
            },
        },
        "signup_form": {
            "type": ComponentType.FORM,
            "template": "auth/signup_form.tsx",
            "props": {"fields": ["name", "email", "password", "confirmPassword"]},
        },
        "auth_provider": {
            "type": ComponentType.AUTH,
            "template": "auth/provider.tsx",
            "props": {"provider": "jwt"},
        },
    }

    # Pre-built CRUD components
    CRUD_COMPONENTS = {
        "data_table": {
            "type": ComponentType.TABLE,
            "template": "crud/table.tsx",
            "props": {
                "columns": [],
                "sortable": True,
                "filterable": True,
                "pagination": True,
            },
        },
        "data_form": {
            "type": ComponentType.FORM,
            "template": "crud/form.tsx",
            "props": {"fields": []},
        },
        "crud_client": {
            "type": ComponentType.API_CLIENT,
            "template": "crud/client.ts",
            "props": {},
        },
    }

    # Pre-built UI components
    UI_COMPONENTS = {
        "navbar": {
            "type": ComponentType.NAVIGATION,
            "template": "ui/navbar.tsx",
            "props": {"links": [], "userMenu": True},
        },
        "sidebar": {
            "type": ComponentType.NAVIGATION,
            "template": "ui/sidebar.tsx",
            "props": {"items": []},
        },
        "card": {"type": ComponentType.CARD, "template": "ui/card.tsx", "props": {}},
        "button": {
            "type": ComponentType.BUTTON,
            "template": "ui/button.tsx",
            "props": {"variants": ["primary", "secondary", "danger"]},
        },
        "modal": {"type": ComponentType.MODAL, "template": "ui/modal.tsx", "props": {}},
        "chart": {
            "type": ComponentType.CHART,
            "template": "ui/chart.tsx",
            "props": {"types": ["line", "bar", "pie"]},
        },
    }

    # Data model templates
    MODEL_TEMPLATES = {
        "user": {
            "name": "User",
            "fields": [
                FieldSchema(name="email", type="string", required=True, unique=True),
                FieldSchema(name="password", type="string", required=True),
                FieldSchema(name="name", type="string", required=True),
                FieldSchema(name="avatar", type="string"),
                FieldSchema(name="role", type="string", default="'user'"),
                FieldSchema(name="created_at", type="timestamp", default="NOW()"),
            ],
        },
        "product": {
            "name": "Product",
            "fields": [
                FieldSchema(name="name", type="string", required=True),
                FieldSchema(name="description", type="text"),
                FieldSchema(name="price", type="decimal", required=True),
                FieldSchema(name="stock", type="integer", default="0"),
                FieldSchema(
                    name="category_id", type="integer", foreign_key="categories"
                ),
                FieldSchema(name="image_url", type="string"),
                FieldSchema(name="created_at", type="timestamp", default="NOW()"),
            ],
        },
        "order": {
            "name": "Order",
            "fields": [
                FieldSchema(
                    name="user_id", type="integer", required=True, foreign_key="users"
                ),
                FieldSchema(name="status", type="string", default="'pending'"),
                FieldSchema(name="total", type="decimal", required=True),
                FieldSchema(name="shipping_address", type="text"),
                FieldSchema(name="created_at", type="timestamp", default="NOW()"),
            ],
        },
        "task": {
            "name": "Task",
            "fields": [
                FieldSchema(name="title", type="string", required=True),
                FieldSchema(name="description", type="text"),
                FieldSchema(name="status", type="string", default="'todo'"),
                FieldSchema(name="priority", type="string", default="'medium'"),
                FieldSchema(name="due_date", type="timestamp"),
                FieldSchema(name="user_id", type="integer", foreign_key="users"),
                FieldSchema(name="created_at", type="timestamp", default="NOW()"),
            ],
        },
        "post": {
            "name": "Post",
            "fields": [
                FieldSchema(name="title", type="string", required=True),
                FieldSchema(name="content", type="text", required=True),
                FieldSchema(name="slug", type="string", unique=True),
                FieldSchema(name="published", type="boolean", default="false"),
                FieldSchema(name="author_id", type="integer", foreign_key="users"),
                FieldSchema(name="created_at", type="timestamp", default="NOW()"),
            ],
        },
    }

    @classmethod
    def get_component(cls, name: str) -> Optional[dict]:
        """Get component by name"""
        # Check all component categories
        all_components = {
            **cls.AUTH_COMPONENTS,
            **cls.CRUD_COMPONENTS,
            **cls.UI_COMPONENTS,
        }
        return all_components.get(name)

    @classmethod
    def get_model_template(cls, name: str) -> Optional[dict]:
        """Get data model template by name"""
        return cls.MODEL_TEMPLATES.get(name)

    @classmethod
    def create_model_from_template(cls, template_name: str) -> Optional[ModelSchema]:
        """Create a model schema from a template"""
        template = cls.get_model_template(template_name)
        if not template:
            return None

        return ModelSchema(
            name=template["name"],
            fields=[FieldSchema(**f) for f in template["fields"]],
            description=f"Auto-generated {template_name} model",
        )
