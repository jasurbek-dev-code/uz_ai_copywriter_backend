import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Kutish uchun yordamchi funksiya (ms)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateCopy = async (
  params: {
    contentType: string;
    promptText: string;
    targetAudience: string;
    language: string;
    tone: string;
    keywords?: string;
  },
  retries = 3,
  delay = 2000,
): Promise<string> => {
  const prompt = `
    Sen professional Copywriter va SMM mutaxassisisiz. Quyidagi ma'lumotlar asosida mukammal matn yozib ber:
    - Kontent turi: ${params.contentType}
    - Mavzu/Talab: ${params.promptText}
    - Maqsadli auditoriya: ${params.targetAudience}
    - Til: ${params.language}
    - Ohang (Tone): ${params.tone}
    - Qo'shimcha kalit so'zlar/talablar: ${params.keywords || "Yo'q"}

    MUHIM QOIDALAR (Murojaat shakli va til):
    1. Agar matn O'zbek tilida bo'lsa, mutlaqo HURMAT BILAN, ya'ni **"siz"** olmoshida va hurmat shaklida (masalan: "xohlaysizmi?", "olasizmi?", "erishasiz?", "boshlang") murojaat qil. "Sen" deb yozish qat'iyan taqiqlanadi.
    2. Agar matn Rus tilida bo'lsa, mutlaqo HURMAT BILAN, ya'ni **"Вы"** (hurmat ma'nosida) va tegishli feq shakllarida (masalan: "хотите", "получите", "начните") murojaat qil. "Ты" deb ishlatish taqiqlanadi.
    3. Agar matn Ingliz tilida bo'lsa, professional, biznesga mos va jozibali tonda bo'lsin.

    Iltimos, faqat tayyor matnning o'zini (chiroyli formatda, emojilar bilan) chiqarib ber.
  `;

  // Avtomatik qayta urinish sikli (Retry loop)
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      if (response.text) {
        return response.text;
      }
      throw new Error("Bo'sh javob qaytdi");
    } catch (error: any) {
      console.warn(`[Urinish ${attempt}/${retries}] Gemini serveri band (503 yoki xatolik).`);

      // Agar urinishlar tugamagan bo'lsa, biroz kutamiz va yana urinib ko'ramiz
      if (attempt < retries) {
        console.log(`${delay / 1000} soniyadan so'ng qayta urinib ko'rilmoqda...`);
        await sleep(delay);
        delay *= 2; // Har safar kutish vaqtini biroz uzaytiramiz (Exponential backoff)
      } else {
        console.error("Barcha urinishlar muvaffaqiyatsiz tugadi:", error);
        throw new Error("Gemini serverlari vaqtincha juda band. Iltimos, birozdan keyin qayta urinib ko'ring.");
      }
    }
  }

  throw new Error("Failed to generate content using Gemini API");
};
