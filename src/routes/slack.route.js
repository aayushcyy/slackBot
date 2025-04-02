import express from "express";
import {
  slackEventController,
  handleSlashCommand,
  handleAction,
} from "../controllers/slack.controllers.js";
import { verifySlackRequest } from "../middlewares/verifySlackRequest.js";

const router = express.Router();

router.post("/", slackEventController);
// add the middleware(verifySlackRequest) in below both routes
router.post("/api/slack/command", handleSlashCommand);
router.post("/api/slack/actions", handleAction);

export default router;
