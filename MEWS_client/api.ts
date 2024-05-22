import { initClient, initContract } from "@ts-rest/core";
import { z } from "zod";
import * as env from "./env";

const coustomerFromApi = z.object({
  Id: z.string().nullable(),
  Title: z.string().nullable(),
  Sex: z.string().nullable(),
  Gender: z.string().nullable(),
  FirstName: z.string().nullable(),
  LastName: z.string().nullable(),
  NationalityCode: z.string().nullable(),
  LanguageCode: z.string().nullable(),
  Email: z.string().nullable(),
  Phone: z.string().nullable(),
  CreatedUtc: z.string().nullable(),
  UpdatedUtc: z.string().nullable(),
  Address: z
    .object({
      City: z.string().nullable(),
      PostalCode: z.string().nullable(),
      CountryCode: z.string().nullable(),
    })
    .nullable(),
  AddressId: z.string().nullable(),
});

const reservationFromApi = z.object({
  RateId: z.string().nullable(),
  RequestedResourceCategoryId: z.string().nullable(),
  AssignedResourceId: z.string().nullable(),
  StartUtc: z.string().nullable(),
  EndUtc: z.string().nullable(),
  Id: z.string().nullable(),
  BookerId: z.string().nullable(),
  TravelAgencyId: z.string().nullable(),
  State: z.string(),
  Origin: z.string().nullable(),
  CreatedUtc: z.string().nullable(),
  UpdatedUtc: z.string().nullable(),
  CancelledUtc: z.string().nullable(),
  LinkedReservationId: z.string().nullable(),
  AccountId: z.string().nullable(),
  AccountType: z.string().nullable(),
  PersonCounts: z.array(
    z.object({
      AgeCategoryId: z.string(),
      Count: z.number(),
    })
  ),
});

const ratesFromApi = z.object({
  Id: z.string().nullable(),
  GroupId: z.string().nullable(),
  ServiceId: z.string().nullable(),
  BaseRateId: z.string().nullable(),
  BusinessSegmentId: z.string().nullable(),
  IsActive: z.boolean(),
  IsEnabled: z.boolean(),
  IsPublic: z.boolean(),
  Type: z.string().nullable(),
  Name: z.string().nullable(),
  ShortName: z.string().nullable(),
  UpdatedUtc: z.string().nullable(),
  ExternalIdentifier: z.string().nullable(),
  Options: z.object({
    HidePriceFromGuest: z.boolean(),
    IsBonusPointsEligible: z.boolean(),
  }),
});

const restrictionsFromApi = z.object({
  Id: z.string(),
  ServiceId: z.string(),
  Origin: z.string(),
  Conditions: z.object({
    Type: z.string(),
    ExactRateId: z.string().nullable(),
    BaseRateId: z.string().nullable(),
    RateGroupId: z.string().nullable(),
    ResourceCategoryId: z.string().nullable(),
    ResourceCategoryType: z.string().nullable(),
    StartUtc: z.string().nullable(),
    EndUtc: z.string().nullable(),
  }),
});

const servicesFromApi = z.object({
  Id: z.string().nullish(),
  EnterpriseId: z.string(),
  IsActive: z.boolean(),
  Name: z.string().nullable(),
  StartTime: z.string().nullable(),
  EndTime: z.string().nullable(),
  Type: z.string(),
  Ordering: z.number(),
  CreatedUtc: z.string().nullable(),
  UpdatedUtc: z.string().nullable(),
});

const roomTypesFromApi = z.object({
  Id: z.string().nullable(),
  EnterpriseId: z.string().nullable(),
  ServiceId: z.string().nullable(),
  IsActive: z.boolean(),
  Type: z.string().nullable(),
  Classification: z.string().nullable(),
  Names: z.record(z.string().nullable()),
  ShortNames: z.record(z.string().nullable()),
  // Descriptions: {},
  Ordering: z.number(),
  Capacity: z.number(),
  ExtraCapacity: z.number(),
});
const c = initContract();
export const contract = c.router({
  getRoomTypes: {
    method: "POST",
    path: "/resourceCategories/getAll",
    body: z.object({
      ClientToken: z.string().default(env.clientToken),
      AccessToken: z.string().default(env.accessToken),
      Client: z.string().default(env.clientName),
      ServiceIds: z.array(z.string()).optional(),
      Limitation: z
        .object({
          Cursor: z.string().optional(),
          Count: z.number().default(100),
        })
        .default({
          Count: 100,
        }),
    }),
    responses: {
      200: z.object({
        ResourceCategories: z.array(roomTypesFromApi),
        Cursor: z.string().nullable(),
      }),
    },
  },
  getReservations: {
    method: "POST",
    path: "/reservations/getAll/:start",
    body: z.object({
      ClientToken: z.string().default(env.clientToken),
      AccessToken: z.string().default(env.accessToken),
      Client: z.string().default(env.clientName),
      EnterpriseIds: z.array(z.string()).optional(),
      ReservationIds: z.array(z.string()).optional(),
      StartUtc: z.string().optional(),
      EndUtc: z.string().optional(),
      UpdatedUtc: z
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
        Cursor: z.string().nullable(),
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
      ServiceIds: z.array(z.string()).optional(),
    }),
    responses: {
      200: z.object({
        Rates: z.array(ratesFromApi),
        Cursor: z.string().nullable(),
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
  
  getCustomerDetails: {
    method: "POST",
    path: "/customers/getAll",
    body: z.object({
      ClientToken: z.string().default(env.clientToken),
      AccessToken: z.string().default(env.accessToken),
      Client: z.string().default(env.clientName),
      CustomerIds: z.array(z.string()).optional(),
    }),
    responses: {
      200: z.object({
        Customers: z.array(coustomerFromApi),
      }),
    },
  },
  getServices: {
    method: "POST",
    path: "/services/getAll",
    body: z.object({
      ClientToken: z.string().default(env.clientToken),
      AccessToken: z.string().default(env.accessToken),
      Client: z.string().default(env.clientName),
      EnterpriseIds: z.array(z.string()).optional(),
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
        Services: z.array(servicesFromApi),
        Cursor: z.string().nullable(),
      }),
    },
  },
  getAgeCategories: {
    method: "POST",
    path: "/ageCategories/getAll",
    body: z.object({
      ClientToken: z.string().default(env.clientToken),
      AccessToken: z.string().default(env.accessToken),
      Client: z.string().default(env.clientName),
      EnterpriseIds: z.array(z.string()).optional(),
      ServiceIds: z.array(z.string()).optional(),
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
        AgeCategories: z.array(
          z.object({
            Id: z.string().nullable(),
            MinimalAge: z.number().nullable(),
            MaximalAge: z.number().nullable(),
          })
        ),
        Cursor: z.string().nullable(),
      }),
    },
  },
  getRestrictions: {
    method: "POST",
    path: "/restrictions/getAll",
    body: z.object({
      ClientToken: z.string().default(env.clientToken),
      AccessToken: z.string().default(env.accessToken),
      Client: z.string().default(env.clientName),
      EnterpriseIds: z.array(z.string()).optional(),
      ServiceIds: z.array(z.string()).optional(),
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
        Restrictions: z.array(restrictionsFromApi),
        Cursor: z.string().nullable(),
      }),
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
