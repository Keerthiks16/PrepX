# PrepX - AI Interview & Career Prep Platform

PrepX is a comprehensive career preparation platform built with the MERN stack (MongoDB, Express, React, Node.js). It offers a suite of tools designed to help candidates prepare for interviews, build their resumes, and improve their career prospects through AI-driven insights.

## Features

- AI Mock Interviews: Practice interviews with AI and get real-time feedback using Groq API.
- Resume Builder: Create professional resumes and export them.
- Cover Letter Generator: Generate tailored cover letters for specific job applications.
- Networking Hub: Connect with other professionals and participate in group discussions.
- User Profiles: Manage your career details, API keys, and application settings.
- Modern UI: A sleek, modern user interface with a unified dark emerald green aesthetic and lottie animations.
- Authentication: Secure user login and registration with JWT.

## Technology Stack

### Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Framer Motion (Animations)
- Lottie React

### Backend

- Node.js
- Express.js
- MongoDB & Mongoose
- Groq SDK (AI Integration)
- JWT (JSON Web Tokens)
- Multer (File Handling)
- bcryptjs (Password Hashing)
- node-cron (Scheduled job sync)

## Prerequisites

Ensure you have the following installed on your local machine:

- Node.js (v18 or higher recommended)
- MongoDB

## Installation

1. Clone the repository or navigate to the project root directory.

2. Setup the backend:

   ```bash
   cd server
   npm install
   ```

3. Setup the frontend:
   ```bash
   cd frontend
   npm install
   ```

## Environment Variables

### Backend (server/.env)

Create a `.env` file in the `server` directory and configure the necessary environment variables. Common variables include:

- PORT=5000
- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=your_jwt_secret
- GROQ_API_KEY=your_groq_api_key (can also be configured via user profile)
- FRONTEND_URL=your_frontend_url (for CORS)

**Job listing ingestion (JSearch + Adzuna):**

- RAPIDAPI_KEY=your_rapidapi_key
- JSEARCH_ENABLED=true
- JSEARCH_COUNTRY=in
- ADZUNA_APP_ID=your_adzuna_app_id
- ADZUNA_APP_KEY=your_adzuna_app_key
- ADZUNA_COUNTRY=in
- ADZUNA_ENABLED=true
- JOB_SYNC_ENABLED=true
- JOB_SYNC_QUERIES=software engineer,react developer,mern developer,data analyst
- JOB_SYNC_LOCATION=India
- JOB_SYNC_CRON=0 */6 * * *

Obtain API keys from [RapidAPI JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) and [Adzuna Developer Portal](https://developer.adzuna.com/).

Run a manual sync:

```bash
cd server
npm run sync-jobs
npm run sync-jobs -- --query="react developer" --location="Bangalore"
npm run sync-jobs -- --source=jsearch
```

Job listing API (authenticated):

- GET /api/job-listings — paginated feed (`?q=`, `?location=`, `?source=`, `?page=`, `?limit=`)
- GET /api/job-listings/:id — single listing
- POST /api/job-listings/sync — trigger manual sync (5-minute cooldown)
- POST /api/job-listings/:id/save — save listing to personal job tracker

### Frontend (frontend/.env)

Create a `.env` file in the `frontend` directory:

- VITE_API_BASE_URL=your_backend_url

## Running the Application Locally

To run the application locally for development, you will need to start both the backend and frontend servers in separate terminal windows.

1. Start the Backend Server

   ```bash
   cd server
   npm run dev
   ```

   The backend will start using nodemon.

2. Start the Frontend Development Server
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at http://localhost:5173.

## Project Structure

- /frontend: Contains the React frontend application code, including components, assets, pages, and store configurations.
- /server: Contains the Node.js/Express backend application code, including routes, Mongoose models, and controllers.
- README.md: Project documentation.
