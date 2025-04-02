import axios from "axios";

const openApprovalModal = async (triggerId) => {
  const modalPayload = {
    trigger_id: triggerId,
    view: {
      type: "modal",
      callback_id: "approval_request",
      title: { type: "plain_text", text: "Approval Request" },
      blocks: [
        {
          type: "input",
          block_id: "approver",
          label: { type: "plain_text", text: "Select Approver" },
          element: {
            type: "users_select",
            action_id: "approver_selected",
          },
        },
        {
          type: "input",
          block_id: "approval_text",
          label: { type: "plain_text", text: "Approval Request Details" },
          element: {
            type: "plain_text_input",
            action_id: "approval_text_input",
          },
        },
      ],
      submit: { type: "plain_text", text: "Submit" },
    },
  };

  await axios.post("https://slack.com/api/views.open", modalPayload, {
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
};

const sendSlackMessage = async (userId, text) => {
  const messagePayload = {
    channel: userId,
    text: text,
  };

  await axios.post("https://slack.com/api/chat.postMessage", messagePayload, {
    headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
  });
};

const sendApprovalRequest = async (approverId, requesterId, approvalText) => {
  const messagePayload = {
    channel: approverId,
    text: `Approval request from <@${requesterId}>:\n${approvalText}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Approval request from <@${requesterId}>:\n${approvalText}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Approve" },
            style: "primary",
            value: "approve",
            action_id: "approve_action",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Reject" },
            style: "danger",
            value: "reject",
            action_id: "reject_action",
          },
        ],
      },
    ],
  };

  await axios.post("https://slack.com/api/chat.postMessage", messagePayload, {
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
};

export { openApprovalModal, sendSlackMessage, sendApprovalRequest };
