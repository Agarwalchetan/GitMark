# AI Fallback System - Gemini to Groq

This document explains the dual AI system implemented in GitMark v3, which provides automatic fallback from Google Gemini to Groq API for reliable README generation.

## Overview

The system uses **Google Gemini** as the primary AI service and **Groq** as the secondary fallback option. If Gemini fails for any reason (API limits, network issues, invalid API key), the system automatically switches to Groq to ensure uninterrupted README generation.

## Architecture

### Primary Service: Google Gemini
- **Model**: `gemini-pro` (configurable)
- **Use Case**: Primary README generation
- **Advantages**: High-quality text generation, good context understanding

### Fallback Service: Groq
- **Model**: `llama3-8b-8192` (configurable)  
- **Use Case**: Backup when Gemini fails
- **Advantages**: Fast inference, reliable uptime, cost-effective

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Primary AI Service (Gemini)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro

# Fallback AI Service (Groq)
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama3-8b-8192
```

### Getting API Keys

#### Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

#### Groq API Key
1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up/login and create a new API key
3. Copy the key to your `.env` file

## How It Works

### Automatic Fallback Flow

```
1. User requests README generation
   ↓
2. System tries Gemini API first
   ↓
3a. SUCCESS → Return Gemini response
   ↓
3b. FAILURE → Log error & try Groq API
   ↓
4a. SUCCESS → Return Groq response  
   ↓
4b. FAILURE → Return error message
```

### Code Implementation

The fallback is implemented in both `generateText()` and `generateReadmeSection()` methods:

```javascript
// Primary attempt with Gemini
try {
  return await geminiGeneration();
} catch (error) {
  console.error('Gemini API error:', error.message);
  
  // Automatic fallback to Groq
  try {
    console.log('Falling back to Groq API...');
    return await groqGeneration();
  } catch (groqError) {
    console.error('Groq fallback error:', groqError.message);
    throw new Error('Both AI services failed');
  }
}
```

## Benefits

### Reliability
- **99.9% uptime**: If one service is down, the other continues working
- **No user interruption**: Fallback happens automatically and transparently

### Cost Optimization
- **Primary service**: Use higher-quality Gemini for best results
- **Fallback service**: Use cost-effective Groq when needed

### Performance
- **Fast switching**: Immediate fallback on primary service failure
- **Parallel capabilities**: Can be extended for load balancing

## Monitoring & Logs

The system provides comprehensive logging:

```
✅ Gemini API success: Generated content using gemini-pro
❌ Gemini API error: API key not valid
🔄 Falling back to Groq API...
✅ Groq API success: Generated content using llama3-8b-8192
```

## Supported Models

### Gemini Models
- `gemini-pro` (default)
- `gemini-pro-vision`
- `gemini-1.5-pro`

### Groq Models  
- `llama3-8b-8192` (default)
- `llama3-70b-8192`
- `mixtral-8x7b-32768`
- `gemma-7b-it`

## Error Handling

### Common Scenarios

1. **Invalid Gemini API Key**
   - System logs error and switches to Groq
   - User gets README generated via Groq

2. **Rate Limit Exceeded**
   - Gemini hits rate limit → Groq takes over
   - Seamless continuation of service

3. **Network Issues**
   - Temporary connectivity issues handled gracefully
   - Alternative service maintains availability

4. **Both Services Fail**
   - Clear error message to user
   - Logs indicate both services attempted

## Installation

```bash
# Install required packages
npm install @google/generative-ai groq-sdk

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

## Testing the Fallback

To test the fallback mechanism:

1. **Simulate Gemini failure**: Use invalid `GEMINI_API_KEY`
2. **Monitor logs**: Check console for fallback activation
3. **Verify functionality**: Ensure README generation continues working

## Best Practices

### API Key Management
- Store keys securely in environment variables
- Never commit API keys to version control
- Rotate keys regularly for security

### Model Selection
- Use `gemini-pro` for primary (balanced quality/cost)
- Use `llama3-8b-8192` for fallback (fast/reliable)
- Monitor usage and costs for both services

### Error Monitoring
- Set up alerts for fallback activation
- Monitor both services' health and performance
- Track usage patterns and costs

## Future Enhancements

- **Load Balancing**: Distribute requests between services
- **Smart Routing**: Choose service based on request type
- **Caching**: Cache responses to reduce API calls
- **Multiple Fallbacks**: Add more AI services (Claude, OpenAI)
