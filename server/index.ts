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
      ClientToken:
        "E0D439EE522F44368DC78E1BFB03710C-D24FB11DBE31D4621C4817E028D9E1D",
      AccessToken:
        "C66EF7B239D24632943D115EDE9CB810-EA00F8FD8294692C940F6B5A8F9453D",
      Client: "Sample Client 1.0.0",
      Limitation: {
        Count: 10,
      },
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
