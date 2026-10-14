// =====================================================
//  SITE — monta a página a partir do conteúdo.
//  Cada seção é um bloco independente em SECOES:
//    html(conteudo)       → devolve o HTML da seção
//    montar(el, conteudo) → liga os cliques (opcional)
//  Para criar uma seção nova: adicione aqui, no
//  conteudo-padrao.js (em "secoes") e no esquema.js.
// =====================================================
(function () {
  const { escapar: e, url: u, cor } = PK.util;
  const raiz = document.documentElement;
  const app = document.getElementById("app");
  const topo = document.getElementById("topo");
  const rodape = document.getElementById("rodape");
  const modal = document.getElementById("modal");
  const modalConteudo = document.getElementById("modal-conteudo");

  let conteudo = null;

  // ---------- Seções ----------
  const SECOES = {
    inicio: {
      html: (c) => `
        <section class="hero" id="inicio">
          <div class="hero-texto">
            ${c.inicio.rotulo ? `<p class="rotulo">${e(c.inicio.rotulo)}</p>` : ""}
            <h1>${e(c.inicio.titulo)}</h1>
            ${c.inicio.subtitulo ? `<p class="hero-sub">${e(c.inicio.subtitulo)}</p>` : ""}
            <div class="hero-acoes">
              ${c.inicio.botao ? `<a href="#projetos" class="botao">${e(c.inicio.botao)}</a>` : ""}
              ${c.inicio.link ? `<a href="#contato" class="link-seta">${e(c.inicio.link)}</a>` : ""}
            </div>
          </div>
          <div class="hero-logo">
            <button class="troca-tema" id="troca-tema" aria-label="Trocar a paleta de cores do site">
              <img src="" alt="Logo ${e(c.geral.nome)}" data-logo>
            </button>
            ${
              c.temas.length > 1
                ? `<p class="dica-tema">
                     <span>${e(c.inicio.dicaTema)}</span>
                     <span class="bolinhas">${c.temas.map(() => "<span></span>").join("")}</span>
                   </p>`
                : ""
            }
          </div>
        </section>`,
      montar(el, c) {
        const botao = el.querySelector("#troca-tema");
        if (c.temas.length < 2) botao.disabled = true;
        botao.addEventListener("click", () => {
          const i = indiceTemaAtual();
          aplicarTema(c.temas[(i + 1) % c.temas.length].id, true);
        });
      },
    },

    projetos: {
      html: (c) => `
        <section id="projetos" class="secao">
          <div class="secao-cabeca">
            <h2>${e(c.projetos.titulo)}</h2>
            <div class="filtros"></div>
          </div>
          <div class="grade"></div>
        </section>`,
      montar(el, c) {
        const itens = c.projetos.itens;
        const grade = el.querySelector(".grade");
        const filtros = el.querySelector(".filtros");

        const desenhar = (categoria) => {
          const lista = categoria ? itens.filter((p) => p.categoria === categoria) : itens;
          grade.innerHTML = lista.map((p) => cardProjeto(p, itens.indexOf(p))).join("");
          observarRevelar();
        };

        const categorias = [...new Set(itens.map((p) => p.categoria).filter(Boolean))];
        if (categorias.length > 1) {
          filtros.innerHTML = [`<button class="ativo" data-categoria="">${e(c.projetos.textoTodos)}</button>`]
            .concat(categorias.map((cat) => `<button data-categoria="${e(cat)}">${e(cat)}</button>`))
            .join("");
          filtros.addEventListener("click", (ev) => {
            const b = ev.target.closest("button");
            if (!b) return;
            filtros.querySelectorAll("button").forEach((x) => x.classList.toggle("ativo", x === b));
            desenhar(b.dataset.categoria);
          });
        }

        grade.addEventListener("click", (ev) => {
          const card = ev.target.closest(".card");
          if (card) abrirProjeto(itens[Number(card.dataset.indice)]);
        });

        desenhar("");
      },
    },

    sobre: {
      html: (c) => `
        <section id="sobre" class="secao sobre">
          <h2>${e(c.sobre.titulo)}</h2>
          <div class="sobre-corpo">
            <div>
              ${c.sobre.destaque ? `<p class="sobre-destaque">${e(c.sobre.destaque)}</p>` : ""}
              ${paragrafos(c.sobre.texto)}
            </div>
            ${
              c.sobre.stack.length
                ? `<dl class="stack">${c.sobre.stack
                    .map((s) => `<div><dt>${e(s.rotulo)}</dt><dd>${e(s.valor)}</dd></div>`)
                    .join("")}</dl>`
                : ""
            }
          </div>
        </section>`,
    },

    contato: {
      html: (c) => `
        <section id="contato" class="contato">
          ${c.contato.rotulo ? `<p class="rotulo">${e(c.contato.rotulo)}</p>` : ""}
          <h2>${e(c.contato.titulo)}</h2>
          ${c.contato.email ? `<a class="contato-email" href="${u("mailto:" + c.contato.email)}">${e(c.contato.email)}</a>` : ""}
          ${
            c.contato.redes.length
              ? `<div class="redes">${c.contato.redes
                  .map((r) => `<a href="${u(r.url)}" target="_blank" rel="noopener">${e(r.nome)}</a>`)
                  .join("")}</div>`
              : ""
          }
        </section>`,
    },
  };

  // ---------- Pedaços reutilizáveis ----------
  function paragrafos(texto) {
    return String(texto || "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${e(p)}</p>`)
      .join("");
  }

  function cardProjeto(p, indice) {
    const capa = p.imagens[0];
    return `
      <button class="card revelar" data-indice="${indice}" aria-label="Ver detalhes de ${e(p.titulo)}">
        <div class="card-imagem">
          ${capa ? `<img src="${u(capa)}" alt="${e(p.titulo)}" loading="lazy">` : `<span class="sem-imagem">${e(p.titulo)}</span>`}
        </div>
        <div class="card-info">
          <h3>${e(p.titulo)}</h3>
          <span class="card-ano">${[p.categoria, p.ano].filter(Boolean).map(e).join(" · ")}</span>
        </div>
        ${p.resumo ? `<p>${e(p.resumo)}</p>` : ""}
        ${p.tags.length ? `<ul class="tags">${p.tags.map((t) => `<li>${e(t)}</li>`).join("")}</ul>` : ""}
      </button>`;
  }

  function abrirProjeto(p) {
    const links = [];
    if (p.links.site) links.push(`<a class="botao" href="${u(p.links.site)}" target="_blank" rel="noopener">Ver projeto</a>`);
    if (p.links.codigo) links.push(`<a class="link-seta" href="${u(p.links.codigo)}" target="_blank" rel="noopener">Código-fonte →</a>`);

    const meta = [
      ["Ano", p.ano],
      ["Tipo", p.categoria],
      ["Papel", p.papel],
      ["Stack", p.tags.join(", ")],
    ].filter(([, v]) => v);

    modalConteudo.innerHTML = `
      ${p.imagens.length ? `<div class="galeria-principal"><img id="imagem-principal" src="${u(p.imagens[0])}" alt="${e(p.titulo)}"></div>` : `<div class="galeria-vazia"></div>`}
      ${
        p.imagens.length > 1
          ? `<div class="miniaturas">${p.imagens
              .map((src, i) => `<button class="${i === 0 ? "ativo" : ""}" data-src="${u(src)}" aria-label="Imagem ${i + 1}"><img src="${u(src)}" alt=""></button>`)
              .join("")}</div>`
          : ""
      }
      <h3>${e(p.titulo)}</h3>
      <div class="modal-meta">
        <div>
          ${paragrafos(p.descricao || p.resumo)}
          ${links.length ? `<div class="modal-links">${links.join("")}</div>` : ""}
        </div>
        <dl>${meta.map(([k, v]) => `<dt>${k}</dt><dd>${e(v)}</dd>`).join("")}</dl>
      </div>`;

    modal.showModal();
    modal.scrollTop = 0;
  }

  modalConteudo.addEventListener("click", (ev) => {
    const mini = ev.target.closest(".miniaturas button");
    if (!mini) return;
    document.getElementById("imagem-principal").src = mini.dataset.src;
    modalConteudo.querySelectorAll(".miniaturas button").forEach((b) => b.classList.toggle("ativo", b === mini));
  });
  document.getElementById("modal-fechar").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (ev) => {
    if (ev.target === modal) modal.close();
  });

  // ---------- Topo e rodapé ----------
  function desenharTopo(c) {
    const visiveis = c.secoes.filter((s) => s.visivel).map((s) => s.id);
    const links = [];
    if (visiveis.includes("projetos")) links.push(`<a href="#projetos">${e(c.projetos.titulo)}</a>`);
    if (visiveis.includes("sobre")) links.push(`<a href="#sobre">${e(c.sobre.titulo)}</a>`);
    if (visiveis.includes("contato")) links.push(`<a href="#contato" class="nav-cta">${e(c.contato.rotulo || "Contato")}</a>`);

    topo.innerHTML = `
      <a href="#" class="marca" aria-label="Início"><img src="" alt="Logo ${e(c.geral.nome)}" data-logo></a>
      <nav>${links.join("")}</nav>`;
  }

  function desenharRodape(c) {
    const texto = String(c.rodape.texto || "").replace(/\{ano\}/g, new Date().getFullYear());
    rodape.innerHTML = `
      <span>${e(texto)}</span>
      ${c.rodape.voltarTopo ? `<a href="#">${e(c.rodape.voltarTopo)}</a>` : ""}`;
  }

  // ---------- Temas e fontes ----------
  const paraCss = (chave) => "--" + chave.replace(/[A-Z]/g, (l) => "-" + l.toLowerCase());

  function ehEscuro(hex) {
    const h = cor(hex).replace("#", "");
    if (h.length < 6) return false;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45;
  }

  function desenharCoresTemas(c) {
    const declaracoes = (t) =>
      Object.entries(t.cores)
        .filter(([, v]) => cor(v))
        .map(([k, v]) => `${paraCss(k)}:${cor(v)};`)
        .join("") + `color-scheme:${ehEscuro(t.cores.fundo) ? "dark" : "light"};`;
    const idCss = (id) => String(id).replace(/[^a-zA-Z0-9_-]/g, "");
    const padrao = c.temas.find((t) => t.id === c.temaPadrao) || c.temas[0];

    let estilo = document.getElementById("cores-temas");
    if (!estilo) {
      estilo = document.createElement("style");
      estilo.id = "cores-temas";
      document.head.appendChild(estilo);
    }
    estilo.textContent =
      `:root{${declaracoes(padrao)}}` + c.temas.map((t) => `[data-tema="${idCss(t.id)}"]{${declaracoes(t)}}`).join("");
  }

  function aplicarFontes(geral) {
    const nomeSeguro = (n, reserva) => (/^[A-Za-z0-9 ]+$/.test(n || "") ? n : reserva);
    const titulos = nomeSeguro(geral.fonteTitulos, "Bagel Fat One");
    const texto = nomeSeguro(geral.fonteTexto, "Inter");
    const familia = (n) => n.trim().replace(/ /g, "+");

    const href =
      `https://fonts.googleapis.com/css2?family=${familia(titulos)}` +
      `&family=${familia(texto)}:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap`;
    const link = document.getElementById("fontes");
    if (link.getAttribute("href") !== href) link.setAttribute("href", href);

    raiz.style.setProperty("--fonte-display", `"${titulos}", "Arial Rounded MT Bold", system-ui, sans-serif`);
    raiz.style.setProperty("--fonte-texto", `"${texto}", system-ui, -apple-system, "Segoe UI", sans-serif`);
  }

  function indiceTemaAtual() {
    const i = conteudo.temas.findIndex((t) => t.id === raiz.dataset.tema);
    return i === -1 ? 0 : i;
  }

  function aplicarTema(id, animar) {
    const indice = Math.max(0, conteudo.temas.findIndex((t) => t.id === id));
    const tema = conteudo.temas[indice];

    const trocar = () => {
      raiz.dataset.tema = tema.id;
      document.querySelectorAll("[data-logo]").forEach((img) => (img.src = tema.logo || ""));
      const favicon = document.getElementById("favicon");
      if (tema.logo) favicon.href = tema.logo;
      document.querySelectorAll(".bolinhas span").forEach((s, i) => s.classList.toggle("ativo", i === indice));
    };

    if (!animar) return trocar();

    const botao = document.getElementById("troca-tema");
    raiz.classList.add("trocando-tema");
    botao.classList.remove("girando");
    void botao.offsetWidth; // reinicia a animação
    botao.classList.add("girando");
    setTimeout(trocar, 300); // troca no meio do giro
    setTimeout(() => {
      raiz.classList.remove("trocando-tema");
      botao.classList.remove("girando");
    }, 950);

    try {
      localStorage.setItem("tema", tema.id);
    } catch (err) {}
  }

  // ---------- Animação ao rolar ----------
  const observador = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target);
        }
      }),
    { threshold: 0.15 }
  );

  function observarRevelar() {
    document.querySelectorAll(".revelar:not(.visivel)").forEach((el) => observador.observe(el));
  }

  // ---------- Montagem da página ----------
  function renderizar(c) {
    conteudo = c;

    document.title = c.geral.tituloAba || c.geral.nome;
    document.querySelector('meta[name="description"]').setAttribute("content", c.geral.descricao || "");
    aplicarFontes(c.geral);
    desenharCoresTemas(c);

    desenharTopo(c);
    desenharRodape(c);

    app.innerHTML = "";
    c.secoes
      .filter((s) => s.visivel && SECOES[s.id])
      .forEach((s) => {
        const bloco = document.createElement("div");
        bloco.innerHTML = SECOES[s.id].html(c).trim();
        const el = bloco.firstElementChild;
        app.appendChild(el);
        SECOES[s.id].montar?.(el, c);
      });

    let salvo = null;
    try {
      salvo = localStorage.getItem("tema");
    } catch (err) {}
    aplicarTema(c.temas.some((t) => t.id === salvo) ? salvo : c.temaPadrao, false);
    c.temas.forEach((t) => t.logo && (new Image().src = t.logo)); // pré-carrega as logos

    observarRevelar();
    document.body.classList.remove("carregando");
  }

  async function iniciar() {
    const cache = PK.dados.lerCache();
    if (cache) renderizar(PK.dados.normalizar(cache));
    else if (!PK.dados.configurado()) renderizar(PK.dados.normalizar(null));

    const remoto = await PK.dados.carregarRemoto();
    if (remoto) {
      if (JSON.stringify(remoto) !== JSON.stringify(cache)) renderizar(PK.dados.normalizar(remoto));
      PK.dados.salvarCache(remoto);
    } else if (!conteudo) {
      renderizar(PK.dados.normalizar(null));
    }
  }

  iniciar();
})();
