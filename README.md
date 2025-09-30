# Metodologia Analítica – Tarot (HTML/CSS/JS)

Site simples (sem build) pra apresentar minha otimização de lucro mensal usando Programação Linear, com visual preto + magenta, botão de Play no centro e um carrossel full-screen com os tópicos.

## O que tem aqui

- Loading com uma carta de tarot sendo “desenhada” (~8s) + fade (~2s) e só depois libera a página.
- Vídeo de fundo em loop (fullscreen) com um fumê preto de 80% por cima pra não poluir o texto.
- Botão Play fixo no centro abre um carrossel em tela cheia (Materialize):
  - Suporte a toque/arraste, setas do teclado e ESC pra fechar.
  - Deep link: dá pra abrir direto em uma seção via hash (ex.: `#servicos`). O hash sincroniza quando navego.
- Altura dos cards se ajusta ao tamanho da janela e o conteúdo rola dentro do card (não estoura mais).
- Responsivo de celular a 4K (tipografia, botões e container com `clamp()` e variáveis CSS).
- Favicon é um “play” magenta. Cliques dos botões ficam magenta (override no teal do Materialize).
- Nada de build: é abrir o `index.html` e usar.

## Como rodar local

Tem duas formas, escolhe a que preferir:

- VS Code + Live Server (recomendado):

  1.  Abre a pasta no VS Code.
  2.  Clica com o botão direito no `index.html` → “Open with Live Server”.

- Abrir direto no navegador:
  - Dá duplo clique no `index.html` e pronto. (Quase tudo funciona. O vídeo toca em autoplay porque tá `muted`.)

## Como publicar no GitHub Pages

Eu deixei um `.nojekyll` na raiz pra evitar qualquer bloqueio do Pages.

1. Cria o repositório no GitHub (público) e copia a URL HTTPS.

2. No PowerShell, dentro da pasta do projeto:

```powershell
git init
git branch -M main
git add .
git commit -m "subindo site pro github pages"
git remote add origin https://github.com/SEUUSUARIO/NOME-DO-REPO.git
git push -u origin main
```

3. Ativa o Pages no GitHub

- Repo → Settings → Pages → Build and deployment
  - Source: Deploy from a branch
  - Branch: main
  - Folder: /(root)

Depois de 1 a 5 min ele publica. A URL fica algo como:

```
https://SEUUSUARIO.github.io/NOME-DO-REPO/
```

Se não aparecer a opção de “/(root)”, é só mover tudo pra uma pasta `docs/` e escolher `/docs` nas Pages.

## Estrutura

```
index.html            # landing + carrossel
src/styles.css        # tema, responsivo e ajustes de UI
src/main.js           # loader, carrossel e navegação
assets/images/        # imagens
assets/media/         # vídeos (coloco o background.mp4 aqui)
favicon.svg           # ícone de play magenta
.nojekyll             # deixa o GitHub Pages servir tudo como está
```

## Personalizo assim

- Vídeo de fundo: troco o arquivo em `assets/media/background.mp4`. Se for pesado, dá pra comprimir pra carregar mais rápido.
- Cores e tema: no `:root` do `styles.css` tem as variáveis (ex.: `--accent` é o magenta).
- Tamanhos do carrossel: `--carouselW` e `--carouselH` no `styles.css` controlam largura/altura máxima.
- Textos e seções: tudo está em `index.html`, dentro do `#carouselSlider` como `.carousel-item` (ids: `intro`, `servicos`, `variaveis`, `restricoes`, `objetivo`, `resolucao`, `ajuste`, `lucro`, `conclusao`).
- Tempo do loading: em `src/main.js` dá pra mexer em `duration = 8000` (desenho) e `fade = 2000` (esmaecer).

## Notas

- O autoplay do vídeo depende do navegador, mas com `muted` ligado costuma rodar de boa.
- Se o favicon antigo ficar no cache, dá um Ctrl+F5 que ele troca pro play magenta.

## Licença

MIT. Tá no arquivo `LICENSE`.
