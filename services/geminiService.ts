import { GoogleGenAI, Type } from "@google/genai";

export const solveMathWithGemini = async (apiKey: string, problem: string): Promise<{ answer: string; explanation: string }> => {
  if (. AIzaSyBIg4NyQ1vu5gEVwJeBk-R4_l6s6f9HtJQ) {
    throw new Error("يرجى إدخال مفتاح API في الإعدادات للمتابعة.");
  }

  const ai = new GoogleGenAI({ apiKey });

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

  } catch (error: any) {
    console.error("Gemini Error:", error);
    let errorMessage = "فشل في الاتصال بالذكاء الاصطناعي.";
    
    // Check for common API Key errors
    if (error.toString().includes('API key') || error.status === 400 || error.status === 403) {
        errorMessage = "مفتاح API غير صحيح أو منتهي الصلاحية.";
    }
    
    throw new Error(errorMessage);
  }
};
