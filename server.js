// server.js
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyCEQgFAd21M_Oakzr2jgHmQlLV20UVemRE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/generate", async (req, res) => {
    const { prompt } = req.body;
    try {
        const result = await model.generateContent(prompt);
        res.json({ response: { text: result.response.text() } });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate response." });
    }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
