import { ClientInferResponseBody } from "@ts-rest/core";
import { contract, client } from "./api";
import { fetchServices, service_format } from "./services";
import {
  getAllRates,
  getRatePrice,
  ratePrice_format,
  rate_format,
} from "./rates";
import { fetchRestrictions, restrictions_format } from "./restrictions";
import { z } from "zod";

const roomTypeRateV2Model = z.object({
  id: z.string(),
  roomTypeId: z.string(),
  queryDate: z.date(), //today
  rateId: z.string().nullish(),
  rates: z.array(
    z.object({
      // rateDate       DateTime
      // rateId         String?
      // roomRate       Float

      date: z.string(), // yyyy-MM-dd
      rate: z.number(),
    })
  ),
  roomsAvailable: z.number().int().nullish(), //capacitt
  isDerived: z.boolean(),
});

export type resourceCategory_format = ClientInferResponseBody<
  typeof contract.getRoomTypes,
  200
>["ResourceCategories"];

export async function getAllRoomTypes(body, cursor?: string) {
  console.log("🚀 ~ getAllRoomTypes ~ calles:");
  let roomTypeArr: z.infer<typeof roomTypeRateV2Model>[] = [];
  const serviceList: service_format = await fetchServices(
    JSON.parse(JSON.stringify(body))
  );

  const serviceIdList = serviceList
    .map((ser) => {
      if (ser.Type == "Reservable") {
        return ser.Id;
      }
    })
    .filter((id) => id !== undefined);
  const ratesArr: rate_format = await getAllRates({
    ServiceIds: serviceIdList,
  });

  const restrictionsArr: restrictions_format = await fetchRestrictions({
    ServiceIds: serviceIdList,
  });

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

      resourcesArr.push(
        ...resp.body["ResourceCategories"].filter((cat) => cat.Type == "Room")
      );
      //   await fetch(body, resp.body["Cursor"] as string);
    }
  }
  await fetch({ ServiceIds: serviceIdList }, cursor as string);
  roomTypeArr = await Promise.all(
    resourcesArr.map(async (resource) => {
      const restriction = restrictionsArr.find(
        (ele) => ele.Conditions.ResourceCategoryId == resource.Id
      );
      console.log("🚀 ~ resourcesArr.map ~ restriction:", restriction);
      const rate = restriction
        ? ratesArr.find((ele) => ele.Id == restriction.Conditions.ExactRateId)
        : undefined;
      const rateDetails: ratePrice_format = rate
        ? await getRatePrice(
            rate.Id as string,
            restriction.Conditions.StartUtc as string,
            restriction.Conditions.EndUtc as string
          )
        : undefined;
      const detailedRoomRates: { [key: string]: number }[] = rateDetails
        ? rateDetails["BasePrices"].map((price: number, idx: number) => {
            var obj: { [key: string]: number } = {};
            obj[rateDetails.TimeUnitStartsUtc[idx]] = price;
            return obj;
          })
        : [];
      const obj: z.infer<typeof roomTypeRateV2Model> = {
        id: "",
        roomTypeId: resource.Id,
        queryDate: new Date(), //today
        rateId: rate ? rate.Id : null,
        rates: detailedRoomRates,
        roomsAvailable: resource.Capacity, //capacitt
        isDerived: false,
      };
      return obj
    })
  );
  return roomTypeArr;
}
