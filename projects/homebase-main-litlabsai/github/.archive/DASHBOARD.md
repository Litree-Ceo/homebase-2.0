# 🏠 HomeBase 2.0 Dashboard

Welcome to your new home! This dashboard is designed to make everything easy to find and customize.

## 🎨 Visual Customization

### 1. Web App Themes
The web app now has **Easy Toggles**!
- **Hive**: The classic golden honeycomb look.
- **Neon**: A futuristic blue/cyan aesthetic.
- **Minimal**: A clean, light-mode professional look.
> **How to use**: Open the web app (`pnpm dev`) and look for the floating buttons in the bottom-right corner.

### 2. VS Code Look & Feel
We've optimized your editor for a "noob-friendly" but powerful experience:
- **Breadcrumbs**: Enabled for easy navigation.
- **Sticky Scroll**: Keeps function headers visible as you scroll.
- **Minimap**: Always visible with a slider.
- **Icons**: Using `vscode-icons` for clear file identification.

---

## 📐 Layout Toggles

### Focused vs. Full View
You can toggle how you see the project:
- **Full View**: Open the root folder `HomeBase 2.0`.
- **Focused View**: Open `HomeBase.code-workspace`. This splits the monorepo into logical sections (Web, API, Core) in your sidebar.

---

## 🚀 Quick Actions

| Task | Command |
| :--- | :--- |
| **Install Everything** | `pnpm install` |
| **Start Web App** | `pnpm -w run dev` |
| **Start API** | `pnpm -C packages/api start` |
| **Azure Login** | `az login` |
| **Bootstrap Cloud** | `.\litree-homebase-master-bootstrap.ps1` |

---

## 🤖 AI Agent Markers
Use these in your code to get help:
- `// @workspace`: "Build me a new page here."
- `// @debugger`: "Fix this bug for me."
- `// @agent`: "Use the Grok API for this."

---

*Need help? Just ask Copilot: "How do I deploy the API?" or "Change the theme to blue."*
