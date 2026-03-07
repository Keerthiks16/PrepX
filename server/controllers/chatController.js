import Groq from 'groq-sdk';

// Initialize Groq lazily to ensure process.env is ready
let groq;

const getGroqClient = (userApiKey = null) => {
    if (userApiKey) {
        return new Groq({ apiKey: userApiKey });
    }
    if (!groq) {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }
    return groq;
};

// Helper to extract user API key from request
const extractApiKey = (req) => {
    return req.headers['x-groq-api-key'] || req.body?.context?.groqApiKey || req.body?.groqApiKey || null;
};

// function to generate dynamic system prompt based on context
const generateSystemPrompt = (context) => {
    const role = context?.role || "Software Engineer";
    const skills = context?.skills || "General Software Engineering";
    const jobDescription = context?.jobDescription ? `\nJOB DESCRIPTION CONTEXT:\n${context.jobDescription}` : "";
    const resumeText = context?.resumeText ? `\nCANDIDATE RESUME/EXPERIENCE:\n${context.resumeText}` : "";
    
    // Default to classical if not specified
    const mode = context?.interviewType || 'Classical';

    const baseIdentity = `You are an experienced technical interviewer for a ${role} position. Your goal is to conduct a professional, realistic interview.`;
    
    const commonInstructions = `
- Ask one clear question at a time.
- Start by introducing yourself as the AI Interviewer for this specific role and mode.
- LISTEN to the candidate's answer.
- PROVIDE FEEDBACK (Required):
  * If correct: Acknowledge briefly (1 sentence).
  * If partially correct/wrong: Provide a brief correction or hint (MAX 2-3 lines). DO NOT lecture.
- THEN ask the next related question.
- Keep your total response concise (under 200 words).
- Do not write code or long explanations unless asked.`;

    // MODE 1: Classical (Standard Technical Interview)
    if (mode === 'Classical') {
        return `${baseIdentity}

INTERVIEW CONTEXT:
- Candidate Target Role: ${role}
- Candidate Skills/Tech Stack: ${skills}
${jobDescription}
${resumeText}

INSTRUCTIONS:
${commonInstructions}
- Focus strictly on the technical skills relevant to the ${role}.
- Mix of conceptual and practical questions.`;
    }

    // MODE 2: Resume Based (Deep Dive into Experience)
    if (mode === 'Resume') {
        return `${baseIdentity}

INTERVIEW CONTEXT:
- Candidate Target Role: ${role}
${resumeText}

INSTRUCTIONS:
${commonInstructions}
- Your PRIMARY SOURCE is the candidate's resume/experience provided above.
- Ask detailed questions about their specific projects, roles, and achievements found in the resume.
- Probe for depth: "Tell me more about how you implemented X...", "What challenges did you face when building Y?".
- Verify their claims by asking technical details about the tools they listed.`;
    }

    // MODE 3: Scenario Based (Behavioral & Situational)
    if (mode === 'Scenario') {
        return `${baseIdentity}

INTERVIEW CONTEXT:
- Candidate Target Role: ${role}
- Candidate Skills: ${skills}

INSTRUCTIONS:
${commonInstructions}
- Focus on "What would you do if..." and "Tell me about a time..." questions.
- Cover System Design scenarios, conflict resolution, production outages, and architectural decisions.
- Evaluate their problem-solving process, not just the final answer.
- Present a scenario, wait for their approach, then complicate/evolve the scenario.`;
    }

    // MODE 4: Project Viva (Technical Deep Dive)
    if (mode === 'Project') {
        const projectContext = context?.projectContext || "No project text provided.";
        return `${baseIdentity}

INTERVIEW CONTEXT (PROJECT VIVA):
- Role: Technical Interviewer conducting a Viva.
- User's Project Context:
${projectContext}

INSTRUCTIONS:
${commonInstructions}
- Your goal is to GRILL the candidate on THIS SPECIFIC PROJECT.
- Ask "HOW" and "WHY" questions based on the provided text.
- Example: "You mentioned using Redis for caching. Why not Memcached? How did you handle cache invalidation?"
- Example: "Explain the data flow in the [specific feature] you mentioned."
- Verify if they actually understand the code they claim to have written.`;
    }

    // MODE 5: Coaching (Friendly Mentor)
    if (mode === 'Coaching') {
        const projectContext = context?.projectContext || "No project text provided.";
        return `You are a Friendly Engineering Mentor.
Your goal is to help the candidate refine their pitch for the following project.

PROJECT CONTEXT:
${projectContext}

INSTRUCTIONS:
- Do NOT act as an interviewer. Act as a collaborator/coach.
- Discuss the project workflow.
- Ask: "How would you explain the architecture to a non-technical person?"
- Suggest improvements: "That's a good start, but try to emphasize the *impact* of using Microservices here."
- Help them structure their "Elevator Pitch".
- Be encouraging but provide sharp, actionable feedback.`;
    }

    return baseIdentity; // Fallback
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

        const client = getGroqClient(extractApiKey(req));
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

        const client = getGroqClient(extractApiKey(req));
        
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

        const client = getGroqClient(extractApiKey(req));
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

export const generateResumeSummary = async (req, res) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText) return res.status(400).json({ error: "No text provided" });

        const systemPrompt = `You are a professional Career Coach.
Summarize the following resume text into a concise, impressive professional profile (max 4-5 sentences).
Focus on:
- Key roles and years of experience.
- Top technical skills.
- Major achievements.
- Do not use "I", "me", or "my". Use implicit third person (e.g., "Experienced Software Engineer with...") or first person if requested, but standard is implicit.

Resume Text:
${resumeText}`;

        const client = getGroqClient(extractApiKey(req));
        const completion = await client.chat.completions.create({
            messages: [{ role: 'user', content: systemPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 300
        });

        const summary = completion.choices[0]?.message?.content?.trim();
        res.json({ summary });

    } catch (error) {
        console.error("Resume Summary Error:", error);
        res.status(500).json({ error: "Failed to summarize resume" });
    }
};

export const generateNetworkingMessage = async (req, res) => {
    try {
        const { userContext, recipient, templateName, templateText, jobDescription } = req.body;

        if (!userContext || !recipient) {
            return res.status(400).json({ error: "Missing user or recipient details" });
        }

        const systemPrompt = `You are a Career Networking Expert.
Your task is to take a SPECIFIC TEMPLATE and fill in the placeholders using the User's and Recipient's details.

TEMPLATE NAME: ${templateName}

TEMPLATE TEXT:
"${templateText}"

USER CONTEXT:
Name: ${userContext.name}
Role: ${userContext.role}
Skills: ${userContext.skills}
College: ${userContext.college}
Degree: ${userContext.degree}
Available Projects: ${JSON.stringify(userContext.projects)}
Links: LinkedIn: ${userContext.linkedin}, Portfolio: ${userContext.portfolio}

RECIPIENT CONTEXT:
Name: ${recipient.name}
Role: ${recipient.role}
Company: ${recipient.company}

JOB CONTEXT:
${jobDescription || "General Application for relevant role"}

INSTRUCTIONS:
1. Replace all placeholders (e.g., [Name], [Company], [Skill]) with actual data.
2. **PROJECT SELECTION**: If the template asks for a project/experience, choose the **SINGLE MOST RELEVANT** project from "Available Projects" that matches the "JOB CONTEXT". If strictly no project is relevant, use the most impressive one. Do NOT list multiple unless asked.
3. If data is missing (e.g., [App ID]), make a reasonable placeholder or remove that small part if sentence allows.
4. Fix any grammar or fluency issues.
5. Keep the tone exact to the template.

OUTPUT: Return ONLY the final compiled message text.`;

        const client = getGroqClient(extractApiKey(req));
        const completion = await client.chat.completions.create({
            messages: [{ role: 'user', content: systemPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 500
        });

        const message = completion.choices[0]?.message?.content?.trim();
        res.json({ message });

    } catch (error) {
        console.error("Networking Message Error:", error);
        res.status(500).json({ error: "Failed to generate message" });
    }
};

export const generateResumeLatex = async (req, res) => {
    try {
        const { userContext, jobDescription, mode, resumeContent, targetRole } = req.body;

        if (!userContext || !jobDescription) {
            return res.status(400).json({ error: "Missing user context or job description" });
        }

        // Default to provided resume content or user context
        const sourceMaterial = resumeContent || userContext.resumeContext || "No resume text provided.";
        const roleFocus = targetRole ? `TARGET ROLE: ${targetRole} (Prioritize experience relevant to this)` : "";

        let instruction = "";
        if (mode === 'Restructure') {
            instruction = "STRICTLY use the content from 'CURRENT RESUME CONTENT'. Do NOT invent new projects. Rephrase bullet points to match keywords from the Job Description. The goal is to optimize ATS score using ONLY the candidate's real experience.";
        } else if (mode === 'Blend') {
            instruction = "Hybrid Strategy: Select the 2 most relevant projects from 'CURRENT RESUME CONTENT' and keep them (can rephrase slightly). Then, HALLUCINATE ONE (1) new 'Suggested Project' that is perfectly tailored to the Job Description to bridge any skill gap. Total 3 projects. IMPORTANT: Give the hallucinated project a SPECIFIC, REALISTIC NAME (e.g., 'FlowState: Real-time Analytics' instead of 'Project A').";
        } else if (mode === 'Aggressive') {
            instruction = "Extreme Strategy: HALLUCINATE THREE (3) completely new projects that are a 100% perfect match for the Job Description. Ignore the candidate's actual projects if they don't fit. The goal is to create a resume that looks like the perfect candidate. IMPORTANT: Give every project a SPECIFIC, CATCHY NAME (e.g., 'Nebula: Cloud Orchestrator', 'FinTrack: AI Finance App').";
        }

        const systemPrompt = `You are an expert Resume Architect.
You must generate a full, valid LaTeX resume based EXACTLY on the user's provided template structure.

USER TEMPLATE (You MUST follow this formatting & styling exactly, just replace content):
--------------------------------------------------
\\documentclass[11pt,a4paper]{article}
\\usepackage[top=0.6in, bottom=0.7in, left=0.8in, right=0.8in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}
\\usepackage{setspace}
\\setstretch{1.1}
\\pagenumbering{gobble}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{2pt}
\\titleformat{\\section}{\\vspace{-1pt}\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{8pt}{10pt}
\\begin{document}
\\begin{center}
    {\\LARGE \\textbf{[NAME]}}\\\\
    \\vspace{4pt}
    \\href{mailto:[EMAIL]}{[EMAIL]} \\,·\\, [PHONE] \\,·\\, \\href{[PORTFOLIO_URL]}{Portfolio} \\,·\\, \\href{[GITHUB_URL]}{GitHub} \\,·\\, \\href{[LINKEDIN_URL]}{LinkedIn}
\\end{center}

\\section*{Summary}
[SUMMARY]

\\section*{Experience}
[EXPERIENCE_ENTRIES] 
% Format for Experience:
% \\textbf{Company} \\hfill \\textit{Role} \\vspace{-1pt} \\begin{itemize}[leftmargin=*, itemsep=2pt, topsep=1pt] \\item ... \\end{itemize}

\\section*{Projects}
[PROJECT_ENTRIES]
% Format for Projects:
% \\textbf{\\href{Link}{Title}} \\hfill \\textit{Tech Stack} \\begin{itemize}[leftmargin=*, itemsep=2pt, topsep=1pt] \\item ... \\end{itemize}

\\section*{Education}
[EDUCATION_ENTRIES]

\\section*{Skills}
\\textbf{Programming \\& Development:} [LANGUAGES] \\\\[1pt]
\\textbf{Technologies \\& Tools:} [TOOLS]

\\section*{Certifications}
[CERTIFICATIONS]

\\section*{Achievement}
[ACHIEVEMENTS]

\\end{document}
--------------------------------------------------

CANDIDATE INFO:
Name: ${userContext.name || "Keerthik Shetty"}
Role: ${userContext.role || "Software Engineer"}
Skills: ${userContext.skills}
CURRENT RESUME CONTENT:
${sourceMaterial}

TARGET ROLE: ${targetRole || "Best Fit"}
JOB DESCRIPTION:
${jobDescription}

MODE: ${mode}
INSTRUCTION: ${instruction}

OUTPUT RULES:
1. Return ONLY the valid LaTeX code.
2. Maintain the exact styling (packages, margins, commands) of the USER TEMPLATE.
3. Fill in the brackets [ ] with the Candidate's info from CURRENT RESUME CONTENT.
4. **ATS OPTIMIZATION (CRITICAL):**
   - Use VARIED, STRONG ACTION VERBS (e.g., Architected, Engineered, Optimized, Spearheaded). Do NOT repeat verbs like 'Developed' or 'Used'.
   - Ensure PERFECT SPELLING & GRAMMAR. Zero tolerance for errors.
5. **PROJECT DESCRIPTIONS:**
   - Structure: "Built [Feature X] using [Tech Stack Y] to achieve [Business Result Z]."
   - Balance: 50% implementation details (Tech), 50% user-facing features/impact.
6. **If 'Restructure' mode:** Maintain the original length/density of the resume. Do NOT condense it too much.
7. Escape special LaTeX characters (e.g., $ becomes \\$, & becomes \\&, % becomes \\%).
`;

        const client = getGroqClient(extractApiKey(req));
        const completion = await client.chat.completions.create({
            messages: [{ role: 'user', content: systemPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            max_tokens: 3000
        });

        let latexCode = completion.choices[0]?.message?.content?.trim();
        
        // Cleanup if AI wrapped it in markdown
        if (latexCode?.startsWith('```latex')) {
            latexCode = latexCode.replace(/^```latex\n/, '').replace(/\n```$/, '');
        } else if (latexCode?.startsWith('```')) {
            latexCode = latexCode.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        res.json({ latexCode });

    } catch (error) {
        console.error("Resume Generation Error:", error);
        res.status(500).json({ error: "Failed to generate resume" });
    }
};

export const generateCoverLetter = async (req, res) => {
    try {
        const { userContext, jobDescription, company, manager, tone } = req.body;

        if (!userContext || !jobDescription || !company) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const systemPrompt = `You are a professional Cover Letter Writer.
    Your goal is to write a ${tone || 'Professional'} cover letter for the following candidate.

    CANDIDATE CONTEXT:
    Name: ${userContext.name}
    Current Role: ${userContext.role}
    Skills: ${userContext.skills}
    Projects: ${JSON.stringify(userContext.projects)}
    Resume Highlights: ${userContext.resumeContext || "N/A"}

    JOB PARAMETERS:
    Company: ${company}
    Hiring Manager: ${manager || "Hiring Manager"}
    Job Description:
    ${jobDescription}

    INSTRUCTIONS:
    1. Write a compelling, human-like cover letter.
    2. Tone: ${tone || 'Professional'}.
    3. Structure:
       - Hook: enthusiastic opening mentioning the role and company.
       - Body Paragraph 1: Connect candidate's skills/experience to the JD's requirements.
       - Body Paragraph 2: Highlight a relevant project or achievement.
       - Closing: Call to action and sign-off.
    4. Do not use placeholders like [Date] or [Address] unless necessary. Keep it ready-to-send.
    5. Length: 250-350 words.

    OUTPUT:
    Return ONLY the raw text of the cover letter. Do not include markdown formatting or explanations.`;

        const client = getGroqClient(extractApiKey(req));
        const completion = await client.chat.completions.create({
            messages: [{ role: 'user', content: systemPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1000
        });

        const coverLetter = completion.choices[0]?.message?.content?.trim();
        res.json({ coverLetter });

    } catch (error) {
        console.error("Cover Letter Generation Error:", error);
        res.status(500).json({ error: "Failed to generate cover letter" });
    }
};

// --- GROUP DISCUSSION (GD) FEATURES ---

export const handleGDChat = async (req, res) => {
    try {
        const { topic, history, currentSpeaker } = req.body;

        const personaPrompts = {
            excellent: "You are an excellent GD participant. You are polite, efficient, use strong facts, and structure your viewpoints perfectly. You are a confirmed selection because of how efficiently you put across your points.",
            aggressive: "You are an aggressive GD participant. You resonate all 'not to do' behaviors. You interrupt often, sound dominating, and might disregard others' opinions.",
            neutral: "You are a neutral GD participant. You contribute moderately, have a 50-50 chance of selection, and provide standard viewpoints.",
            silent: "You are a silent GD participant. You speak very little, provide minimal contribution, and are often less involved."
        };

        const systemPrompt = `You are ${currentSpeaker.name}, a participant in a Group Discussion.
Topic: "${topic}"
Your Role/Persona: ${personaPrompts[currentSpeaker.persona.toLowerCase()] || "Neutral participant"}

INSTRUCTIONS:
1. Stay strictly in character.
2. Respond to the conversation so far.
3. Keep your response concise (2-4 sentences).
4. Do not act as a mediator. Speak as a fellow candidate.
5. If someone just spoke, you can either agree, disagree or add a new dimension to the topic.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || [])
        ];

        const client = getGroqClient(extractApiKey(req));
        const chatCompletion = await client.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.8,
            max_tokens: 200,
        });

        const response = chatCompletion.choices[0]?.message?.content || "I agree with the point.";
        res.json({ response });

    } catch (error) {
        console.error("GD Chat Error:", error);
        res.status(500).json({ error: "Failed to generate GD response" });
    }
};

export const generateGDFeedback = async (req, res) => {
    try {
        const { topic, history, userName } = req.body;

        const systemPrompt = `You are an Expert GD Evaluator (Hiring Manager).
Topic: "${topic}"
User being evaluated: "${userName}"

Evaluate the user's performance in this Group Discussion.

OUTPUT FORMAT:
Return ONLY a raw JSON object:
{
  "rating": <number 0-100>,
  "summary": "<string, 2-3 sentences max>",
  "speakerType": "excellent" | "neutral" | "aggressive" | "silent",
  "suggestions": ["<string>", "<string>"],
  "redFlags": ["<string>", "<string>"]
}

CRITERIA:
- Evaluate content quality, teamwork, and communication.
- Identify "red flags" (e.g., being too aggressive, too silent, or irrelevant points). If no red flags, return empty array.
- "speakerType" should be based on how the user sounded during the GD.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `GD TRANSCRIPT:\n${JSON.stringify(history)}` }
        ];

        const client = getGroqClient(extractApiKey(req));
        const completion = await client.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        res.json(JSON.parse(completion.choices[0]?.message?.content));

    } catch (error) {
        console.error("GD Feedback Error:", error);
        res.status(500).json({ error: "Failed to generate GD feedback" });
    }
};

export const generateGDMediatorIntro = async (req, res) => {
    try {
        const { topic } = req.body;
        const systemPrompt = `You are a GD Mediator. Formally introduce the topic: "${topic}". 
Announce that the discussion is now open and participants can begin. 
Be professional and brief (max 2 sentences).`;

        const client = getGroqClient(extractApiKey(req));
        const completion = await client.chat.completions.create({
            messages: [{ role: 'user', content: systemPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 150
        });

        res.json({ response: completion.choices[0]?.message?.content });
    } catch (error) {
        console.error("GD Intro Error:", error);
        res.status(500).json({ error: "Failed to generate mediator intro" });
    }
};
