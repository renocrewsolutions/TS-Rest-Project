import { contract, client } from "./api";

export async function getAllRates(body, cursor?) {
  var ratesArr = [];
  async function fetchRates(body, cursor) {
    if (ratesArr.length === 0 || cursor) {
      if (cursor) {
        body["Limitation"] = {
          Cursor: cursor,
        };
      }
      const resp = await client.getAllRates({
        body: contract.getReservations.body.parse(body),
      });
      ratesArr.push(...resp.body["Rates"]);
      await fetchRates(body, resp.body["Cursor"]);
    }
  }
  await fetchRates(body, cursor);
  return ratesArr;
}
 
export async function getRatePrice(rateID, startDate, endDate) {
  const resp = await client.getRatePrice({
    body: contract.getRatePrice.body.parse({
      RateId: rateID,
      StartUtc: startDate,
      EndUtc: endDate,
    }),
  });
  return resp.body;
}

export async function updateRates(body) {
  const resp = await client.updateRates({
    body: contract.getReservations.body.parse(body),
  });
  return resp.body;
}
