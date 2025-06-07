# faasock

A cloud-native, real-time chat app powered by **Apache OpenWhisk**, **WebSockets**, and **Kubernetes**, with built-in **auto-moderation** and **sentiment feedback**.

## 🚀 Project Overview

**faasock** is a real-time chat system where messages are passed through a **data pipeline of serverless functions** before being broadcasted to users. Messages are filtered for profanity and analyzed for sentiment **live**, making it ideal for moderated or emotionally-aware chat environments.

## 🏗️ Architecture

```
[ Client Browser ]
        ↓ (WebSocket Message)
 ┌──────┴────────────┐
 ↓                  ↓
[FaaS A: Profanity]  [FaaS B: Sentiment]
 ↓                  ↓
Cleaned Text       Emotion Tag
       ↓            ↓
       →→ Packaged →→
       →→ Broadcast to All Clients
```

## 📁 Project Structure

```
faasock/
├── client/
│   ├── index.html          # Web-based chat client
│   ├── app.js              # Frontend WebSocket logic
│   ├── style.css           # Client styling
│   └── index.js            # TTY client for testing
├── websocket-server/
│   ├── server.js           # WebSocket server with OpenWhisk integration
│   ├── package.json        # Node.js dependencies
│   └── Dockerfile          # Container configuration
├── faas-functions/
│   ├── clean-message/
│   │   ├── index.js        # Profanity filter function
│   │   └── package.json
│   └── analyze-sentiment/
│       ├── index.js        # Sentiment analysis function
│       └── package.json
├── k8s/
│   ├── namespace.yaml      # Kubernetes namespace definition
│   ├── websocket-deployment.yaml  # WebSocket server deployment
│   └── websocket-service.yaml     # LoadBalancer service
├── openwhisk/              # Cloned from OpenWhisk official repo
└── scripts/
    ├── deploy-faas.sh      # Deploy FaaS functions
    └── setup-k8s.sh        # Setup Docker and Kubernetes
```

## 🧩 Components

### Client
- **Frontend**: HTML/CSS/JS chat interface that connects to WebSocket server
- **TTY Client**: Command-line test client for WebSocket testing

### WebSocket Server
Node.js WebSocket server (`WhiskChat`) with OpenWhisk-powered processing pipeline:
- **Port 8080**: WebSocket server for real-time chat
- **Port 3000**: HTTP health check endpoint (`/health`)
- **Message Pipeline**:
  1. `clean-message` - Cleans & filters profanity
  2. `analyze-sentiment` - Returns sentiment analysis & confidence
- **Features**:
  - UUID assignment for messages and clients
  - Broadcasts processed messages to all connected clients
  - Stateless health reporting with connected client count

### FaaS Functions

#### clean-message
- Removes profanity from messages using a simple word replacement list
- Deployed as OpenWhisk serverless function
- Returns cleaned text for broadcast

#### analyze-sentiment  
- Counts positive and negative words in sentences
- Assigns sentiment score to messages
- Returns emotion tags and confidence levels

### Kubernetes Deployment

#### websocket-deployment.yaml
Kubernetes deployment for WebSocket server:
- **2 replicas** for high availability
- **Environment-configurable** OpenWhisk host and auth via Kubernetes Secret
- **Health checks** using `/health` endpoint
- **Resource limits** for efficient scheduling
- **Image**: `localhost:5000/faasock/websocket-server:latest`

#### websocket-service.yaml
LoadBalancer service exposing the WebSocket server:
- **Port 8080**: WebSocket traffic
- **Port 3000**: Health checks
- Enables external access via LoadBalancer

## 🚀 Quick Start

### Prerequisites
- Debian netinst (or similar Linux distribution)
- Docker
- Git

### Deployment Steps

1. **Clone and build OpenWhisk**

> Use Gradle 7.6.2 and Java 17

   ```bash
   git clone https://github.com/apache/openwhisk.git
   cd openwhisk
   ./gradlew build
   ./gradlew core:standalone:bootRun
   ```

2. **Configure WSK properties**
   ```bash
   wsk property set --apihost localhost:3233 --auth 23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP
   ```

3. **Install K3s**
   ```bash
   curl -sfL https://get.k3s.io | sh -
   ```

4. **Clone faasock repository**
   ```bash
   git clone <your-repo-url>
   cd faasock
   ```

5. **Run deployment scripts**
   ```bash
   # Setup Kubernetes and Docker
   ./scripts/setup-k8s.sh
   
   # Deploy FaaS functions
   ./scripts/deploy-faas.sh
   ```

## 🌐 Live Demo

**WebSocket Server**: `ws://fitting-internal-hookworm.ngrok-free.app/`

> ⚠️ **Note**: Using ngrok tunnel - the host machine must be running to access this link

### Testing the Client
1. Open `client/index.html` in your browser
2. Replace the WebSocket URL with the ngrok link above
3. Start chatting with real-time profanity filtering and sentiment analysis!

## 🆕 UPDATE: Quick Start with Pre-deployed Demo

For immediate testing without local setup:

1. **Navigate to the global client directory**
   ```bash
   cd client-global/
   ```

2. **Verify WebSocket URL**
   - Open `app.js` in your editor
   - Ensure the WebSocket URL matches: `ws://fitting-internal-hookworm.ngrok-free.app/`
   ```javascript
   const socket = new WebSocket('ws://fitting-internal-hookworm.ngrok-free.app/');
   ```

3. **Launch the application**
   ```bash
   # Simply open in your browser
   open index.html
   # OR double-click index.html
   ```

4. **Start chatting!**
   - The app connects to the live WebSocket server
   - All FaaS functions and Kubernetes infrastructure are hosted on my machine
   - Real-time message processing via ngrok tunnel

> 🏗️ **Infrastructure Note**: The complete faasock stack (OpenWhisk FaaS functions, Kubernetes WebSocket deployment, and message processing pipeline) is running on my local machine and exposed via ngrok tunnel for demonstration purposes.

## 🔧 Environment Variables

The WebSocket server requires these environment variables:

- `OPENWHISK_HOST`: OpenWhisk API endpoint
- `OPENWHISK_AUTH`: Authentication token (configured via Kubernetes secret)

## 🏥 Health Monitoring

- Health endpoint: `http://localhost:3000/health`
- Returns connected client count and server status
- Used by Kubernetes for health checks and load balancing

## 🛠️ Development

### Local Testing
Use the TTY client for command-line testing:
```bash
node client/index.js
```

### Custom FaaS Functions
Add new serverless functions in the `faas-functions/` directory and deploy using the provided scripts.

### Demo Video
[Watch](https://drive.google.com/file/d/1clystgKylHCYG0HcQSI_6DyOEFrLR74K/view?usp=sharing)
> Restriced to KIIT Domain
---

Built with ❤️  by Dastageer using Apache OpenWhisk, Kubernetes, and WebSockets for GDGKIIT cloud
