const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  // 只允许 POST 请求
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" }),
    };
  }

  try {
    const { action, payload } = JSON.parse(event.body);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let result;

    switch (action) {
      case "lookup": {
        const prompt = `
        Analyze the input: "${payload.word}".
        
        Role: English Coach for Chinese students.
        
        1. **If Input is an English WORD or PHRASE** (e.g., "Resilience", "Piece of cake"):
           - word: Return the input word (corrected case).
           - phonetic: Provide IPA (e.g., /rɪˈzɪliəns/).
           - definition: Simple English definition.
           - translation_cn: **Strictly Simplified Chinese** translation (e.g., "n. 韧性，恢复力").
           - example: A short, daily-life sentence using it.

        2. **If Input is an English SENTENCE** (e.g., "I want to ask for a refund"):
           - word: Return the input sentence.
           - phonetic: "" (Empty string).
           - definition: Explain the key grammar point or keyword in **Simplified Chinese**.
           - translation_cn: Translate the whole sentence into natural **Simplified Chinese**.
           - example: A natural response or variation of this sentence in English.

        3. **If Input is CHINESE** (e.g., "尴尬", "我想请假"):
           - Treat it as a reverse lookup.
           - word: The best English translation (Word, Phrase, or Sentence).
           - phonetic: IPA for the English translation (if it's a word/phrase).
           - definition: Explain the nuance of this English translation in **Simplified Chinese**.
           - translation_cn: The original Chinese input.
           - example: A sentence using the English translation.
        
        Output strictly valid JSON with keys: word, phonetic, definition, translation_cn, example.
        `;
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        // 提取 JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        break;
      }

      case "sos": {
        const prompt = `User wants to say this in English: "${payload.query}".
        Provide a "Native Option" (natural, colloquial, not textbook direct translation).
        Also provide a very brief explanation (under 10 words) of why this is better.
        Output strictly valid JSON with keys: native, explanation.`;
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { native: "Sorry, try again.", explanation: "Error." };
        break;
      }

      case "freetalk": {
        const chat = model.startChat({
          history: payload.history.map(msg => ({
            role: msg.role,
            parts: msg.parts,
          })),
          systemInstruction: "You are an empathetic English conversation partner. You are kind, patient, and encouraging. You do not correct every mistake, but focus on keeping the conversation flowing. Keep your responses short (under 2 sentences) to encourage the user to speak more.",
        });
        const response = await chat.sendMessage(payload.message);
        result = { text: response.response.text() };
        break;
      }

      case "drill-scenario": {
        const prompt = `Create a very short, single-turn roleplay scenario that forces the user to use one or more of these words: ${payload.words.join(', ')}.
        Context: Daily life or Work.
        Output ONLY the setup line (e.g., "You are at a coffee shop. Ask the barista for a napkin.").`;
        const response = await model.generateContent(prompt);
        result = { scenario: response.response.text() };
        break;
      }

      case "drill-check": {
        const prompt = `Role: Strict English Coach.
        Scenario: ${payload.scenario}
        User Said: "${payload.userSaid}"
        
        Task: Evaluate ONLY two things:
        1. Did they make sense in context?
        2. Was it grammatically acceptable (ignoring minor slips)?
        
        If hesitant or very wrong, fail them. If okay, pass them.
        Output strictly valid JSON with keys: passed (boolean), feedback (string).`;
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { passed: false, feedback: "System error. Try again." };
        break;
      }

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Unknown action" }),
        };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
