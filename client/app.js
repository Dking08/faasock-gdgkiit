class WhiskChat {
    constructor() {
        this.ws = null;
        this.username = '';
        this.isConnected = false;

        this.statusEl = document.getElementById('status');
        this.messagesEl = document.getElementById('messages');
        this.usernameInput = document.getElementById('usernameInput');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.connect();
    }

    setupEventListeners() {
        this.usernameInput.addEventListener('input', (e) => {
            const username = e.target.value.trim();
            if (username && this.isConnected) {
                this.username = username;
                this.messageInput.disabled = false;
                this.sendButton.disabled = false;
                this.messageInput.focus();
            } else {
                this.messageInput.disabled = true;
                this.sendButton.disabled = true;
            }
        });

        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.sendButton.disabled) {
                this.sendMessage();
            }
        });

        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
    }

    connect() {
        try {
            const wsUrl = 'ws://localhost:8080';
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('Connected to WhiskChat server');
                this.isConnected = true;
                this.updateStatus('Connected', 'connected');

                if (!this.username) {
                    this.usernameInput.focus();
                }
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };

            this.ws.onclose = () => {
                console.log('Disconnected from WhiskChat server');
                this.isConnected = false;
                this.updateStatus('Disconnected', 'disconnected');
                this.messageInput.disabled = true;
                this.sendButton.disabled = true;

                setTimeout(() => {
                    if (!this.isConnected) {
                        this.updateStatus('Reconnecting...', '');
                        this.connect();
                    }
                }, 3000);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateStatus('Connection Error', 'disconnected');
            };

        } catch (error) {
            console.error('Failed to connect:', error);
            this.updateStatus('Failed to Connect ', 'disconnected');
        }
    }

    updateStatus(text, className) {
        this.statusEl.textContent = text;
        this.statusEl.className = `status ${className}`;
    }

    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || !this.username || !this.isConnected) return;

        const message = {
            type: 'chat',
            user: this.username,
            text: text
        };

        this.ws.send(JSON.stringify(message));
        this.messageInput.value = '';
    }

    handleMessage(data) {
        switch (data.type) {
            case 'chat':
                this.displayChatMessage(data);
                break;
            case 'system':
                this.displaySystemMessage(data);
                break;
            case 'error':
                this.displayErrorMessage(data);
                break;
        }

        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    displayChatMessage(data) {
        const messageEl = document.createElement('div');
        const isOwnMessage = data.user === this.username;

        messageEl.className = `message ${isOwnMessage ? 'user' : 'other'}`;

        const time = new Date(data.timestamp).toLocaleTimeString();
        const sentimentEmoji = this.getSentimentEmoji(data.sentiment);

        messageEl.innerHTML = `
            <div class="message-header">
                <span><strong>${data.user}</strong> ${time}</span>
                <div>
                    <span class="sentiment ${data.sentiment}">
                        ${sentimentEmoji} ${data.sentiment}
                    </span>
                    ${data.filtered ? '<span class="filtered-indicator"> Filtered</span>' : ''}
                </div>
            </div>
            <div class="message-text">${this.escapeHtml(data.message)}</div>
        `;

        this.messagesEl.appendChild(messageEl);
    }

    displaySystemMessage(data) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message system';
        messageEl.textContent = data.message;
        this.messagesEl.appendChild(messageEl);
    }

    displayErrorMessage(data) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message system';
        messageEl.textContent = `Error: ${data.message}`;
        messageEl.style.background = '#dc3545';
        this.messagesEl.appendChild(messageEl);
    }

    getSentimentEmoji(sentiment) {
        switch (sentiment) {
            case 'positive': return '😊';
            case 'negative': return '😔';
            default: return '😐';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WhiskChat();
});
