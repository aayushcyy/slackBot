import express from "express";
import { slackEventController } from "../controllers/slackEvent.controller.js";

const router = express.Router();

router.post("/", slackEventController);

export default router;
