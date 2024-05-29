import type { ClientInferRequest, ClientInferResponseBody } from "@ts-rest/core";
import { contract, client } from "./api";

export type service_format = ClientInferResponseBody<
  typeof contract.getServices,
  200
>["Services"];

export type service_body = ClientInferRequest<
  typeof contract.getServices
>["body"];

export async function fetchServices(body: service_body, cursor?: string) {
  const serviceArr: service_format = [];
  async function fetch(body: service_body, cursor: string) {
    if (serviceArr.length === 0 || cursor) {
      if (cursor) {
        body["Limitation"] = {
          Cursor: cursor,
        };
      }
      const resp = await client.getServices({
        body: contract.getServices.body.parse(body),
      });
      if (resp.status == 200) {
        serviceArr.push(...resp.body["Services"]);
        await fetch(body, resp.body["Cursor"] as string);
      } else {
        throw new Error("Unexpected response format");
      }
    }
  }
  await fetch(body, cursor as string);
  return serviceArr;
}

export async function getServiceIdList(body: service_body): Promise<string[]> {
  const services: service_format = await fetchServices(body);
  return services.map((ser) => ser.Id) as string[];
}
