# ChronoSync Application Blueprint

## 1. Overview

ChronoSync is a web application designed to be a modern, intuitive, and visually engaging platform. The goal is to create a seamless user experience with a focus on performance and aesthetics, built with Astro.js and Firebase. The target design is a comprehensive development tool for next-gen temporal infrastructure engineers, featuring modules like Temporal AI, a Data Simulator, and an Image Forge.

## 2. Style, Design, and Features

This section documents the application's features as they are rebuilt to match the target design.

*   **Framework:** Astro.js
*   **Styling:** Tailwind CSS with a sophisticated dark theme, vibrant gradients, and modern UI components.
*   **Layout:** A main layout with a consistent header and a central content area.
*   **Pages:** A main dashboard (`index.astro`), a Lab for experiments, a Network monitor, and a Studio for development.
*   **Home Page:** The home page is now a dashboard that matches the modern UI from the screenshot. It features the headline "Temporal Sync for Infinite Scale," action buttons, and four feature cards: "Nanosecond Precision," "Quantum Guard," "Global Mesh," and "Zero Trust Sync."
*   **Header:** The header now displays the "CHRONOSYNC" brand and has navigation links for "Dashboard," "Lab," "Network," and "Studio."

## 3. Current Plan: Add Footer, AI Terminal, and Animations

My current task is to add the remaining components and animations to the home page to fully match the user-provided screenshot.

### Plan:

1.  **Create Footer:** Create a `Footer.astro` component and add it to the main layout.
2.  **Create AI Agent Terminal:** Build an interactive `AgentStatus.jsx` component with a typing animation.
3.  **Add Terminal and Button to Home Page:** Integrate the `AgentStatus` component and a "Connect with Github" button into `index.astro`.
4.  **Implement Animations:** Add scroll-triggered fade-in animations for the feature cards and a hover effect that adds a colored border.
