import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import slackEventRouter from "./routes/slack.route.js";
import cors from "cors";

const app = express();

app.use(cors({ origin: "*", credentials: true }));

// Use express.raw() only for Slack verification
app.use("/api/slack/command", express.raw({ type: "application/json" }));
app.use("/api/slack/actions", express.raw({ type: "application/json" }));

// Body parsers for other routes
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// development middleware
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
