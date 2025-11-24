import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize client only if key exists (handled gracefully in UI if missing)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const solveMathWithGemini = async (problem: string): Promise<{ answer: string; explanation: string }> => {
  if (!ai) {
    throw new Error("API Key is missing.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Solve this math problem or answer this question. Provide the final numerical or short answer separately from the detailed explanation.
      
      Problem: ${problem}`,
      config: {
        systemInstruction: "You are a helpful and precise math tutor. Solve the problem step-by-step. Return the response in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description: "The final concise answer or result (e.g., '42', 'x = 5').",
            },
            explanation: {
              type: Type.STRING,
              description: "A step-by-step explanation of how the result was achieved.",
            },
          },
          required: ["answer", "explanation"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      answer: "Error",
      explanation: "فشل في الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى."
    };
  }
};