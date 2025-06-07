const WebSocket = require('ws');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// OpenWhisk configuration
const OPENWHISK_HOST = process.env.OPENWHISK_HOST || '172.17.0.1:3233';
const OPENWHISK_AUTH = process.env.OPENWHISK_AUTH || '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP';

const wss = new WebSocket.Server({ port: 8080 });

console.log('WhiskChat WebSocket Server running on port 8080');

// Store connected clients
const clients = new Map();

// Call OpenWhisk function
async function callOpenWhiskFunction(functionName, params) {
  try {
    const response = await axios.post(
      `http://${OPENWHISK_HOST}/api/v1/namespaces/_/actions/${functionName}?blocking=true&result=true`,
      params,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(OPENWHISK_AUTH).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error.message);
    return { error: error.message };
  }
}

// Process message through pipeline
async function processMessage(rawMessage) {
  try {
    // Step 1: Clean the message
    const cleanResult = await callOpenWhiskFunction('clean-message', { message: rawMessage.text });

    // Step 2: Analyze sentiment
    const sentimentResult = await callOpenWhiskFunction('analyze-sentiment', { message: cleanResult.cleaned || rawMessage.text });

    return {
      id: uuidv4(),
      user: rawMessage.user,
      original: rawMessage.text,
      message: cleanResult.cleaned || rawMessage.text,
      sentiment: sentimentResult.sentiment || 'neutral',
      confidence: sentimentResult.confidence || 0.5,
      filtered: cleanResult.filtered || false,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error processing message:', error);
    return {
      id: uuidv4(),
      user: rawMessage.user,
      message: rawMessage.text,
      sentiment: 'neutral',
      confidence: 0.5,
      filtered: false,
      error: 'Processing failed',
      timestamp: new Date().toISOString()
    };
  }
}

// Broadcast to all clients
function broadcast(message) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client, id) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    } else {
      clients.delete(id);
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  const clientId = uuidv4();
  clients.set(clientId, ws);

  console.log(`Client ${clientId} connected. Total clients: ${clients.size}`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    message: 'Connected to WhiskChat!',
    clientId,
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages
  ws.on('message', async (data) => {
    try {
      const rawMessage = JSON.parse(data);

      if (rawMessage.type === 'chat') {
        console.log(`Processing message from ${rawMessage.user}: ${rawMessage.text}`);

        // Process through FaaS pipeline
        const processedMessage = await processMessage(rawMessage);

        // Broadcast to all clients
        broadcast({
          type: 'chat',
          ...processedMessage
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected. Total clients: ${clients.size}`);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`Client ${clientId} error:`, error);
    clients.delete(clientId);
  });
});

// Health check endpoint
const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      clients: clients.size,
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Health check server running on port 3000');
});
