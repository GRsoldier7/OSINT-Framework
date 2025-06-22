/**
 * OSINT Framework Chatbot
 * Intelligent AI assistant for tool recommendations and OSINT guidance
 */

class OSINTChatbot {
    constructor() {
        this.isOpen = false;
        this.isLoading = false;
        this.messages = [];
        this.currentCategory = null;
        
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.setupEventListeners();
        this.loadProviderInfo();
        
        // Add welcome message
        this.addMessage({
            type: 'bot',
            content: 'Hello! I\'m your OSINT assistant. I can help you find the right tools and provide guidance on intelligence gathering. What would you like to know?',
            timestamp: new Date()
        });
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <div id="osint-chatbot" class="chatbot-container">
                <!-- Chatbot Toggle Button -->
                <button class="chatbot-toggle" id="chatbot-toggle">
                    <i class="fas fa-robot"></i>
                    <span class="chatbot-toggle-text">OSINT Assistant</span>
                </button>

                <!-- Chatbot Window -->
                <div class="chatbot-window" id="chatbot-window">
                    <!-- Header -->
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <i class="fas fa-robot"></i>
                            <span>OSINT Assistant</span>
                        </div>
                        <div class="chatbot-actions">
                            <button class="chatbot-minimize" id="chatbot-minimize">
                                <i class="fas fa-minus"></i>
                            </button>
                            <button class="chatbot-close" id="chatbot-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Messages Container -->
                    <div class="chatbot-messages" id="chatbot-messages">
                        <!-- Messages will be dynamically added here -->
                    </div>

                    <!-- Tool Recommendations -->
                    <div class="chatbot-recommendations" id="chatbot-recommendations">
                        <!-- Tool recommendations will be shown here -->
                    </div>

                    <!-- Input Area -->
                    <div class="chatbot-input-area">
                        <div class="chatbot-input-container">
                            <input type="text" 
                                   id="chatbot-input" 
                                   class="chatbot-input" 
                                   placeholder="Ask me about OSINT tools and techniques..."
                                   maxlength="500">
                            <button class="chatbot-send" id="chatbot-send">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        <div class="chatbot-status" id="chatbot-status">
                            <span class="provider-info">AI: <span id="ai-provider">Loading...</span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    setupEventListeners() {
        // Toggle chatbot
        document.getElementById('chatbot-toggle').addEventListener('click', () => {
            this.toggleChatbot();
        });

        // Minimize chatbot
        document.getElementById('chatbot-minimize').addEventListener('click', () => {
            this.minimizeChatbot();
        });

        // Close chatbot
        document.getElementById('chatbot-close').addEventListener('click', () => {
            this.closeChatbot();
        });

        // Send message
        document.getElementById('chatbot-send').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send message
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            const chatbot = document.getElementById('osint-chatbot');
            if (!chatbot.contains(e.target) && this.isOpen) {
                this.closeChatbot();
            }
        });
    }

    async loadProviderInfo() {
        try {
            const response = await fetch('/api/chat/provider');
            const data = await response.json();
            
            if (data.success) {
                const providerElement = document.getElementById('ai-provider');
                const provider = data.data.provider === 'openrouter' ? 'OpenRouter' : 'OpenAI';
                const status = data.data.configured ? 'Connected' : 'Not Configured';
                providerElement.textContent = `${provider} (${status})`;
                providerElement.className = data.data.configured ? 'connected' : 'disconnected';
            }
        } catch (error) {
            console.error('Failed to load provider info:', error);
            document.getElementById('ai-provider').textContent = 'Error';
        }
    }

    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }

    openChatbot() {
        this.isOpen = true;
        document.getElementById('osint-chatbot').classList.add('open');
        document.getElementById('chatbot-input').focus();
        this.scrollToBottom();
    }

    closeChatbot() {
        this.isOpen = false;
        document.getElementById('osint-chatbot').classList.remove('open');
    }

    minimizeChatbot() {
        document.getElementById('chatbot-window').classList.toggle('minimized');
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message || this.isLoading) return;

        // Add user message
        this.addMessage({
            type: 'user',
            content: message,
            timestamp: new Date()
        });

        // Clear input
        input.value = '';
        
        // Show loading state
        this.setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    context: {
                        currentPage: 'Tools Hub',
                        currentCategory: this.currentCategory
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                // Add bot response
                this.addMessage({
                    type: 'bot',
                    content: data.data.response,
                    timestamp: new Date()
                });

                // Show tool recommendations if available
                if (data.data.toolRecommendations && data.data.toolRecommendations.length > 0) {
                    this.showToolRecommendations(data.data.toolRecommendations);
                }
            } else {
                this.addMessage({
                    type: 'bot',
                    content: `Sorry, I encountered an error: ${data.message}`,
                    timestamp: new Date(),
                    isError: true
                });
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage({
                type: 'bot',
                content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
                timestamp: new Date(),
                isError: true
            });
        } finally {
            this.setLoading(false);
        }
    }

    addMessage(message) {
        this.messages.push(message);
        
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageElement = this.createMessageElement(message);
        messagesContainer.appendChild(messageElement);
        
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${message.type}-message`;
        
        if (message.isError) {
            messageDiv.classList.add('error-message');
        }

        const timestamp = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.formatMessage(message.content)}</div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;

        return messageDiv;
    }

    formatMessage(content) {
        // Convert markdown-like formatting to HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showToolRecommendations(recommendations) {
        const container = document.getElementById('chatbot-recommendations');
        
        if (recommendations.length === 0) {
            container.innerHTML = '';
            return;
        }

        const recommendationsHTML = `
            <div class="recommendations-header">
                <i class="fas fa-lightbulb"></i>
                <span>Recommended Tools</span>
            </div>
            <div class="recommendations-list">
                ${recommendations.map(rec => `
                    <div class="recommendation-item" data-category="${rec.category}">
                        <div class="recommendation-icon" style="color: ${rec.color}">
                            <i class="${rec.icon}"></i>
                        </div>
                        <div class="recommendation-content">
                            <div class="recommendation-name">${rec.name}</div>
                            <div class="recommendation-description">${rec.description}</div>
                        </div>
                        <button class="recommendation-action" onclick="chatbot.navigateToCategory('${rec.category}')">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = recommendationsHTML;
        container.style.display = 'block';
    }

    navigateToCategory(category) {
        // Switch to the specified category in the tools interface
        if (window.toolsManager) {
            window.toolsManager.switchCategory(category);
        }
        
        // Add a message about the navigation
        this.addMessage({
            type: 'bot',
            content: `I've switched to the ${this.getCategoryDisplayName(category)} category. You can now browse the relevant tools.`,
            timestamp: new Date()
        });
    }

    getCategoryDisplayName(category) {
        const names = {
            'geographic': 'Geographic & Location',
            'socialMedia': 'Social Media & Networks',
            'search': 'Search & Discovery',
            'data': 'Data & Archives',
            'analysis': 'AI & Analysis',
            'network': 'Network & Infrastructure',
            'documents': 'Documents & Files',
            'images': 'Images & Visual'
        };
        return names[category] || category;
    }

    setLoading(loading) {
        this.isLoading = loading;
        const sendButton = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');
        
        if (loading) {
            sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            sendButton.disabled = true;
            input.disabled = true;
        } else {
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            sendButton.disabled = false;
            input.disabled = false;
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Public method to set current category (called from tools manager)
    setCurrentCategory(category) {
        this.currentCategory = category;
    }

    // Public method to add quick suggestions
    addQuickSuggestions() {
        const suggestions = [
            "What tools can help me find someone's social media profiles?",
            "How do I analyze a domain for security threats?",
            "What's the best way to search for images online?",
            "Can you help me with geographic location analysis?",
            "What tools are available for document analysis?"
        ];

        const suggestionsHTML = `
            <div class="quick-suggestions">
                <div class="suggestions-header">Quick Questions:</div>
                ${suggestions.map(suggestion => `
                    <button class="suggestion-btn" onclick="chatbot.askQuestion('${suggestion}')">
                        ${suggestion}
                    </button>
                `).join('')}
            </div>
        `;

        const messagesContainer = document.getElementById('chatbot-messages');
        const suggestionsElement = document.createElement('div');
        suggestionsElement.className = 'quick-suggestions-container';
        suggestionsElement.innerHTML = suggestionsHTML;
        messagesContainer.appendChild(suggestionsElement);
    }

    askQuestion(question) {
        document.getElementById('chatbot-input').value = question;
        this.sendMessage();
    }
}

// Initialize chatbot when DOM is loaded
let chatbot;
document.addEventListener('DOMContentLoaded', () => {
    chatbot = new OSINTChatbot();
});

// Export for global access
window.chatbot = chatbot; 