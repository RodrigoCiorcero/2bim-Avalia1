import { gerarDesenho } from "../../lib/desenho.js";

function erro(status, mensagem, extra = {}) {
  return new Response(JSON.stringify({ erro: mensagem }), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });
}

export async function onRequest({ request, env }) {
  // 1) metodo -> 405
  if (request.method !== "POST") {
    return erro(405, "Metodo nao permitido", { Allow: "POST" });
  }

  // 2) corpo -> 400
  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return erro(400, "Corpo ausente ou JSON invalido");
  }
  const numero = corpo?.numero;
  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    return erro(400, "numero deve ser um inteiro entre 1 e 100");
  }

  // 3) token -> 401
  const m = (request.headers.get("Authorization") || "").match(/^Bearer\s+(\S+)$/i);
  if (!m) return erro(401, "Token ausente");

  let info;
  try {
    const r = await fetch(
      "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(m[1])
    );
    if (r.status !== 200) return erro(401, "Token invalido ou expirado");
    info = await r.json();
  } catch {
    return erro(401, "Nao foi possivel validar o token");
  }

  if (
    !env.GOOGLE_CLIENT_ID ||
    info.aud !== env.GOOGLE_CLIENT_ID ||
    String(info.email_verified) !== "true" ||
    !info.email
  ) {
    return erro(401, "Token nao aceito");
  }

  // o e-mail vem SOMENTE da resposta do Google, nunca do cliente
  const svg = gerarDesenho(numero, info.email);
  return new Response(svg, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
}
