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

export async function getAllRates(body: rate_body, cursor: string | null) {
  var ratesArr: rate_format = [];
  async function fetchRates(body: rate_body, cursor: string | null) {
    if (ratesArr.length === 0 || cursor) {
      if (cursor) {
        body["Limitation"] = {
          Cursor: cursor,
        };
      }
      const resp = await client.getAllRates({
        body: contract.getAllRates.body.parse(body),
      });
      if (resp.status == 200) {
        ratesArr.push(...resp.body["Rates"]);
        await fetchRates(body, resp.body["Cursor"]);
      } else {
        throw new Error("Unexpected response format");
      }
    }
  }
  await fetchRates(body, cursor);
  return ratesArr;
}

export async function getRatePrice(
  rateID: string,
  startDate: string,
  endDate: string
): Promise<ratePrice_format> {
  const resp = await client.getRatePrice({
    body: contract.getRatePrice.body.parse({
      RateId: rateID,
      StartUtc: startDate,
      EndUtc: endDate,
    }),
  });
  if (resp.status == 200) {
    return resp.body;
  } else {
    throw new Error("Unexpected response format");
  }
}

export async function updateRates(body: updatRate_body) {
  const resp = await client.updateRates({
    body: contract.updateRates.body.parse(body),
  });
  return resp.body;
}
