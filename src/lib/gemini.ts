import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const visionModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: `You are a Recycling Assistant for the Vashudha app. 
  Analyze images of waste and identify the material type, estimated weight, and recyclability.
  
  Return ONLY a JSON object in this format:
  {
    "materialType": "PET Plastic" | "Paper" | "Glass" | "Metal" | "Other",
    "confidence": "High" | "Medium" | "Low",
    "isRecyclable": boolean,
    "credits": number,
    "co2SavedKg": number,
    "action": string (short instruction like 'Place in Blue Bin')
  }
  
  Credits Reference:
  - Plastic: 50 per kg
  - Paper: 20 per kg
  - Glass: 30 per kg
  - Metal: 100 per kg
  `
});

export async function analyzeWaste(base64Image: string) {
  try {
    const result = await visionModel.generateContent([
      "Identify this waste material and provide recycling data in JSON format.",
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg"
        }
      }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the potentially markdown-wrapped response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid AI response format");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
