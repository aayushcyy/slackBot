import axios from "axios";
import querystring from "querystring";
import {
  openApprovalModal,
  sendSlackMessage,
  sendApprovalRequest,
} from "../services/slackService.js";

// controller for slack event subscriptions (e.g., URL verification)
const slackEventController = async (req, res) => {
  const { type, challenge } = req.body;

  // Handling slack verification challenge
  if (type === "url_verification") {
    return res.status(200).send({ challenge });
  }

  // handling other event types
  return res.status(200).send("Event received!");
};

// controller for handling slack slash commands (e.g., /approval-test)
const handleSlashCommand = async (req, res) => {
  try {
    // parse the raw request body
    const parsedBody = querystring.parse(req.body.toString());
    console.log("body is being parsed: ", parsedBody);

    const triggerId = parsedBody.trigger_id;
    const responseUrl = parsedBody.response_url;

    // validating trigger_id presence
    if (!triggerId) {
      return res.status(400).send("Missing trigger_id from Slack request");
    }

    // acknowledge the request to Slack
    res.status(200).send("Processing your request...");

    // open approval modal for the requester
    await openApprovalModal(triggerId, responseUrl);

    return res.status(200).send();
  } catch (error) {
    return res.status(500).send("Internal server errror");
  }
};

// controller for handling Slack actions (modal submissions, button clicks)
const handleAction = async (req, res) => {
  try {
    // parse the raw request body
    const parsedBody = querystring.parse(req.body.toString());
    const payload = JSON.parse(parsedBody.payload);

    // handle modal submission (approval request form)
    if (payload.type === "view_submission") {
      // extracting data from modal
      const values = payload.view.state.values;
      const approverId = values.approver.approver_selected.selected_user;
      const approvalText = values.approval_text.approval_text_input.value;
      const requesterId = payload.user.id;
      const responseUrl = JSON.parse(
        payload.view.private_metadata
      ).response_url;

      // send approval request to the approver
      const { messageTs, responseUrl: returnedResponseUrl } =
        await sendApprovalRequest(
          approverId,
          requesterId,
          approvalText,
          responseUrl
        );

      // close the modal
      return res.status(200).json({
        response_action: "clear",
      });
    }

    // handle button actions (approve/reject)
    if (payload.type === "block_actions") {
      // validate actions
      if (
        !payload.actions ||
        !Array.isArray(payload.actions) ||
        payload.actions.length === 0
      ) {
        console.error("22. Error: No actions found in payload.");
        return res.status(400).send("Invalid payload: No actions found.");
      }

      const action = payload.actions[0].value;
      console.log("Processing action:", action);

      const approverId = payload.user.id;
      const requesterId = payload.message.text.match(/<@(.+?)>/)[1];
      const responseUrl = payload.response_url;

      const message =
        action === "approve" ? "✅ Request Approved!" : "❌ Request Rejected!";

      // notify the requester of approval result
      try {
        await sendSlackMessage(requesterId, message);
      } catch (error) {
        console.error(`Failed to notify requester ${requesterId}:`, error);
        // fallback: Notify in the channel where the command was run
        await sendSlackMessage(
          payload.channel.id,
          `Failed to notify <@${requesterId}> directly. Approval result: ${message}`
        );
      }

      // update the original message in Slack
      await axios.post(responseUrl, {
        replace_original: "true",
        text: `User <@${requesterId}> has ${action}d the request.`,
      });

      // notify the channel of the approval result
      await sendSlackMessage(
        "C08KZTK985U", // The channel id
        `Approval result for <@${requesterId}>: ${message}`
      );

      return res.status(200).send();
    }

    // handle unsupported payload types
    return res.status(400).send("Unsupported payload type");
  } catch (error) {
    console.error("Error handling actions:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export { slackEventController, handleSlashCommand, handleAction };
