import { GoogleGenerativeAI } from '@google/generative-ai';
import { GroqService } from './groq.js';
import { CodeAnalyzer } from './codeAnalyzer.js';

export class GeminiService {
  static genAI = null;
  
  static getGeminiClient() {
    if (!this.genAI) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return this.genAI;
  }
  
  static async generateText(prompt) {
    try {
      const modelName = process.env.GEMINI_MODEL || "gemini-pro";
      const geminiClient = this.getGeminiClient();
      const model = geminiClient.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error.message);
      
      // Fallback to Groq API if Gemini fails
      try {
        console.log('Falling back to Groq API...');
        return await GroqService.generateText(prompt);
      } catch (groqError) {
        console.error('Groq API fallback error:', groqError.message);
        // If Groq also fails, just return the original Gemini error
        throw error;
      }
    }
  }
  
  static async generateReadmeSection(sectionType, repositoryData, customInstructions = '') {
    try {
      const { repository, structure, files } = repositoryData;
      
      // Enhanced repository analysis
      const analysis = CodeAnalyzer.analyzeRepository(repository, structure, files);
      
      const prompts = {
      title: `Generate a simple, clear project title for: ${repository.name}. Make it descriptive but not overly technical.`,
      
      description: `Create a simple, beginner-friendly description for this ${analysis.projectType} called "${repository.name}".

Project Details:
- Type: ${analysis.projectType}
- Main Features: ${analysis.mainFeatures.join(', ')}
- Tech Stack: ${analysis.techStack.join(', ')}
- Complexity: ${analysis.complexity}

Original Description: "${repository.description || 'No description provided'}"

Write in plain English that anyone can understand. Focus on:
- What the project does (in simple terms)
- Who would use it
- Why it's useful
- Key features (max 3-4 bullet points)

Avoid technical jargon. Use everyday language. ${customInstructions}`,
      
      installation: `Create simple, step-by-step installation instructions for this ${analysis.projectType}.

System Requirements: ${analysis.dependencies.system.join(', ')}
Main Dependencies: ${analysis.dependencies.runtime.slice(0, 5).join(', ')}
Available Scripts: ${Object.keys(analysis.scripts).join(', ')}

Write instructions that a beginner can follow:
1. Use numbered steps
2. Include system requirements first
3. Provide exact commands to copy-paste
4. Add troubleshooting for common issues
5. Keep explanations simple and clear

Format as a beginner-friendly guide. ${customInstructions}`,
      
      usage: `Create easy-to-follow usage examples for "${repository.name}" (${analysis.projectType}).

Entry Points: ${analysis.entryPoints.join(', ')}
Available Scripts: ${JSON.stringify(analysis.scripts, null, 2)}
Main Features: ${analysis.mainFeatures.join(', ')}

Write usage instructions that are:
- Simple and clear
- Include copy-paste examples
- Show the most common use cases first
- Use real examples, not placeholders
- Explain what each command does

Focus on getting users started quickly. ${customInstructions}`,
      
      api: `Generate simple API documentation for this ${analysis.projectType}.

Based on the project structure and features: ${analysis.mainFeatures.join(', ')}
Entry points: ${analysis.entryPoints.join(', ')}

Create documentation that:
- Lists main endpoints/functions in simple terms
- Shows example requests/responses
- Uses clear, non-technical language
- Includes practical examples
- Focuses on the most important APIs only

Keep it beginner-friendly. ${customInstructions}`,
      
      contributing: `Create welcoming contribution guidelines for this ${analysis.projectType}.

Project Complexity: ${analysis.complexity}
Tech Stack: ${analysis.techStack.join(', ')}

Write guidelines that:
- Welcome newcomers warmly
- Explain the setup process simply
- List ways people can help (not just coding)
- Use encouraging, friendly language
- Include beginner-friendly tasks
- Make it feel approachable

Focus on building a welcoming community. ${customInstructions}`,
      
      license: `Generate a simple license section for this project.

License: ${repository.license?.name || 'No license specified'}

Explain in plain English:
- What license is used
- What people can/cannot do
- Keep it simple and clear
- Avoid legal jargon

${customInstructions}`
    };
    
    const prompt = prompts[sectionType];
    if (!prompt) {
      throw new Error(`Invalid section type: ${sectionType}`);
    }
    
      return this.generateText(prompt);
    } catch (error) {
      console.error('Gemini README section generation error:', error.message);
      
      // Fallback to Groq API if Gemini fails
      try {
        console.log('Falling back to Groq API for README section generation...');
        return await GroqService.generateReadmeSection(sectionType, repositoryData, customInstructions);
      } catch (groqError) {
        console.error('Groq README section fallback error:', groqError.message);
        // If Groq also fails, just return the original Gemini error
        throw error;
      }
    }
  }
  
  static analyzeTechStack(structure, files) {
    const technologies = [];
    
    // Check for specific files
    if (files['package.json']) {
      const packageJson = JSON.parse(files['package.json']);
      if (packageJson.dependencies) {
        if (packageJson.dependencies.react) technologies.push('React');
        if (packageJson.dependencies.vue) technologies.push('Vue.js');
        if (packageJson.dependencies.angular) technologies.push('Angular');
        if (packageJson.dependencies.express) technologies.push('Express.js');
        if (packageJson.dependencies.typescript) technologies.push('TypeScript');
      }
      technologies.push('Node.js');
    }
    
    if (files['requirements.txt'] || files['setup.py']) {
      technologies.push('Python');
    }
    
    if (files['Gemfile']) {
      technologies.push('Ruby');
    }
    
    if (files['composer.json']) {
      technologies.push('PHP');
    }
    
    if (files['pom.xml']) {
      technologies.push('Java');
    }
    
    if (files['Cargo.toml']) {
      technologies.push('Rust');
    }
    
    // Check file extensions
    const extensions = structure.map(item => {
      const ext = item.path.split('.').pop();
      return ext;
    });
    
    if (extensions.includes('py')) technologies.push('Python');
    if (extensions.includes('js') || extensions.includes('jsx')) technologies.push('JavaScript');
    if (extensions.includes('ts') || extensions.includes('tsx')) technologies.push('TypeScript');
    if (extensions.includes('go')) technologies.push('Go');
    if (extensions.includes('rs')) technologies.push('Rust');
    if (extensions.includes('java')) technologies.push('Java');
    if (extensions.includes('php')) technologies.push('PHP');
    if (extensions.includes('rb')) technologies.push('Ruby');
    
    return technologies.length > 0 ? technologies.join(', ') : 'General Software';
  }
}