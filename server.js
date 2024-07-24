const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to create a bin
app.post('/api/create-bin', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }
    if (Buffer.byteLength(text, 'utf8') > 2 * 1024 * 1024) {
        return res.status(400).json({ error: 'Text exceeds the 2MB limit' });
    }

    const randomSubdomain = Math.random().toString(36).substring(2, 15) + '/' + Math.random().toString(36).substring(2, 15);
    const binUrl = `https://6locc.xyz/${randomSubdomain}`;

    // Here you would typically save the bin data to a database
    // For demonstration, we'll just return the URL
    res.json({ url: binUrl });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
