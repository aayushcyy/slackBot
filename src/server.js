import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import slackEventRouter from "./routes/slackEvents.route.js";

const app = express();
// enabeling json parsing
app.use(express.json());

app.use(bodyParser.json());

// slack event subscription route
app.use("/", slackEventRouter);

app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
