import { initClient, initContract } from "@ts-rest/core";
import { z } from "zod";
import * as env from "./env";

const coustomerFromApi = z.object({
  Id: z.string().optional().nullable(),
  Title: z.string().optional().nullable(),
  Sex: z.string().optional().nullable(),
  Gender: z.string().optional().nullable(),
  FirstName: z.string().optional().nullable(),
  LastName: z.string().optional().nullable(),
  NationalityCode: z.string().optional().nullable(),
  LanguageCode: z.string().optional().nullable(),
  Email: z.string().optional().nullable(),
  Phone: z.string().optional().nullable(),
  CreatedUtc: z.string().optional().nullable(),
  UpdatedUtc: z.string().optional().nullable(),
  Address: z
    .object({
      City: z.string().optional().nullable(),
      PostalCode: z.string().optional().nullable(),
      CountryCode: z.string().optional().nullable(),
    })
    .nullable()
    .optional(),
  AddressId: z.string().optional().nullable(),
});
const reservationFromApi = z.object({
  RateId: z.string().nullable().optional(),
  RequestedCategoryId: z.string().nullable().optional(),
  AssignedResourceId: z.string().nullable().optional(),
  StartUtc: z.string().nullable().optional(),
  EndUtc: z.string().nullable().optional(),
  Id: z.string().nullable().optional(),
  BookerId: z.string().nullable().optional(),
  TravelAgencyId: z.string().nullable().optional(),
  State: z.string().nullable().optional(),
  Origin: z.string().nullable().optional(),
  CreatedUtc: z.string().nullable().optional(),
  UpdatedUtc: z.string().nullable().optional(),
  CancelledUtc: z.string().nullable().optional(),
  CustomerId: z.string().nullable().optional(),
  LinkedReservationId: z.string().nullable().optional(),
  AdultCount: z.number().optional(),
  ChildCount: z.number().optional(),
});
const ratesFromApi = z.object({
  Id: z.string().nullable().optional(),
  GroupId: z.string().nullable().optional(),
  ServiceId: z.string().nullable().optional(),
  BaseRateId: z.string().nullable().optional(),
  BusinessSegmentId: z.string().nullable().optional(),
  IsActive: z.boolean().optional(),
  IsEnabled: z.boolean().optional(),
  IsPublic: z.boolean().optional(),
  Type: z.string().nullable().optional(),
  Name: z.string().nullable().optional(),
  ShortName: z.string().nullable().optional(),
  UpdatedUtc: z.string().nullable().optional(),
  ExternalIdentifier: z.string().nullable().optional(),
  Options: z.object({
    HidePriceFromGuest: z.boolean().optional(),
    IsBonusPointsEligible: z.boolean().optional(),
  }),
});
const c = initContract();
export const contract = c.router({
  getReservations: {
    method: "POST",
    path: "/reservations/getAll",
    body: z.object({
      ClientToken: z.string().default(env.clientToken),
      AccessToken: z.string().default(env.accessToken),
      Client: z.string().default(env.clientName),
      EnterpriseIds: z.array(z.string()).optional(),
      ReservationIds: z.array(z.string()).optional(),
      ServiceIds: z.array(z.string()).optional(),
      AccountIds: z.array(z.string()).optional(),
      StartUtc: z.string(),
      EndUtc: z.string(),
      ReservationGroupIds: z.array(z.string()).optional(),
      UpdatedUtc: z
        .object({
          StartUtc: z.string(),
          EndUtc: z.string(),
        })
        .optional(),
      ScheduledStartUtc: z
        .object({
          StartUtc: z.string(),
          EndUtc: z.string(),
        })
        .optional(),
      Limitation: z
        .object({
          Cursor: z.string().optional(),
          Count: z.number().default(1000),
        })
        .default({
          Count: 1000,
        }),
    }),
    responses: {
      200: z.object({
        Reservations: z.array(reservationFromApi),
        Customers: z.array(coustomerFromApi),
        Cursor: z.string().nullable().optional(),
      }),
    },
  },
  getRatePrice: {
    method: "POST",
    path: "/rates/getPricing",
    body: z.object({
      ClientToken: z.string().default(env.clientToken),
      AccessToken: z.string().default(env.accessToken),
      Client: z.string().default(env.clientName),
      RateId: z.string(),
      StartUtc: z.string(),
      EndUtc: z.string(),
    }),
    responses: {
      200: z.object({
        Currency: z.string(),
        TimeUnitStartsUtc: z.array(z.string()),
        BasePrices: z.array(z.number()),
      }),
    },
  },
  getAllRates: {
    method: "POST",
    path: "/rates/getAll",
    body: z.object({
      ClientToken: z.string().default(env.clientToken),
      AccessToken: z.string().default(env.accessToken),
      Client: z.string().default(env.clientName),
      Limitation: z
        .object({
          Cursor: z.string().optional(),
          Count: z.number().default(1000),
        })
        .default({
          Count: 1000,
        }),
      EnterpriseIds: z.array(z.string()).optional(),
    }),
    responses: {
      200: z.object({
        Rates: z.array(ratesFromApi),
        Cursor: z.string().nullable().optional(),
      }),
    },
  },
  updateRates: {
    method: "POST",
    path: "/rates/updatePrice",
    body: z.object({
      ClientToken: z.string().default(env.clientToken),
      AccessToken: z.string().default(env.accessToken),
      Client: z.string().default(env.clientName),
      RateId: z.string(),
      PriceUpdates: z.array(
        z.object({
          StartUtc: z.string(),
          EndUtc: z.string(),
          Value: z.number(),
        })
      ),
    }),
    responses: {
      200: z.object({}),
    },
  },
});

export const client = initClient(contract, {
  baseUrl: env.baseUrl,
  validateResponse: true,
  baseHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
