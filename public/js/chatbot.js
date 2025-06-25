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
        this.isInitialized = false;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (this.isInitialized) return;
        
        // Ensure chatbot panel starts hidden
        const panel = document.getElementById('chatbotPanel');
        if (panel) {
            panel.style.display = 'none';
        }
        
        this.setupEventListeners();
        this.loadProviderInfo();
        this.addWelcomeMessage();
        this.isInitialized = true;
        console.log('🤖 OSINT Chatbot initialized successfully');
    }

    setupEventListeners() {
        // Toggle chatbot
        const toggleBtn = document.getElementById('chatbotToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleChatbot();
            });
        }

        // Close chatbot
        const closeBtn = document.getElementById('chatbotClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeChatbot();
            });
        }

        // Send message
        const sendBtn = document.getElementById('chatbotSend');
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.sendMessage();
            });
        }

        // Enter key to send message
        const input = document.getElementById('chatbotInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Focus input when chatbot opens
            input.addEventListener('focus', () => {
                if (!this.isOpen) {
                    this.openChatbot();
                }
            });
        }

        // Click outside to close
        document.addEventListener('click', (e) => {
            const chatbot = document.getElementById('chatbotContainer');
            const toggleBtn = document.getElementById('chatbotToggle');
            
            if (chatbot && this.isOpen) {
                // Check if click is outside chatbot and not on toggle button
                if (!chatbot.contains(e.target) && !toggleBtn?.contains(e.target)) {
                    this.closeChatbot();
                }
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChatbot();
            }
        });

        // Prevent clicks inside chatbot from closing it
        const chatbotPanel = document.getElementById('chatbotPanel');
        if (chatbotPanel) {
            chatbotPanel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    async loadProviderInfo() {
        try {
            const response = await fetch('/api/chat/provider');
            const data = await response.json();
            
            if (data.success) {
                console.log('AI Provider loaded:', data.data);
            }
        } catch (error) {
            console.error('Failed to load provider info:', error);
        }
    }

    addWelcomeMessage() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer && messagesContainer.children.length === 0) {
            this.addMessage({
                type: 'bot',
                content: 'Hello! I\'m your OSINT assistant. I can help you find the right tools and provide guidance on intelligence gathering. What would you like to know?',
                timestamp: new Date()
            });
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
        const container = document.getElementById('chatbotContainer');
        const panel = document.getElementById('chatbotPanel');
        
        if (container) {
            container.classList.add('open');
        }
        
        if (panel) {
            panel.style.display = 'flex';
            // Force a reflow to ensure the transition works
            panel.offsetHeight;
            panel.classList.add('chatbot-animate');
            setTimeout(() => panel.classList.remove('chatbot-animate'), 400);
        }
        
        // Focus input after a short delay to ensure animation completes
        setTimeout(() => {
            const input = document.getElementById('chatbotInput');
            if (input) {
                input.focus();
            }
        }, 100);
        
        this.scrollToBottom();
    }

    closeChatbot() {
        this.isOpen = false;
        const container = document.getElementById('chatbotContainer');
        const panel = document.getElementById('chatbotPanel');
        
        if (container) {
            container.classList.remove('open');
        }
        
        if (panel) {
            panel.style.display = 'none';
        }
        
        // Clear input
        const input = document.getElementById('chatbotInput');
        if (input) {
            input.value = '';
            input.blur();
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        if (!input) return;
        
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

                // Show tool recommendations if any
                if (data.data.recommendations && data.data.recommendations.length > 0) {
                    this.showToolRecommendations(data.data.recommendations);
                }
            } else {
                // Add error message
                this.addMessage({
                    type: 'bot',
                    content: 'Sorry, I encountered an error. Please try again.',
                    timestamp: new Date()
                });
            }
        } catch (error) {
            console.error('Chat error:', error);
            
            // Add error message
            this.addMessage({
                type: 'bot',
                content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
                timestamp: new Date()
            });
        } finally {
            this.setLoading(false);
        }
    }

    addMessage(message) {
        this.messages.push(message);
        
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
            this.scrollToBottom();
        }
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = this.formatMessage(message.content);
        
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'message-timestamp';
        timestampDiv.textContent = this.formatTimestamp(message.timestamp);
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timestampDiv);
        
        return messageDiv;
    }

    formatMessage(content) {
        // Basic formatting for links and code
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    showToolRecommendations(recommendations) {
        const container = document.getElementById('chatbotRecommendations');
        if (!container) return;

        const recommendationsHTML = recommendations.map(rec => `
            <div class="recommendation-item" data-category="${rec.category}">
                <div class="recommendation-icon" style="color: ${rec.color}">${rec.icon}</div>
                <div class="recommendation-content">
                    <h4>${rec.name}</h4>
                    <p>${rec.description}</p>
                </div>
                <button class="recommendation-action" onclick="window.toolsPage?.selectCategory('${rec.category}')">
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = recommendationsHTML;
        container.style.display = 'block';
    }

    setLoading(loading) {
        this.isLoading = loading;
        
        const sendBtn = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');
        
        if (sendBtn) {
            sendBtn.disabled = loading;
            sendBtn.innerHTML = loading ? 
                '<i class="fas fa-spinner fa-spin"></i>' : 
                '<i class="fas fa-paper-plane"></i>';
        }
        
        if (input) {
            input.disabled = loading;
            input.placeholder = loading ? 'Thinking...' : 'Ask about OSINT tools...';
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    setCurrentCategory(category) {
        this.currentCategory = category;
    }

    // Public methods for external access
    open() {
        this.openChatbot();
    }

    close() {
        this.closeChatbot();
    }

    isOpen() {
        return this.isOpen;
    }
}

// Initialize the chatbot when DOM is loaded
let chatbot = null;

document.addEventListener('DOMContentLoaded', () => {
    chatbot = new OSINTChatbot();
    
    // Make chatbot globally accessible
    window.chatbot = chatbot;
});

// Export for global access
window.OSINTChatbot = OSINTChatbot;

window.addEventListener('ask-ai-about-tool', (e) => {
    const tool = e.detail;
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotPanel = document.getElementById('chatbotPanel');
    if (chatbotInput && chatbotPanel) {
        chatbotInput.value = `What can I do with the tool '${tool.name}'?`;
        chatbotPanel.style.display = 'block';
        chatbotPanel.classList.add('chatbot-animate');
        setTimeout(() => chatbotPanel.classList.remove('chatbot-animate'), 400);
        chatbotInput.focus();
    }
});

window.addEventListener('tools-page-loaded', (e) => {
    const chatbotRecommendations = document.getElementById('chatbotRecommendations');
    if (!chatbotRecommendations) return;
    const recent = (window.toolsPage?.recentTools || []).slice(0, 3);
    const favorites = (window.toolsPage?.favorites || []).slice(0, 3);
    let html = '';
    if (recent.length) {
        html += '<div class="rec-section"><strong>Recently Used:</strong> ' + recent.map(id => {
            const tool = window.toolsPage.getTool(null, id);
            return tool ? `<button class="rec-btn" data-id="${tool.id}">${tool.name}</button>` : '';
        }).join(' ') + '</div>';
    }
    if (favorites.length) {
        html += '<div class="rec-section"><strong>Favorites:</strong> ' + favorites.map(fav => {
            const tool = window.toolsPage.getTool(fav.category, fav.toolId);
            return tool ? `<button class="rec-btn" data-id="${tool.id}">${tool.name}</button>` : '';
        }).join(' ') + '</div>';
    }
    chatbotRecommendations.innerHTML = html;
    chatbotRecommendations.querySelectorAll('.rec-btn').forEach(btn => {
        btn.onclick = () => {
            const tool = window.toolsPage.getTool(null, btn.dataset.id);
            if (tool) {
                document.getElementById('chatbotInput').value = `What can I do with the tool '${tool.name}'?`;
                document.getElementById('chatbotInput').focus();
            }
        };
    });
});

window.addEventListener('tool-modal-opened', (e) => {
    const tool = e.detail;
    const chatbotRecommendations = document.getElementById('chatbotRecommendations');
    if (!chatbotRecommendations) return;
    chatbotRecommendations.innerHTML = `<div class="rec-section"><strong>Tip:</strong> Ask about <b>${tool.name}</b> or try related tools!</div>`;
}); 