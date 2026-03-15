# 🤖 Agent Zero - Setup & Integration Guide

## Overview

Agent Zero is a versatile AI agent with multiple AI provider support (OpenAI, Anthropic, Google). It now includes a **Web API** for integration with `web3.agent-zero.ai` and `www.agent-zero.ai`.

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
cd github/apps/agent-zero

# Start the web API
docker-compose up -d

# Check status
curl http://localhost:8000/health

# View logs
docker-compose logs -f
```

### Option 2: Python Virtual Environment

```bash
cd github/apps/agent-zero

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run web API
python web_api.py
```

---

## 🌐 Web Interface

Once running, access:

- **API**: http://localhost:8000
- **Web UI**: http://localhost:8000/static/index.html
- **Health Check**: http://localhost:8000/health
- **Status**: http://localhost:8000/status

---

## 🔗 Integration with web3.agent-zero.ai

### Step 1: Configure CORS

The web API already has CORS configured for:
- `https://web3.agent-zero.ai`
- `https://www.agent-zero.ai`
- `https://agent-zero.ai`

### Step 2: Deploy API

Deploy the Agent Zero API to a publicly accessible server:

```bash
# Build and push Docker image
docker build -t agent-zero:latest .
docker tag agent-zero:latest your-registry/agent-zero:latest
docker push your-registry/agent-zero:latest

# Or use docker-compose with nginx for SSL
docker-compose --profile production up -d
```

### Step 3: DNS Configuration

Point your domain to your server:
```
web3.agent-zero.ai → YOUR_SERVER_IP
```

### Step 4: SSL Certificates

Place your SSL certificates in `./ssl/`:
- `fullchain.pem`
- `privkey.pem`

Or use Let's Encrypt:
```bash
certbot certonly --standalone -d web3.agent-zero.ai -d www.agent-zero.ai
```

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Detailed health status |
| `/status` | GET | Agent status & stats |
| `/command` | POST | Send command to agent |
| `/chat` | POST | Chat endpoint (alias) |
| `/capabilities` | GET | List capabilities |
| `/history` | GET | Conversation history |
| `/clear-history` | POST | Clear history |
| `/ws` | WebSocket | Real-time communication |

### Example API Calls

```bash
# Health check
curl http://localhost:8000/health

# Get status
curl http://localhost:8000/status

# Send command
curl -X POST http://localhost:8000/command \
  -H "Content-Type: application/json" \
  -d '{"command": "hello"}'

# Chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"command": "What can you do?"}'
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# AI Provider API Keys
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key_here

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_telegram_token

# Web API Settings
AGENT_ZERO_HOST=0.0.0.0
AGENT_ZERO_PORT=8000
AGENT_ZERO_INTERACTIVE=false
```

### Docker Compose Profiles

**Development (no SSL)**:
```bash
docker-compose up -d
```

**Production (with nginx + SSL)**:
```bash
docker-compose --profile production up -d
```

---

## 🧪 Testing

### Test Web Interface

1. Start the API: `docker-compose up -d`
2. Open browser: http://localhost:8000/static/index.html
3. Type messages and verify responses

### Test API Integration

```bash
# Test from web3.agent-zero.ai domain (replace with your domain)
curl -H "Origin: https://web3.agent-zero.ai" \
  http://localhost:8000/status

# Should return JSON with agent status
```

---

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs agent-zero

# Rebuild
docker-compose down
docker-compose up --build -d
```

### CORS errors
- Verify `web3.agent-zero.ai` is in the CORS origins in `web_api.py`
- Check browser console for exact error

### Port already in use
```bash
# Change port in docker-compose.yml
ports:
  - "8001:8000"  # Use port 8001 on host
```

### SSL certificate errors
- Ensure certificates are in `./ssl/` directory
- Check certificate permissions
- Verify domain names match certificates

---

## 📁 File Structure

```
agent-zero/
├── main.py              # CLI version
├── web_api.py           # Web API (FastAPI)
├── requirements.txt     # Python dependencies
├── docker-compose.yml   # Docker orchestration
├── Dockerfile           # Container definition
├── nginx.conf           # Reverse proxy config
├── .env                 # Environment variables
├── static/
│   └── index.html       # Web interface
├── data/                # Conversation storage
└── logs/                # Log files
```

---

## 🔐 Security

- **Never commit `.env` file with real API keys**
- Use strong firewall rules (only expose ports 80/443/8000)
- Enable SSL/TLS in production
- Consider rate limiting (configured in nginx.conf)
- Use Docker secrets for sensitive data in production

---

## 📝 Next Steps

1. ✅ Start Agent Zero API locally
2. ✅ Test web interface at http://localhost:8000/static/index.html
3. ✅ Configure DNS for web3.agent-zero.ai
4. ✅ Deploy to production server
5. ✅ Set up SSL certificates
6. ✅ Update frontend at www.agent-zero.ai to connect to API

---

## 💡 Tips

- Use `docker-compose logs -f` to monitor in real-time
- API runs on port 8000 by default
- WebSocket available at `ws://localhost:8000/ws`
- Static files served from `/static` endpoint
- Health check runs every 30 seconds

---

**Need help?** Check the logs or run in interactive mode:
```bash
docker-compose down
docker-compose up  # (without -d to see logs)
```
