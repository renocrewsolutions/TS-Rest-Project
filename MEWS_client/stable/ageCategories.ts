import type { ClientInferRequest, ClientInferResponseBody } from "@ts-rest/core";
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
  cursor?: string,
) {
  const ageCategoryArr: ageCategory_format = [];
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
      if (resp.status == 200) {
        ageCategoryArr.push(...resp.body["AgeCategories"]);
        await fetch(body, resp.body["Cursor"] as string);
      } else {
        throw new Error("Unexpected response format");
      }
    }
  }
  await fetch(body, cursor as string);
  return ageCategoryArr;
}
