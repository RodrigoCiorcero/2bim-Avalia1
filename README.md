# Desenho Assinado

Página que recebe um número inteiro entre 1 e 100 e devolve uma figura em SVG, assinada com o e-mail da conta Google usada no login.

A figura é a tabuada modular no círculo: 240 pontos igualmente espaçados numa circunferência, com cada ponto `i` ligado ao ponto `(k * i) mod 240`, em que `k = número + 1`.

## Estrutura

```
public/
  index.html    formulário com o número e o botão Sign in with Google
  style.css     aparência da página
  script.js     envia número e id_token para /api/desenho e exibe o SVG
lib/
  desenho.js    gerarDesenho (fora de public/, não é servido)
functions/
  api/desenho.js    Pages Function: POST /api/desenho
evidencias/
  exemplo.svg   desenho gerado pelo site publicado
```

## Publicação no Cloudflare Pages

Framework preset: `None`. Build command: vazio. Build output directory: `public`.
Variável de ambiente: `GOOGLE_CLIENT_ID`.

## Identificação

Nome: Rodrigo Ciorcero
RA: 
URL: https://
