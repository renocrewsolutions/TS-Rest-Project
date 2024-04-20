"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// main.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_2 = require("@ts-rest/express");
const contract_1 = require("./contract");
const reservation_1 = require("./reservation");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
const s = (0, express_2.initServer)();
const router = s.router(contract_1.contract, {
    getReservationbyID: (_a) => __awaiter(void 0, [_a], void 0, function* ({ params: { id } }) {
        const post = yield (0, reservation_1.getReservation)(id);
        return {
            status: 200,
            body: post,
        };
    }),
    get: () => {
        const post = 'Application is running';
        return {
            status: 200,
            body: post,
        };
    },
});
(0, express_2.createExpressEndpoints)(contract_1.contract, router, app);
const port = process.env.port || 3333;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
