const fs = require('fs');
const path = require('path');

// Tool extraction and categorization script
class ToolExtractor {
    constructor() {
        this.tools = new Map(); // Use Map to avoid duplicates by URL
        this.categories = new Map();
    }

    // Extract tools from The Kitchen Sink
    extractKitchenSink() {
        console.log('🔍 Extracting tools from The Kitchen Sink...');
        
        const categories = {
            'People Search': {
                icon: '👥',
                subcategories: {
                    'General People Search': '🔍',
                    'Voter Records': '🗳️',
                    'Yearbooks': '📚'
                }
            },
            'Death Search': {
                icon: '🪦',
                subcategories: {
                    'Obituaries': '📰',
                    'Grave Search': '🏛️'
                }
            },
            'Telephone Numbers': {
                icon: '📞',
                subcategories: {
                    'Phone Lookup': '🔍',
                    'Carrier Lookup': '📡',
                    'Voicemail Access': '🎙️'
                }
            },
            'Email': {
                icon: '✉️',
                subcategories: {
                    'Account Discovery': '🔍',
                    'Email Verification': '✅',
                    'Email Format': '📝',
                    'Header Analysis': '📋'
                }
            },
            'Usernames': {
                icon: '👤',
                subcategories: {
                    'Username Search': '🔍',
                    'Social Media Check': '📱'
                }
            },
            'Social Media': {
                icon: '📱',
                subcategories: {
                    'Instagram': '📸',
                    'Facebook': '📘',
                    'Twitter/X': '🐦',
                    'Pinterest': '📌',
                    'Tumblr': '💭',
                    'Patreon': '💝',
                    'TikTok': '🎵',
                    'Reddit': '🤖',
                    'Imgur': '🖼️',
                    'YouTube': '📺',
                    'Twitch': '🎮',
                    'Telegram': '📢',
                    'Snapchat': '👻',
                    'Linktree': '🌳',
                    'Tinder': '💕',
                    'OnlyFans': '🔞',
                    'Forums': '💬',
                    'Analytics': '📊'
                }
            },
            'Property Information': {
                icon: '🏠',
                subcategories: {
                    'Property Records': '📋',
                    'Real Estate': '🏘️'
                }
            },
            'Professional Licenses': {
                icon: '⚒️',
                subcategories: {
                    'License Lookup': '🔍',
                    'Professional Info': '💼'
                }
            },
            'Criminal Background': {
                icon: '🚓',
                subcategories: {
                    'Criminal Records': '📋',
                    'Inmate Lookup': '🔒',
                    'Sex Offender Database': '⚠️',
                    'Warrants': '🚨'
                }
            },
            'Court and Government Records': {
                icon: '🏛️',
                subcategories: {
                    'Court Records': '⚖️',
                    'Public Records': '📄',
                    'FOIA': '🔍',
                    'Government Contracts': '📋'
                }
            },
            'Donations': {
                icon: '💰',
                subcategories: {
                    'Campaign Donations': '🗳️',
                    'Political Contributions': '🏛️'
                }
            },
            'Businesses and NonProfits': {
                icon: '🏢',
                subcategories: {
                    'Business Information': '📊',
                    'Non-Profit Records': '🤝',
                    'Reviews': '⭐'
                }
            },
            'Search Engines': {
                icon: '🔍',
                subcategories: {
                    'General Search': '🌐',
                    'Advanced Search': '⚡',
                    'Dorking': '🔧',
                    'Specialty Search': '🎯'
                }
            },
            'Maps and Geolocation': {
                icon: '🗺️',
                subcategories: {
                    'Maps': '🗺️',
                    'Street View': '🏙️',
                    'Satellite Imagery': '🛰️',
                    'Geolocation': '📍',
                    'Sun/Shadow Analysis': '☀️'
                }
            },
            'Image Video and Documents': {
                icon: '📷',
                subcategories: {
                    'Image Search': '🔍',
                    'Facial Recognition': '👤',
                    'Image Analysis': '🔬',
                    'Video Tools': '🎥',
                    'Document Analysis': '📄',
                    'EXIF Data': '📊'
                }
            },
            'Credential Breaches': {
                icon: '🔓',
                subcategories: {
                    'Breach Lookup': '🔍',
                    'Data Breaches': '💾'
                }
            },
            'Tor Hidden Services': {
                icon: '🧅',
                subcategories: {
                    'Link Directories': '📁',
                    'Forums': '💬',
                    'Search Engines': '🔍',
                    'Journalism': '📰'
                }
            },
            'Domains': {
                icon: '🌐',
                subcategories: {
                    'URL Scanning': '🔍',
                    'Domain Lookup': '🔎',
                    'WHOIS': '📋',
                    'SSL Certificates': '🔒',
                    'Subdomain Enumeration': '🔍',
                    'Website Mirroring': '📋'
                }
            },
            'IP Addresses': {
                icon: '🔢',
                subcategories: {
                    'IP Lookup': '🔍',
                    'Malicious IP': '⚠️',
                    'Tor Relays': '🧅',
                    'Torrent Tracking': '📥'
                }
            },
            'Radio Frequency': {
                icon: '📻',
                subcategories: {
                    'Radio Database': '📊',
                    'FCC Database': '📋',
                    'Live Radio': '🎵',
                    'Wireless Networks': '📶'
                }
            },
            'Transportation': {
                icon: '✈️',
                subcategories: {
                    'Vehicle Lookup': '🚗',
                    'Flight Tracking': '✈️',
                    'Maritime Tracking': '🚢',
                    'Railway Tracking': '🚂',
                    'Cargo Tracking': '📦'
                }
            },
            'Webcams': {
                icon: '📹',
                subcategories: {
                    'Live Webcams': '📹'
                }
            },
            'Sock Account Creation': {
                icon: '🧦',
                subcategories: {
                    'Persona Creation': '👤',
                    'Fake Identity': '🆔',
                    'Burner Services': '🔥'
                }
            }
        };

        // Parse the OSINTials.md file
        const content = fs.readFileSync('temp_repos/The-Kitchen-Sink/OSINTials.md', 'utf8');
        
        let currentCategory = '';
        let currentSubcategory = '';
        
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for category headers
            if (line.startsWith('## ')) {
                const categoryName = line.replace('## ', '').trim();
                if (categories[categoryName]) {
                    currentCategory = categoryName;
                    currentSubcategory = '';
                }
            }
            
            // Check for subcategory headers
            if (line.startsWith('### ')) {
                const subcategoryName = line.replace('### ', '').trim();
                if (categories[currentCategory]?.subcategories[subcategoryName]) {
                    currentSubcategory = subcategoryName;
                }
            }
            
            // Extract tools from table rows
            if (line.includes('|') && line.includes('[') && line.includes(']')) {
                const parts = line.split('|').map(p => p.trim()).filter(p => p);
                if (parts.length >= 2) {
                    const toolName = parts[0].replace(/\[([^\]]+)\]\([^)]+\)/, '$1');
                    const toolUrl = parts[0].match(/\[([^\]]+)\]\(([^)]+)\)/)?.[2] || '';
                    const description = parts[1] || '';
                    
                    if (toolName && toolUrl && currentCategory) {
                        const toolKey = toolUrl.toLowerCase();
                        if (!this.tools.has(toolKey)) {
                            this.tools.set(toolKey, {
                                name: toolName,
                                url: toolUrl,
                                description: description,
                                category: currentCategory,
                                subcategory: currentSubcategory || 'General',
                                icon: categories[currentCategory]?.icon || '🔧',
                                subcategoryIcon: categories[currentCategory]?.subcategories[currentSubcategory] || '📋',
                                sourceRepo: 'The-Kitchen-Sink',
                                tags: this.generateTags(currentCategory, currentSubcategory, description),
                                type: 'web'
                            });
                        }
                    }
                }
            }
        }
        
        console.log(`✅ Extracted ${this.tools.size} tools from The Kitchen Sink`);
    }

    // Extract tools from Awesome OSINT
    extractAwesomeOSINT() {
        console.log('🔍 Extracting tools from Awesome OSINT...');
        
        const content = fs.readFileSync('temp_repos/awesome-osint/README.md', 'utf8');
        
        // Define category mappings for Awesome OSINT
        const categoryMappings = {
            'General Search': 'Search Engines',
            'Main National Search Engines': 'Search Engines',
            'Meta Search': 'Search Engines',
            'Specialty Search Engines': 'Search Engines',
            'Dark Web Search Engines': 'Tor Hidden Services',
            'Visual Search and Clustering Search Engines': 'Search Engines',
            'Similar Sites Search': 'Search Engines',
            'Document and Slides Search': 'Documents & Files',
            'Digital Footprint Tools': 'Digital Footprint',
            'Threat Actor Search': 'Threat Intelligence',
            'Live Cyber Attack Maps': 'Threat Intelligence',
            'File Search': 'Documents & Files',
            'Pastebins': 'Data & Archives',
            'Code Search': 'Code Analysis',
            'Major Social Networks': 'Social Media',
            'Real-Time Search, Social Media Search, and General Social Media Tools': 'Social Media',
            'Social Media Tools': 'Social Media',
            'Blog Search': 'Search Engines',
            'Forums and Discussion Boards Search': 'Social Media',
            'Username Check': 'Usernames',
            'People Investigations': 'People Search',
            'Email Search / Email Check': 'Email',
            'Phone Number Research': 'Telephone Numbers',
            'Vehicle / Automobile Research': 'Transportation',
            'Expert Search': 'People Search',
            'Company Research': 'Businesses and NonProfits',
            'Job Search Resources': 'People Search',
            'Q&A Sites': 'Social Media',
            'Domain and IP Research': 'Domains',
            'Keywords Discovery and Research': 'Search Engines',
            'Web History and Website Capture': 'Data & Archives',
            'Language Tools': 'Language & Translation',
            'Image Search': 'Image Video and Documents',
            'Image Analysis': 'Image Video and Documents',
            'Video Search and Other Video Tools': 'Image Video and Documents',
            'Academic Resources and Grey Literature': 'Academic Research',
            'Geospatial Research and Mapping Tools': 'Maps and Geolocation',
            'News': 'News & Media',
            'News Digest and Discovery Tools': 'News & Media',
            'Fact Checking': 'News & Media',
            'Data and Statistics': 'Data & Archives',
            'Web Monitoring': 'Monitoring',
            'Browsers': 'Browsers & Privacy',
            'Offline Browsing': 'Browsers & Privacy',
            'VPN Services': 'Privacy & Security',
            'Infographics and Data Visualization': 'Data Visualization',
            'Social Network Analysis': 'Social Media',
            'Privacy and Encryption Tools': 'Privacy & Security',
            'DNS': 'Domains',
            'Maritime': 'Transportation',
            'Other Tools': 'Miscellaneous',
            'Threat Intelligence': 'Threat Intelligence'
        };

        let currentCategory = '';
        let currentSubcategory = '';
        
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for category headers
            if (line.startsWith('## [↑](#-table-of-contents) ')) {
                const categoryName = line.replace('## [↑](#-table-of-contents) ', '').trim();
                if (categoryMappings[categoryName]) {
                    currentCategory = categoryMappings[categoryName];
                    currentSubcategory = '';
                }
            }
            
            // Extract tools from list items
            if (line.startsWith('* [') && line.includes('](') && line.includes(')')) {
                const toolMatch = line.match(/\* \[([^\]]+)\]\(([^)]+)\)/);
                if (toolMatch) {
                    const toolName = toolMatch[1];
                    const toolUrl = toolMatch[2];
                    const description = line.split(' - ')[1] || '';
                    
                    if (toolName && toolUrl && currentCategory) {
                        const toolKey = toolUrl.toLowerCase();
                        if (!this.tools.has(toolKey)) {
                            this.tools.set(toolKey, {
                                name: toolName,
                                url: toolUrl,
                                description: description,
                                category: currentCategory,
                                subcategory: currentSubcategory || 'General',
                                icon: this.getCategoryIcon(currentCategory),
                                subcategoryIcon: this.getSubcategoryIcon(currentSubcategory),
                                sourceRepo: 'awesome-osint',
                                tags: this.generateTags(currentCategory, currentSubcategory, description),
                                type: 'web'
                            });
                        }
                    }
                }
            }
        }
        
        console.log(`✅ Extracted ${this.tools.size} tools from Awesome OSINT`);
    }

    // Add CLI tools
    addCLITools() {
        console.log('🔍 Adding CLI tools...');
        
        const cliTools = [
            {
                name: 'theHarvester',
                url: 'https://github.com/laramies/theHarvester',
                description: 'Gather subdomains, emails, and IP addresses of target websites',
                category: 'Domains',
                subcategory: 'Subdomain Enumeration',
                icon: '🌐',
                subcategoryIcon: '🔍',
                sourceRepo: 'theHarvester',
                tags: ['cli', 'subdomains', 'emails', 'reconnaissance'],
                type: 'cli'
            },
            {
                name: 'Sherlock',
                url: 'https://github.com/sherlock-project/sherlock',
                description: 'Hunt down social media accounts by username across social networks',
                category: 'Usernames',
                subcategory: 'Username Search',
                icon: '👤',
                subcategoryIcon: '🔍',
                sourceRepo: 'sherlock',
                tags: ['cli', 'social-media', 'username', 'reconnaissance'],
                type: 'cli'
            },
            {
                name: 'Maigret',
                url: 'https://github.com/soxoj/maigret',
                description: 'Collect a dossier on a person by username, email, or name',
                category: 'Usernames',
                subcategory: 'Username Search',
                icon: '👤',
                subcategoryIcon: '🔍',
                sourceRepo: 'awesome-osint',
                tags: ['cli', 'social-media', 'username', 'reconnaissance'],
                type: 'cli'
            },
            {
                name: 'Holehe',
                url: 'https://github.com/megadose/holehe',
                description: 'Check if an email is attached to an account on sites like Twitter, Instagram, and more',
                category: 'Email',
                subcategory: 'Account Discovery',
                icon: '✉️',
                subcategoryIcon: '🔍',
                sourceRepo: 'The-Kitchen-Sink',
                tags: ['cli', 'email', 'account-discovery', 'social-media'],
                type: 'cli'
            },
            {
                name: 'Socialscan',
                url: 'https://github.com/iojw/socialscan',
                description: 'Check email address and username usage on online platforms',
                category: 'Email',
                subcategory: 'Account Discovery',
                icon: '✉️',
                subcategoryIcon: '🔍',
                sourceRepo: 'The-Kitchen-Sink',
                tags: ['cli', 'email', 'username', 'account-discovery'],
                type: 'cli'
            },
            {
                name: 'Crosslinked',
                url: 'https://github.com/m8sec/crosslinked',
                description: 'Scrape LinkedIn for employee email addresses',
                category: 'Email',
                subcategory: 'Account Discovery',
                icon: '✉️',
                subcategoryIcon: '🔍',
                sourceRepo: 'The-Kitchen-Sink',
                tags: ['cli', 'email', 'linkedin', 'scraping'],
                type: 'cli'
            },
            {
                name: 'Spiderfoot',
                url: 'https://github.com/smicallef/spiderfoot',
                description: 'Automated OSINT collection and reconnaissance platform',
                category: 'Reconnaissance',
                subcategory: 'Automated OSINT',
                icon: '🕷️',
                subcategoryIcon: '🤖',
                sourceRepo: 'The-Kitchen-Sink',
                tags: ['cli', 'automation', 'reconnaissance', 'osint'],
                type: 'cli'
            },
            {
                name: 'Sublist3r',
                url: 'https://github.com/aboul3la/Sublist3r',
                description: 'Fast subdomains enumeration tool for penetration testers',
                category: 'Domains',
                subcategory: 'Subdomain Enumeration',
                icon: '🌐',
                subcategoryIcon: '🔍',
                sourceRepo: 'awesome-osint',
                tags: ['cli', 'subdomains', 'penetration-testing'],
                type: 'cli'
            },
            {
                name: 'Photon',
                url: 'https://github.com/s0md3v/Photon',
                description: 'Incredibly fast crawler designed for OSINT',
                category: 'Reconnaissance',
                subcategory: 'Web Crawling',
                icon: '🕷️',
                subcategoryIcon: '🕸️',
                sourceRepo: 'awesome-osint',
                tags: ['cli', 'crawler', 'osint', 'reconnaissance'],
                type: 'cli'
            },
            {
                name: 'Metagoofil',
                url: 'https://github.com/opsdisk/metagoofil',
                description: 'Metadata harvester for OSINT',
                category: 'Documents & Files',
                subcategory: 'Metadata Extraction',
                icon: '📄',
                subcategoryIcon: '📊',
                sourceRepo: 'awesome-osint',
                tags: ['cli', 'metadata', 'documents', 'osint'],
                type: 'cli'
            }
        ];

        cliTools.forEach(tool => {
            const toolKey = tool.url.toLowerCase();
            if (!this.tools.has(toolKey)) {
                this.tools.set(toolKey, tool);
            }
        });

        console.log(`✅ Added ${cliTools.length} CLI tools`);
    }

    // Generate tags based on category, subcategory, and description
    generateTags(category, subcategory, description) {
        const tags = [];
        
        // Add category-based tags
        if (category) tags.push(category.toLowerCase().replace(/\s+/g, '-'));
        if (subcategory) tags.push(subcategory.toLowerCase().replace(/\s+/g, '-'));
        
        // Add description-based tags
        const desc = description.toLowerCase();
        if (desc.includes('search')) tags.push('search');
        if (desc.includes('social')) tags.push('social-media');
        if (desc.includes('email')) tags.push('email');
        if (desc.includes('domain')) tags.push('domain');
        if (desc.includes('ip')) tags.push('ip');
        if (desc.includes('people')) tags.push('people');
        if (desc.includes('business')) tags.push('business');
        if (desc.includes('criminal')) tags.push('criminal');
        if (desc.includes('court')) tags.push('court');
        if (desc.includes('property')) tags.push('property');
        if (desc.includes('license')) tags.push('license');
        if (desc.includes('breach')) tags.push('breach');
        if (desc.includes('tor')) tags.push('tor');
        if (desc.includes('dark')) tags.push('dark-web');
        if (desc.includes('free')) tags.push('free');
        if (desc.includes('paid')) tags.push('paid');
        if (desc.includes('api')) tags.push('api');
        
        return [...new Set(tags)]; // Remove duplicates
    }

    // Get category icon
    getCategoryIcon(category) {
        const icons = {
            'Search Engines': '🔍',
            'Social Media': '📱',
            'People Search': '👥',
            'Email': '✉️',
            'Usernames': '👤',
            'Domains': '🌐',
            'Telephone Numbers': '📞',
            'Businesses and NonProfits': '🏢',
            'Transportation': '✈️',
            'Maps and Geolocation': '🗺️',
            'Image Video and Documents': '📷',
            'Threat Intelligence': '🛡️',
            'Tor Hidden Services': '🧅',
            'Documents & Files': '📄',
            'Data & Archives': '📚',
            'Privacy & Security': '🔒',
            'News & Media': '📰',
            'Academic Research': '🎓',
            'Monitoring': '📊',
            'Browsers & Privacy': '🌐',
            'Data Visualization': '📈',
            'Code Analysis': '💻',
            'Digital Footprint': '👣',
            'Language & Translation': '🌍',
            'Miscellaneous': '🔧',
            'Reconnaissance': '🕵️'
        };
        return icons[category] || '🔧';
    }

    // Get subcategory icon
    getSubcategoryIcon(subcategory) {
        const icons = {
            'General': '📋',
            'Search': '🔍',
            'Lookup': '🔎',
            'Analysis': '🔬',
            'Discovery': '🔍',
            'Verification': '✅',
            'Enumeration': '🔢',
            'Tracking': '📍',
            'Monitoring': '📊',
            'Extraction': '📤',
            'Crawling': '🕷️',
            'Automated OSINT': '🤖',
            'Web Crawling': '🕸️',
            'Metadata Extraction': '📊'
        };
        return icons[subcategory] || '📋';
    }

    // Export to CSV
    exportToCSV() {
        console.log('📊 Exporting tools to CSV...');
        
        const csvHeader = 'Name,URL,Description,Category,Subcategory,Icon,SubcategoryIcon,SourceRepo,Tags,Type\n';
        let csvContent = csvHeader;
        
        for (const tool of this.tools.values()) {
            const row = [
                `"${tool.name}"`,
                `"${tool.url}"`,
                `"${tool.description}"`,
                `"${tool.category}"`,
                `"${tool.subcategory}"`,
                `"${tool.icon}"`,
                `"${tool.subcategoryIcon}"`,
                `"${tool.sourceRepo}"`,
                `"${tool.tags.join(', ')}"`,
                `"${tool.type}"`
            ].join(',');
            
            csvContent += row + '\n';
        }
        
        fs.writeFileSync('tools-master.csv', csvContent);
        console.log(`✅ Exported ${this.tools.size} tools to tools-master.csv`);
        
        // Also export as JSON for backend use
        const jsonData = {
            tools: Array.from(this.tools.values()),
            categories: this.getCategories(),
            totalTools: this.tools.size,
            lastUpdated: new Date().toISOString()
        };
        
        fs.writeFileSync('tools-master.json', JSON.stringify(jsonData, null, 2));
        console.log('✅ Exported tools to tools-master.json');
        
        return jsonData;
    }

    // Get categories structure
    getCategories() {
        const categories = {};
        
        for (const tool of this.tools.values()) {
            if (!categories[tool.category]) {
                categories[tool.category] = {
                    icon: tool.icon,
                    subcategories: {}
                };
            }
            
            if (!categories[tool.category].subcategories[tool.subcategory]) {
                categories[tool.category].subcategories[tool.subcategory] = {
                    icon: tool.subcategoryIcon,
                    count: 0
                };
            }
            
            categories[tool.category].subcategories[tool.subcategory].count++;
        }
        
        return categories;
    }

    // Run the extraction
    run() {
        console.log('🚀 Starting comprehensive OSINT tool extraction...\n');
        
        this.extractKitchenSink();
        this.extractAwesomeOSINT();
        this.addCLITools();
        
        const result = this.exportToCSV();
        
        console.log('\n📊 Extraction Summary:');
        console.log(`Total Tools: ${result.totalTools}`);
        console.log(`Categories: ${Object.keys(result.categories).length}`);
        
        console.log('\n📁 Categories:');
        for (const [category, info] of Object.entries(result.categories)) {
            console.log(`  ${info.icon} ${category} (${Object.keys(info.subcategories).length} subcategories)`);
        }
        
        console.log('\n✅ Extraction complete! Files created:');
        console.log('  - tools-master.csv (for review)');
        console.log('  - tools-master.json (for backend)');
    }
}

// Run the extraction
const extractor = new ToolExtractor();
extractor.run(); 