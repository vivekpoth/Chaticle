//I used a free Glitch project to run this code, you can replace the endpoints in background.js. 
//You will also need to add your own API Key in configuration below.
const { Configuration, OpenAIApi } = require("openai");
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { parse } = require('node-html-parser');
const bodyParser = require('body-parser'); 

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


const configuration = new Configuration({
    apiKey: "Insert Your OpenAI API Key",
  });
  const openai = new OpenAIApi(configuration);
// Initialize conversation state
let conversationState = [];

app.get('/summary', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is missing.' });
  }

  try {

    conversationState = [];

    const articleContent = await getArticleContent(url);

    const messages = [
      { role: 'system', content: 'I will provide you with a piece of text, an article, and you should summarize it, be sure to include key names and dates. The summary should be between 20 percent word length of the article I provide to you.' },
      { role: 'user', content: articleContent }
    ];
    
    // Extend conversation state with user's article
    conversationState = conversationState.concat(messages);
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: conversationState
    });
    // Extract assistant's reply from the API response
    const assistantReply = response.data.choices[0].message.content;
    // Append assistant's reply to conversation state
    conversationState.push({ role: 'assistant', content: assistantReply });
    conversationState.push({ role: 'system', content: 'Answer any questions related to the article moving forward. If outside information is needed, use it.' });

    res.json({ summary: assistantReply });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch the article content.' });
  }
});


app.post('/chat', async (req, res) => {
  const question = req.body.question;
  if (!question) {
    return res.status(400).json({ error: 'Question parameter is missing.' });
  }
  // Append user's question to conversation state
  conversationState.push({ role: 'user', content: question });
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: conversationState
  });

  // Extract assistant's reply from the API response
  const assistantReply = response.data.choices[0].message.content;

  // Append assistant's reply to conversation state
  conversationState.push({ role: 'assistant', content: assistantReply });
  res.json({ answer: assistantReply });
});

async function getArticleContent(url) {
    try {
      const response = await axios.get(url);
      const html = response.data;
      const root = parse(html);
      const articleElement = root.querySelector('article'); // Adjust the selector according to the specific website's HTML structure
      if (articleElement) {
        return articleElement.text;
      } else {
        throw new Error('Failed to extract article content.');
      }
    } catch (error) {
      throw new Error('Failed to fetch the article content.');
    }
  }

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});