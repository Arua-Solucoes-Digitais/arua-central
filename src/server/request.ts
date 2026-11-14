// Dados do pedido atual. ARUA_TRUST_PROXY=1 só deve ser usado atrás de um proxy que você controla,
// porque sem ele qualquer pessoa pode falsificar esses cabeçalhos.
import { getRequest, getRequestHeader, getRequestIP } from "@tanstack/react-start/server";

export const SESSION_COOKIE = "arua_session";

const trustProxy = () => process.env["ARUA_TRUST_PROXY"] === "1";

export function clientAddress() {
  return getRequestIP({ xForwardedFor: trustProxy() }) ?? "desconhecido";
}

export function isHttpsRequest() {
  if (trustProxy() && getRequestHeader("x-forwarded-proto") === "https") return true;
  return new URL(getRequest().url).protocol === "https:";
}
