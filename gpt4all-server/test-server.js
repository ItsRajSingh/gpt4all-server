import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);
const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://interconether.vercel.app', 'https://quantum-bridge.vercel.app']  // Add your deployed frontend URLs
    : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'EAGLE is operational' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    const userInput = req.body.input;
    
    // Sanitize the input
    const sanitizedInput = userInput.replace(/["']/g, '');
    const prompt = `You are EAGLE, an AI assistant. User: ${sanitizedInput} EAGLE:`;

    // Use absolute path for Python script
    const pythonScript = path.join(__dirname, 'gpt4all_handler.py');
    const { stdout, stderr } = await execAsync(
      `python "${pythonScript}" "${prompt}"`,
      { 
        timeout: 10000,
        cwd: __dirname // Set working directory
      }
    );

    if (stderr) {
      console.error('Python stderr:', stderr);
    }

    const response = stdout.trim();
    console.log('Response:', response);
    res.json({ response });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      response: "EAGLE is recalibrating. Please try again.",
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`EAGLE is operational on port ${port}`);
}); 