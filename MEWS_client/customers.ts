import { ClientInferResponseBody } from "@ts-rest/core";
import { contract, client } from "./api";

export type customer_format = ClientInferResponseBody<
  typeof contract.getCustomerDetails,
  200
>["Customers"];

export async function fetchCustomer(body: {
  CustomerIds: string[];
}): Promise<customer_format> {
  const resp = await client.getCustomerDetails({
    body: contract.getCustomerDetails.body.parse(body),
  });
  return resp.body["Customers"];
}

export async function getCustomerDetails(body: { CustomerIds: string[] }): Promise<customer_format[0]> {
  const customers: customer_format = await fetchCustomer(body);
  return customers.find((cus) => cus.Id == body.CustomerIds[0]) as customer_format[0];
}
