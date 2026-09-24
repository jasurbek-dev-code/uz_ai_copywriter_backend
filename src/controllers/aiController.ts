import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { generateCopy } from "../services/gemini";

/**
 * Generates content using Gemini API, ensures the user exists, and saves the history.
 *
 * @param {Request} req - Express request object containing generation parameters in the body.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const generateContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { telegramId, name, contentType, promptText, targetAudience, language, tone, keywords } = req.body;

    if (!telegramId || !contentType || !promptText) {
      res.status(400).json({ error: "telegramId, contentType, and promptText are required." });
      return;
    }

    // Ensure user exists or create a new one
    const user = await prisma.user.upsert({
      where: { telegramId: String(telegramId) },
      update: { name: name || undefined },
      create: {
        telegramId: String(telegramId),
        name: name || null,
      },
    });

    // Call the Gemini service
    const generatedText = await generateCopy({
      contentType,
      promptText,
      targetAudience: targetAudience || "Umumiy",
      language: language || "O'zbek",
      tone: tone || "Professional",
      keywords: Array.isArray(keywords) ? keywords.join(", ") : keywords || "Yo'q",
    });

    // Save the generated content to the database (contentType to'g'irlandi)
    const historyItem = await prisma.generationHistory.create({
      data: {
        userId: user.id,
        promptText,
        contentType: contentType, // contentType (T harfi katta)
        generatedText,
      },
    });

    res.status(200).json({ success: true, data: historyItem });
  } catch (error) {
    console.error("Error in generateContent:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Retrieves the generation history for a specific user by their telegramId.
 *
 * @param {Request} req - Express request object containing telegramId in params.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { telegramId } = req.params;

    if (!telegramId) {
      res.status(400).json({ error: "telegramId is required." });
      return;
    }

    // Find user and their history ordered by newest first (history relation nomi ishlatildi)
    const user = await prisma.user.findUnique({
      where: { telegramId: String(telegramId) },
      include: {
        history: {
          // generationHistory o'rniga history
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json({ success: true, data: user.history });
  } catch (error) {
    console.error("Error in getHistory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
