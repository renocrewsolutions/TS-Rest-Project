// main.ts
import express from "express";
import cors from "cors";
import bodyParser from "body-parser"

import { createExpressEndpoints, initServer } from '@ts-rest/express';
import { contract } from './contract';
import { getReservation } from "./reservation";


const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const s = initServer();

const router = s.router(contract, {
  getReservationbyID: async ({ params: { id } }) => {
    const post = await getReservation(id)

    return {
      status: 200,
      body: post,
    };
  },
  get: () => {
    const post = 'Application is running'
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