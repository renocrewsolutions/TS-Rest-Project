import * as z from "zod";
import type { ClientInferRequest, ClientInferResponseBody } from "@ts-rest/core";
import { contract, client } from "./api";
import type { ratePrice_format } from "./rates";
import { getRatePrice } from "./rates";
import type { customer_format} from "./customers";
import { getCustomerDetails } from "./customers";
import { getServiceIdList } from "./services";
import type { ageCategory_format} from "./ageCategories";
import { fetchAgeCategories } from "./ageCategories";

const reservations_db_format = z.array(
  z.object({
    id: z.string(),
    createdAt: z.date(),
    valid_from: z.date(),
    valid_to: z.date().nullish(),
    hotelId: z.string(),
    providerReservationId: z.string().nullable(),
    providerSubReservationId: z.string(),
    reservationDateCreated: z.date(),
    reservationDateCanceled: z.date().nullish(),
    status: z.string(),
    guestCountry: z.string().nullish(),
    sourceName: z.string().nullish(),
    checkInDate: z.date(),
    checkOutDate: z.date(),
    roomTypeId: z.string(),
    rateId: z.string().nullish(),
    adults: z.number().int(),
    children: z.number().int(),
    totalRate: z.number(),
    detailedRoomRates: z.record(z.number()).nullish(),
    reservationDateModified: z.date().nullish(),
    roomCount: z.number().int(),
    changedAt: z.date(),
  })
);

type resp_format = ClientInferResponseBody<
  typeof contract.getReservations,
  200
>;

export type reservation_body = ClientInferRequest<
  typeof contract.getReservations
>['body'];

let serviceList: string[] = [];
let ageCategoryList: ageCategory_format = [];

export async function getReservation(body: reservation_body, cursor?: string): Promise<z.infer<typeof reservations_db_format>> {
  const reservationArr: z.infer<typeof reservations_db_format> = []; // Initialize the reservation array within the function scope
  serviceList = await getServiceIdList(JSON.parse(JSON.stringify(body)));
  ageCategoryList = await fetchAgeCategories({ ServiceIds: serviceList });

  async function fetchReservations(body: reservation_body, cursor: string) {
    if (reservationArr.length === 0 || cursor) {
      if (cursor) {
        body["Limitation"] = {
          Cursor: cursor,
        };
      }
      const resp = await client.getReservations({
        params: {
          start: body.StartUtc as string,
        },
        body: contract.getReservations.body.parse(body),
      });
      if (resp.status == 200) {
        reservationArr.push(...(await convertRespToDBFormat(resp.body)));
        // Recursively fetch reservations with the new cursor
        await fetchReservations(body, resp.body["Cursor"] as string);
      }
    }
  }

  await fetchReservations(body, cursor as string);
  console.log("🚀 ~ getReservation ~ reservationArr:", reservationArr.length)
  return reservationArr;
}

function getPersonCountFormCategories(
  categoryList: resp_format["Reservations"][0]["PersonCounts"]
) {
  const obj = {
    adultCount: 0,
    childCount: 0,
  };
  categoryList.forEach((cat) => {
    const ageCategory: ageCategory_format[0] = ageCategoryList.find(
      (age) => age.Id == cat.AgeCategoryId
    ) as ageCategory_format[0];
    if (
      (ageCategory.MinimalAge as number) > 0 &&
      (ageCategory.MaximalAge as number) >= 18
    ) {
      obj.childCount += cat.Count;
    } else {
      obj.adultCount += cat.Count;
    }
  });
  return obj;
}

async function convertRespToDBFormat(
  data: resp_format
): Promise<z.infer<typeof reservations_db_format>> {
  const respReservations = data["Reservations"];
  const status_lookup: { [key: string]: string } = {
    Enquired: "not_confirmed",
    Requested: "confirmed",
    Optional: "not_confirmed",
    Confirmed: "confirmed",
    Started: "checked_in",
    Processed: "checked_out",
    Canceled: "canceled",
  };
  const reservations: z.infer<typeof reservations_db_format> =
    await Promise.all(
      respReservations.map(async (ele) => {
        const customer: customer_format[0] = await getCustomerDetails({
          CustomerIds: [ele.AccountId as string],
        });
        const rateDetails: ratePrice_format = await getRatePrice(
          ele.RateId as string,
          ele.StartUtc as string,
          ele.EndUtc as string
        );

        const arrayOfObjects: { [key: string]: number }[] = rateDetails[
          "BasePrices"
        ].map((price: number, idx: number) => {
          const obj: { [key: string]: number } = {};
          obj[rateDetails.TimeUnitStartsUtc[idx] as string] = price;
          return obj;
        });

        const detailedRoomRates: Record<string, number> = arrayOfObjects.reduce(
          (result, currentObject) => {
            Object.keys(currentObject).forEach((key) => {
              result[key] = currentObject[key] as number;
            });
            return result;
          },
          {}
        );

        const personCounts = getPersonCountFormCategories(ele.PersonCounts);
        const res =  {
          id: "",
          createdAt: new Date(ele.CreatedUtc as string),
          valid_from: new Date(ele.StartUtc as string),
          valid_to: ele.EndUtc ? new Date(ele.EndUtc) : null,
          hotelId: "",
          providerReservationId: ele.Id as string,
          providerSubReservationId: "",
          reservationDateCreated: new Date(ele.CreatedUtc as string),
          reservationDateCanceled: ele.CancelledUtc
            ? new Date(ele.CancelledUtc)
            : null,
          status: status_lookup[ele.State] as string,
          guestCountry: customer.NationalityCode
            ? customer.NationalityCode
            : customer.Address
            ? customer.Address.CountryCode
            : null,
          sourceName: ele.TravelAgencyId, //booking redirects
          checkInDate: new Date(ele.StartUtc as string),
          checkOutDate: new Date(ele.EndUtc as string),
          roomTypeId: ele.RequestedResourceCategoryId as string,
          rateId: ele.RateId,
          adults: personCounts.adultCount,
          children: personCounts.childCount,
          totalRate: rateDetails["BasePrices"].reduce(
            (acc: number, curr: number) => acc + curr,
            0
          ),
          detailedRoomRates: detailedRoomRates, //detailed room rates by day
          reservationDateModified: new Date(ele.UpdatedUtc as string),
          roomCount: 1,
          changedAt: new Date(ele.UpdatedUtc as string),
        };
        return res;
      })
    );

  return reservations;
}
