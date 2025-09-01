import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
console.log('Environment check:', {
  hasApiKey: !!API_KEY,
  keyLength: API_KEY?.length,
  keyStart: API_KEY?.substring(0, 10) + '...',
  allEnvVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
});

if (!API_KEY || API_KEY === 'your-gemini-api-key-here') {
  console.error('❌ Gemini API key not found or invalid!');
  console.error('Make sure you have REACT_APP_GEMINI_API_KEY in your .env file');
} else {
  console.log('✅ Gemini API key loaded successfully');
}

const genAI = new GoogleGenerativeAI(API_KEY || 'dummy-key');

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    console.log('🚀 Using Gemini 2.0 Flash - Latest and most advanced model!');
  }

  // Summarize note content
  async summarizeNote(content) {
    try {
      if (!API_KEY || API_KEY === 'dummy-key') {
        throw new Error('API key not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file and restart the server.');
      }

      const prompt = `Please provide a concise summary of the following note content. Keep it brief and capture the main points:

${content}

Summary:`;

      console.log('🤖 Calling Gemini API for summarization...');
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      console.log('✅ Gemini API response received');
      return text;
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText
      });
      
      if (error.message?.includes('API_KEY_INVALID') || error.status === 400) {
        throw new Error('Invalid API key. Please check your Gemini API key in the .env file.');
      } else if (error.status === 403) {
        throw new Error('API key access denied. Make sure your Gemini API key has proper permissions.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before trying again. Consider using Gemini Flash for higher free tier limits.');
      } else {
        throw new Error(`Failed to summarize note: ${error.message}`);
      }
    }
  }

  // Generate smart title from content
  async generateTitle(content) {
    try {
      const prompt = `Based on the following note content, suggest a short, descriptive title (maximum 5-6 words):

${content}

Title:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating title:', error);
      throw new Error('Failed to generate title.');
    }
  }

  // Enhance note content with AI suggestions
  async enhanceNote(content) {
    try {
      const prompt = `Please enhance and improve the following note content while maintaining its original meaning. Make it more clear, organized, and well-structured:

${content}

Enhanced version:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error enhancing note:', error);
      throw new Error('Failed to enhance note.');
    }
  }

  // Extract key points from content
  async extractKeyPoints(content) {
    try {
      const prompt = `Extract the key points from the following note content and format them as a bulleted list:

${content}

Key Points:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error extracting key points:', error);
      throw new Error('Failed to extract key points.');
    }
  }

  // Generate tags for the note
  async generateTags(content) {
    try {
      const prompt = `Based on the following note content, suggest 3-5 relevant tags/keywords (single words or short phrases):

${content}

Tags (comma-separated):`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().split(',').map(tag => tag.trim());
    } catch (error) {
      console.error('Error generating tags:', error);
      throw new Error('Failed to generate tags.');
    }
  }

  // Smart search suggestions
  async getSearchSuggestions(query, notes) {
    try {
      const notesContext = notes.map(note => `${note.title}: ${note.content}`).join('\n\n');
      
      const prompt = `Based on the search query "${query}" and the following notes context, suggest related search terms or topics that might be relevant:

Notes context:
${notesContext}

Search suggestions for "${query}":`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().split('\n').filter(suggestion => suggestion.trim());
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }
}

const geminiService = new GeminiService();
export default geminiService;