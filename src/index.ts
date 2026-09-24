import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import aiRouter from "./routes/ai";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", aiRouter);

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "AI Copywriter API is running successfully! 🚀" });
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
