// contract.ts

import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.object({
    id: z.string(),
    value: z.any(),
  }),
});

export const contract = c.router({
  getReservationbyID: {
    method: "GET",
    path: `/res/:id`,
    responses: {
      200: PostSchema.nullable(),
    },
    summary: "Get a post by id",
  },
  defaultapi: {
    method: "GET",
    path: `/`,
    responses: {
      200: z.string()
    },
    summary: "Get a post by id",
  },
});
