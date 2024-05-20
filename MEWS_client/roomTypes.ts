import { ClientInferResponseBody } from "@ts-rest/core";
import { contract, client } from "./api";
import { getServiceIdList } from "./services";
import { getAllRates, rate_format } from "./rates";
import { fetchRestrictions, restrictions_format } from "./restrictions";

export type resourceCategory_format = ClientInferResponseBody<
  typeof contract.getRoomTypes,
  200
>["ResourceCategories"];

export async function getAllRoomTypes(body, cursor?: string) {
  console.log("🚀 ~ getAllRoomTypes ~ calles:")
  let serviceList: string[] = [];
  serviceList = await getServiceIdList(JSON.parse(JSON.stringify(body)));

  let ratesArr: rate_format = [];
  ratesArr = await getAllRates({ ServiceIds: serviceList });

  var restrictionsArr: restrictions_format = [];
  restrictionsArr = await fetchRestrictions({ ServiceIds: serviceList });
  console.log("🚀 ~ getAllRoomTypes ~ serviceList:", serviceList, ratesArr, restrictionsArr)

  var resourcesArr: resourceCategory_format = [];
  async function fetch(body, cursor: string) {
    if (resourcesArr.length === 0 || cursor) {
      if (cursor) {
        body["Limitation"] = {
          Cursor: cursor,
        };
      }
      const resp = await client.getRoomTypes({
        body: contract.getRoomTypes.body.parse(body),
      });
      resourcesArr.push(...resp.body["ResourceCategories"]);
      //   await fetch(body, resp.body["Cursor"] as string);
    }
  }
  await fetch({ ServiceIds: serviceList }, cursor as string);
  return resourcesArr;
}
