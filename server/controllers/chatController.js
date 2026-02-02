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

// function to generate dynamic system prompt based on context
const generateSystemPrompt = (context) => {
    const role = context?.role || "Software Engineer";
    const skills = context?.skills || "General Software Engineering";
    const jobDescription = context?.jobDescription ? `\nJOB DESCRIPTION CONTEXT:\n${context.jobDescription}` : "";

    return `You are an experienced technical interviewer for a ${role} position. 
Your goal is to conduct a professional, realistic interview.

INTERVIEW CONTEXT:
- Candidate Target Role: ${role}
- Candidate Skills/Tech Stack: ${skills}
${jobDescription}

INSTRUCTIONS:
- Ask one clear question at a time.
- Start by introducing yourself as the AI Interviewer for this specific role.
- If the candidate answers correctly, acknowledge it briefly and move to a deeper or related specific question based on the Skills provided.
- If the candidate struggles, offer a small hint or ask a simpler related question.
- Keep your responses concise and conversational (suitable for voice output).
- Do not write code or long explanations unless asked.
- Focus strictly on the technical skills and requirements relevant to the ${role} and the provided Job Description.`;
};

export const handleChat = async (req, res) => {
    try {
        const { message, history, context } = req.body;

        // Generate dynamic prompt based on the user's setup
        const systemPrompt = generateSystemPrompt(context);

        // Construct messages array for the LLM
        // history should be an array of { role: 'user' | 'assistant', content: string }
        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []),
            { role: 'user', content: message }
        ];

        const client = getGroqClient();
        const chatCompletion = await client.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 200, 
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "I apologize, I didn't catch that.";

        res.json({ response: aiResponse });

    } catch (error) {
        console.error("Groq API Error Detail:", error.message, error.response?.data);
        res.status(500).json({ error: "Failed to generate response capabilities." });
    }
};

export const transcribeAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided" });
        }

        const client = getGroqClient();
        
        // Convert Buffer to File object (Node 18+ global File)
        const file = new File([req.file.buffer], "audio.webm", { type: req.file.mimetype });

        const translation = await client.audio.transcriptions.create({
            file: file,
            model: "whisper-large-v3",
            response_format: "json",
            temperature: 0.0,
        });

        console.log("Transcription:", translation.text);
        res.json({ text: translation.text });

    } catch (error) {
        console.error("Transcription Error:", error);
        res.status(500).json({ error: "Transcription failed" });
    }
};
