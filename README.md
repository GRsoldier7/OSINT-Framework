# 🚀 Ultimate OSINT Framework v3.0

> **The Absolute Best and Most Comprehensive OSINT Framework** - Now with 200+ tools across 12 categories, powered by AI and enhanced with The Kitchen Sink best practices.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![OSINT](https://img.shields.io/badge/OSINT-Framework-red.svg)](https://github.com/OSINTI4L/The-Kitchen-Sink)
[![AI Powered](https://img.shields.io/badge/AI-Powered-purple.svg)](https://openrouter.ai/)

## 🌟 What's New in v3.0

### 🎯 **Enhanced with The Kitchen Sink Best Practices**
- **200+ Integrated Tools** across 12 comprehensive categories
- **AI-Powered Analysis** with OpenRouter integration
- **Advanced Search Capabilities** including Google Dorks, Shodan, Censys
- **Social Media Intelligence** with cross-platform analysis
- **Geographic & Location Intelligence** with satellite imagery
- **Financial & Business Intelligence** with blockchain analysis
- **Threat Intelligence & Security** with vulnerability assessment
- **Data Visualization & Reporting** with interactive dashboards

### 🚀 **Key Features**
- **Intelligent Chatbot** with tool recommendations
- **Real-time Data Processing** with live updates
- **Modular Architecture** for easy extensibility
- **Enterprise-Ready** with security and compliance features
- **Cross-Platform** web, mobile, and API access
- **Open Source** with community-driven development

## 📊 Tool Categories

### 🔍 **Search & Discovery (15 tools)**
- Advanced Google Dorks with deep web discovery
- Bing Advanced Search with filters
- DuckDuckGo Privacy-focused search
- Yandex International search capabilities
- Baidu Chinese search engine
- Shodan IoT and device search
- Censys Internet-wide scanning
- BinaryEdge Threat Intelligence
- ZoomEye Global cyberspace mapping
- Reverse image search across platforms
- Face search and recognition
- And more...

### 📱 **Social Media & Networks (15 tools)**
- Twitter/X Advanced Search with sentiment analysis
- Instagram Location and hashtag analysis
- Facebook Graph API integration
- LinkedIn Company Intelligence
- TikTok Trend Analysis
- Reddit Subreddit Analysis
- Cross-platform username enumeration
- Social media footprint mapping
- Influencer network analysis
- Content sentiment analysis
- And more...

### 🌍 **Geographic & Location (10 tools)**
- Google Earth Pro integration
- OpenStreetMap data extraction
- Historical satellite imagery
- Drone footage analysis
- Foursquare venue intelligence
- Yelp business intelligence
- Shadow mapping for urban analysis
- Flight tracking and aviation data
- Crowd capacity estimation
- And more...

### 🏢 **People & Identity (9 tools)**
- Email address validation and analysis
- Phone number intelligence
- Username correlation across platforms
- Professional profile analysis
- Contact information enrichment
- Public records search
- Court document analysis
- Business registration lookup
- Professional license verification

### 💰 **Financial & Business (9 tools)**
- Comprehensive company research
- Financial statement analysis
- Patent and trademark search
- Corporate structure mapping
- Executive profile analysis
- Cryptocurrency transaction analysis
- Blockchain address tracking
- Financial regulatory data
- Investment portfolio analysis

### 🛡️ **Threat Intelligence & Security (9 tools)**
- Vulnerability assessment
- CVE database integration
- Exploit database search
- Security advisory monitoring
- Risk scoring and assessment
- IOC (Indicators of Compromise) analysis
- Malware family identification
- Attack pattern recognition
- Threat actor profiling

### 🌐 **Network & Infrastructure (13 tools)**
- Domain analysis and WHOIS enrichment
- DNS record analysis and monitoring
- SSL certificate monitoring
- Subdomain enumeration
- Domain reputation scoring
- Multi-provider IP geolocation
- ASN information and routing
- Port scanning and service detection
- Network topology mapping
- Threat intelligence integration
- And more...

### 📄 **Documents & Files (8 tools)**
- PDF metadata extraction
- Office document analysis
- Image EXIF extraction
- Hash analysis and verification
- File type identification
- Malware analysis integration
- Digital signature verification
- Advanced metadata extraction

### 🤖 **AI & Analysis (10 tools)**
- AI-powered analysis with GPT-4
- Sentiment analysis
- Entity extraction and recognition
- Language detection and translation
- Content summarization
- Image classification and tagging
- Object detection and recognition
- Visual similarity search
- Pattern recognition
- Threat assessment

### 🖼️ **Images & Visual (3 tools)**
- Image analysis with OCR and metadata
- Reverse image search across platforms
- Face detection and analysis

### 📊 **Data & Archives (6 tools)**
- Wayback Machine integration
- Advanced metadata extraction
- Document version tracking
- Archive content analysis
- EXIF and metadata viewing
- Historical data analysis

### 📈 **Data Visualization & Reporting (9 tools)**
- Interactive dashboards
- Real-time data visualization
- Network relationship mapping
- Timeline analysis
- Geographic mapping
- Automated report generation
- Evidence documentation
- Export to multiple formats
- Collaboration features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenRouter API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/OSINT-Framework.git
cd OSINT-Framework

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your API keys
nano .env

# Start the server
npm start
```

### Environment Configuration

```bash
# .env file
NODE_ENV=development
PORT=3000

# AI Configuration (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=meta-llama/llama-4-maverick:free

# Optional: OpenAI (fallback)
OPENAI_API_KEY=your_openai_api_key

# Database (optional)
MONGODB_URI=mongodb://localhost:27017/osint-framework
REDIS_URL=redis://localhost:6379
```

### Access the Application

- **Main Application**: http://localhost:3000
- **Tools Hub**: http://localhost:3000/tools
- **API Documentation**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## 🎯 Usage Examples

### 🔍 Advanced Search
```bash
# Google Dorks search
curl -X POST "http://localhost:3000/api/tools/search/advancedGoogleDorks/execute" \
  -H "Content-Type: application/json" \
  -d '{"query": "site:example.com filetype:pdf", "operators": ["site:", "filetype:"]}'
```

### 📱 Social Media Analysis
```bash
# Twitter advanced search
curl -X POST "http://localhost:3000/api/tools/socialMedia/twitterAdvancedSearch/execute" \
  -H "Content-Type: application/json" \
  -d '{"query": "OSINT", "filters": {"sentiment": "positive", "date": "2024-01-01"}}'
```

### 🌍 Geographic Intelligence
```bash
# Historical satellite imagery
curl -X POST "http://localhost:3000/api/tools/geographic/historicalImagery/execute" \
  -H "Content-Type: application/json" \
  -d '{"location": "New York", "dateRange": "2020-2024"}'
```

### 🏢 Company Research
```bash
# Company intelligence
curl -X POST "http://localhost:3000/api/tools/financial/companyResearch/execute" \
  -H "Content-Type: application/json" \
  -d '{"company": "Apple Inc", "research": "comprehensive"}'
```

### 🛡️ Security Assessment
```bash
# Vulnerability assessment
curl -X POST "http://localhost:3000/api/tools/security/vulnerabilityAssessment/execute" \
  -H "Content-Type: application/json" \
  -d '{"target": "example.com", "assessment": "comprehensive"}'
```

## 🤖 AI Chatbot Features

The integrated AI chatbot provides:

- **Tool Recommendations**: Suggests relevant tools based on your query
- **OSINT Guidance**: Answers general OSINT questions
- **Workflow Assistance**: Helps create investigation workflows
- **Context Awareness**: Understands your current page and category

### Chatbot Usage
1. Navigate to the Tools Hub
2. Click the chat icon in the bottom-right corner
3. Ask questions like:
   - "How do I find information about a domain?"
   - "What tools should I use for social media analysis?"
   - "Help me create a workflow for investigating a company"

## 📊 API Endpoints

### Core Endpoints
- `GET /api/tools` - Get all tools
- `GET /api/tools/categories` - Get tool categories
- `GET /api/tools/category/:category` - Get tools by category
- `GET /api/tools/:category/:toolId` - Get specific tool details
- `POST /api/tools/:category/:toolId/execute` - Execute a tool
- `GET /api/tools/search?q=query` - Search tools
- `GET /api/tools/recommendations?q=query` - Get tool recommendations

### AI Endpoints
- `POST /api/chat` - AI chat interface
- `GET /api/chat/provider` - Get AI provider information

### Health & Status
- `GET /api/health` - Health check
- `GET /api/statistics` - System statistics

## 🔧 Advanced Configuration

### Custom Tool Integration
```javascript
// Add custom tools in src/services/toolsService.js
const customTool = {
    name: 'Custom Tool',
    description: 'Your custom tool description',
    type: 'custom',
    tags: ['custom', 'tool'],
    api: true,
    internal: true
};
```

### API Rate Limiting
```javascript
// Configure rate limiting in src/routes/tools.js
const toolsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
```

### Database Integration
```javascript
// MongoDB integration for persistent storage
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
```

## 🛡️ Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Sanitizes all inputs
- **CORS Protection**: Configurable cross-origin requests
- **Authentication**: Role-based access control (enterprise)
- **Audit Logging**: Comprehensive activity logging
- **Data Encryption**: Secure data storage and transmission

## 📈 Performance Optimization

- **Caching**: Redis-based caching for API responses
- **Compression**: Gzip compression for responses
- **CDN Ready**: Static asset optimization
- **Database Indexing**: Optimized database queries
- **Load Balancing**: Horizontal scaling support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Install development dependencies
npm install --dev

# Run tests
npm test

# Run linting
npm run lint

# Start development server
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **The Kitchen Sink Repository** for inspiration and best practices
- **OpenRouter** for AI capabilities
- **Open Source Community** for tools and libraries
- **OSINT Community** for feedback and contributions

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-username/OSINT-Framework/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/OSINT-Framework/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/OSINT-Framework/discussions)
- **Email**: support@osint-framework.com

## 🎯 Roadmap

### v3.1 (Q2 2024)
- [ ] Mobile application
- [ ] Advanced workflow builder
- [ ] Real-time collaboration
- [ ] Plugin marketplace

### v3.2 (Q3 2024)
- [ ] Machine learning models
- [ ] Advanced visualization
- [ ] Enterprise features
- [ ] API marketplace

### v4.0 (Q4 2024)
- [ ] Distributed processing
- [ ] Advanced AI capabilities
- [ ] Blockchain integration
- [ ] Global deployment

---

**Made with ❤️ by the OSINT Community**

*This framework is designed for legitimate OSINT research and investigation purposes only. Please ensure compliance with all applicable laws and regulations.*