import { ClientInferRequest, ClientInferResponseBody } from "@ts-rest/core";
import { contract, client } from "./api";
export type ratePrice_format = ClientInferResponseBody<
  typeof contract.getRatePrice,
  200
>;

export type updatRate_body = ClientInferRequest<
  typeof contract.updateRates
>["body"];

export type rate_format = ClientInferResponseBody<
  typeof contract.getAllRates,
  200
>["Rates"];

export type rate_body = ClientInferRequest<typeof contract.getAllRates>["body"];

export async function getAllRates(body: rate_body, cursor?: string) {
  var ratesArr: rate_format = [];
  async function fetchRates(body: rate_body, cursor: string) {
    if (ratesArr.length === 0 || cursor) {
      if (cursor) {
        body["Limitation"] = {
          Cursor: cursor,
        };
      }
      const resp = await client.getAllRates({
        body: contract.getAllRates.body.parse(body),
      });
      ratesArr.push(...resp.body["Rates"]);
      await fetchRates(body, resp.body["Cursor"] as string);
    }
  }
  await fetchRates(body, cursor as string);
  return ratesArr;
}

export async function getRatePrice(
  rateID: string,
  startDate: string,
  endDate: string
) {
  const resp = await client.getRatePrice({
    body: contract.getRatePrice.body.parse({
      RateId: rateID,
      StartUtc: startDate,
      EndUtc: endDate,
    }),
  });
  return resp.body as ratePrice_format;
}

export async function updateRates(body: updatRate_body) {
  const resp = await client.updateRates({
    body: contract.updateRates.body.parse(body),
  });
  return resp.body;
}
