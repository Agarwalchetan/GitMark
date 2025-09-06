import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  static async generateText(prompt) {
    try {
      const modelName = process.env.GEMINI_MODEL || "gemini-pro";
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error.message);
      throw new Error('AI content generation failed');
    }
  }
  
  static async generateReadmeSection(sectionType, repositoryData, customInstructions = '') {
    const { repository, structure, files } = repositoryData;
    
    // Analyze repository to determine technology stack
    const techStack = this.analyzeTechStack(structure, files);
    
    const prompts = {
      title: `Generate a compelling project title for: ${repository.name}`,
      
      description: `Create a comprehensive project description for a ${techStack} project named "${repository.name}". 
                   Repository description: "${repository.description || 'No description provided'}".
                   Include the project's purpose, key features, and value proposition. Make it engaging and informative.
                   ${customInstructions}`,
      
      installation: `Generate detailed installation instructions for a ${techStack} project.
                    Analyze the following files to determine dependencies and setup requirements:
                    ${JSON.stringify(files, null, 2)}
                    Include prerequisites, step-by-step installation, and common troubleshooting tips.
                    ${customInstructions}`,
      
      usage: `Create comprehensive usage examples for a ${techStack} project named "${repository.name}".
              Based on the project structure and files, provide:
              - Basic usage examples
              - Common use cases
              - Code snippets where applicable
              - Configuration options
              Repository structure: ${JSON.stringify(structure.slice(0, 20), null, 2)}
              ${customInstructions}`,
      
      api: `Generate API documentation for a ${techStack} project.
            Analyze the codebase structure to identify API endpoints, functions, or modules:
            ${JSON.stringify(structure.slice(0, 30), null, 2)}
            Include endpoints, parameters, response formats, and examples.
            ${customInstructions}`,
      
      contributing: `Create contributing guidelines for a ${techStack} open-source project.
                     Include development setup, code style guidelines, pull request process, and community standards.
                     Make it welcoming to new contributors.
                     ${customInstructions}`,
      
      license: `Generate a license section for the project. 
                Repository license: ${repository.license?.name || 'No license specified'}.
                Include license information and usage rights.
                ${customInstructions}`
    };
    
    const prompt = prompts[sectionType];
    if (!prompt) {
      throw new Error(`Invalid section type: ${sectionType}`);
    }
    
    return this.generateText(prompt);
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