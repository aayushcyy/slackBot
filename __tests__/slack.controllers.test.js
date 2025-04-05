import {
  handleSlashCommand,
  slackEventController,
  handleAction,
} from "../controllers/slack.controllers.js";
import querystring from "querystring";
import { openApprovalModal } from "../services/slackService.js";

// mock dependencies
jest.mock("../services/slackService.js");
jest.mock("querystring");

// mock express object
const mockRequest = (body) => ({
  body: Buffer.from(body),
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("handleSlashCommand", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SLACK_BOT_TOKEN = "test-bot-token"; // set test token for modal calls
  });

  // test - 1: handle missing trigger_id
  test("should return 400 if trigger_id is missing", async () => {
    const req = mockRequest("trigger_id=&response_url=https://test.url");
    const res = mockResponse();
    querystring.parse.mockReturnValue({
      trigger_id: "",
      response_url: "https://test.url",
    });

    await handleSlashCommand(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      "Missing trigger_id from Slack request"
    );
    expect(openApprovalModal).not.toHaveBeenCalled();
  });

  // test - 2: process valid slash command
  test("should process slash command and open modal", async () => {
    const req = mockRequest("trigger_id=test-id&response_url=https://test.url");
    const res = mockResponse();
    querystring.parse.mockReturnValue({
      trigger_id: "test-id",
      response_url: "https://test.url",
    });
    openApprovalModal.mockResolvedValue({});

    await handleSlashCommand(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Processing your request...");
    expect(openApprovalModal).toHaveBeenCalledWith(
      "test-id",
      "https://test.url"
    );
  });

  // test - 3: handle modal opening failure
  test("should handle error and return 500", async () => {
    const req = mockRequest("trigger_id=test-id&response_url=https://test.url");
    const res = mockResponse();
    querystring.parse.mockReturnValue({
      trigger_id: "test-id",
      response_url: "https://test.url",
    });
    openApprovalModal.mockRejectedValue(new Error("Modal error"));

    await handleSlashCommand(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Internal server error");
  });
});

describe("slackEventController", () => {
  const mockRequest = (body) => ({ body });
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  // test - 4: handle URL verification
  test("should handle URL verification event and return challenge", async () => {
    const req = mockRequest({
      type: "url_verification",
      challenge: "test-challenge",
    });
    const res = mockResponse();

    await slackEventController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ challenge: "test-challenge" });
  });

  // test - 5: acknowledge other event types
  test("should acknowledge other event types", async () => {
    const req = mockRequest({ type: "app_mention" });
    const res = mockResponse();

    await slackEventController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Event received!");
  });

  // test - 6: handle malformed request
  test("should handle malformed request", async () => {
    const req = mockRequest({});
    const res = mockResponse();

    await slackEventController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Event received!");
  });
});

describe("handleAction", () => {
  const mockRequest = (body) => ({ body: Buffer.from(body) });
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  // test - 7: handle view_submission
  test("should handle view_submission and clear modal", async () => {
    const payload = JSON.stringify({
      type: "view_submission",
      view: {
        state: {
          values: {
            approver: { approver_selected: { selected_user: "U456" } },
            approval_text: { approval_text_input: { value: "Approve this" } },
          },
        },
        private_metadata: JSON.stringify({ response_url: "https://test.url" }),
      },
      user: { id: "U123" },
    });
    const req = mockRequest(`payload=${payload}`);
    const res = mockResponse();
    jest.spyOn(JSON, "parse").mockReturnValue(JSON.parse(payload));

    await import("../controllers/slack.controllers.js").then((module) =>
      module.handleAction(req, res)
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ response_action: "clear" });
  });
});
