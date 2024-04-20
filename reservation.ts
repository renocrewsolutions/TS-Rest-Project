import axios from "axios";

export async function getReservation(id: any) {
  let header = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  let obj = {
    ClientToken:
      "E0D439EE522F44368DC78E1BFB03710C-D24FB11DBE31D4621C4817E028D9E1D",
    AccessToken:
      "C66EF7B239D24632943D115EDE9CB810-EA00F8FD8294692C940F6B5A8F9453D",
    Client: "Sample Client 1.0.0",
    Limitation: {
      Count: 1000,
    },
    LanguageCode: null,
    CultureCode: null,
  };
  let resp = await axios.post(
    "https://api.mews-demo.com/api/connector/v1/reservations/getAll/2023-06-06",
    obj,
    { headers: header }
  );
  return { id: id, value: resp.data };
}
