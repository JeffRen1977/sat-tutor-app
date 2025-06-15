# AI-Powered SAT Tutor

This project is an SAT preparation web application designed to help students study and prepare for the SAT exam with the aid of AI-powered tools. It features a modern, responsive user interface built with React and a robust Node.js backend that handles AI model interactions and saves user progress to a Firestore database.

## Features

The application is split into several key modules, providing a comprehensive study experience for users and powerful content management tools for administrators.

### For Students:
* **User Authentication**: Secure registration and login system for students and admins using JWT.
* **Dashboard**: A central hub for students to get an overview of their progress and daily tasks.
* **Study Modules**:
    * **Reading Practice**: Start a session with a random, full-length passage from the database and answer all associated questions.
    * **Math & Writing Practice**: Engage in standalone practice sessions that fetch random sets of questions for focused learning.
    * **Practice History**: All practice attempts are saved to the user's individual database, tracking correct/incorrect answers and providing a foundation for future analytics.
* **AI-Powered Practice Tests**:
    * Generate full-length, realistic SAT practice tests on-demand.
    * Generate section-specific tests for Math, Reading, or Writing & Language.
    * A dedicated test-taking UI to answer questions and view final scores.
* **AI Tutoring Chat**: An interactive chat interface allowing students to ask the AI tutor questions and receive instant explanations.

### For Admins:
* **Admin Tools Dashboard**: A dedicated page for content management, accessible only to users with an 'admin' role.
* **Passage Generation Workflow**:
    * Generate new reading passages using the Gemini AI based on genre, word count, and topic.
    * Review the generated passage before a final decision.
    * **Approve & Link**: Upon approval, the passage is saved to the database, and 3 related questions are automatically generated and saved, linked to the new passage.
    * **Reject**: Discard a generated passage without saving.
* **Standalone Question Generation**:
    * Generate batches of Math or Writing questions based on subject, difficulty, and type.
    * Review the generated questions, including options, correct answers, and explanations.
    * **Approve & Save**: Save the entire batch of reviewed questions to the database.
    * **Reject**: Discard the generated questions.

---

## Technology Stack

### Frontend
* **React**: For building the user interface.
* **Tailwind CSS**: For utility-first styling.
* **Lucide React**: For icons.

### Backend
* **Node.js**: JavaScript runtime environment.
* **Express.js**: Web application framework for building the API.
* **Google Gemini API**: Powers all AI-driven features, including test generation, chat, and content creation.
* **Firestore**: NoSQL database for storing user data, passages, questions, and practice history.
* **JSON Web Tokens (JWT)**: For secure user authentication and session management.

---

## Project Structure

The project is organized into a standard monorepo structure with separate directories for the frontend and backend.

/├── backend/│   ├── config/│   │   ├── firebase.js│   │   └── jwt.js│   ├── middleware/│   │   └── authMiddleware.js│   ├── routes/│   │   ├── aiRoutes.js│   │   ├── authRoutes.js│   │   ├── passageRoutes.js│   │   ├── practiceHistoryRoutes.js│   │   ├── questionRoutes.js│   │   └── testRoutes.js│   ├── services/│   │   ├── authService.js│   │   ├── geminiService.js│   │   ├── passageService.js│   │   ├── questionService.js│   │   └── testResultService.js│   ├── .env.example│   ├── index.js│   └── package.json│└── frontend/└── src/└── App.js
---

## Setup and Installation

### Prerequisites
* Node.js and npm installed.
* Access to a Google Gemini API key.
* A Firebase project with Firestore enabled and a service account key file.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    * Create a `.env` file in the `backend` directory.
    * Copy the contents of `.env.example` into it.
    * Fill in your actual credentials:
        ```env
        GEMINI_API_KEY=your_gemini_api_key_here
        JWT_SECRET=your_super_secret_key_for_jwt
        ADMIN_EMAILS=admin@example.com,anotheradmin@example.com
        ```

4.  **Add Firebase Credentials:**
    * Place your Firebase service account JSON file in the `backend` directory.
    * Ensure the filename in `backend/config/firebase.js` matches your service account file's name.

5.  **Start the server:**
    ```bash
    npm start
    ```
    The backend server will be running on `http://localhost:3001`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend 
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Verify API URL:**
    * Open `src/App.js` and ensure the `API_BASE_URL` constant at the top points to your backend server's address (`http://localhost:3001/api`).

4.  **Start the React application:**
    ```bash
    npm start
    ```
    The application will open in your browser at `http://localhost:3000`.

---

## API Endpoints

The following are the primary API endpoints available:

| Method | Endpoint                                 | Description                                              |
| :----- | :--------------------------------------- | :------------------------------------------------------- |
| POST   | `/api/register`                          | Register a new user.                                     |
| POST   | `/api/login`                             | Log in a user and receive a JWT.                         |
| POST   | `/api/chat`                              | Interact with the AI tutor.                              |
| POST   | `/api/passages/generate`                 | Generate a passage for admin review.                     |
| POST   | `/api/passages/approve-and-generate-questions` | Save an approved passage and generate linked questions.    |
| POST   | `/api/questions/generate`                | Generate standalone questions for admin review.          |
| POST   | `/api/questions/add-batch`               | Save a batch of approved questions to the database.      |
| POST   | `/api/tests/generate`                    | Generate a full or section-specific practice test.       |
| POST   | `/api/practice-history/save`             | Save a user's answer to a single practice question.      |
| GET    | `/api/passages/fetch`                    | Fetch existing passages from the database.               |
| GET    | `/api/questions/fetch`                   | Fetch existing questions from the database.              |

---
## Future Development

* **Recommendation Module**: Analyze the data in the `user_practice_history` collection to create personalized study plans and recommend specific practice areas for each user.
* **Detailed Progress Tracking**: Enhance the Progress Tracking page with charts and statistics based on saved practice history.
* **UI/UX Enhancements**: Continue to refine the user interface for an even more intuitive and engaging experience.
