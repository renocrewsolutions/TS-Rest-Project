// main.ts
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { createExpressEndpoints, initServer } from "@ts-rest/express";
import { contract } from "./contract";
import { getReservation } from "../MEWS_client/reservation";
import { getAllRates, updateRates } from "../MEWS_client/rates";
import { getAllRoomTypes } from "../MEWS_client/roomTypes";

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
  getReservations: async ({}) => {
    const obj = {
      StartUtc: "2023-06-06",
      EndUtc: "2023-06-10",
      EnterpriseIds: ["c65ea6e9-2340-42f4-9136-ab3a00b6da22"],
    };
    const post = await getReservation(obj, null);

    return {
      status: 200,
      body: post,
    };
  },
  getRoomTypes: async ({}) => {
    const obj = {
      StartUtc: "2023-06-06",
      EndUtc: "2023-06-10",
      EnterpriseIds: ["c65ea6e9-2340-42f4-9136-ab3a00b6da22"],
    };
    const post = await getAllRoomTypes(obj, null);

    return {
      status: 200,
      body: post,
    };
  },
  updateRates: async ({}) => {
    const obj = {
      RateId: "fa2e29cd-ea49-481d-a3ad-b15b011952ab",
      PriceUpdates: [
        {
          StartUtc: "2024-05-25T00:00:00Z",
          EndUtc: "2024-05-28T00:00:00Z",
          Value: 123,
        },
      ],
    };
    const post = await updateRates(obj);

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
