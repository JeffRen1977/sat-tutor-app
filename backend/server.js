// ================================================================= //
//                  SAT TUTOR BACKEND SERVER (MAIN)                  //
//          Node.js, Express - Modularized Structure               //
// ================================================================= //

// --- DEPENDENCIES --- //
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// --- ROUTE IMPORTS --- //
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const passageRoutes = require('./routes/passageRoutes');
const questionRoutes = require('./routes/questionRoutes');
const testResultRoutes = require('./routes/testResultRoutes');
const practiceHistoryRoutes = require('./routes/practiceHistoryRoutes');
const testRoutes = require('./routes/testRoutes'); 
const recommendationRoutes = require('./routes/recommendationRoutes'); 


// --- INITIALIZATION --- //
const app = express();
const PORT = process.env.PORT || 3001;

// --- CORE MIDDLEWARE --- //
app.use(cors()); // Enable Cross-Origin Resource Sharing for all routes
app.use(express.json()); // Enable parsing of JSON request bodies

// ================================================================= //
//                          API ROUTES MOUNTING                      //
//     Mounting modular routers to specific base paths.            //
// ================================================================= //

app.use('/api', authRoutes); // Mounts /register, /login
app.use('/api', aiRoutes); // Mounts /chat, /vocabulary, /essay-brainstorm, /math-solver
app.use('/api/passages', passageRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/test_results', testResultRoutes);
app.use('/api/practice-history', practiceHistoryRoutes);
app.use('/api/tests', testRoutes); 
app.use('/api/recommendations', recommendationRoutes);


// --- ROOT ENDPOINT --- //
app.get('/', (req, res) => {
    res.send('SAT Tutor API is running!');
});

// ================================================================= //
//                      START THE SERVER                             //
// ================================================================= //

app.listen(PORT, () => {
    console.log(`🚀 SAT Tutor backend server is running on http://localhost:${PORT}`);
});
