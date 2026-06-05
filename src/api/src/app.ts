import express from "express";
import { errorHandler } from "./middleware/errorHandler";

// TODO: import routes
// import sessionsRouter from "./routes/sessions";
// import capabilitiesRouter from "./routes/capabilities";
// import autonomyRouter from "./routes/autonomy";
// import heatmapRouter from "./routes/heatmap";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ai-autonomy-mapper-api" });
});

// TODO: register routers
// app.use("/sessions", sessionsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`AI Autonomy Mapper API listening on http://localhost:${PORT}`);
});

export default app;
