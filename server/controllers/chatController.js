import Groq from 'groq-sdk';

// Initialize Groq lazily to ensure process.env is ready
let groq;

const getGroqClient = () => {
    if (!groq) {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }
    return groq;
};

// System prompt to define the AI persona
const SYSTEM_PROMPT = `You are an experienced technical interviewer. 
Your goal is to conduct a professional interview.
- Ask one clear question at a time.
- Start by introducing yourself and asking the candidate to introduce themselves.
- If the candidate answers correctly, acknowledge it briefly and move to a deeper or related specific question.
- If the candidate struggles, offer a small hint or ask a simpler related question.
- Keep your responses concise and conversational (suitable for voice output).
- Do not write code or long explanations unless asked.
- Focus on technical topics relevant to the job description provided (or general software engineering if none).`;

export const handleChat = async (req, res) => {
    try {
        const { message, history } = req.body;

        // Construct messages array for the LLM
        // history should be an array of { role: 'user' | 'assistant', content: string }
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...(history || []),
            { role: 'user', content: message }
        ];

        const client = getGroqClient();
        const chatCompletion = await client.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile", // Updated to supported model
            temperature: 0.7,
            max_tokens: 150, // Keep responses short for voice
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "I apologize, I didn't catch that.";

        res.json({ response: aiResponse });

    } catch (error) {
        console.error("Groq API Error Detail:", error.message, error.response?.data);
        res.status(500).json({ error: "Failed to generate response capabilities." });
    }
};
