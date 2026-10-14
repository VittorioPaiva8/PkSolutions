// =====================================================
//  ESQUEMA DO PAINEL
//  Cada aba do admin é gerada a partir desta lista.
//  Para adicionar um campo editável, acrescente uma linha:
//    { chave: "secao.campo", rotulo: "Nome", tipo: "texto" }
//
//  Tipos disponíveis:
//    texto, textarea, url, email, cor, checkbox, select,
//    tags (lista separada por vírgula), imagem, imagens,
//    lista (itens repetidos com seus próprios campos)
// =====================================================
window.PK = window.PK || {};

(function () {
  PK.FONTES = {
    titulos: ["Bagel Fat One", "Rammetto One", "Bowlby One", "Shrikhand", "Rubik Mono One", "Archivo Black", "DM Serif Display", "Fraunces"],
    texto: ["Inter", "DM Sans", "Manrope", "Work Sans", "IBM Plex Sans", "Nunito Sans"],
  };

  const NOMES_SECOES = {
    inicio: "Início (topo da página)",
    projetos: "Projetos",
    sobre: "Sobre",
    contato: "Contato",
  };

  // Cores que cada tema define (chave → descrição no painel)
  const CORES_TEMA = [
    ["fundo", "Fundo da página"],
    ["texto", "Texto principal"],
    ["textoSuave", "Texto secundário"],
    ["superficie", "Tags e fundo das imagens"],
    ["superficieClara", "Janela do projeto"],
    ["linha", "Linhas divisórias"],
    ["destaque", "Destaque (botões, hover)"],
    ["sobreDestaque", "Texto em cima do destaque"],
    ["invertido", "Pílulas escuras (menu, botão fechar)"],
    ["sobreInvertido", "Texto em cima das pílulas"],
    ["contatoFundo", "Fundo do bloco de contato"],
    ["contatoTexto", "Texto do bloco de contato"],
    ["contatoHover", "Hover do e-mail no contato"],
  ];

  PK.ESQUEMA = [
    {
      id: "geral",
      titulo: "Geral",
      descricao: "Nome, título da aba do navegador e fontes do site.",
      campos: [
        { chave: "geral.nome", rotulo: "Nome ou marca", tipo: "texto", ajuda: "Aparece no texto alternativo da logo." },
        { chave: "geral.tituloAba", rotulo: "Título da aba do navegador", tipo: "texto" },
        { chave: "geral.descricao", rotulo: "Descrição para buscadores", tipo: "textarea", ajuda: "Texto curto que o Google mostra abaixo do link." },
        { chave: "geral.fonteTitulos", rotulo: "Fonte dos títulos", tipo: "select", opcoes: PK.FONTES.titulos },
        { chave: "geral.fonteTexto", rotulo: "Fonte dos textos", tipo: "select", opcoes: PK.FONTES.texto },
      ],
    },

    {
      id: "secoes",
      titulo: "Seções",
      descricao: "Mude a ordem das seções com as setas e escolha quais aparecem no site.",
      campos: [
        {
          chave: "secoes",
          tipo: "lista",
          fixa: true,
          tituloItem: (s) => NOMES_SECOES[s.id] || s.id,
          campos: [{ chave: "visivel", rotulo: "Mostrar no site", tipo: "checkbox" }],
        },
      ],
    },

    {
      id: "inicio",
      titulo: "Início",
      descricao: "O topo da página, com a apresentação e a logo.",
      campos: [
        { chave: "inicio.rotulo", rotulo: "Texto pequeno acima do título", tipo: "texto" },
        { chave: "inicio.titulo", rotulo: "Título principal", tipo: "textarea" },
        { chave: "inicio.subtitulo", rotulo: "Subtítulo", tipo: "textarea" },
        { chave: "inicio.botao", rotulo: "Texto do botão", tipo: "texto", ajuda: "Leva para a seção de projetos. Deixe vazio para esconder." },
        { chave: "inicio.link", rotulo: "Texto do link ao lado", tipo: "texto", ajuda: "Leva para o contato. Deixe vazio para esconder." },
        { chave: "inicio.dicaTema", rotulo: "Dica embaixo da logo", tipo: "texto" },
      ],
    },

    {
      id: "projetos",
      titulo: "Projetos",
      descricao: "Seus projetos. A primeira imagem de cada um vira a capa do card.",
      campos: [
        { chave: "projetos.titulo", rotulo: "Título da seção", tipo: "texto" },
        { chave: "projetos.textoTodos", rotulo: "Texto do filtro \"todos\"", tipo: "texto" },
        {
          chave: "projetos.itens",
          rotulo: "Lista de projetos",
          tipo: "lista",
          textoAdicionar: "Adicionar projeto",
          tituloItem: (p) => p.titulo || "Projeto sem nome",
          novo: () => ({
            titulo: "Novo projeto",
            ano: String(new Date().getFullYear()),
            categoria: "Web",
            resumo: "",
            descricao: "",
            papel: "",
            tags: [],
            imagens: [],
            links: { site: "", codigo: "" },
          }),
          campos: [
            { chave: "titulo", rotulo: "Nome do projeto", tipo: "texto" },
            { chave: "ano", rotulo: "Ano", tipo: "texto", meia: true },
            { chave: "categoria", rotulo: "Tipo", tipo: "texto", meia: true, ajuda: "Ex: Web, Mobile. Vira um filtro." },
            { chave: "resumo", rotulo: "Resumo (aparece no card)", tipo: "textarea" },
            { chave: "descricao", rotulo: "Descrição completa (aparece ao abrir)", tipo: "textarea", linhas: 6 },
            { chave: "papel", rotulo: "Seu papel", tipo: "texto", meia: true },
            { chave: "tags", rotulo: "Tecnologias", tipo: "tags", meia: true, ajuda: "Separe por vírgula." },
            { chave: "imagens", rotulo: "Imagens", tipo: "imagens" },
            { chave: "links.site", rotulo: "Link do projeto", tipo: "url", meia: true },
            { chave: "links.codigo", rotulo: "Link do código-fonte", tipo: "url", meia: true },
          ],
        },
      ],
    },

    {
      id: "sobre",
      titulo: "Sobre",
      descricao: "Sua apresentação e as tecnologias que você usa.",
      campos: [
        { chave: "sobre.titulo", rotulo: "Título da seção", tipo: "texto" },
        { chave: "sobre.destaque", rotulo: "Frase em destaque", tipo: "textarea" },
        { chave: "sobre.texto", rotulo: "Texto", tipo: "textarea", linhas: 6, ajuda: "Deixe uma linha em branco para começar outro parágrafo." },
        {
          chave: "sobre.stack",
          rotulo: "Tecnologias",
          tipo: "lista",
          textoAdicionar: "Adicionar linha",
          tituloItem: (s) => s.rotulo || "Nova linha",
          novo: () => ({ rotulo: "", valor: "" }),
          campos: [
            { chave: "rotulo", rotulo: "Área", tipo: "texto", meia: true },
            { chave: "valor", rotulo: "Tecnologias", tipo: "texto", meia: true },
          ],
        },
      ],
    },

    {
      id: "contato",
      titulo: "Contato",
      descricao: "O bloco de contato no fim da página.",
      campos: [
        { chave: "contato.rotulo", rotulo: "Texto pequeno (também usado no menu)", tipo: "texto" },
        { chave: "contato.titulo", rotulo: "Título", tipo: "textarea" },
        { chave: "contato.email", rotulo: "E-mail", tipo: "email" },
        {
          chave: "contato.redes",
          rotulo: "Redes sociais",
          tipo: "lista",
          textoAdicionar: "Adicionar rede",
          tituloItem: (r) => r.nome || "Nova rede",
          novo: () => ({ nome: "", url: "https://" }),
          campos: [
            { chave: "nome", rotulo: "Nome", tipo: "texto", meia: true },
            { chave: "url", rotulo: "Link", tipo: "url", meia: true },
          ],
        },
      ],
    },

    {
      id: "cores",
      titulo: "Cores e logos",
      descricao: "Cada tema tem sua logo e suas cores. Clicar na logo do site passa para o próximo tema da lista.",
      campos: [
        {
          chave: "temaPadrao",
          rotulo: "Tema da primeira visita",
          tipo: "select",
          opcoes: (c) => c.temas.map((t) => ({ valor: t.id, rotulo: t.nome || t.id })),
        },
        {
          chave: "temas",
          rotulo: "Temas",
          tipo: "lista",
          minimo: 1,
          textoAdicionar: "Adicionar tema",
          tituloItem: (t) => t.nome || "Tema sem nome",
          amostras: (t) => [t.cores.fundo, t.cores.texto, t.cores.destaque, t.cores.contatoFundo],
          novo: (c) => ({
            id: "tema-" + Date.now().toString(36),
            nome: "Novo tema",
            logo: c.temas[0]?.logo || "",
            cores: { ...PK.CONTEUDO_PADRAO.temas[0].cores },
          }),
          campos: [
            { chave: "nome", rotulo: "Nome do tema", tipo: "texto" },
            { chave: "logo", rotulo: "Logo deste tema", tipo: "imagem", ajuda: "De preferência vertical (3:4), como as atuais." },
            ...CORES_TEMA.map(([chave, rotulo]) => ({ chave: "cores." + chave, rotulo, tipo: "cor", meia: true })),
          ],
        },
      ],
    },

    {
      id: "rodape",
      titulo: "Rodapé",
      descricao: "A última linha do site.",
      campos: [
        { chave: "rodape.texto", rotulo: "Texto", tipo: "texto", ajuda: "Escreva {ano} para mostrar o ano atual." },
        { chave: "rodape.voltarTopo", rotulo: "Texto do link \"voltar ao topo\"", tipo: "texto" },
      ],
    },
  ];
})();
