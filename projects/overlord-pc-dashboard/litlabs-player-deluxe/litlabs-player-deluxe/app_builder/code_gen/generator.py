"""
Code Generation Engine
Transforms parsed NLP output into functional application code
"""

from pathlib import Path
from typing import Optional

from app_builder.schema.models import (
    Project,
    ProjectConfig,
    ProjectStatus,
    FrameworkType,
    BackendType,
    DatabaseType,
    ModelSchema,
    PageSchema,
    EndpointSchema,
    HTTPMethod,
    ComponentLibrary,
)
from app_builder.nlp.engine import ParsedRequest


class FrontendGenerator:
    """Generate frontend code (React/Next.js)"""

    def generate_package_json(self, config: ProjectConfig) -> str:
        """Generate package.json"""
        return f"""{"name": "{config.name.lower().replace(" ", "-")}","version": "1.0.0","type": "module","scripts": {"dev": "vite","build": "tsc && vite build","preview": "vite preview"},"dependencies": {"react": "^18.2.0","react-dom": "^18.2.0","react-router-dom": "^6.20.0","axios": "^1.6.0","lucide-react": "^0.294.0"},"devDependencies": {"@types/react": "^18.2.37","@types/react-dom": "^18.2.15","@vitejs/plugin-react": "^4.2.0","autoprefixer": "^10.4.16","postcss": "^8.4.32","tailwindcss": "^3.3.6","typescript": "^5.2.2","vite": "^5.0.0"}}"""

    def generate_vite_config(self) -> str:
        return """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
"""

    def generate_tsconfig(self) -> str:
        return """{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
"""

    def generate_index_html(self, title: str = "App") -> str:
        return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"""

    def generate_main_tsx(self) -> str:
        return """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"""

    def generate_app_tsx(self, pages: list[PageSchema]) -> str:
        routes = []
        for page in pages:
            routes.append(f"  {{ path: '{page.route}', element: <{page.name} /> }}")

        return f"""import React from 'react'
import {{ BrowserRouter, Routes, Route }} from 'react-router-dom'

function App() {{
  return (
    <BrowserRouter>
      <Routes>
        {chr(10).join(routes)}
      </Routes>
    </BrowserRouter>
  )
}}

export default App
"""

    def generate_index_css(self) -> str:
        return """@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, sans-serif;
}

body {{
  margin: 0;
  min-height: 100vh;
}}
"""

    def generate_tailwind_config(self) -> str:
        return """/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
"""

    def generate_page_component(self, page: PageSchema) -> str:
        return f"""import React from 'react'

export function {page.name}() {{
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
      </div>
    </div>
  )
}}

export default {page.name}
"""


class BackendGenerator:
    """Generate backend code (Node.js/Express)"""

    def generate_package_json(self, config: ProjectConfig) -> str:
        return f"""{{
  "name": "{config.name.lower().replace(' ', '-')}-backend",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {{
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }},
  "dependencies": {{
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "pg": "^8.11.3"
  }},
  "devDependencies": {{
    "nodemon": "^3.0.2"
  }}
}}"""

    def generate_index_js(self, routes: list[str] = None) -> str:
        routes_usage = ""
        if routes:
            routes_usage = "\n".join(
                [f"app.use('/api/{r}', require('./routes/{r}'))" for r in routes]
            )

        return f"""const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

{routes_usage}

app.get('/api/health', (req, res) => {{
  res.json({{ status: 'ok', timestamp: new Date().toISOString() }})
}})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server on port ${{PORT}}`))
"""

    def generate_model_js(self, model: ModelSchema) -> str:
        fields = []
        for field in model.fields:
            if field.name != "id":
                fields.append(
                    f"  {field.name}: {{ type: DataTypes.{field.type.upper()} }}"
                )

        return f"""const {{ DataTypes }} = require('sequelize')
const {{ sequelize }} = require('../config/database')

const {model.name} = sequelize.define('{model.name}', {{
{chr(10).join(fields)}
}}, {{ tableName: '{model.name.lower()}s', timestamps: true }})

module.exports = {model.name}
"""

    def generate_controller_js(self, model_name: str) -> str:
        model = model_name.lower()
        return f"""const {model_name} = require('../models/{model_name}')

exports.getAll = async (req, res) => {{
  const items = await {model_name}.findAll()
  res.json(items)
}}

exports.getById = async (req, res) => {{
  const item = await {model_name}.findByPk(req.params.id)
  if (!item) return res.status(404).json({{ error: 'Not found' }})
  res.json(item)
}}

exports.create = async (req, res) => {{
  const item = await {model_name}.create(req.body)
  res.status(201).json(item)
}}

exports.update = async (req, res) => {{
  await {model_name}.update(req.body, {{ where: {{ id: req.params.id }} }})
  const item = await {model_name}.findByPk(req.params.id)
  res.json(item)
}}

exports.delete = async (req, res) => {{
  await {model_name}.destroy({{ where: {{ id: req.params.id }} }})
  res.status(204).send()
}}
"""

    def generate_route_js(self, model_name: str) -> str:
        return f"""const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/{model_name}Controller')

router.get('/', ctrl.getAll)
router.get('/:id', ctrl.getById)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.delete)

module.exports = router
"""

    def generate_env_example(self) -> str:
        return """PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=change-me
"""


class DatabaseGenerator:
    """Generate database schemas"""

    def generate_sql(self, models: list[ModelSchema]) -> str:
        statements = ["-- Auto-generated schema", ""]
        for model in models:
            statements.append(model.to_sql())
            statements.append("")
        return "\n".join(statements)

    def generate_prisma_schema(
        self, models: list[ModelSchema], database: DatabaseType
    ) -> str:
        lines = [
            'generator client { provider = "prisma-client-js" }',
            "",
            f"datasource db {{",
            f'  provider = "{database.value}"',
            '  url      = env("DATABASE_URL")',
            "}",
            "",
        ]

        for model in models:
            lines.append(f"model {model.name} {{")
            lines.append("  id Int @id @default(autoincrement())")

            for field in model.fields:
                if field.name == "id":
                    continue

                type_mapping = {
                    "string": "String",
                    "text": "String",
                    "integer": "Int",
                    "boolean": "Boolean",
                    "timestamp": "DateTime",
                    "decimal": "Float",
                }

                prisma_type = type_mapping.get(field.type.lower(), "String")
                if field.unique:
                    prisma_type += " @unique"
                if not field.required:
                    prisma_type += "?"

                lines.append(f"  {field.name} {prisma_type}")

            lines.append("}")
            lines.append("")

        return "\n".join(lines)


class CodeGenerator:
    """Main code generation coordinator"""

    def __init__(self):
        self.frontend = FrontendGenerator()
        self.backend = BackendGenerator()
        self.database = DatabaseGenerator()

    async def generate(self, parsed: ParsedRequest) -> dict:
        """Generate complete application code"""
        config = self._create_config(parsed)

        project = Project(
            name=self._extract_project_name(parsed.raw_input),
            config=config,
            status=ProjectStatus.GENERATING,
        )

        project.models = self._generate_models(parsed)
        project.pages = self._generate_pages(parsed)
        project.endpoints = self._generate_endpoints(parsed)

        code = {
            "frontend": self._generate_frontend_code(project),
            "backend": self._generate_backend_code(project),
            "database": self._generate_database_code(project),
        }

        project.generated_code = code
        project.status = ProjectStatus.COMPLETED

        return code

    def _create_config(self, parsed: ParsedRequest) -> ProjectConfig:
        frontend = FrameworkType.REACT
        if parsed.entities.frameworks:
            fw = parsed.entities.frameworks[0].lower()
            if fw == "vue":
                frontend = FrameworkType.VUE
            elif fw == "angular":
                frontend = FrameworkType.ANGULAR
            elif fw == "next.js":
                frontend = FrameworkType.NEXT_JS

        backend = BackendType.NODE_EXPRESS
        if parsed.entities.backend:
            be = parsed.entities.backend.lower()
            if be == "django":
                backend = BackendType.DJANGO
            elif be == "flask":
                backend = BackendType.FLASK
            elif be == "fastapi":
                backend = BackendType.FASTAPI

        database = DatabaseType.POSTGRESQL
        if parsed.entities.database:
            db = parsed.entities.database.lower()
            if db == "mysql":
                database = DatabaseType.MYSQL
            elif db == "mongodb":
                database = DatabaseType.MONGODB
            elif db == "sqlite":
                database = DatabaseType.SQLITE

        return ProjectConfig(
            name=self._extract_project_name(parsed.raw_input),
            frontend_framework=frontend,
            backend_framework=backend,
            database=database,
        )

    def _extract_project_name(self, text: str) -> str:
        import re

        patterns = [
            r"(?:create|build|make|develop)\s+(?:a\s+)?(.+?)(?:\s+app|\s+application|$)",
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                name = re.sub(r"[^\w\s-]", "", name)
                return name.title()

        return "MyApp"

    def _generate_models(self, parsed: ParsedRequest) -> list[ModelSchema]:
        models = []
        for model_name in parsed.entities.data_models:
            model = ComponentLibrary.create_model_from_template(model_name)
            if model:
                models.append(model)

        if "authentication" in parsed.entities.features:
            user_model = ComponentLibrary.create_model_from_template("user")
            if user_model and user_model.name not in [m.name for m in models]:
                models.append(user_model)

        return models

    def _generate_pages(self, parsed: ParsedRequest) -> list[PageSchema]:
        pages = []
        pages.append(PageSchema(name="Home", route="/", title="Home"))

        for page_name in parsed.entities.page_names:
            pages.append(
                PageSchema(
                    name=page_name.title(),
                    route=f"/{page_name.lower()}",
                    title=page_name.title(),
                )
            )

        if "authentication" in parsed.entities.features:
            pages.append(PageSchema(name="Login", route="/login", title="Login"))

        return pages

    def _generate_endpoints(self, parsed: ParsedRequest):
        endpoints = []
        for model_name in parsed.entities.data_models:
            base = model_name.lower()
            endpoints.extend(
                [
                    EndpointSchema(
                        path=f"/{base}", method=HTTPMethod.GET, model=model_name
                    ),
                    EndpointSchema(
                        path=f"/{base}", method=HTTPMethod.POST, model=model_name
                    ),
                    EndpointSchema(
                        path=f"/{base}/{{id}}", method=HTTPMethod.PUT, model=model_name
                    ),
                    EndpointSchema(
                        path=f"/{base}/{{id}}",
                        method=HTTPMethod.DELETE,
                        model=model_name,
                    ),
                ]
            )
        return endpoints

    def _generate_frontend_code(self, project: Project) -> dict:
        code = {}
        code["package.json"] = self.frontend.generate_package_json(project.config)
        code["vite.config.ts"] = self.frontend.generate_vite_config()
        code["tsconfig.json"] = self.frontend.generate_tsconfig()
        code["index.html"] = self.frontend.generate_index_html(project.name)
        code["tailwind.config.js"] = self.frontend.generate_tailwind_config()
        code["src/main.tsx"] = self.frontend.generate_main_tsx()
        code["src/index.css"] = self.frontend.generate_index_css()
        code["src/App.tsx"] = self.frontend.generate_app_tsx(project.pages)

        for page in project.pages:
            code[f"src/pages/{page.name}.tsx"] = self.frontend.generate_page_component(
                page
            )

        return code

    def _generate_backend_code(self, project: Project) -> dict:
        code = {}
        code["package.json"] = self.backend.generate_package_json(project.config)
        code[".env.example"] = self.backend.generate_env_example()

        routes = [m.name.lower() for m in project.models]
        code["src/index.js"] = self.backend.generate_index_js(routes)

        for model in project.models:
            code[f"src/models/{model.name}.js"] = self.backend.generate_model_js(model)
            code[f"src/controllers/{model.name}Controller.js"] = (
                self.backend.generate_controller_js(model.name)
            )
            code[f"src/routes/{model.name.lower()}Routes.js"] = (
                self.backend.generate_route_js(model.name)
            )

        return code

    def _generate_database_code(self, project: Project) -> dict:
        code = {}
        if project.config.database == DatabaseType.POSTGRESQL:
            code["schema.sql"] = self.database.generate_sql(project.models)
        code["prisma/schema.prisma"] = self.database.generate_prisma_schema(
            project.models, project.config.database
        )
        return code


def create_code_generator() -> CodeGenerator:
    return CodeGenerator()
