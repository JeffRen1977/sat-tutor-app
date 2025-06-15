SAT Tutor Web Application
This project is an SAT preparation web application designed to help students study and prepare for the SAT exam with the aid of AI-powered tools. It features a modern, responsive user interface built with React and a robust Node.js backend that handles AI model interactions and will support database operations in the future.
✨ Features
The SAT Tutor app offers the following core functionalities:
Dashboard: Provides students with an overview of their study progress, including latest scores, daily tasks, and vocabulary review.
Study Modules: Organized content for SAT subjects (Reading, Writing and Language, Math). This section is enhanced with AI features:
Vocabulary Expander: Enter any SAT vocabulary word, and the AI will provide a concise explanation, an example sentence, and synonyms/antonyms.
Essay Brainstormer: Get AI-generated ideas, angles, arguments, and relevant examples for a given essay topic, aiding in SAT essay preparation.
Math Problem Solver: Input a math problem, and the AI will provide a detailed, step-by-step solution to help understand the solving process.
Practice Tests: Allows students to take full-length simulated tests or specific section-wise quizzes.
Progress Tracking: Visualizes student performance and historical scores, offering insights into their learning journey (currently placeholders).
AI Tutoring Chat: An interactive chat interface where students can ask questions related to SAT topics and receive instant, AI-powered assistance.
Settings: Users can manage application preferences like notifications and theme settings.
🛠️ Technologies Used
Frontend:
React: A JavaScript library for building user interfaces.
Tailwind CSS: A utility-first CSS framework for rapid UI development and responsive design.
Lucide React: A collection of beautiful and customizable open-source icons.
Backend:
Node.js: A JavaScript runtime environment.
Express.js: A fast, unopinionated, minimalist web framework for Node.js.
CORS: Middleware to enable Cross-Origin Resource Sharing.
Dotenv: Loads environment variables from a .env file.
GoogleGenerativeAI (@google/generative-ai): Official Node.js client library for interacting with Google's Gemini API.
AI Model:
Gemini 2.0 Flash: Used for all AI-powered features (AI Tutoring Chat, Vocabulary Expander, Essay Brainstormer, Math Problem Solver).
📁 File Architecture
The project is structured into two main directories: backend and frontend.
sat-tutor-app/
├── backend/
│   ├── node_modules/           # Backend dependencies
│   ├── .env                    # Environment variables (e.g., GEMINI_API_KEY)
│   ├── package.json            # Backend project metadata
│   ├── package-lock.json       # Locked dependency versions
│   └── server.js               # Node.js Express backend server code
│
└── frontend/
    ├── node_modules/           # Frontend dependencies
    ├── public/
    │   ├── index.html          # Main HTML file
    │   └── ...                 # Other public assets
    ├── src/
    │   ├── App.js              # Main React component (contains all UI logic)
    │   ├── index.js            # React app entry point
    │   └── ...                 # Other React components or CSS/JS files
    ├── package.json            # Frontend project metadata
    ├── package-lock.json       # Locked dependency versions
    └── ...                     # Other frontend files


🚀 Setup Instructions
Follow these steps to get the SAT Tutor application up and running on your local machine.
1. Clone the Repository (if applicable)
If this project is in a Git repository, start by cloning it:
git clone <your-repository-url>
cd sat-tutor-app


Otherwise, create the sat-tutor-app directory and then create backend and frontend subdirectories.
2. Backend Setup
Navigate to the backend directory:
cd backend


Install Node.js dependencies:
npm install


Create a .env file in the backend directory and add your Gemini API Key:
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE


Replace YOUR_GEMINI_API_KEY_HERE with your actual Gemini API key.
Start the backend server:
node server.js


You should see a message like Backend server listening at http://localhost:3001. Keep this terminal window open.
3. Frontend Setup
Open a new terminal window and navigate to the frontend directory:
cd ../frontend


Install React and other frontend dependencies:
npm install


If you are starting from scratch or encounter issues with Tailwind CSS, you might need to initialize it:
npx tailwindcss init -p


And configure tailwind.config.js to scan your src files.
Start the React development server:
npm start


This will typically open the application in your web browser at http://localhost:3000.
💡 Usage
Once both the backend and frontend servers are running:
Open your web browser and navigate to http://localhost:3000 (or whatever address npm start provides).
Use the sidebar navigation to explore different modules: Dashboard, Study Modules, Practice Tests, Progress Tracking, AI Tutoring Chat, and Settings.
To use AI features:
In Study Modules, try the "Vocabulary Expander" by typing a word and clicking "Get Explanation ✨".
In Study Modules, try the "Essay Brainstormer" by entering a topic and clicking "Brainstorm Essay ✨".
In Study Modules, try the "Math Problem Solver" by entering a math problem and clicking "Solve Problem ✨".
Go to the AI Tutoring Chat and start a conversation with your AI tutor.
🔮 Future Enhancements
Database Integration: Implement data persistence using a database (e.g., Firestore) to save user progress, chat history, and customized study plans.
User Authentication: Add full user registration and login functionality.
Dynamic Content: Populate study modules and practice tests with real SAT content fetched from a database.
Advanced Progress Tracking: Integrate charting libraries to display detailed and interactive progress graphs.
Personalized Study Paths: Utilize AI to recommend tailored study plans based on individual student performance and weaknesses.
More AI Tools: Develop additional AI features like an AI essay grader or personalized question generation.
