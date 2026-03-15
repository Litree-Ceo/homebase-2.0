# Overlord PC Dashboard - Development Handbook

> **Version:** 1.0.0  
> **Last Updated:** 2026-03-06  

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure & Architecture](#project-structure--architecture)
3. [Frontend Development](#frontend-development)
4. [Backend Development](#backend-development)
5. [Database Development](#database-development)
6. [API Development](#api-development)
7. [Testing Strategy](#testing-strategy)
8. [Code Quality & Standards](#code-quality--standards)
9. [Development Workflow](#development-workflow)
10. [Debugging & Troubleshooting](#debugging--troubleshooting)

---

## 1. Development Environment Setup

### 1.1 Prerequisites

#### System Requirements
- **OS:** Windows 10/11, macOS 10.15+, Ubuntu 20.04+
- **RAM:** 8GB minimum, 16GB recommended
- **Storage:** 10GB free space
- **CPU:** 4 cores minimum, 8 cores recommended

#### Required Software
```bash
# Node.js (LTS version)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python (3.9+)
sudo apt-get install python3.9 python3.9-venv

# Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Git
# (usually pre-installed)
git --version
```

### 1.2 Environment Setup

#### Clone the Repository
```bash
git clone https://github.com/your-org/overlord-pc-dashboard.git
cd overlord-pc-dashboard
```

#### Create Virtual Environments
```bash
# Python virtual environment
python3.9 -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Node.js environment
npm ci
```

#### Environment Configuration
```bash
# Copy environment templates
cp .env.example .env
cp config.yaml.example config.yaml

# Edit configuration files
nano .env
nano config.yaml
```

---

## 2. Project Structure & Architecture

### 2.1 Directory Structure

```
overlord-pc-dashboard/
├── handbook/                    # Documentation
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API services
│   │   ├── utils/            # Utility functions
│   │   └── types/            # TypeScript definitions
│   ├── public/               # Static assets
│   ├── tests/                # Frontend tests
│   └── package.json          # Frontend dependencies
├── backend/                    # Python backend
│   ├── src/
│   │   ├── services/         # Business logic
│   │   ├── models/           # Database models
│   │   ├── api/              # API endpoints
│   │   ├── utils/            # Utility functions
│   │   └── config/           # Configuration
│   ├── tests/                # Backend tests
│   ├── requirements.txt      # Python dependencies
│   └── pyproject.toml        # Python project config
├── shared/                     # Shared code
│   ├── types/                # Shared TypeScript types
│   └── utils/                # Shared utilities
├── docs/                       # Additional documentation
├── scripts/                    # Development scripts
├── tests/                      # Integration tests
├── docker/                     # Docker configurations
└── config/                     # Configuration files
```

### 2.2 Architecture Overview

#### Layered Architecture
```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[React Components]
        Mobile[Mobile App]
    end
    
    subgraph "Application Layer"
        API[REST API]
        WS[WebSocket Service]
    end
    
    subgraph "Business Layer"
        Services[Business Services]
        Auth[Authentication]
        Cache[Cache Service]
    end
    
    subgraph "Data Layer"
        DB[PostgreSQL]
        Redis[Redis Cache]
        Storage[File Storage]
    end
    
    UI --> API
    Mobile --> API
    API --> Services
    Services --> Auth
    Services --> Cache
    Services --> DB
    Services --> Redis
    Services --> Storage
```

---

## 3. Frontend Development

### 3.1 Technology Stack

#### Core Technologies
- **Framework:** React 18 with TypeScript
- **State Management:** Redux Toolkit with RTK Query
- **Styling:** Tailwind CSS with custom design system
- **Routing:** React Router v6
- **Build Tool:** Vite

#### Development Tools
- **Linting:** ESLint with TypeScript rules
- **Formatting:** Prettier
- **Testing:** Jest + React Testing Library
- **Type Checking:** TypeScript strict mode

### 3.2 Component Development

#### Component Structure
```typescript
// src/components/ExampleComponent.tsx
import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ExampleComponentProps {
  title: string;
  items: string[];
  onAction: (item: string) => void;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  items,
  onAction,
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    onAction(item);
  };

  return (
    <Card className="w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item}>
            <Button
              onClick={() => handleItemClick(item)}
              className={cn(
                'w-full justify-start text-left',
                selectedItem === item && 'bg-blue-50'
              )}
            >
              {item}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
};
```

#### Custom Hooks
```typescript
// src/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export const useSystems = () => {
  return useQuery({
    queryKey: ['systems'],
    queryFn: () => apiClient.get('/systems'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateSystem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.put(`/systems/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systems'] });
    },
  });
};
```

### 3.3 Styling Guidelines

#### Tailwind CSS Usage
```typescript
// Good: Using Tailwind classes
const StyledComponent = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h1 className="text-xl font-bold mb-4">Title</h1>
    <p className="text-gray-600">Content</p>
  </div>
);

// Avoid: Inline styles
const BadComponent = () => (
  <div style={{ backgroundColor: 'white', padding: '1.5rem' }}>
    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Title</h1>
  </div>
);
```

#### Design System
```typescript
// src/components/ui/button.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
```

---

## 4. Backend Development

### 4.1 Technology Stack

#### Core Technologies
- **Language:** Python 3.9+
- **Framework:** FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Async:** asyncio with async/await

#### Development Tools
- **Linting:** pylint + black
- **Formatting:** black
- **Testing:** pytest + pytest-asyncio
- **Type Checking:** mypy

### 4.2 API Development

#### FastAPI Endpoint
```python
# src/api/systems.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import System
from schemas import SystemCreate, SystemResponse
from services import system_service

router = APIRouter(prefix="/systems", tags=["systems"])

@router.get("/", response_model=List[SystemResponse])
def get_systems(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    systems = system_service.get_systems(db, skip=skip, limit=limit)
    return systems

@router.post("/", response_model=SystemResponse)
def create_system(
    system: SystemCreate,
    db: Session = Depends(get_db),
):
    db_system = system_service.create_system(db, system)
    return db_system

@router.get("/{system_id}", response_model=SystemResponse)
def get_system(system_id: str, db: Session = Depends(get_db)):
    db_system = system_service.get_system(db, system_id)
    if db_system is None:
        raise HTTPException(status_code=404, detail="System not found")
    return db_system
```

#### Database Models
```python
# models.py
from sqlalchemy import Column, String, Integer, DateTime, JSON, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class System(Base):
    __tablename__ = "systems"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    status = Column(String, default="offline")
    last_seen = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # JSON field for flexible data
    metadata = Column(JSON)

class Metric(Base):
    __tablename__ = "metrics"
    
    id = Column(String, primary_key=True, index=True)
    system_id = Column(String, index=True)
    metric_type = Column(String, index=True)
    value = Column(JSON)
    timestamp = Column(DateTime(timezone=True), index=True)
    
    __table_args__ = (
        Index('idx_metrics_system_time', 'system_id', 'timestamp'),
    )
```

### 4.3 Service Layer

#### Business Logic
```python
# services/system_service.py
from typing import List, Optional
from sqlalchemy.orm import Session

from models import System, Metric
from schemas import SystemCreate, SystemUpdate

class SystemService:
    @staticmethod
    def get_systems(db: Session, skip: int = 0, limit: int = 100) -> List[System]:
        return db.query(System).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_system(db: Session, system_id: str) -> Optional[System]:
        return db.query(System).filter(System.id == system_id).first()
    
    @staticmethod
    def create_system(db: Session, system: SystemCreate) -> System:
        db_system = System(**system.dict())
        db.add(db_system)
        db.commit()
        db.refresh(db_system)
        return db_system
    
    @staticmethod
    def update_system(
        db: Session, system_id: str, system_update: SystemUpdate
    ) -> Optional[System]:
        db_system = db.query(System).filter(System.id == system_id).first()
        if db_system is None:
            return None
        
        update_data = system_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_system, key, value)
        
        db.commit()
        db.refresh(db_system)
        return db_system
    
    @staticmethod
    def delete_system(db: Session, system_id: str) -> bool:
        db_system = db.query(System).filter(System.id == system_id).first()
        if db_system is None:
            return False
        
        db.delete(db_system)
        db.commit()
        return True
```

---

## 5. Database Development

### 5.1 Database Schema

#### Migration Files
```sql
-- migrations/001_create_systems_table.sql
CREATE TABLE systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    
    CONSTRAINT systems_name_type_unique UNIQUE (name, type)
);

CREATE INDEX idx_systems_status ON systems(status);
CREATE INDEX idx_systems_last_seen ON systems(last_seen DESC);

-- migrations/002_create_metrics_table.sql
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_id UUID REFERENCES systems(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    value JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    CONSTRAINT metrics_system_type_time_unique UNIQUE (system_id, metric_type, timestamp)
);

CREATE INDEX idx_metrics_system_time ON metrics(system_id, timestamp DESC);
CREATE INDEX idx_metrics_type_time ON metrics(metric_type, timestamp DESC);
```

### 5.2 Database Operations

#### Query Examples
```python
# src/services/metric_service.py
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

class MetricService:
    @staticmethod
    def get_latest_metrics(
        db: Session, 
        system_id: str, 
        metric_types: List[str] = None
    ) -> List[Dict[str, Any]]:
        query = db.query(
            Metric.metric_type,
            func.max(Metric.timestamp).label('latest_timestamp')
        ).filter(
            Metric.system_id == system_id
        )
        
        if metric_types:
            query = query.filter(Metric.metric_type.in_(metric_types))
        
        query = query.group_by(Metric.metric_type)
        
        latest_times = {row.metric_type: row.latest_timestamp for row in query.all()}
        
        results = []
        for metric_type, latest_time in latest_times.items():
            metric = db.query(Metric).filter(
                Metric.system_id == system_id,
                Metric.metric_type == metric_type,
                Metric.timestamp == latest_time
            ).first()
            
            if metric:
                results.append({
                    'type': metric.metric_type,
                    'value': metric.value,
                    'timestamp': metric.timestamp
                })
        
        return results
    
    @staticmethod
    def get_metrics_history(
        db: Session,
        system_id: str,
        metric_type: str,
        start_time: datetime,
        end_time: datetime,
        limit: int = 1000
    ):
        return db.query(Metric).filter(
            Metric.system_id == system_id,
            Metric.metric_type == metric_type,
            Metric.timestamp >= start_time,
            Metric.timestamp <= end_time
        ).order_by(desc(Metric.timestamp)).limit(limit).all()
```

---

## 6. API Development

### 6.1 API Design Principles

#### RESTful Conventions
```python
# Good: RESTful resource naming
GET    /api/v1/systems              # List systems
POST   /api/v1/systems              # Create system
GET    /api/v1/systems/{id}         # Get system
PUT    /api/v1/systems/{id}         # Update system
DELETE /api/v1/systems/{id}         # Delete system

# Good: Nested resources
GET    /api/v1/systems/{id}/metrics # Get system metrics
POST   /api/v1/systems/{id}/metrics # Add system metric

# Avoid: Non-RESTful patterns
GET    /api/v1/getAllSystems        # Bad naming
POST   /api/v1/createSystem         # Should be POST to collection
```

#### API Response Format
```json
{
  "data": {
    "id": "system-123",
    "name": "Server 1",
    "type": "windows",
    "status": "online",
    "last_seen": "2026-03-06T10:30:00Z",
    "metadata": {
      "os": "Windows 11 Pro",
      "version": "22H2"
    }
  },
  "links": {
    "self": "/api/v1/systems/system-123",
    "metrics": "/api/v1/systems/system-123/metrics"
  },
  "meta": {
    "timestamp": "2026-03-06T10:30:00Z",
    "version": "1.0"
  }
}
```

### 6.2 API Documentation

#### OpenAPI Specification
```yaml
openapi: 3.0.0
info:
  title: Overlord PC Dashboard API
  version: 1.0.0
  description: API for managing PC systems and monitoring

servers:
  - url: https://api.overlord.com/v1
    description: Production server
  - url: http://localhost:8000/v1
    description: Development server

paths:
  /systems:
    get:
      summary: List all systems
      tags: [Systems]
      parameters:
        - name: skip
          in: query
          schema:
            type: integer
            default: 0
        - name: limit
          in: query
          schema:
            type: integer
            default: 100
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/System'
    post:
      summary: Create a new system
      tags: [Systems]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SystemCreate'
      responses:
        '201':
          description: System created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/System'
```

---

## 7. Testing Strategy

### 7.1 Testing Pyramid

```mermaid
pie title Test Distribution
    "Unit Tests" : 70
    "Integration Tests" : 20
    "E2E Tests" : 10
```

### 7.2 Unit Testing

#### Frontend Tests
```typescript
// src/components/__tests__/ExampleComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ExampleComponent } from '@/components/ExampleComponent';

describe('ExampleComponent', () => {
  it('renders the component with items', () => {
    const items = ['Item 1', 'Item 2', 'Item 3'];
    const handleAction = jest.fn();
    
    render(<ExampleComponent title="Test Title" items={items} onAction={handleAction} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
  
  it('calls onAction when item is clicked', () => {
    const items = ['Item 1'];
    const handleAction = jest.fn();
    
    render(<ExampleComponent title="Test" items={items} onAction={handleAction} />);
    
    fireEvent.click(screen.getByText('Item 1'));
    expect(handleAction).toHaveBeenCalledWith('Item 1');
  });
});
```

#### Backend Tests
```python
# tests/test_system_service.py
import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session

from services.system_service import SystemService
from models import System
from schemas import SystemCreate

class TestSystemService:
    @pytest.fixture
    def mock_db(self) -> Session:
        return MagicMock(spec=Session)
    
    def test_create_system_success(self, mock_db):
        system_data = SystemCreate(
            name="Test System",
            type="linux",
            status="online"
        )
        
        result = SystemService.create_system(mock_db, system_data)
        
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
        assert result.name == "Test System"
    
    def test_get_system_not_found(self, mock_db):
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        result = SystemService.get_system(mock_db, "nonexistent-id")
        
        assert result is None
```

### 7.3 Integration Testing

#### API Integration Tests
```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from main import app
from database import get_db
from models import System

client = TestClient(app)

@pytest.fixture
def test_system(db: Session):
    system = System(
        id="test-system-1",
        name="Test System",
        type="test",
        status="online"
    )
    db.add(system)
    db.commit()
    return system

class TestSystemAPI:
    def test_get_systems(self, db: Session, test_system):
        response = client.get("/api/v1/systems")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) >= 1
        assert data["data"][0]["name"] == "Test System"
    
    def test_create_system(self):
        system_data = {
            "name": "New System",
            "type": "windows",
            "status": "offline"
        }
        
        response = client.post("/api/v1/systems", json=system_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["data"]["name"] == "New System"
```

### 7.4 Test Coverage Requirements

#### Coverage Targets

| Test Type | Minimum Coverage | Target Coverage |
|-----------|------------------|-----------------|
| Unit Tests | 70% | 80% |
| Integration Tests | 50% | 60% |
| Overall Project | 65% | 75% |

#### Critical Path Coverage

All critical paths must have 100% test coverage:
- Authentication and authorization flows
- Payment processing endpoints
- Data validation and sanitization
- Error handling paths
- Database transactions

#### Coverage Configuration

**Frontend (package.json):**
```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/*.stories.tsx"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 75,
        "statements": 75
      }
    }
  }
}
```

**Backend (pytest.ini):**
```ini
[tool:pytest]
testpaths = tests
addopts = --cov=. --cov-report=term-missing --cov-fail-under=70
```

### 7.5 CI Integration

#### GitHub Actions Workflow

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install frontend dependencies
        run: npm ci

      - name: Install backend dependencies
        run: pip install -r requirements.txt

      - name: Run frontend tests
        run: npm test -- --coverage
        env:
          CI: true
          NODE_ENV: test

      - name: Run backend tests
        run: pytest --cov=. --cov-report=xml
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
          threshold: 75%

      - name: Run linters
        run: |
          npm run lint
          npm run type-check
          pylint **/*.py

  quality-gate:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Check coverage thresholds
        run: |
          echo "Checking test coverage thresholds..."
          # Add threshold validation logic here
          echo "Quality gate passed!"
```

#### Quality Gates

| Gate | Threshold | Action on Failure |
|------|-----------|-------------------|
| Test Coverage | ≥75% | Block merge |
| Lint Errors | 0 | Block merge |
| Type Errors | 0 | Block merge |
| Security Scan | High/Critical only | Block merge |

#### Status Badges

Add coverage badges to your README:
```markdown
[![Tests](https://github.com/your-org/overlord-pc-dashboard/actions/workflows/test.yml/badge.svg)](https://github.com/your-org/overlord-pc-dashboard/actions/workflows/test.yml)
[![Coverage](https://codecov.io/gh/your-org/overlord-pc-dashboard/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/overlord-pc-dashboard)
[![Quality Gate](https://img.shields.io/badge/quality-gate-passing-green)](https://sonarcloud.io/summary/new_code?id=your-org_overlord-pc-dashboard)
```

### 7.6 Additional Test Types

#### 7.6.1 End-to-End Tests (Playwright)

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete user flow', async ({ page }) => {
    // Login
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Verify dashboard loads
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="system-count"]')).toBeVisible();
    
    // Navigate to systems
    await page.click('[data-testid="nav-systems"]');
    await expect(page.locator('[data-testid="systems-table"]')).toBeVisible();
  });

  test('error handling', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Trigger error state
    await page.route('**/api/systems', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
```

**Playwright Configuration:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'playwright-results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

#### 7.6.2 Performance Tests (k6)

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at peak
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    errors: ['rate<0.1'],               // Less than 10% errors
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/api/v1/systems`);
  
  errorRate.add(res.status !== 200);
  responseTime.add(res.timings.duration);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has data': (r) => r.json('data') !== undefined,
  });
  
  sleep(1);
}
```

Run with: `k6 run tests/performance/load-test.js -e BASE_URL=https://your-app.vercel.app`

#### 7.6.3 Security Tests

**SAST with Bandit:**
```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  bandit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Bandit
        uses: pybandit/bandit-action@v1
        with:
          targets: './services,./api'
          severity: 'medium'
          confidence: 'medium'

  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: npm audit
        run: npm audit --audit-level=moderate
```

**OWASP ZAP (DAST):**
```yaml
zap-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: ZAP Scan
      uses: zaproxy/action-baseline@v0.9.0
      with:
        target: 'https://your-staging-url.com'
```

#### 7.6.4 Smoke Tests

```typescript
// tests/smoke/smoke.spec.ts
import { test } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
  });

  test('api health endpoint', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
  });

  test('critical assets load', async ({ page }) => {
    await page.goto('/');
    const logo = page.locator('img[alt="Logo"]');
    await expect(logo).toBeVisible();
  });
});
```

#### 7.6.5 Regression Tests

Run comprehensive regression before releases:

```bash
# Run full test suite
npm run test:all

# Run regression-specific tests
npm run test:regression

# Run with full reporting
npm run test:all -- --report --json > test-results.json
```

### 7.7 Test Data Management

#### Fixtures and Factories

**Python Factory:**
```python
# tests/factories.py
import factory
from factory.alchemy import SQLAlchemyModelFactory
from database import SessionLocal
from models import System, User

class BaseFactory(SQLAlchemyModelFactory):
    class Meta:
        abstract = True
        sqlalchemy_session = SessionLocal
        sqlalchemy_session_persistence = 'commit'

class SystemFactory(BaseFactory):
    class Meta:
        model = System
    
    id = factory.Sequence(lambda n: f'system-{n}')
    name = factory.Sequence(lambda n: f'Test System {n}')
    type = 'linux'
    status = 'online'
    
class UserFactory(BaseFactory):
    class Meta:
        model = User
    
    id = factory.Sequence(lambda n: f'user-{n}')
    email = factory.Sequence(lambda n: f'user{n}@example.com')
    username = factory.Sequence(lambda n: f'testuser{n}')
    is_active = True
```

**TypeScript Factory:**
```typescript
// tests/factories/userFactory.ts
import { User, System } from '@/types';

export const createUser = (overrides: Partial<User> = {}): User => ({
  id: `user-${Date.now()}`,
  email: 'test@example.com',
  username: 'testuser',
  isActive: true,
  ...overrides,
});

export const createSystem = (overrides: Partial<System> = {}): System => ({
  id: `system-${Date.now()}`,
  name: 'Test System',
  type: 'linux',
  status: 'online',
  lastSeen: new Date().toISOString(),
  ...overrides,
});
```

#### Mock Data Strategies

```typescript
// src/__mocks__/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/systems', () => {
    return HttpResponse.json({
      data: [
        { id: '1', name: 'System 1', status: 'online' },
        { id: '2', name: 'System 2', status: 'offline' },
      ],
    });
  }),
  http.post('/api/v1/systems', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: body }, { status: 201 });
  }),
];
```

#### Test Databases

```python
# conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = "sqlite:///./test.db"

@pytest.fixture(scope="session")
def engine():
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    return engine

@pytest.fixture(scope="function")
def db_session(engine):
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # Clean up tables
        for table in reversed(engine.metadata.sorted_tables):
            engine.execute(table.delete())
```

### 7.8 Test Execution

#### Parallel Execution

```json
// package.json
{
  "scripts": {
    "test:parallel": "jest --maxWorkers=50%",
    "test:ci": "CI=true npm test -- --maxWorkers=2"
  }
}
```

```python
# pytest.ini
[pytest]
addopts = -n auto --dist loadfile
```

#### Test Reporting

**JUnit XML Report:**
```bash
npm test -- --reporters=default --reporters=jest-junit
pytest --junitxml=test-results.xml
```

**HTML Report:**
```bash
npm test -- --html --output test-report.html
pytest --html=test-report.html --self-contained-html
```

**Allure Report:**
```bash
npm install --save-dev @allure-jest/allure-jest
pytest --alluredir=allure-results
allure serve allure-results
```

#### Flaky Test Handling

```typescript
// playwright.config.ts
export default defineConfig({
  retries: {
    mode: 'only失败的测试会重试',
    maxRetryCount: 2,
  },
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
});
```

**Mark flaky tests:**
```typescript
test.describe('Flaky tests', () => {
  test.flaky('sometimes passes', async ({ page }) => {
    // Test that may occasionally fail
  });
});
```

```python
@pytest.mark.flaky(reruns=3)
def test_sometimes_fails():
    # Test that may occasionally fail
    pass
```

### 7.9 Testing Best Practices

#### Naming Conventions

```typescript
// Good test names
describe('UserService', () => {
  it('should create a new user with valid data', () => {});
  it('should throw error when email is invalid', () => {});
  it('should return null for non-existent user', () => {});
  it('should hash password before saving', () => {});
});

// Bad test names
describe('UserService', () => {
  it('test create user', () => {});
  it('test1', () => {});
  it('should work', () => {});
});
```

#### AAA Pattern (Arrange, Act, Assert)

```typescript
describe('calculateTotal', () => {
  it('should apply discount correctly', () => {
    // Arrange
    const items = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 },
    ];
    const discount = 0.1;
    
    // Act
    const total = calculateTotal(items, discount);
    
    // Assert
    expect(total).toBe(225); // 250 - 10% = 225
  });
});
```

#### Test Isolation

```typescript
// Each test should be independent
describe('UserService', () => {
  let userService: UserService;
  let mockDatabase: jest.Mocked<Database>;
  
  beforeEach(() => {
    // Fresh instance for each test
    mockDatabase = createMockDatabase();
    userService = new UserService(mockDatabase);
    
    // Clear any previous state
    mockDatabase.clear();
  });
  
  it('should create user', () => {
    // Test operates on clean state
  });
});
```

#### Mock vs Stub vs Spy

| Type | Purpose | Example |
|------|---------|---------|
| **Mock** | Verify interactions | `expect(mock.save).toHaveBeenCalled()` |
| **Stub** | Provide predefined responses | `mock.getUser.returnsValue(user)` |
| **Spy** | Wrap real implementation | `spyOn(service, 'method').and.callThrough()` |

```typescript
// Mock - verify interaction
const mockRepo = jest.mock('./userRepository');
await userService.create(user);
expect(mockRepo.save).toHaveBeenCalledWith(user);

// Stub - provide data
const stubRepo = {
  findById: jest.fn().mockReturnValue(mockUser),
  save: jest.fn(),
};

// Spy - monitor real object
const realApi = new ExternalApi();
const spyApi = jest.spyOn(realApi, 'fetchData').mockResolvedValue(mockData);
```

#### Test Documentation

```typescript
/**
 * Tests for the authentication flow
 * 
 * @see https://example.com/docs/auth-flow
 * @sensitive - Tests involve sensitive user data
 */
describe('Authentication', () => {
  /**
   * Validates that users can successfully authenticate
   * with valid credentials.
   * 
   * @ precondition User must be registered in the system
   * @ postcondition User receives valid JWT token
   */
  it('should authenticate with valid credentials', async () => {
    // Test implementation
  });
});
```

---

## 8. Code Quality & Standards

### 8.1 Code Style Guidelines

#### Python Style
```python
# Good: PEP 8 compliant
class SystemService:
    def __init__(self):
        self._db = None
    
    def get_system(self, system_id: str) -> Optional[System]:
        return self._db.query(System).filter(
            System.id == system_id
        ).first()

# Avoid: Non-compliant
class system_service:
    def __init__(self):
        self.db=None
    
    def getSystem(self,id):
        return self.db.query(System).filter(System.id==id).first()
```

#### TypeScript Style
```typescript
// Good: Consistent formatting
interface System {
  id: string;
  name: string;
  type: SystemType;
  status: SystemStatus;
  lastSeen: Date;
}

// Avoid: Inconsistent formatting
interface system{
id:string;name:string;type:SystemType;status:SystemStatus;lastSeen:Date}
```

### 8.2 Linting Configuration

#### ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": ".",
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error"
  }
}
```

#### Pylint Configuration
```ini
[MASTER]
load-plugins=
pylint.extensions.docstyle

[MESSAGES CONTROL]
disable=missing-docstring,too-few-public-methods

[DESIGN]
max-args=7
max-locals=15
max-returns=6
max-statements=50
max-branches=12

[FORMAT]
max-line-length=88
```

### 8.3 Code Review Guidelines

#### Review Checklist
- [ ] Code follows project style guidelines
- [ ] All new code has appropriate tests
- [ ] Security considerations addressed
- [ ] Performance implications evaluated
- [ ] Documentation updated
- [ ] Error handling is comprehensive
- [ ] Code is maintainable and readable

#### Common Issues to Watch For
- **Security:** SQL injection, XSS, authentication bypass
- **Performance:** N+1 queries, memory leaks, blocking I/O
- **Maintainability:** Complex logic, magic numbers, unclear variable names
- **Reliability:** Unhandled exceptions, race conditions, data consistency

---

## 9. Development Workflow

### 9.1 Git Workflow

#### Branch Strategy
```
main                 # Production-ready code
├── develop            # Integration branch
│   ├── feature/user-auth    # Feature branches
│   ├── feature/metrics-api  # Feature branches
│   └── fix/database-issue  # Bug fix branches
└── hotfix/security-patch # Critical fixes
```

#### Commit Message Guidelines
```
feat: add user authentication system
├── Implement JWT-based authentication
├── Add login/logout endpoints
├── Create user management service
└── Update documentation

fix: resolve database connection timeout
├── Increase connection pool size
├── Add retry logic for failed connections
└── Update error handling

docs: update API documentation
├── Add examples for new endpoints
├── Update authentication flow
└── Fix broken links
```

### 9.2 Development Commands

#### Frontend Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

#### Backend Commands
```bash
# Install dependencies
pip install -e .

# Start development server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Run tests with coverage
pytest --cov=src --cov-report=html

# Type checking
mypy src/

# Linting
pylint src/

# Format code
black src/
```

---

## 10. Debugging & Troubleshooting

### 10.1 Common Issues

#### Frontend Issues
```typescript
// Common React issues and solutions

// Issue: Component re-renders too often
const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
    
    const intervalId = setInterval(fetchMetrics, 30000);
    return () => clearInterval(intervalId);
  }, []);
  
  return { metrics, loading };
};
```

#### Backend Issues
```python
# Common Python/FastAPI issues and solutions

# Issue: Database connection pool exhausted
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

def get_db_session():
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=3600
    )
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()

# Issue: Slow API responses
@app.get("/systems/{system_id}/metrics")
def get_system_metrics(
    system_id: str,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 1000,
):
    # Use database indexes
    query = db.query(Metric).filter(
        Metric.system_id == system_id
    )
    
    if start_time:
        query = query.filter(Metric.timestamp >= start_time)
    
    if end_time:
        query = query.filter(Metric.timestamp <= end_time)
    
    # Limit result set
    query = query.order_by(desc(Metric.timestamp)).limit(limit)
    
    return query.all()
```

### 10.2 Debugging Tools

#### Frontend Debugging
```bash
# React DevTools
# Install browser extension
# Use in development:
console.log('Component rendered:', componentName);
console.table(dataArray);
console.time('operation');
// operation
console.timeEnd('operation');
```

#### Backend Debugging
```bash
# Python debugging
import pdb; pdb.set_trace()  # Breakpoint

# Logging
import logging
logger = logging.getLogger(__name__)
logger.debug('Debug message')
logger.info('Info message')
logger.warning('Warning message')
logger.error('Error message')

# Profiling
import cProfile
cProfile.run('function_to_profile()')
```

---

## Conclusion

This development handbook provides comprehensive guidance for building and maintaining the Overlord PC Dashboard. By following these guidelines and best practices, developers can ensure high-quality, maintainable, and scalable code.

**Next Steps:**
1. Set up your development environment
2. Familiarize yourself with the project structure
3. Start with small, well-defined tasks
4. Follow the code review process
5. Contribute to documentation

---

*Development handbook version: 1.0.0 | Last updated: 2026-03-06*

---

## Robotic Claw Mechanism: Design and Evaluation Plan

This section outlines a comprehensive plan for the safe design, implementation, and evaluation of a robotic claw mechanism.

### Part 1: Design and Implementation of a Safe Control System

#### 1. Define Operational Requirements and Safety Specifications
*   **Purpose:** Clearly articulate the intended function of the claw (e.g., grasping, lifting, manipulating objects).
*   **Payload:** Specify the maximum and minimum weight, size, and fragility of objects to be handled.
*   **Operating Environment:** Describe the conditions under which the claw will operate (e.g., temperature, humidity, presence of hazardous materials, human proximity).
*   **Safety Standards:** Identify and adhere to relevant industry safety standards and regulations (e.g., ISO 10218 for industrial robots, machinery directives).
*   **Risk Assessment:** Conduct a thorough risk assessment to identify potential hazards associated with the claw's operation (e.g., crushing, pinching, dropping objects, uncontrolled movement, electrical hazards).

#### 2. Control System Architecture Design
*   **Hardware Components:**
    *   **Actuators:** Select appropriate motors (e.g., servo, stepper, hydraulic, pneumatic) based on required force, speed, and precision.
    *   **Sensors:** Integrate sensors for feedback and safety:
        *   **Position/Encoder Sensors:** For precise control of claw opening/closing and joint angles.
        *   **Force/Torque Sensors:** To detect grip force and prevent crushing or dropping.
        *   **Proximity Sensors:** To detect objects or obstacles in the claw's path.
        *   **Emergency Stop (E-Stop) Buttons:** Strategically placed, hardwired E-stop circuits.
    *   **Controller:** Choose a suitable programmable logic controller (PLC), microcontroller (e.g., Arduino, Raspberry Pi), or industrial PC for control logic.
    *   **Power Supply:** Design a robust and appropriately sized power supply with overcurrent protection.
*   **Software/Firmware Development:**
    *   **Control Logic:** Implement algorithms for precise grip force control, position control, and motion planning.
    *   **Safety Interlocks:** Develop software logic to prevent unsafe operations (e.g., preventing movement if safety gates are open, limiting force based on sensor feedback).
    *   **Error Handling:** Implement robust error detection and recovery mechanisms, including fault logging.
    *   **User Interface:** Design an intuitive interface for operators to monitor status, initiate actions, and respond to alerts.

#### 3. Safety Features and Mechanisms
*   **Emergency Stop System:** Implement a redundant, fail-safe E-stop system that immediately cuts power to actuators and brings the claw to a safe state.
*   **Overload Protection:** Integrate hardware and software mechanisms to prevent the claw from exceeding its load capacity or applying excessive force.
*   **Collision Avoidance:** Utilize sensor data to detect potential collisions and implement evasive maneuvers or controlled shutdowns.
*   **Fail-Safe Design:** Ensure that in the event of power loss or component failure, the claw defaults to a safe state (e.g., holding its current position, slowly opening, or retracting).
*   **Guarding and Enclosures:** Design physical barriers or enclosures to prevent human access to hazardous moving parts during operation.

#### 4. Testing and Validation
*   **Unit Testing:** Test individual hardware and software components for functionality and reliability.
*   **Integration Testing:** Verify that all components work together seamlessly as a system.
*   **Safety Function Testing:** Rigorously test all safety features, including E-stops, interlocks, and overload protection, under various fault conditions.
*   **Performance Testing:** Evaluate the claw's ability to meet operational requirements (e.g., grip strength, speed, precision, repeatability).
*   **Durability Testing:** Conduct long-term tests to assess the system's reliability and wear characteristics.

#### 5. Documentation and Training
*   **Technical Manuals:** Create comprehensive documentation including design specifications, wiring diagrams, software architecture, and maintenance procedures.
*   **Operator Manuals:** Develop clear instructions for safe operation, troubleshooting, and emergency procedures.
*   **Training Program:** Provide thorough training for all personnel involved in the operation, maintenance, and supervision of the claw system.

### Part 2: Evaluation and Selection of Claw Mechanisms

#### 1. Define Evaluation Criteria
*   **Safety Features:**
    *   Inherent fail-safe characteristics.
    *   Compatibility with external safety systems (e.g., E-stops, light curtains).
    *   Risk of pinching, crushing, or dropping objects.
*   **Performance:**
    *   Grip Force and Range: Maximum and minimum force, and the range of object sizes it can handle.
    *   Precision and Repeatability: Accuracy of positioning and consistency of grip.
    *   Speed of Operation: Time required for opening, closing, and grasping.
    *   Payload Capacity: Maximum weight the claw can securely hold.
    *   Power Consumption: Energy efficiency.
*   **Durability and Maintenance:**
    *   Material Construction: Robustness and resistance to wear, corrosion, or specific environmental factors.
    *   Expected Lifespan: Mean Time Between Failures (MTBF).
    *   Ease of Maintenance: Accessibility of components, availability of spare parts.
*   **Integration:**
    *   Compatibility with existing robotic arms or control systems.
    *   Ease of mechanical and electrical integration.
*   **Cost:**
    *   Initial purchase price.
    *   Installation costs.
    *   Operating and maintenance costs.

#### 2. Research and Identify Potential Claw Mechanisms
*   **"Open Claw" (Generic Parallel/Angular Grippers):** Research standard industrial grippers, pneumatic or electric, with parallel or angular jaw movements.
*   **"Iron Claw" (Specific Product/Brand):** Investigate specific products or brands known as "Iron Claw" or similar heavy-duty, robust grippers.
*   **Alternative Gripper Types:** Explore other specialized grippers such as vacuum grippers, soft grippers, magnetic grippers, or custom-designed solutions, if applicable to the defined operational requirements.

#### 3. Conduct Comparative Analysis
*   Gather detailed specifications, technical data sheets, and user reviews for each identified claw mechanism.
*   Create a comparison matrix, scoring each claw against the defined evaluation criteria.
*   Perform simulations or small-scale tests if possible, to validate manufacturer claims regarding grip force, precision, and safety.

#### 4. Recommendation and Justification
*   Based on the comparative analysis, identify the claw mechanism that best meets the defined operational requirements, safety specifications, and budget constraints.
*   Provide a detailed justification for the selection, highlighting how the chosen claw excels in critical areas and addresses potential risks.
*   Outline any necessary modifications or additional safety measures required for the selected claw to ensure safe and controlled operation within the specific application.

---
*Development handbook version: 1.0.0 | Last updated: 2026-03-06*