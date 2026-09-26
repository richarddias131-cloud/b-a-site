# B&A Sign — site institucional

Site estático (HTML + CSS + JS puro), sem build. Pronto para GitHub Pages.

```
ba-sign-site/
├── index.html        estrutura e conteúdo
├── css/style.css     estilos (mobile-first, seções numeradas)
├── js/main.js        animações (GSAP + ScrollTrigger) e smooth scroll (Lenis)
├── assets/           logos e imagens
└── README.md
```

Bibliotecas via CDN (nada para instalar):
- GSAP 3.12.5 + ScrollTrigger — cdnjs.cloudflare.com
- Lenis 1.1.13 — cdn.jsdelivr.net

## Rodar localmente

Abrir `index.html` direto no navegador funciona. Para testar igual ao servidor:

```bash
cd ba-sign-site
python -m http.server 8000
# http://localhost:8000
```

## Publicar no GitHub Pages

1. Crie um repositório e envie o conteúdo de `ba-sign-site/` para a raiz.
2. Em **Settings → Pages**, escolha a branch `main` e a pasta `/ (root)`.
3. O site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

## WhatsApp

Número e mensagem padrão ficam no topo de `js/main.js`:

```js
const WA_NUMBER = '5535992451801';
const WA_DEFAULT_MSG = 'Olá, B&A Sign! Vim pelo site e quero um orçamento.';
```

Qualquer link com `data-wa` vira link de orçamento. Para mensagem específica:

```html
<a data-wa data-wa-msg="Olá! Quero orçamento de fachada em ACM." href="...">Orçar</a>
```

(O `href` no HTML é o fallback caso o JS não carregue.)

## Assets

- `logo-ba-sign.png` — logo original (fundo preto), usado como favicon/og:image.
- `logo-ba-sign-transparente.png` — versão recortada com fundo transparente, usada no header.

O logo animado do hero é montado em texto (Saira Black Italic para B/A/&, Orbitron para SIGN)
para permitir que o B e o A entrem separados. Se houver o logo vetorial (SVG) com B, A, & e SIGN
em camadas separadas, dá para trocar mantendo as mesmas classes.

## Acessibilidade e desempenho

- `prefers-reduced-motion`: sem animações; headline já aparece preenchida.
- Mobile: sem pin no hero, menos riscos de luz, grão estático.
- Se o CDN falhar, o conteúdo aparece estático (sem ficar invisível).
