"use strict";
// contract.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.contract = void 0;
const core_1 = require("@ts-rest/core");
const zod_1 = require("zod");
const c = (0, core_1.initContract)();
const PostSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    body: zod_1.z.object({
        id: zod_1.z.string(),
        value: zod_1.z.any()
    }),
});
exports.contract = c.router({
    getReservationbyID: {
        method: 'GET',
        path: `/res/:id`,
        responses: {
            200: PostSchema.nullable(),
        },
        summary: 'Get a post by id',
    },
    get: {
        method: 'GET',
        path: `/`,
        responses: {
            200: zod_1.z.string(),
        },
        summary: 'Get a post by id',
    }
});
