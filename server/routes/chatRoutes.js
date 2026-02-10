import express from 'express';
import multer from 'multer';
import { handleChat, transcribeAudio, generateFeedback, generateResumeSummary, generateNetworkingMessage, generateResumeLatex, generateCoverLetter } from '../controllers/chatController.js';

const router = express.Router();
console.log("Loading chatRoutes...");
console.log("generateResumeSummary type:", typeof generateResumeSummary);

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/chat - Process user message and get AI response
router.post('/', (req, res, next) => {
    console.log("Received chat request at /api/chat");
    console.log("Body:", req.body);
    next();
}, handleChat);

// POST /api/chat/transcribe - Transcribe audio file
router.post('/transcribe', upload.single('audio'), transcribeAudio);

// POST /api/chat/feedback - Generate interview feedback
router.post('/feedback', generateFeedback);

// POST /api/chat/resume-summary
router.post('/resume-summary', (req, res, next) => {
    console.log('DEBUG: Hit /resume-summary route');
    next();
}, generateResumeSummary);

// POST /api/chat/networking-message
router.post('/networking-message', (req, res, next) => {
    console.log('DEBUG: Hit /networking-message route');
    next();
}, generateNetworkingMessage);

// POST /api/chat/resume-latex
router.post('/resume-latex', (req, res, next) => {
    console.log('DEBUG: Hit /resume-latex route');
    next();
}, generateResumeLatex);

// POST /api/chat/cover-letter
router.post('/cover-letter', (req, res, next) => {
    console.log('DEBUG: Hit /cover-letter route');
    next();
}, generateCoverLetter);

export default router;
