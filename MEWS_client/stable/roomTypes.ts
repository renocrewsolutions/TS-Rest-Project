import type { ClientInferRequest, ClientInferResponseBody } from "@ts-rest/core";
import { contract, client } from "./api";
import type { service_format } from "./services";
import { fetchServices } from "./services";
import type {
  ratePrice_format,
  rate_format} from "./rates";
import {
  getAllRates,
  getRatePrice
} from "./rates";
import type { restrictions_format } from "./restrictions";
import { fetchRestrictions } from "./restrictions";
import { string, z } from "zod";

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
    }),
  ),
  roomsAvailable: z.number().int().nullish(), //capacitt
  isDerived: z.boolean(),
});

export type resourceCategory_format = ClientInferResponseBody<
  typeof contract.getRoomTypes,
  200
>["ResourceCategories"];

export type roomType_body = ClientInferRequest<
  typeof contract.getRoomTypes
>["body"];

interface roomRateRequest_payload {
  StartUtc: string;
  EndUtc: string;
  EnterpriseIds: string[];
}
export async function getAllRoomTypes(
  body: roomRateRequest_payload,
  cursor?: string,
) {
  let roomTypeArr: z.infer<typeof roomTypeRateV2Model>[] = [];
  const serviceList: service_format = await fetchServices(
    JSON.parse(JSON.stringify(body)),
  );

  const serviceIdList: string[] = serviceList
    .map((ser) => {
      if (ser.Type == "Reservable") {
        return ser.Id;
      }
    })
    .filter((id) => id !== undefined) as string[];
  const ratesArr: rate_format = await getAllRates({
    ServiceIds: serviceIdList,
  });

  const restrictionsArr: restrictions_format = await fetchRestrictions({
    ServiceIds: serviceIdList,
  });

  const resourcesArr: resourceCategory_format = [];
  async function fetch(body: roomType_body, cursor: string) {
    if (resourcesArr.length === 0 || cursor) {
      if (cursor) {
        body["Limitation"] = {
          Cursor: cursor,
        };
      }
      const resp = await client.getRoomTypes({
        body: contract.getRoomTypes.body.parse(body),
      });
      if (resp.status == 200) {
        resourcesArr.push(
          ...resp.body["ResourceCategories"].filter(
            (cat) => cat.Type == "Room",
          ),
        );
        await fetch(body, resp.body["Cursor"] as string);
      } else {
        throw new Error("Unexpected response format");
      }
    }
  }
  await fetch({ ServiceIds: serviceIdList }, cursor as string);
  roomTypeArr = await Promise.all(
    resourcesArr.map(async (resource) => {
      const restriction = restrictionsArr.find(
        (ele) => ele.Conditions.ResourceCategoryId == resource.Id,
      );
      const rate = restriction
        ? ratesArr.find((ele) => ele.Id == restriction.Conditions.ExactRateId)
        : undefined;
      const rateDetails: ratePrice_format | undefined = rate
        ? await getRatePrice(rate.Id as string, body.StartUtc, body.EndUtc)
        : undefined;
      const detailedRoomRates: { date: string; rate: number }[] = rateDetails
        ? rateDetails["BasePrices"].map((price: number, idx: number) => {
            const obj: { date: string; rate: number } = {
              date: rateDetails.TimeUnitStartsUtc[idx] as string,
              rate: price,
            };
            return obj;
          })
        : [];
      const obj: z.infer<typeof roomTypeRateV2Model> = {
        id: "",
        roomTypeId: resource.Id as string,
        queryDate: new Date(), //today
        rateId: rate ? rate.Id : null,
        rates: detailedRoomRates,
        roomsAvailable: resource.Capacity, //capacitt
        isDerived: false,
      };
      return obj;
    }),
  );
  console.log("🚀 ~ getAllRoomTypes ~ roomTypeArr:", roomTypeArr.length);
  return roomTypeArr;
}
