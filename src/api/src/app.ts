import express from "express";
import sessionsRouter from "./routes/sessions";
import exportRouter from "./routes/export";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ai-autonomy-mapper-api", version: "1.0.0" });
});

// API routes
app.use("/api/sessions", sessionsRouter);
app.use("/api/sessions/:id/export", exportRouter);

// 404 handler
app.use("*", (_req, res) => {
  res.status(404).json({ error: "Not found", status: 404 });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server if running directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 AI Autonomy Mapper API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: GET http://localhost:${PORT}/health`);
  });
}

export default app;
