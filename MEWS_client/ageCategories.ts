import { ClientInferRequest, ClientInferResponseBody } from "@ts-rest/core";
import { contract, client } from "./api";

export type ageCategory_format = ClientInferResponseBody<
  typeof contract.getAgeCategories,
  200
>["AgeCategories"];

export type ageCategory_body = ClientInferRequest<
  typeof contract.getAgeCategories
>["body"];

export async function fetchAgeCategories(
  body: ageCategory_body,
  cursor?: string
) {
  var ageCategoryArr: ageCategory_format = [];
  async function fetch(body: ageCategory_body, cursor: string) {
    if (ageCategoryArr.length === 0 || cursor) {
      if (cursor) {
        body["Limitation"] = {
          Cursor: cursor,
        };
      }
      const resp = await client.getAgeCategories({
        body: contract.getAgeCategories.body.parse(body),
      });
      ageCategoryArr.push(...resp.body["AgeCategories"]);
      await fetch(body, resp.body["Cursor"] as string);
    }
  }
  await fetch(body, cursor as string);
  return ageCategoryArr;
}
