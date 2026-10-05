// script.js
// O navegador apenas envia o numero e o id_token do Google para /api/desenho
// e exibe o SVG devolvido pelo servidor. O e-mail da assinatura nunca passa por aqui.

const GOOGLE_CLIENT_ID = "23332818343-7ca2nd7mn2mr3fqoegfmpdaeo11dkupn.apps.googleusercontent.com"; // publico

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const usuario = document.getElementById("usuario");
const botaoBaixar = document.getElementById("baixar");

let idToken = null;
let svgAtual = "";

function aoLogar(resposta) {
  idToken = resposta.credential;
  try {
    // Apenas para exibir quem entrou. Quem valida o token e o servidor.
    const payload = JSON.parse(atob(idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    usuario.textContent = "Conectado como " + payload.email;
  } catch {
    usuario.textContent = "Login realizado.";
  }
  mensagem.textContent = "";
}

function iniciarGoogle() {
  if (!window.google || !google.accounts || !google.accounts.id) {
    setTimeout(iniciarGoogle, 100);
    return;
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: aoLogar,
  });
  google.accounts.id.renderButton(document.getElementById("login"), {
    theme: "outline",
    size: "large",
    text: "signin_with",
  });
}
iniciarGoogle();

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";

  const numero = Number(campoNumero.value);

  const cabecalhos = { "Content-Type": "application/json" };
  if (idToken) cabecalhos["Authorization"] = "Bearer " + idToken;

  let resposta;
  try {
    resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: cabecalhos,
      body: JSON.stringify({ numero }),
    });
  } catch {
    mensagem.textContent = "Falha de rede ao chamar o servidor.";
    return;
  }

  if (resposta.status === 400) {
    mensagem.textContent = "Erro 400: informe um número inteiro entre 1 e 100.";
    return;
  }
  if (resposta.status === 401) {
    mensagem.textContent = "Erro 401: faça login com o Google (token ausente, inválido ou expirado).";
    return;
  }
  if (!resposta.ok) {
    mensagem.textContent = "Erro " + resposta.status + " ao gerar o desenho.";
    return;
  }

  svgAtual = await resposta.text();
  area.innerHTML = svgAtual;
  botaoBaixar.hidden = false;
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});
