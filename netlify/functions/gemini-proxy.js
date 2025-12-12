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
    console.error("API key not found in environment variables");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" }),
    };
  }

  // 打印 API Key 前几位用于调试（不要打印完整 Key）
  console.log("API Key prefix:", apiKey.substring(0, 10) + "...");

  try {
    const { action, payload } = JSON.parse(event.body);
    const genAI = new GoogleGenerativeAI(apiKey);
    // 尝试使用 gemini-1.5-flash 作为备选，它更稳定
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        const systemPrompt = "You are an empathetic English conversation partner. Be kind, patient, and encouraging. Don't correct every mistake, focus on keeping the conversation flowing. Keep responses short (under 2 sentences).";
        const userMessage = payload.message;
        
        // 过滤并格式化历史记录，确保格式正确
        const rawHistory = payload.history.slice(0, -1);
        
        // 如果没有历史记录，直接用 generateContent
        if (rawHistory.length === 0) {
          const response = await model.generateContent(`${systemPrompt}\n\nUser: ${userMessage}`);
          result = { text: response.response.text() };
          break;
        }
        
        // 构建有效的对话历史，确保以 user 开始且交替出现
        const historyFormatted = [];
        for (const msg of rawHistory) {
          const role = msg.role === "user" ? "user" : "model";
          const text = msg.parts?.[0]?.text || "";
          if (!text) continue;
          
          // 确保交替：如果当前角色和上一个相同，跳过
          if (historyFormatted.length > 0 && historyFormatted[historyFormatted.length - 1].role === role) {
            continue;
          }
          historyFormatted.push({ role, parts: [{ text }] });
        }
        
        // 确保历史以 user 开始
        if (historyFormatted.length > 0 && historyFormatted[0].role !== "user") {
          historyFormatted.shift();
        }
        
        // 确保历史以 model 结束（因为下一条是 user 发送的）
        if (historyFormatted.length > 0 && historyFormatted[historyFormatted.length - 1].role === "user") {
          historyFormatted.pop();
        }
        
        const chat = model.startChat({
          history: historyFormatted,
        });
        
        const response = await chat.sendMessage(
          historyFormatted.length === 0 
            ? `${systemPrompt}\n\nUser: ${userMessage}` 
            : userMessage
        );
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
