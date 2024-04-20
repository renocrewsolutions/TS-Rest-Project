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
exports.getReservation = void 0;
const axios_1 = __importDefault(require("axios"));
function getReservation(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let header = {
            "Content-Type": "application/json",
            Accept: "application/json",
        };
        let obj = {
            ClientToken: "E0D439EE522F44368DC78E1BFB03710C-D24FB11DBE31D4621C4817E028D9E1D",
            AccessToken: "C66EF7B239D24632943D115EDE9CB810-EA00F8FD8294692C940F6B5A8F9453D",
            Client: "Sample Client 1.0.0",
            Limitation: {
                Count: 1000,
            },
            LanguageCode: null,
            CultureCode: null,
        };
        let resp = yield axios_1.default.post("https://api.mews-demo.com/api/connector/v1/reservations/getAll/2023-06-06", obj, { headers: header });
        return { id: id, value: resp.data };
    });
}
exports.getReservation = getReservation;
