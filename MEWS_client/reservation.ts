import axios from "axios";
import * as z from "zod";
import type { ClientInferResponseBody } from "@ts-rest/core";
import { contract, client } from "./api";

const reservations_db_format = z.array(
  z.object({
    id: z.string(),
    createdAt: z.date(),
    valid_from: z.date(),
    valid_to: z.date().nullish(),
    hotelId: z.string(),
    providerReservationId: z.string(),
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

export async function getReservation(id: any) {
  const resp = await client.getReservations({
    body: {
      ClientToken:
        "E0D439EE522F44368DC78E1BFB03710C-D24FB11DBE31D4621C4817E028D9E1D",
      AccessToken:
        "C66EF7B239D24632943D115EDE9CB810-EA00F8FD8294692C940F6B5A8F9453D",
      Client: "Sample Client 1.0.0",
      Limitation: {
        Count: 10,
      },
      StartUtc: "2023-06-06",
      EndUtc: "2023-06-10",
    },
  });
  // console.log("🚀 ~ getReservation ~ resp:", resp.body);
  const dbFormat = await convertRespToDBFormat(resp.body);
  return { id: id, value: dbFormat };
}

async function getRates(rateID, startDate, endDate) {
  const resp = await client.getRatePrice({
    body: {
      ClientToken:
        "E0D439EE522F44368DC78E1BFB03710C-D24FB11DBE31D4621C4817E028D9E1D",
      AccessToken:
        "C66EF7B239D24632943D115EDE9CB810-EA00F8FD8294692C940F6B5A8F9453D",
      Client: "Sample Client 1.0.0",
      RateId: rateID,
      StartUtc: startDate,
      EndUtc: endDate,
    },
  });
  console.log("🚀 ~ getRates ~ resp:", resp);
  const sum: number = resp.body["BasePrices"].reduce(
    (acc, curr) => acc + curr,
    0
  );
  return sum;
}

async function convertRespToDBFormat(data: resp_format) {
  let respReservations = data["Reservations"];
  let status_lookup = [
    "Enquired",
    "Requested",
    "Optional",
    "Confirmed",
    "Started",
    "Processed",
    "Canceled",
  ];

  let reservations: z.infer<typeof reservations_db_format> = await Promise.all(
    respReservations.map(async (ele) => {
      let customer = data.Customers.find((cus) => cus.Id == ele.CustomerId);
      let res = await {
        id: ele.Id,
        createdAt: new Date(ele.CreatedUtc),
        valid_from: new Date(ele.StartUtc),
        valid_to: ele.EndUtc ? new Date(ele.EndUtc) : null,
        hotelId: "",
        providerReservationId: "z.string()",
        providerSubReservationId: "z.string()",
        reservationDateCreated: new Date(ele.CreatedUtc),
        reservationDateCanceled: ele.CancelledUtc
          ? new Date(ele.CancelledUtc)
          : null,
        status: ele.State,
        guestCountry: customer.NationalityCode
          ? customer.NationalityCode
          : customer.Address
          ? customer.Address.CountryCode
          : null,
        sourceName: null,
        checkInDate: new Date(ele.StartUtc),
        checkOutDate: new Date(ele.EndUtc),
        roomTypeId: ele.RequestedCategoryId,
        rateId: ele.RateId,
        adults: ele.AdultCount,
        children: ele.ChildCount,
        totalRate: await getRates(ele.RateId, ele.StartUtc, ele.EndUtc),
        detailedRoomRates: null,
        reservationDateModified: new Date(ele.UpdatedUtc),
        roomCount: 1,
        changedAt: new Date(ele.UpdatedUtc),
      };
      return res;
    })
  );

  return reservations;
}
