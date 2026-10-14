// =====================================================
//  DADOS — funções compartilhadas entre o site e o painel:
//  segurança de texto/links, leitura do Supabase e cache.
// =====================================================
window.PK = window.PK || {};

(function () {
  const ehObjeto = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

  const util = {
    ehObjeto,

    clonar: (v) => JSON.parse(JSON.stringify(v)),

    // Escapa texto para colocar dentro de HTML
    escapar(texto) {
      return String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    },

    // Só deixa passar links seguros (bloqueia "javascript:" etc.)
    url(endereco) {
      const u = String(endereco ?? "").trim();
      if (!u) return "";
      const esquema = u.match(/^([a-z][a-z0-9+.-]*):/i);
      if (!esquema) return util.escapar(u);
      const nome = esquema[1].toLowerCase();
      if (["http", "https", "mailto", "tel"].includes(nome) || /^data:image\//i.test(u)) return util.escapar(u);
      return "#";
    },

    // Só aceita cores no formato #RGB / #RRGGBB / #RRGGBBAA
    cor: (v) => (/^#[0-9a-f]{3,8}$/i.test(String(v ?? "").trim()) ? String(v).trim() : ""),

    // Junta o conteúdo salvo com o padrão (campos novos ganham o valor padrão)
    mesclar(padrao, salvo) {
      if (salvo === undefined || salvo === null) return util.clonar(padrao ?? null);
      if (ehObjeto(padrao) && ehObjeto(salvo)) {
        const resultado = util.clonar(padrao);
        for (const chave of Object.keys(salvo)) resultado[chave] = util.mesclar(padrao[chave], salvo[chave]);
        return resultado;
      }
      return util.clonar(salvo);
    },
  };

  const CHAVE_CACHE = "pk-conteudo";

  const dados = {
    configurado() {
      const c = PK.config || {};
      return /^https:\/\/\S+/.test(c.supabaseUrl || "") && (c.supabaseChave || "").length > 20;
    },

    // Garante que o conteúdo tem tudo que o site precisa
    normalizar(salvo) {
      const padrao = PK.CONTEUDO_PADRAO;
      const c = util.mesclar(padrao, ehObjeto(salvo) ? salvo : {});

      if (!Array.isArray(c.temas) || c.temas.length === 0) c.temas = util.clonar(padrao.temas);
      const coresBase = padrao.temas[0].cores;
      c.temas.forEach((t, i) => {
        t.id = String(t.id || `tema-${i}`);
        t.cores = { ...coresBase, ...(ehObjeto(t.cores) ? t.cores : {}) };
      });
      if (!c.temas.some((t) => t.id === c.temaPadrao)) c.temaPadrao = c.temas[0].id;

      const conhecidas = padrao.secoes.map((s) => s.id);
      c.secoes = (Array.isArray(c.secoes) ? c.secoes : []).filter((s) => s && conhecidas.includes(s.id));
      conhecidas.forEach((id) => {
        if (!c.secoes.some((s) => s.id === id)) c.secoes.push({ id, visivel: true });
      });

      ["projetos.itens", "sobre.stack", "contato.redes"].forEach((caminho) => {
        const [a, b] = caminho.split(".");
        if (!Array.isArray(c[a][b])) c[a][b] = [];
      });
      c.projetos.itens.forEach((p) => {
        p.tags = Array.isArray(p.tags) ? p.tags : [];
        p.imagens = Array.isArray(p.imagens) ? p.imagens : [];
        p.links = ehObjeto(p.links) ? p.links : {};
      });

      return c;
    },

    lerCache() {
      try {
        const texto = localStorage.getItem(CHAVE_CACHE);
        return texto ? JSON.parse(texto) : null;
      } catch (e) {
        return null;
      }
    },

    salvarCache(conteudo) {
      try {
        localStorage.setItem(CHAVE_CACHE, JSON.stringify(conteudo));
      } catch (e) {}
    },

    // Lê o conteúdo publicado (leitura pública, sem login)
    async carregarRemoto() {
      if (!dados.configurado()) return null;
      const { supabaseUrl, supabaseChave } = PK.config;
      const controle = new AbortController();
      const limite = setTimeout(() => controle.abort(), 6000);
      try {
        const resposta = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/site?id=eq.1&select=conteudo`, {
          headers: { apikey: supabaseChave },
          signal: controle.signal,
        });
        if (!resposta.ok) return null;
        const linhas = await resposta.json();
        return linhas[0]?.conteudo || null;
      } catch (e) {
        return null;
      } finally {
        clearTimeout(limite);
      }
    },
  };

  PK.util = util;
  PK.dados = dados;
})();
