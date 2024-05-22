import { ClientInferRequest, ClientInferResponseBody } from "@ts-rest/core";
import { contract, client } from "./api";

export type restrictions_format = ClientInferResponseBody<
  typeof contract.getRestrictions,
  200
>["Restrictions"];

export type restrictions_body = ClientInferRequest<
  typeof contract.getRestrictions
>['body'];

export async function fetchRestrictions(body:restrictions_body, cursor?: string) {
  var restrictionsArr: restrictions_format = [];
  async function fetch(body:restrictions_body, cursor: string) {
    if (restrictionsArr.length === 0 || cursor) {
      if (cursor) {
        body["Limitation"] = {
          Cursor: cursor,
        };
      }
      const resp = await client.getRestrictions({
        body: contract.getRestrictions.body.parse(body),
      });
      restrictionsArr.push(...resp.body["Restrictions"]);
      await fetch(body, resp.body["Cursor"] as string);
    }
  }
  await fetch(body, cursor as string);
  return restrictionsArr;
}
