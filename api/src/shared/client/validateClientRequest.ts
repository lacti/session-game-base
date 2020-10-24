import ClientRequest from "./ClientRequest";

export default function validateClientRequest(request: ClientRequest): boolean {
  return (
    !!request && !!request.type && ["pickCard"].some((t) => t === request.type)
  );
}
