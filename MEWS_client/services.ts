import { ClientInferResponseBody } from "@ts-rest/core";
import { contract, client } from "./api";

export type service_format = ClientInferResponseBody<
  typeof contract.getServices,
  200
>["Services"];

export async function fetchServices(body, cursor?: string) {
  var serviceArr: service_format = [];
  async function fetch(body, cursor: string) {
    if (serviceArr.length === 0 || cursor) {
      if (cursor) {
        body["Limitation"] = {
          Cursor: cursor,
        };
      }
      const resp = await client.getServices({
        body: contract.getServices.body.parse(body),
      });
      serviceArr.push(...resp.body["Services"]);
      await fetch(body, resp.body["Cursor"]);
    }
  }
  await fetch(body, cursor as string);
  return serviceArr;
}

export async function getServiceIdList(body): Promise<string[]> {
  const services: service_format = await fetchServices(body);
  return services.map((ser) => ser.Id) as string[];
}
