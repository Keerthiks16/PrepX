import express from 'express';
import multer from 'multer';
import { handleChat, transcribeAudio } from '../controllers/chatController.js';

const router = express.Router();

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

export default router;
