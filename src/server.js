import express from "express";
import "dotenv/config"; // imports and configs dotenv
import bodyParser from "body-parser";
import slackEventRouter from "./routes/slack.route.js";
import cors from "cors";

const app = express();

// enable CORS for all origins
app.use(cors({ origin: "*", credentials: true }));

// parse JSON requests for all routes
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

// Parse the body as URL-encoded after the raw middleware for use in controllers
//remove this just for check as it doesn't needed
// app.use("/api/slack/command", express.urlencoded({ extended: true }));
// app.use("/api/slack/actions", express.urlencoded({ extended: true }));

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
