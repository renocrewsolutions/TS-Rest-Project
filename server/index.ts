// main.ts
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { createExpressEndpoints, initServer } from "@ts-rest/express";
import { contract } from "./contract";
import { getReservation } from "../MEWS_client/reservation";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const s = initServer();

const router = s.router(contract, {
  defaultapi: async () => {
    const post = "Application is running";

    return {
      status: 200,
      body: post,
    };
  },
  getReservationbyID: async ({}) => {
    const obj = {
      StartUtc: "2023-06-06",
      EndUtc: "2023-06-10",
    }
    const post = await getReservation(obj);

    return {
      status: 200,
      body: post,
    };
  },
});

createExpressEndpoints(contract, router, app);

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
