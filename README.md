# Ultimate OSINT Framework

![OSINT Framework](https://img.shields.io/badge/OSINT-Framework-blue)
![Version](https://img.shields.io/badge/Version-1.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

A comprehensive, browser-based Open Source Intelligence (OSINT) framework that provides investigators, researchers, journalists, and security professionals with a powerful set of tools for gathering and analyzing publicly available information.

## 🔍 Overview

The Ultimate OSINT Framework is designed to be a one-stop solution for all your OSINT needs. It combines the functionality of popular tools like IntelTechniques with the extensive resources from awesome-osint, all in a simple, browser-based interface that requires no installation.

### Key Features

- **Browser-Based**: Run entirely in your browser - no installation required
- **Privacy-Focused**: All processing happens client-side, no data is stored on servers
- **Comprehensive Tools**: Multiple specialized tools for different OSINT tasks
- **Multi-Engine Search**: Search across multiple platforms simultaneously
- **Customizable**: Select which search engines and platforms to use
- **Open Source**: Free to use, modify, and extend
- **AI-Powered**: Leverage advanced AI models for analysis and insights
- **MCP Integration**: Utilize Taskmaster, Context7, and MagicUI for enhanced capabilities

## 🛠️ Architecture

The Ultimate OSINT Framework follows a modular, service-based architecture that separates concerns and provides clear API boundaries between components. The architecture is designed to be scalable, maintainable, and extensible.

### Core Components

- **Core Engine**: Provides the foundation for all OSINT tools and services
- **Module System**: Allows for easy addition of new OSINT tools and capabilities
- **API Layer**: Provides a consistent interface for all OSINT tools and services
- **UI Layer**: Provides a user-friendly interface for interacting with OSINT tools
- **MCP Integration**: Connects to MCP servers for enhanced capabilities

### MCP Servers

The framework integrates with the following MCP servers:

- **Taskmaster**: Provides task management, workflow automation, and progress tracking
- **Context7**: Provides contextual intelligence, knowledge management, and information retrieval
- **MagicUI**: Provides advanced UI components, theming, and interactive visualizations
- **OpenRouter**: Provides access to advanced AI models for enhanced OSINT capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/GRsoldier7/OSINT-Framework.git
   ```

2. Navigate to the project directory:
   ```
   cd OSINT-Framework
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Configure environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file to add your API keys and configuration.

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Production Deployment

1. Build the production version:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## 📚 Tools Included

The framework includes the following specialized tools:

### Search Engines Tool
- Search across multiple search engines simultaneously
- Includes general search engines, specialized search, and social media search
- Customizable search options

### Username Search Tool
- Find accounts associated with a username across various platforms
- Covers social media, professional sites, gaming platforms, and more
- Quickly identify a person's digital footprint

### Email Analysis Tool
- Verify email addresses and check for data breaches
- Find social profiles associated with an email
- Analyze email domain information

### Domain Analysis Tool
- Investigate websites and domains
- Check WHOIS data, DNS records, and technical information
- Analyze website security and reputation

### IP Address Lookup Tool
- Get detailed information about IP addresses
- Check geolocation, reputation, and network information
- Find associated domains and security issues

### AI-Powered Analysis Tool
- Extract entities from text
- Map relationships between entities
- Generate search queries for OSINT research
- Analyze images for OSINT purposes
- Generate comprehensive OSINT reports

## 🔧 Configuration

The framework can be configured using the following configuration files:

- `config/app.config.js`: Main application configuration
- `config/mcp.config.js`: MCP server configuration
- `config/mcp/taskmaster.config.js`: Taskmaster MCP server configuration
- `config/mcp/context7.config.js`: Context7 MCP server configuration
- `config/mcp/magicui.config.js`: MagicUI MCP server configuration
- `config/mcp/openrouter.config.js`: OpenRouter AI configuration

## 📊 Logging

The framework includes a comprehensive logging system that follows the Vibe Coding guidelines for always-on comprehensive logging. Logs are structured and include detailed context for all operations.

### Log Levels

- `debug`: Detailed debugging information
- `info`: General information about the application's operation
- `warn`: Warning messages that don't affect the application's operation
- `error`: Error messages that affect the application's operation

### Log Formats

- `json`: Structured JSON logs for machine processing
- `text`: Human-readable text logs

## 🔒 Security

The framework includes robust security features to protect against common web vulnerabilities:

- **Input Validation**: All user inputs are validated and sanitized
- **CORS Protection**: Cross-Origin Resource Sharing protection
- **Content Security Policy**: Prevents XSS and other injection attacks
- **XSS Protection**: Additional protection against cross-site scripting
- **Frame Options**: Prevents clickjacking attacks
- **Referrer Policy**: Controls the information sent in the Referer header

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

Please follow the [Vibe Coding Markdown Rulebook](./Vibe%20Coding%20Markdown%20Rulebook.md) for all contributions.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [awesome-osint](https://github.com/jivoi/awesome-osint) for the comprehensive list of OSINT resources
- [IntelTechniques](https://inteltechniques.com) for inspiration on tool design and functionality
- All the amazing OSINT tools and services that this framework connects to

## ⚠️ Disclaimer

This framework is provided for legitimate OSINT research and educational purposes only. Always respect privacy, terms of service of the platforms you're using, and applicable laws and regulations. The authors are not responsible for any misuse of this tool or any information gathered using it.

## 📞 Contact

For questions, suggestions, or issues, please open an issue on GitHub or contact the repository owner.

---

Made with ❤️ by the OSINT community
