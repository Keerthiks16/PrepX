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
- LISTEN to the candidate's answer.
- PROVIDE FEEDBACK (Required):
  * If correct: Acknowledge briefly (1 sentence).
  * If partially correct/wrong: Provide a brief correction or hint (MAX 2-3 lines). DO NOT lecture.
- THEN ask the next related question.
- Keep your total response concise (under 200 words) to prevent cutoff.
- Do not write code or long explanations unless asked.
- Focus strictly on the technical skills relevant to the ${role}.`;
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

// Helper to validate JSON output from LLM
const parseJSON = (text) => {
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) return null;
        return JSON.parse(text.substring(start, end + 1));
    } catch (e) {
        return null;
    }
};

export const generateFeedback = async (req, res) => {
    try {
        const { history, context } = req.body;
        
        if (!history || history.length < 2) {
             return res.status(400).json({ error: "Not enough interview data for feedback." });
        }

        const role = context?.role || "Software Engineer";
        const skills = context?.skills || "General";

        const systemPrompt = `You are a Senior Hiring Manager. 
Analyze the following interview transcript for a ${role} position.
Candidates Skills: ${skills}.

OUTPUT FORMAT:
Return ONLY a raw JSON object (no markdown, no extra text) with this structure:
{
  "rating": <number 0-100>,
  "summary": "<string, 3 sentences max>",
  "strengths": ["<string>", "<string>"],
  "weaknesses": ["<string>", "<string>"],
  "improvements": ["<string>", "<string>"]
}

CRITERIA:
- Rating should reflect technical accuracy, communication clarity, and relevance to the role.
- Be honest but constructive.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `TRANSCRIPT:\n${JSON.stringify(history)}` }
        ];

        const client = getGroqClient();
        const completion = await client.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            response_format: { type: "json_object" } 
        });

        const content = completion.choices[0]?.message?.content;
        const feedbackData = parseJSON(content);

        if (!feedbackData) {
            throw new Error("Failed to parse AI response as JSON");
        }

        res.json(feedbackData);

    } catch (error) {
        console.error("Feedback Generation Error:", error);
        res.status(500).json({ error: "Failed to generate feedback" });
    }
};
