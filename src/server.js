import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import slackEventRouter from "./routes/slack.route.js";
import cors from "cors";

const app = express();

app.use(cors({ origin: "*", credentials: true }));

// General body parsers for other routes
app.use(express.json()); // General JSON parsing for all routes

// Use express.raw() for Slack routes to capture the raw body
app.use(
  "/api/slack/command",
  express.raw({ type: "application/x-www-form-urlencoded" })
);
app.use(
  "/api/slack/actions",
  express.raw({ type: "application/x-www-form-urlencoded" })
);

// Parse the body as URL-encoded after the raw middleware for use in controllers
app.use("/api/slack/command", express.urlencoded({ extended: true }));
app.use("/api/slack/actions", express.urlencoded({ extended: true }));

// Development log middleware
app.use((req, res, next) => {
  console.log("Received request:", req.method, req.url, req.headers);
  next();
});

// Slack event subscription route
app.use("/", slackEventRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Home Page!");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
