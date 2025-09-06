# GitMark - AI-Powered README Generator

A comprehensive, AI-powered README generator that supports both public and private GitHub repositories. Generate professional documentation with the power of AI.

## Features

- **Dual Repository Support**: Works with both public repositories (no auth required) and private repositories (OAuth)
- **Beautiful UI/UX**: Modern design with light/dark theme toggle and responsive layout
- **AI-Powered Content**: Uses Google Gemini API to generate contextually relevant README content
- **Repository Analysis**: Automatically analyzes codebase structure and dependencies
- **Customizable Sections**: Choose which sections to include in your README
- **Enhanced Preview**: Full-screen modal preview with markdown rendering and editing capabilities
- **Direct Save**: Save generated READMEs directly to your GitHub repository
- **Project Stats Integration**: Display GitHub stars and forks for the project

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd advanced-readme-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create GitHub OAuth App**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App with:
     - Application name: "README Generator"
     - Homepage URL: `http://localhost:5173` 
     - Authorization callback URL: `http://localhost:3001/api/auth/github/callback`

4. **Get Google Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key

5. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   
   Fill in your credentials:
   ```
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   SESSION_SECRET=your_random_session_secret
   GITHUB_REPO=username/gitmark
   ```

6. **Start the application**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## Security Features

- OAuth token secure storage in server sessions
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration for secure cross-origin requests
- Helmet.js for additional security headers

## Architecture

- **Backend**: Express.js with modular route structure and middleware
- **Authentication**: GitHub OAuth with secure session management
- **AI Integration**: Google Gemini API for content generation
- **Frontend**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with dark/light theme support
- **UI Components**: Custom modal system and enhanced preview functionality

## Development
## License

Development by **Chetan Agarwal**
MIT License - see LICENSE file for details.