import type { ClientInferRequest, ClientInferResponseBody } from "@ts-rest/core";
import { contract, client } from "./api";

export type customer_format = ClientInferResponseBody<
  typeof contract.getCustomerDetails,
  200
>["Customers"];

export type customer_body = ClientInferRequest<
  typeof contract.getCustomerDetails
>['body'];
export async function fetchCustomer(body: customer_body): Promise<customer_format> {
  const resp = await client.getCustomerDetails({
    body: contract.getCustomerDetails.body.parse(body),
  });
  if (resp.status == 200) {
    return resp.body["Customers"];
  } else {
    throw new Error("Unexpected response format");
  }
}

export async function getCustomerDetails(body: { CustomerIds: string[] }): Promise<customer_format[0]> {
  const customers: customer_format = await fetchCustomer(body);
  return customers.find((cus) => cus.Id == body.CustomerIds[0]) as customer_format[0];
}
