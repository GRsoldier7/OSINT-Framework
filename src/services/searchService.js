const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { logger } = require('../utils/logger');

class SearchService {
  constructor() {
    this.searchEngines = {
      general: {
        google: 'https://www.google.com/search?q=',
        bing: 'https://www.bing.com/search?q=',
        yahoo: 'https://search.yahoo.com/search?p=',
        duckduckgo: 'https://duckduckgo.com/?q=',
        yandex: 'https://yandex.com/search/?text=',
        baidu: 'https://www.baidu.com/s?wd=',
        startpage: 'https://www.startpage.com/do/search?q=',
        qwant: 'https://www.qwant.com/?q='
      },
      specialized: {
        'google-news': 'https://news.google.com/search?q=',
        'google-images': 'https://www.google.com/search?tbm=isch&q=',
        'google-videos': 'https://www.google.com/search?tbm=vid&q=',
        'google-maps': 'https://www.google.com/maps/search/',
        'google-books': 'https://www.google.com/search?tbm=bks&q=',
        'google-scholar': 'https://scholar.google.com/scholar?q=',
        'bing-news': 'https://www.bing.com/news/search?q=',
        'bing-images': 'https://www.bing.com/images/search?q=',
        'bing-videos': 'https://www.bing.com/videos/search?q='
      },
      social: {
        twitter: 'https://twitter.com/search?q=',
        facebook: 'https://www.facebook.com/search/top/?q=',
        instagram: 'https://www.instagram.com/explore/tags/',
        linkedin: 'https://www.linkedin.com/search/results/all/?keywords=',
        reddit: 'https://www.reddit.com/search/?q=',
        youtube: 'https://www.youtube.com/results?search_query=',
        tiktok: 'https://www.tiktok.com/search?q=',
        pinterest: 'https://www.pinterest.com/search/pins/?q='
      }
    };
  }

  async searchMultipleEngines(query, engines = [], options = {}) {
    const results = {
      query,
      timestamp: new Date().toISOString(),
      results: {},
      metadata: {
        totalEngines: engines.length,
        successfulSearches: 0,
        failedSearches: 0
      }
    };

    const searchPromises = engines.map(async (engine) => {
      try {
        const engineUrl = this.getEngineUrl(engine);
        if (!engineUrl) {
          throw new Error(`Unknown search engine: ${engine}`);
        }

        const searchUrl = engineUrl + encodeURIComponent(query);
        const searchResult = await this.performSearch(searchUrl, engine, options);
        
        results.results[engine] = searchResult;
        results.metadata.successfulSearches++;
        
        return { engine, success: true, data: searchResult };
      } catch (error) {
        logger.error(`Search failed for engine ${engine}:`, error);
        results.results[engine] = { error: error.message };
        results.metadata.failedSearches++;
        
        return { engine, success: false, error: error.message };
      }
    });

    await Promise.allSettled(searchPromises);
    return results;
  }

  async performSearch(url, engine, options = {}) {
    const { usePuppeteer = false, timeout = 10000, userAgent } = options;

    if (usePuppeteer) {
      return await this.searchWithPuppeteer(url, engine, options);
    } else {
      return await this.searchWithAxios(url, engine, options);
    }
  }

  async searchWithAxios(url, engine, options = {}) {
    const { timeout = 10000, userAgent } = options;
    
    const config = {
      timeout,
      headers: {
        'User-Agent': userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };

    const response = await axios.get(url, config);
    return this.parseSearchResults(response.data, engine);
  }

  async searchWithPuppeteer(url, engine, options = {}) {
    const { timeout = 10000, headless = true } = options;
    
    const browser = await puppeteer.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setDefaultTimeout(timeout);
      
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Wait for search results to load
      await page.waitForSelector('body', { timeout });
      
      const content = await page.content();
      return this.parseSearchResults(content, engine);
    } finally {
      await browser.close();
    }
  }

  parseSearchResults(html, engine) {
    const $ = cheerio.load(html);
    const results = [];

    try {
      switch (engine) {
        case 'google':
          results.push(...this.parseGoogleResults($));
          break;
        case 'bing':
          results.push(...this.parseBingResults($));
          break;
        case 'duckduckgo':
          results.push(...this.parseDuckDuckGoResults($));
          break;
        default:
          results.push(...this.parseGenericResults($));
      }
    } catch (error) {
      logger.error(`Error parsing results for ${engine}:`, error);
    }

    return {
      engine,
      count: results.length,
      results,
      rawHtml: html.substring(0, 1000) // First 1000 chars for debugging
    };
  }

  parseGoogleResults($) {
    const results = [];
    
    $('.g').each((i, element) => {
      const title = $(element).find('h3').text().trim();
      const url = $(element).find('a').attr('href');
      const snippet = $(element).find('.VwiC3b').text().trim();
      
      if (title && url) {
        results.push({ title, url, snippet });
      }
    });

    return results;
  }

  parseBingResults($) {
    const results = [];
    
    $('.b_algo').each((i, element) => {
      const title = $(element).find('h2 a').text().trim();
      const url = $(element).find('h2 a').attr('href');
      const snippet = $(element).find('.b_caption p').text().trim();
      
      if (title && url) {
        results.push({ title, url, snippet });
      }
    });

    return results;
  }

  parseDuckDuckGoResults($) {
    const results = [];
    
    $('.result').each((i, element) => {
      const title = $(element).find('.result__title').text().trim();
      const url = $(element).find('.result__url').text().trim();
      const snippet = $(element).find('.result__snippet').text().trim();
      
      if (title && url) {
        results.push({ title, url, snippet });
      }
    });

    return results;
  }

  parseGenericResults($) {
    const results = [];
    
    // Generic parsing for unknown engines
    $('a[href*="http"]').each((i, element) => {
      const title = $(element).text().trim();
      const url = $(element).attr('href');
      
      if (title && url && title.length > 10 && url.length > 10) {
        results.push({ title, url, snippet: '' });
      }
    });

    return results.slice(0, 10); // Limit to first 10 results
  }

  getEngineUrl(engine) {
    for (const category of Object.values(this.searchEngines)) {
      if (category[engine]) {
        return category[engine];
      }
    }
    return null;
  }

  async searchWithFilters(query, filters = {}) {
    const { dateRange, language, region, fileType, site } = filters;
    let modifiedQuery = query;

    // Add date range filter
    if (dateRange) {
      modifiedQuery += ` ${this.buildDateFilter(dateRange)}`;
    }

    // Add language filter
    if (language) {
      modifiedQuery += ` lang:${language}`;
    }

    // Add site filter
    if (site) {
      modifiedQuery += ` site:${site}`;
    }

    // Add file type filter
    if (fileType) {
      modifiedQuery += ` filetype:${fileType}`;
    }

    return await this.searchMultipleEngines(modifiedQuery, ['google', 'bing'], { usePuppeteer: true });
  }

  buildDateFilter(dateRange) {
    const now = new Date();
    const ranges = {
      'day': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      'week': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      'month': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      'year': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };

    if (ranges[dateRange]) {
      const date = ranges[dateRange];
      return `after:${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    return '';
  }

  async getSearchSuggestions(query) {
    try {
      const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
      const response = await axios.get(url);
      return response.data[1] || [];
    } catch (error) {
      logger.error('Error fetching search suggestions:', error);
      return [];
    }
  }

  async searchTrends(query) {
    try {
      // This would integrate with Google Trends API or similar
      const trends = await this.getGoogleTrends(query);
      return trends;
    } catch (error) {
      logger.error('Error fetching search trends:', error);
      return [];
    }
  }

  async getGoogleTrends(query) {
    // Placeholder for Google Trends integration
    return {
      query,
      trends: [],
      relatedQueries: [],
      relatedTopics: []
    };
  }
}

module.exports = new SearchService(); 