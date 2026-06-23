import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Basic GET route configuration
app.get('/', (req, res) => {
    res.json({ message: "Welcome to your Node.js template API!" });
});

// Basic POST route configuration 
app.post('/data', (req, res) => {
    const receivedData = req.body;
    res.status(201).json({
        message: "Data received successfully!",
        data: receivedData
    });
});

// Global error handling middleware 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong on the server." });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running successfully at http://localhost:${PORT}`);
});
