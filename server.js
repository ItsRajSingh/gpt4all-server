const express = require('express');
const cors = require('cors');
const { GPT4All } = require('gpt4all');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const model = new GPT4All('gpt4all-j');

model.init().then(() => {
  console.log('Model loaded successfully');
});

app.post('/api/chat', async (req, res) => {
  const userInput = req.body.input;
  const prompt = `You are EAGLE, an advanced AI assistant. User: ${userInput} EAGLE:`;

  try {
    const response = await model.generate(prompt, {
      maxTokens: 200,
      temp: 0.7,
      topK: 40,
      topP: 0.9,
    });
    res.json({ response: response.trim() });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ response: 'Error processing request.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});