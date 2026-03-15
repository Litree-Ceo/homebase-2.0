# HomeBase Pro: System Architecture Blueprint

This document outlines the architectural and engineering standards for the HomeBase Pro project. Its purpose is to ensure a high level of technical sophistication, scalability, and maintainability.

---

### **1. Project Architecture and Structure**

*   **Architectural Pattern:** We will formally adopt a **Serverless-First, Event-Driven Architecture**.
    *   **Frontend:** A modern Single Page Application (SPA) built with React and Vite, served globally via the Firebase Hosting CDN.
    *   **Backend:** A collection of serverless functions (Firebase Cloud Functions) that handle discrete business logic (e.g., processing Termux commands, data synchronization).
    *   **Event-Driven:** We will leverage Firebase's event-based triggers (e.g., `onWrite` to Firestore, `onCall` from the client) to create a decoupled and highly scalable system.

*   **Directory Structure:** We will refine our current structure to enforce a Clean Architecture approach, separating concerns more explicitly.
    ```
    /functions        # All backend Cloud Functions
    /public           # Static assets for Vite
    /src
    |-- /assets       # Images, fonts, etc.
    |-- /components   # Reusable, "dumb" UI components
    |-- /config       # Centralized application configuration (e.g., Firebase keys)
    |-- /firebase     # DEPRECATED (logic moved to /hooks and /services)
    |-- /hooks        # Custom React hooks (business logic, e.g., useAuth, useProjects)
    |-- /pages        # Top-level page components (e.g., Dashboard, Settings)
    |-- /services     # Third-party API clients (e.g., Algolia, Sentry)
    |-- /styles       # Global styles and design system (aurora.css)
    |-- /types        # TypeScript type definitions
    |-- /utils        # Generic helper functions
    |-- App.jsx       # Main application component and router
    |-- main.jsx      # Application entry point
    .github/workflows # CI/CD pipelines
    ```

*   **Design Principles:**
    *   **SOLID:** We will adhere to SOLID principles in both frontend and backend code.
    *   **Clean Architecture:** Business logic (hooks, services) will be kept independent of the UI framework (React) and external services (Firebase), allowing for easier testing and maintenance.

### **2. Technology Stack**

*   **Primary Stack:**
    *   **Language:** JavaScript (ESNext) / **TypeScript** (to be introduced for type safety).
    *   **Framework:** **React 19** with Hooks.
    *   **Build Tool:** **Vite**.

*   **Database Systems:**
    *   **Primary:** **Cloud Firestore (NoSQL)** for storing all user data, projects, and application state in real-time.

*   **Supporting Services:**
    *   **Search:** **Algolia**. We will integrate Algolia for a powerful, full-text search experience across projects, indexed via a Cloud Function.
    *   **Caching:** Implicitly handled by the **Firebase Hosting CDN** for static assets and configurable caching for function responses.

### **3. Development Environment Setup**

*   **IDE & Extensions:**
    *   **IDE:** Visual Studio Code.
    *   **Extensions:** ESLint, Prettier - Code formatter, EditorConfig for VS Code, npm Intellisense.

*   **Containerization:**
    *   **Docker:** We will create a `docker-compose.yml` file to spin up a local development environment that includes a Firebase emulator suite. This will allow for offline development and consistent testing of Firestore, Auth, and Functions.

*   **Environment Variables:**
    *   **Vite Env Files:** We will use `.env` files (`.env.local`, `.env.production`) to manage all secrets and environment-specific configurations, completely removing them from source code.

### **4. Version Control and Collaboration**

*   **Version Control:** **Git**.
*   **Branching Strategy:** **GitHub Flow**.
    *   `main` is the production branch and must always be stable and deployable.
    *   All new work is done on descriptive feature branches (e.g., `feat/add-project-search`, `fix/auth-bug`).
    *   Pull Requests (PRs) are created to merge feature branches into `main`.
*   **Code Review:**
    *   All PRs must be reviewed by at least one other team member.
    *   PRs must pass all automated CI checks before being eligible for merging.

### **5. Build, Automation, and CI/CD**

*   **Package Manager:** **npm**.
*   **CI/CD Pipeline:** **GitHub Actions**. A workflow file will be created at `.github/workflows/deploy.yml`.
*   **Continuous Integration (CI):** On every PR, the pipeline will:
    1.  Install dependencies using `npm ci` (for speed and consistency).
    2.  Run **ESLint** for static analysis.
    3.  Run all **unit and integration tests** with Vitest.
    4.  Check for vulnerabilities with `npm audit`.
*   **Continuous Deployment (CD):** On every merge to `main`, the pipeline will:
    1.  Execute all CI steps.
    2.  Build the React application (`npm run build`).
    3.  Deploy the `dist` folder to **Firebase Hosting**.
    4.  Deploy all Cloud Functions.
    5.  Deploy `firestore.rules`.
*   **Infrastructure-as-Code (IaC):**
    *   We will continue to use `firebase.json`, `firestore.rules`, and `.firebaserc` as our primary IaC. For more complex cloud resources, we may adopt **Terraform** in the future.

### **6. Testing and Quality Assurance**

*   **Testing Strategy:**
    *   **Unit Tests:** For all individual hooks, utils, and simple components.
    *   **Integration Tests:** To test interactions between components and hooks (e.g., does a form correctly call the `useProjects` hook?).
    *   **End-to-End (E2E) Tests:** To simulate complete user journeys (e.g., sign in, create a project, sign out).
*   **Frameworks & Requirements:**
    *   **Test Runner:** **Vitest** (Vite's native, super-fast test framework).
    *   **Component Testing:** **React Testing Library**.
    *   **E2E Testing:** **Playwright**.
    *   **Code Coverage:** A minimum of **80%** code coverage will be enforced by the CI pipeline for all new code.

### **7. Integration Strategy**

*   **Systems to Integrate:**
    *   **Internal:** All Firebase services (Auth, Firestore, Functions, Hosting).
    *   **External:** **Algolia** (for search), **Sentry** (for error reporting).
*   **Integration Patterns:**
    *   **Firebase:** Direct SDK calls from the client and serverless functions.
    *   **Algolia:** Data will be pushed from a Firestore `onWrite` Cloud Function to the Algolia index, keeping the search in sync with the database in real-time.
*   **Authentication:** All third-party API keys (Algolia, Sentry) will be stored securely using **Firebase Secret Manager** and accessed only by the Cloud Functions.

### **8. Observability and Monitoring**

*   **Logging:**
    *   **Backend:** Centralized logging via **Google Cloud Logging**, which automatically captures all `console.log` output from Cloud Functions.
    *   **Frontend:** **Sentry** will be integrated to capture and report all unhandled client-side exceptions.
*   **Metrics & Monitoring:**
    *   **Google Cloud Monitoring:** We will use this to create dashboards for function execution time, invocation counts, and error rates.
*   **Distributed Tracing:** **Google Cloud Trace** will be used to trace requests as they flow from the client through Cloud Functions to Firestore.
*   **Alerting:** Alerts will be configured in Google Cloud Monitoring to notify us via email of critical issues, such as a spike in function errors or high latency.

### **9. Performance, Scalability, and Resilience**

*   **Performance Benchmarks:**
    *   Google Lighthouse score must remain above **90** for Performance, Accessibility, and Best Practices.
    *   P95 API response time for all Cloud Functions must be below **800ms**.
*   **Scalability & Resilience:**
    *   This is an inherent benefit of our serverless architecture. Firestore, Cloud Functions, and Hosting are designed to scale automatically to handle virtually any load. They are managed, fault-tolerant services with multi-regional availability.
*   **Disaster Recovery:** We will enable **Point-in-Time Recovery (PITR)** on our Firestore database, allowing us to restore the database to any microsecond in the past 30 days.

### **10. Security**

*   **Authentication:** **Firebase Authentication** with OAuth providers (Google, GitHub, etc.).
*   **Authorization:** Granular access control will be enforced via **Firestore Security Rules**.
*   **Vulnerability Scanning:** **Dependabot** will be enabled on the GitHub repository to automatically create PRs for outdated and insecure dependencies.
*   **Secrets Management:** **GitHub Secrets** will be used for CI/CD variables (e.g., Firebase service account). **Firebase Secret Manager** will be used for all runtime secrets needed by Cloud Functions.

### **11. Documentation**

*   **Architectural Documentation:** This document will be saved as `PROJECT_BLUEPRINT.md` in the root of the repository. I will also create an architectural diagram using Mermaid syntax.
*   **Code Commenting:** We will adopt the **JSDoc** standard for all functions and components to enable auto-generating documentation and improve editor intellisense.
*   **README:** The `README.md` will be significantly enhanced to serve as a central hub for the project, containing the information from this blueprint, setup instructions, and a guide to the architecture.
