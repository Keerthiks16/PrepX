import express from 'express';
import { handleChat } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat - Process user message and get AI response
router.post('/', (req, res, next) => {
    console.log("Received chat request at /api/chat");
    console.log("Body:", req.body);
    next();
}, handleChat);

export default router;
