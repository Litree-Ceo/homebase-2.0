# Website Project

## Overview

This is a simple website project built with HTML, CSS, and JavaScript, using Parcel for bundling, Live Server for development, and Serve for static production hosting.

## Project Structure

```
website-project/
├── public/                # Production-ready static files
│   └── index.html         # Main HTML document (output)
├── src/                   # Source files
│   ├── styles/
│   │   └── main.css       # Styles for the website
│   ├── scripts/
│   │   └── main.js        # Main JavaScript code
│   └── components/
│       └── header.js      # Header component
├── package.json           # npm configuration file
└── README.md              # Project documentation
```

## Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd website-project
npm install
```

### 2. Development

Start a local development server with live reloading:

```bash
npm run dev
```

This will open the site in your browser and reload on changes (served from the `public` directory).

### 3. Build for Production

Bundle your source files for production:

```bash
npm run build
```

The output will be placed in the `public` directory.

### 4. Serve Production Build

Serve the built site locally to test the production output:

```bash
npm start
```

This will serve the `public` directory at http://localhost:5000.

## Scripts

- `npm run dev` – Start live development server (Live Server)
- `npm run build` – Build static site with Parcel
- `npm start` – Serve production build (Serve)
- `npm test` – Run tests (placeholder)

## Contributing

Fork the repository and submit a pull request with your changes.

## License

This project is licensed under the ISC License. See the LICENSE file for details.
