import { verifySlackRequest } from "../src/middlewares/verifySlackRequest.js";
import crypto from "crypto";

// Mock express object
const mockRequest = (
  headers = {},
  body = Buffer.from("payload=some-data")
) => ({
  headers,
  body,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // mock status to return res
  res.send = jest.fn().mockReturnValue(res); // mock send to return res
  return res;
};

// mock next function
const mockNext = jest.fn();

describe("verifySlackRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // clearing mocks before each request
    process.env.SLACK_SIGNING_SECRET = "test-secret";
  });

  // test - 1: missing headers
  test("should reject request with missing headers", () => {
    const req = mockRequest(); // with no headers
    const res = mockResponse();
    verifySlackRequest(req, res, mockNext);

    // assersions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Missing Slack headers");
    expect(mockNext).not.toHaveBeenCalled();
  });

  // test - 2: with old timestamps
  test("should reject request with old timestamps", () => {
    const oldTimeStamps = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const req = mockRequest({
      "x-slack-signature": "v0=some-sig",
      "x-slack-request-timestamps": oldTimeStamps,
    });
    const res = mockResponse();
    verifySlackRequest(req, res, mockNext);

    // assersions
    expect(req.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Request timestamps too old");
    expect(mockNext).not.toHaveBeenCalled();
  });

  // test 3: with valid request
  test("should call next for valid request", () => {
    const timestamp = Math.floor(Date.now() / 1000);

    const rawBody = "payload=some-data";
    const sigBaseString = `v0:${timestamp}:${rawBody}`;
    const hmac = crypto.createHmac("sha256", process.env.SLACK_SIGNING_SECRET);
    hmac.update(sigBaseString);
    const signature = `v0=${hmac.digest("hex")}`;

    const req = mockRequest({
      "x-slack-signature": signature,
      "x-slack-request-timestamp": timestamp,
    });
    const res = mockResponse();
    verifySlackRequest(req, res, mockNext);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
