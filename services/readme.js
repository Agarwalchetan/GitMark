import { GeminiService } from './gemini.js';

export class ReadmeService {
  static async generateReadme(repositoryData, requestedSections = [], customInstructions = '') {
    const { repository } = repositoryData;
    
    // Default sections to include
    const defaultSections = [
      'title',
      'description', 
      'installation',
      'usage',
      'contributing',
      'license'
    ];
    
    const sectionsToGenerate = requestedSections.length > 0 ? requestedSections : defaultSections;
    
    let readme = '';
    
    // Generate project title/header
    if (sectionsToGenerate.includes('title')) {
      readme += `# ${repository.name}\n\n`;
      
      if (repository.description) {
        readme += `${repository.description}\n\n`;
      }
    }
    
    // Generate badges
    readme += this.generateBadges(repository);
    
    // Generate each requested section
    for (const section of sectionsToGenerate) {
      if (section === 'title') continue; // Already handled
      
      try {
        const sectionContent = await GeminiService.generateReadmeSection(
          section, 
          repositoryData, 
          customInstructions
        );
        
        const sectionTitle = this.getSectionTitle(section);
        readme += `## ${sectionTitle}\n\n${sectionContent}\n\n`;
      } catch (error) {
        console.error(`Error generating ${section} section:`, error.message);
        // Add fallback content for failed sections
        readme += `## ${this.getSectionTitle(section)}\n\n${this.getFallbackContent(section)}\n\n`;
      }
    }
    
    // Add footer
    readme += this.generateFooter(repository);
    
    return readme.trim();
  }
  
  static generateBadges(repository) {
    let badges = '';
    
    // GitHub badges
    badges += `[![GitHub stars](https://img.shields.io/github/stars/${repository.full_name})](https://github.com/${repository.full_name}/stargazers)\n`;
    badges += `[![GitHub forks](https://img.shields.io/github/forks/${repository.full_name})](https://github.com/${repository.full_name}/network)\n`;
    badges += `[![GitHub issues](https://img.shields.io/github/issues/${repository.full_name})](https://github.com/${repository.full_name}/issues)\n`;
    
    if (repository.license) {
      badges += `[![License](https://img.shields.io/github/license/${repository.full_name})](https://github.com/${repository.full_name}/blob/main/LICENSE)\n`;
    }
    
    return badges + '\n';
  }
  
  static getSectionTitle(section) {
    const titles = {
      description: 'Description',
      installation: 'Installation',
      usage: 'Usage',
      api: 'API Reference',
      contributing: 'Contributing',
      license: 'License',
      testing: 'Testing',
      deployment: 'Deployment'
    };
    
    return titles[section] || section.charAt(0).toUpperCase() + section.slice(1);
  }
  
  static getFallbackContent(section) {
    const fallbacks = {
      description: 'This project provides [brief description of functionality].',
      installation: '```bash\n# Clone the repository\ngit clone [repository-url]\n\n# Install dependencies\n[package-manager] install\n```',
      usage: '```bash\n# Run the application\n[command-to-run]\n```',
      api: 'API documentation coming soon.',
      contributing: 'Contributions are welcome! Please feel free to submit a Pull Request.',
      license: `This project is licensed under the ${repository.license?.name || 'MIT'} License.`,
      testing: '```bash\n# Run tests\n[test-command]\n```',
      deployment: 'Deployment instructions coming soon.'
    };
    
    return fallbacks[section] || 'Content coming soon.';
  }
  
  static generateFooter(repository) {
    return `---\n\n**Generated with ❤️ by README Generator**\n\nFor more information, visit the [repository](${repository.html_url}).`;
  }
}