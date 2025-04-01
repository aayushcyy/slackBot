import express from "express";
import {
  slackEventController,
  handleSlashCommand,
  handleAction,
} from "../controllers/slack.controllers.js";
import { verifySlackRequest } from "../middlewares/verifySlackRequest.js";

const router = express.Router();

router.post("/", slackEventController);
router.post("/api/slack/command", verifySlackRequest, handleSlashCommand);
router.post("/api/slack/actions", verifySlackRequest, handleAction);
// router.post("/api/slack/events", verifySlackRequest, handleEvent);

export default router;
