import axios from "axios";
import { openApprovalModal } from "../services/slackService.js";

// 1. slack event controller
const slackEventController = async (req, res) => {
  const { type, challenge } = req.body;

  // Handling slack verification challenge
  if (type === "url_verification") {
    return res.status(200).send({ challenge });
  }

  // handling other event types
  return res.status(200).send("Event received!");
};

// 2. slash command controller
const handleSlashCommand = async (req, res) => {
  try {
    const triggerId = req.body.trigger_id;

    if (!triggerId) {
      return res.status(400).send("Missing trigger_id from Slack request");
    }

    // open slack model
    await openApprovalModal(triggerId);

    return res.status(200).send();
  } catch (error) {
    console.log(`Error handling slash command: ${error}`);
    return res.status(500).send("Internal server errror");
  }
};

export { slackEventController, handleSlashCommand };
