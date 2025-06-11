// =====================================================================
// --- File: backend/server.js ---
// =====================================================================
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

// Import route modules
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const questionRoutes = require('./routes/questionRoutes');
const testResultRoutes = require('./routes/testResultRoutes'); // New: Import test results route

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- Use Route Modules ---
app.use('/api', authRoutes); // Auth routes: /api/register, /api/login
app.use('/api', aiRoutes);   // AI routes: /api/chat, /api/vocabulary, etc.
app.use('/api/questions', questionRoutes); // Question routes: /api/questions/add, /api/questions/fetch, /api/questions/generate
app.use('/api/test_results', testResultRoutes); // New: Test results routes: /api/test_results/save, /api/test_results/fetch

// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});





