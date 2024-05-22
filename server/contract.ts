// contract.ts

import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const contract = c.router({
  getReservations: {
    method: "GET",
    path: `/getReservations`,
    responses: {
      200: z.any(),
    },
  },
 
  updateRates: {
    method: "GET",
    path: `/updateRates`,
    responses: {
      200: z.any(),
    },
  },
  getRoomTypes: {
    method: "GET",
    path: `/getRoomTypes`,
    responses: {
      200: z.any(),
    },
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
