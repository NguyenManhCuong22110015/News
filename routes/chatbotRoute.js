import { Router } from 'express';
import chatbotService from '../service/chatbotService.js';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import articleService from '../service/articleService.js';

dotenv.config(); // Load environment variables

const router = Router();

// Extract text from HTML using JSDOM
const extractTextFromHTML = (html) => {
    const dom = new JSDOM(html);
    return dom.window.document.body.textContent || "";
};

// Embedding-related variables
let embeddingsData = [];

// Create embeddings for a given text
async function createEmbedding(text) {
    try {
        const embeddings = new OllamaEmbeddings({
            model: "nomic-embed-text",
            baseUrl: "http://localhost:11434",
        });
        const result = await embeddings.embedQuery(text);
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("Embedding generation error:", error.message);
        throw new Error("Failed to generate embeddings.");
    }
}

// Save embeddings data to JSON file
async function saveDataToJSON(data) {
    try {
        fs.writeFileSync('embeddings.json', JSON.stringify(data, null, 2));
        console.log('Data saved to embeddings.json');
    } catch (error) {
        console.error('Error saving data to JSON:', error.message);
        throw error;
    }
}

// Upsert data to JSON (generate embeddings and save)
async function upsertDataToJSON(data) {
    try {
        const vectors = await Promise.all(
            data.map(async (doc) => ({
                id: doc.id.toString(),
                values: await createEmbedding(doc.text),
                metadata: { text: doc.text },
            }))
        );

        embeddingsData = vectors; // Update in-memory data
        await saveDataToJSON(vectors); // Save to file
        console.log('Data has been saved to JSON');
    } catch (error) {
        console.error('Upsert error:', error.message);
        throw error;
    }
}

// Query data from JSON
async function queryDataFromJSON(queryEmbedding) {
    return embeddingsData.slice(0, 30).map((item) => item.metadata.text);
}

// Fetch image from Google Custom Search
async function fetchImage(prompt) {
    const customsearch = google.customsearch('v1');
    const API_KEY = process.env.GG_SEARCH_API_KEY;
    const CX = process.env.GG_SEARCH_CX;

    try {
        const response = await customsearch.cse.list({
            auth: API_KEY,
            cx: CX,
            q: prompt,
            searchType: 'image',
            num: 1,
        });

        if (response.data.items && response.data.items.length > 0) {
            const imageUrl = response.data.items[0].link;
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const base64Image = Buffer.from(imageResponse.data).toString('base64');
            return `data:image/jpeg;base64,${base64Image}`;
        } else {
            console.error('No images found for the given prompt.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching image:', error.message);
        return null;
    }
}

// Generate answer using context and question
async function generateAnswer(context, question) {
    try {
        const prompt = `Answer the question based only on the following context:\n\n${context}\n\nQuestion: ${question}`;
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama3-8b-8192',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
            },
            { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating answer:', error.message);
        throw new Error('Failed to generate answer.');
    }
}

// Route: Handle chatbot question
router.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const questionEmbedding = await createEmbedding(question);
        const relevantDocs = await queryDataFromJSON(questionEmbedding);

        if (!relevantDocs.length) {
            return res.json({ answer: "I don't have enough context to answer that question." });
        }

        const context = relevantDocs.join('\n');
        const answer = await generateAnswer(context, question);

        res.json({ answer });
    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(500).json({
            error: 'An error occurred while processing your request',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// Route: Render chatbot page
router.get('/chatbot', (req, res) => {
    res.render('Chatbot/Chat');
});

// Initialize data into JSON
router.post('/loadArticle', async (req, res) => {
    try {
        const { id } = req.body || 197;
        if (!id) {
            return res.status(400).json({ error: 'Article ID is required' });
        }

        const data = await chatbotService.getDataFromDatabase(id);
        if (!data) {
            return res.status(404).json({ error: 'Article not found' });
        }

        const content = extractTextFromHTML(data.content);
        const fre = 'Hi. I am a assistant, I can help you with your question. Please ask me anything.';
        const text = fre+ `The article titled "${data.title}" was written by ${data.writer_name} on ${data.created_at} and published on ${data.updated_at}. It is ${
            data.is_premium ? '' : 'not '
        }a premium article in the category "${data.category_name}". The main content is: ${content}.`;

        const dataWithText = [{ id: data.id, text }];
        await upsertDataToJSON(dataWithText);

        res.json({ success: true, message: 'Article data loaded successfully' });
    } catch (error) {
        console.error('Error loading article:', error);
        res.status(500).json({ error: 'Failed to load article data' });
    }
});




async function extractEntities(query) {
    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: "deepseek-r1", 
            prompt: query,
            stream: false
        });
        
        if (response.data && response.data.response) {
            // Process the response from local model
            return [{
                word: response.data.response,
                score: 1.0
            }];
        }
        return [];
    } catch (error) {
        console.error("Error calling local model:", error);
        return [];
    }
}


const products = await articleService.getArticle();

router.get('/search', async (req, res) => {
    const query = req.body.query || req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Thiếu tham số truy vấn "q"' });
    }

    const entities = await extractEntities(query);
    console.log('Extracted entities:', entities);

    const results = products.filter(product => {
        return entities.some(entity => product.title.toLowerCase().includes(entity.word.toLowerCase()));
    });

    res.json({ query, entities, results });
});






export default router;
