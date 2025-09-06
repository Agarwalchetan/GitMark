import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'NOT SET');
    console.log('Model:', process.env.GEMINI_MODEL || 'gemini-pro');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });
    
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    const text = response.text();
    
    console.log(' API Key is valid!');
    console.log('Response:', text);
  } catch (error) {
    console.log(' API Key test failed:');
    console.log('Error:', error.message);
  }
}

testGeminiAPI();
