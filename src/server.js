import express from "express";
import "dotenv/config"; // loads env variable from .env
import slackEventRouter from "./routes/slack.route.js";
import cors from "cors";

const app = express();

// enable CORS for all origins
app.use(cors({ origin: "*", credentials: true }));

// parse incoming JSON requests for all routes
app.use(express.json());

// Use express.raw() for Slack routes(middlewares) to capture the raw body
app.use(
  "/api/slack/command",
  express.raw({ type: "application/x-www-form-urlencoded" })
);
app.use(
  "/api/slack/actions",
  express.raw({ type: "application/x-www-form-urlencoded" })
);

// Slack event subscription route
app.use("/", slackEventRouter);

// health check route
app.get("/", (req, res) => {
  res.send("Welcome to the Home Page!");
});

// starting server on specified port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
