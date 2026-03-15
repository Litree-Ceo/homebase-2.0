# ?? HomeBase 2.0

Your personal dashboard for managing tasks, notes, and daily routines. Built with React, Azure Functions, and deployed to Azure Static Web Apps (100% FREE!).

![Azure Static Web Apps](https://img.shields.io/badge/Azure-Static%20Web%20Apps-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ? Features

- ? **Task Management** - Create, track, and complete tasks
- ?? **Modern UI** - Clean, responsive React interface
- ? **Fast** - Built with Vite for lightning-fast development
- ?? **RESTful API** - Azure Functions backend
- ?? **Auto-Deploy** - GitHub Actions CI/CD
- ?? **FREE Hosting** - Azure Static Web Apps Free tier
- ?? **Secure** - HTTPS, CSP headers, and security best practices

## ?? Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/HomeBase2.git
cd HomeBase2

# Run the startup script
# Windows:
.\start-dev.ps1

# Mac/Linux:
./start-dev.sh
```

Open http://localhost:3000 and start building!

?? **[Read the full guide ?](START_HERE.md)**

## ??? Tech Stack

### Frontend
- React 18
- Vite
- Modern CSS

### Backend
- Azure Functions (Node.js)
- RESTful API design

### DevOps
- GitHub Actions
- Azure Static Web Apps
- Automatic CI/CD

## ?? Project Structure

```
HomeBase2/
??? client/          # React frontend application
??? api/             # Azure Functions backend
??? .github/         # GitHub Actions workflows
??? docs/            # Documentation
```

## ?? Deploy to Azure

1. Fork this repository
2. Create an [Azure Static Web App](https://portal.azure.com)
3. Connect your GitHub repository
4. Configure build settings:
   - App location: `/client`
   - API location: `/api`
   - Output location: `dist`
5. Push to main branch - automatic deployment! ??

## ?? API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create new task |

## ??? Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Azure Functions Core Tools (optional)

### Local Development
```bash
# Install dependencies
cd client && npm install
cd ../api && npm install

# Start development servers
npm run dev  # or use startup scripts
```

### Build for Production
```bash
cd client
npm run build
```

## ?? Issues & Feedback

Found a bug? Have a suggestion? Open an issue!

## ?? License

MIT License - feel free to use this project however you'd like!

## ?? Acknowledgments

Built with modern web technologies and best practices for personal productivity.

---

**? Star this repo if you find it useful!**
