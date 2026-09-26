# B&A Sign — site institucional

Site estático (HTML + CSS + JS puro), sem build. Publicado no GitHub Pages:
https://richarddias131-cloud.github.io/b-a-site/

```
ba-sign-site/
├── index.html        estrutura e conteúdo (seções 01 a 08)
├── css/style.css     estilos (mobile-first, blocos numerados por seção)
├── js/main.js        animações (GSAP + ScrollTrigger), smooth scroll (Lenis) e interações
├── assets/           logos
│   └── portfolio/    fotos dos trabalhos (JPEG otimizado, até ~1200px)
└── README.md
```

Bibliotecas via CDN (nada para instalar):
- GSAP 3.12.5 + ScrollTrigger — cdnjs.cloudflare.com
- Lenis 1.1.13 — cdn.jsdelivr.net

## Seções

| # | Seção | Onde editar |
|---|-------|-------------|
| 01 | Hero (logo animado + headline) | `index.html` → `.hero` |
| 02 | Materiais (ACM, PS, PVC em 3D) | `index.html` → `#materiais` |
| 03 | Serviços (9 lâminas) | `index.html` → `#servicos` |
| 04 | Segmentos | textos em `js/main.js` → `segmentsData()` |
| 05 | Processo (linha do tempo) | `index.html` → `#processo` |
| 06 | Portfólio | `index.html` → `#portfolio` |
| 07 | Chamada final | `index.html` → `#orcamento` |
| 08 | Rodapé | `index.html` → `.site-footer` |

## Publicar uma alteração

1. Edite os arquivos.
2. **Suba o número de versão** em `index.html` (`style.css?v=N` e `main.js?v=N`).
   O GitHub Pages deixa o celular usar a cópia antiga por ~10 min; o número novo força o download.
3. `git add -A && git commit -m "..." && git push`
4. Em ~1 min está no ar. Para conferir no celular, abra o link com `?v=N` no final.

## Rodar localmente

Abrir `index.html` direto no navegador funciona. Para testar igual ao servidor:

```bash
python -m http.server 8000
# http://localhost:8000
```

## WhatsApp

Número e mensagem padrão ficam no topo de `js/main.js`:

```js
const WA_NUMBER = '5535992451801';
const WA_DEFAULT_MSG = 'Olá, B&A Sign! Vim pelo site e quero um orçamento.';
```

Qualquer link com `data-wa` vira link de orçamento. Para mensagem específica:

```html
<a data-wa data-wa-msg="Olá! Quero orçamento de fachada em ACM." href="https://wa.me/5535992451801">Orçar</a>
```

## Adicionar um trabalho ao portfólio

1. Salve a foto em `assets/portfolio/` (JPEG, lado maior até ~1200px, de preferência < 150 KB).
   Oculte dados sensíveis de clientes (QR Code de Pix, CNPJ, placas de carro).
2. Copie um bloco `<figure class="work" data-work>` dentro de uma das três `works__col`
   e troque `src`, `width`/`height`, `aspect-ratio`, `alt` e a legenda.
3. Para antes/depois, copie o bloco com `data-cmp` (duas fotos do mesmo tamanho).

## Desempenho

- Nada de animação em loop, exceto o halo do botão final, que só roda com a seção na tela.
- Tudo anima com `transform`/`opacity` (sem blur, blend modes ou backdrop-filter).
- Fotos com `loading="lazy"`.
- `prefers-reduced-motion`: sem animações.
- Se o CDN falhar, o conteúdo aparece estático (nada fica invisível).
