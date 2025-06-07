const WebSocket = require('ws');
const readline = require('readline');

const ws = new WebSocket('ws://localhost:8080');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const user = process.env.USER || 'TTYUser';

ws.on('open', () => {
  console.log(`Connected as "${user}". Type your messages below:`);

  rl.on('line', (line) => {
    const message = {
      type: 'chat',
      user,
      text: line
    };
    ws.send(JSON.stringify(message));
  });
});

ws.on('message', (data) => {
  try {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'chat') {
      const from = msg.user || 'unknown';
      const text = msg.message || msg.text;
      const sentiment = msg.sentiment ? ` [${msg.sentiment}]` : '';
      console.log(` ${from}: ${text}${sentiment}`);
    } else if (msg.type === 'system') {
      console.log(` ${msg.message}`);
    } else {
      console.log('', data.toString());
    }
  } catch (e) {
    console.log('', data.toString());
  }
});

ws.on('error', (err) => {
  console.error(' Error:', err.message);
});

ws.on('close', () => {
  console.log(' Disconnected');
  rl.close();
});

