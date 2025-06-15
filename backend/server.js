// backend/server.js (Refactored Main Entry Point)

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

// Import route modules
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const questionRoutes = require('./routes/questionRoutes');
const testResultRoutes = require('./routes/testResultRoutes');
const passageRoutes = require('./routes/passageRoutes'); // 确保这个导入是正确的

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- Use Route Modules ---
// 确保所有路由都正确挂载，并且路径没有冲突
app.use('/api', authRoutes);
app.use('/api', aiRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/test_results', testResultRoutes);
app.use('/api/passages', passageRoutes); // 再次确认这里的挂载路径和变量名

// Handle 404 - Not Found (important to place after all valid routes)
app.use((req, res, next) => {
    res.status(404).json({ message: "API endpoint not found." });
});

// Generic Error Handler (optional, for unhandled errors)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong on the server.", details: err.message });
});


// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});