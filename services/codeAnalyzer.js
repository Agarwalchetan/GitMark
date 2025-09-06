export class CodeAnalyzer {
  static analyzeRepository(repository, structure, files) {
    const analysis = {
      projectType: this.detectProjectType(structure, files),
      mainFeatures: this.extractMainFeatures(structure, files),
      techStack: this.analyzeTechStack(structure, files),
      entryPoints: this.findEntryPoints(structure, files),
      dependencies: this.analyzeDependencies(files),
      scripts: this.extractScripts(files),
      structure: this.simplifyStructure(structure),
      complexity: this.assessComplexity(structure, files)
    };

    return analysis;
  }

  static detectProjectType(structure, files) {
    // Web Applications
    if (files['package.json']) {
      const pkg = JSON.parse(files['package.json']);
      if (pkg.dependencies?.react || pkg.devDependencies?.react) return 'React Web App';
      if (pkg.dependencies?.vue || pkg.devDependencies?.vue) return 'Vue.js Web App';
      if (pkg.dependencies?.angular || pkg.devDependencies?.angular) return 'Angular Web App';
      if (pkg.dependencies?.express) return 'Node.js Backend API';
      if (pkg.dependencies?.next) return 'Next.js Full-Stack App';
      if (pkg.dependencies?.nuxt) return 'Nuxt.js Full-Stack App';
      return 'JavaScript/Node.js Project';
    }

    // Python Projects
    if (files['requirements.txt'] || files['setup.py'] || files['pyproject.toml']) {
      if (files['manage.py']) return 'Django Web Application';
      if (files['app.py'] || files['main.py']) return 'Python Web API';
      return 'Python Application';
    }

    // Mobile Apps
    if (files['pubspec.yaml']) return 'Flutter Mobile App';
    if (files['android/'] && files['ios/']) return 'React Native Mobile App';

    // Other frameworks
    if (files['Gemfile']) return 'Ruby on Rails Application';
    if (files['composer.json']) return 'PHP Web Application';
    if (files['pom.xml']) return 'Java Application';
    if (files['Cargo.toml']) return 'Rust Application';
    if (files['go.mod']) return 'Go Application';

    return 'Software Project';
  }

  static extractMainFeatures(structure, files) {
    const features = [];

    // Check for common feature indicators
    const featureIndicators = {
      'Authentication': ['auth', 'login', 'register', 'jwt', 'passport'],
      'Database': ['models', 'schema', 'database', 'db', 'migrations'],
      'API': ['api', 'routes', 'endpoints', 'controllers'],
      'Frontend UI': ['components', 'views', 'pages', 'ui'],
      'File Upload': ['upload', 'multer', 'storage'],
      'Real-time': ['socket', 'websocket', 'realtime'],
      'Testing': ['test', 'spec', '__tests__', 'cypress'],
      'Documentation': ['docs', 'documentation', 'readme'],
      'Configuration': ['config', 'settings', 'env'],
      'Deployment': ['docker', 'kubernetes', 'deploy', 'ci']
    };

    const allPaths = structure.map(item => item.path.toLowerCase()).join(' ');
    const allFiles = Object.keys(files).join(' ').toLowerCase();
    const searchText = `${allPaths} ${allFiles}`;

    Object.entries(featureIndicators).forEach(([feature, keywords]) => {
      if (keywords.some(keyword => searchText.includes(keyword))) {
        features.push(feature);
      }
    });

    return features.slice(0, 5); // Limit to top 5 features
  }

  static analyzeTechStack(structure, files) {
    const technologies = [];

    // Package.json analysis
    if (files['package.json']) {
      const pkg = JSON.parse(files['package.json']);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps.react) technologies.push('React');
      if (deps.vue) technologies.push('Vue.js');
      if (deps.angular) technologies.push('Angular');
      if (deps.express) technologies.push('Express.js');
      if (deps.typescript) technologies.push('TypeScript');
      if (deps.tailwindcss) technologies.push('Tailwind CSS');
      if (deps.mongodb || deps.mongoose) technologies.push('MongoDB');
      if (deps.mysql || deps.pg) technologies.push('SQL Database');
      technologies.push('Node.js');
    }

    // File extension analysis
    const extensions = structure.map(item => {
      const ext = item.path.split('.').pop();
      return ext;
    });

    if (extensions.includes('py')) technologies.push('Python');
    if (extensions.includes('java')) technologies.push('Java');
    if (extensions.includes('php')) technologies.push('PHP');
    if (extensions.includes('rb')) technologies.push('Ruby');
    if (extensions.includes('go')) technologies.push('Go');
    if (extensions.includes('rs')) technologies.push('Rust');
    if (extensions.includes('swift')) technologies.push('Swift');
    if (extensions.includes('kt')) technologies.push('Kotlin');

    return [...new Set(technologies)]; // Remove duplicates
  }

  static findEntryPoints(structure, files) {
    const entryPoints = [];

    // Common entry point files
    const commonEntries = [
      'index.js', 'index.ts', 'app.js', 'app.ts', 'main.js', 'main.ts',
      'server.js', 'server.ts', 'index.html', 'main.py', 'app.py',
      'index.php', 'main.go', 'main.rs', 'App.java'
    ];

    commonEntries.forEach(entry => {
      if (files[entry]) {
        entryPoints.push(entry);
      }
    });

    // Check package.json main field
    if (files['package.json']) {
      const pkg = JSON.parse(files['package.json']);
      if (pkg.main && !entryPoints.includes(pkg.main)) {
        entryPoints.push(pkg.main);
      }
    }

    return entryPoints;
  }

  static analyzeDependencies(files) {
    const deps = {
      runtime: [],
      development: [],
      system: []
    };

    if (files['package.json']) {
      const pkg = JSON.parse(files['package.json']);
      deps.runtime = Object.keys(pkg.dependencies || {});
      deps.development = Object.keys(pkg.devDependencies || {});
      deps.system.push('Node.js');
    }

    if (files['requirements.txt']) {
      const requirements = files['requirements.txt'].split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('==')[0].split('>=')[0].trim());
      deps.runtime = requirements;
      deps.system.push('Python');
    }

    if (files['Gemfile']) {
      deps.system.push('Ruby');
    }

    if (files['composer.json']) {
      const composer = JSON.parse(files['composer.json']);
      deps.runtime = Object.keys(composer.require || {});
      deps.system.push('PHP');
    }

    return deps;
  }

  static extractScripts(files) {
    const scripts = {};

    if (files['package.json']) {
      const pkg = JSON.parse(files['package.json']);
      if (pkg.scripts) {
        // Focus on common user scripts
        const importantScripts = ['start', 'dev', 'build', 'test', 'lint'];
        importantScripts.forEach(script => {
          if (pkg.scripts[script]) {
            scripts[script] = pkg.scripts[script];
          }
        });
      }
    }

    return scripts;
  }

  static simplifyStructure(structure) {
    // Group files by directory and show only important ones
    const important = structure.filter(item => {
      const path = item.path.toLowerCase();
      return !path.includes('node_modules') && 
             !path.includes('.git') && 
             !path.includes('dist') && 
             !path.includes('build') &&
             !path.startsWith('.');
    });

    return important.slice(0, 20); // Limit to 20 most relevant files
  }

  static assessComplexity(structure, files) {
    const fileCount = structure.length;
    const hasTests = structure.some(item => 
      item.path.includes('test') || item.path.includes('spec')
    );
    const hasConfig = Object.keys(files).some(file => 
      file.includes('config') || file.startsWith('.')
    );

    if (fileCount < 10) return 'Simple';
    if (fileCount < 50) return 'Medium';
    return 'Complex';
  }
}
