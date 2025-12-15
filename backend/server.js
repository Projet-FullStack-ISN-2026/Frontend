require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function generateQuizWithRetry(model, prompt, maxRetries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let raw = result.response.text();
      raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      return JSON.parse(raw);
    } catch (err) {
      if (err.status === 503 && attempt < maxRetries) {
        console.log(`⚡ Gemini busy, retrying (${attempt}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
}


app.post("/quiz", async (req, res) => {
  const { subject, count } = req.body;
  if (!subject || !count) return res.status(400).json({ error: "Missing subject or count" });

  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const prompt = `
Rôle : Tu es un expert en création de contenu culture générale et un assistant technique précis.
Tâche : Génère un quiz sur le thème : "${subject}".
Contraintes :
- Le quiz doit contenir exactement ${count} questions.
- Chaque question doit avoir 4 choix de réponses (1 vraie, 3 fausses).
- Les réponses fausses doivent être plausibles.
- Ton engageant.

Format strict JSON Array :
[
  {
    "question_text": "L'intitulé",
    "answers": [
      {"id": int,"answer_text": "Choix", "isCorrect": boolean}
    ]
  }
]
`;


    const geminiQuiz = await generateQuizWithRetry(model, prompt);


    const quizData = {
      id: 0,
      title: `Quiz de ${subject}`,
      status: 10,
      questions: geminiQuiz.map((q, qIndex) => ({
        id: qIndex,
        question: q.question_text,
        options: q.answers.map((a, aIndex) => ({
          id: aIndex,
          text: a.answer_text,
          isCorrect: a.isCorrect
        }))
      }))
    };

    console.log("Quiz final :", JSON.stringify(quizData, null, 2));
    return res.json(quizData);

  } catch (err) {
    console.error("GEMINI ERROR:", err);
    return res.status(500).json({ error: "Gemini generation failed" });
  }
});

app.listen(3001, () => console.log("Node API running on http://localhost:3001"));
