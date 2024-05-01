// contract.ts

import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const contract = c.router({
  getReservationbyID: {
    method: "GET",
    path: `/getReservations`,
    responses: {
      200: z.any(),
    },
    summary: "Get a post by id",
  },
  defaultapi: {
    method: "GET",
    path: `/`,
    responses: {
      200: z.string(),
    },
    summary: "Get a post by id",
  },
});
