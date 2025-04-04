import express from "express";
import {
  slackEventController,
  handleSlashCommand,
  handleAction,
} from "../controllers/slack.controllers.js";
import { verifySlackRequest } from "../middlewares/verifySlackRequest.js";

// Express router initialization
const router = express.Router();

// Route for Slack event subscriptions (e.g. URL verification)
router.post("/", slackEventController);

// Route for handling Slack slash commands
router.post("/api/slack/command", verifySlackRequest, handleSlashCommand);

// Route for handling Slack interactive actions (e.g. modal submissions, button clicks)
router.post("/api/slack/actions", verifySlackRequest, handleAction);

export default router;
