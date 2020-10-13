import ClientRequest from "./ClientRequest";

export default function validateClientRequest(request: ClientRequest) {
  return (
    !!request && !!request.type && ["load"].some((t) => t === request.type)
  );
}
