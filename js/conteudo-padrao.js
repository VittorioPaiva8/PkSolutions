// =====================================================
//  CONTEÚDO PADRÃO DO SITE
//  É usado quando o Supabase ainda não está configurado
//  ou quando nada foi salvo pelo painel ainda.
//  Depois de configurar, edite tudo pelo admin.html.
// =====================================================
window.PK = window.PK || {};

PK.CONTEUDO_PADRAO = {
  geral: {
    nome: "PK",
    tituloAba: "PK — Portfólio",
    descricao: "Portfólio de projetos de software.",
    fonteTitulos: "Bagel Fat One",
    fonteTexto: "Inter",
  },

  // Ordem e visibilidade das seções da página
  secoes: [
    { id: "inicio", visivel: true },
    { id: "projetos", visivel: true },
    { id: "sobre", visivel: true },
    { id: "contato", visivel: true },
  ],

  inicio: {
    rotulo: "Desenvolvedor de software",
    titulo: "Software simples, bem feito e que funciona.",
    subtitulo:
      "Eu crio aplicações web, mobile e ferramentas que resolvem problemas reais. Aqui estão alguns projetos que eu construí.",
    botao: "Ver projetos",
    link: "Falar comigo →",
    dicaTema: "Clique pra trocar a cor",
  },

  projetos: {
    titulo: "Projetos",
    textoTodos: "Todos",
    itens: [
      {
        titulo: "Ledger",
        ano: "2026",
        categoria: "Web",
        resumo: "Painel financeiro para pequenas empresas acompanharem receitas e despesas em tempo real.",
        descricao:
          "O Ledger centraliza as finanças de pequenos negócios em um painel simples. Importa extratos bancários, categoriza transações automaticamente e mostra relatórios claros de fluxo de caixa. O foco foi deixar números complexos fáceis de entender em poucos segundos.",
        papel: "Full-stack",
        tags: ["React", "TypeScript", "Node.js", "PostgreSQL"],
        imagens: ["assets/projetos/ledger.svg"],
        links: { site: "#", codigo: "#" },
      },
      {
        titulo: "Rota",
        ano: "2025",
        categoria: "Mobile",
        resumo: "App de entregas com rastreamento ao vivo e otimização de rotas para entregadores.",
        descricao:
          "O Rota ajuda entregadores a planejar o dia: calcula a melhor ordem de paradas, mostra o trajeto no mapa e avisa o cliente quando o pedido está chegando. Funciona offline e sincroniza quando a conexão volta.",
        papel: "Mobile + API",
        tags: ["React Native", "Expo", "Python", "Redis"],
        imagens: ["assets/projetos/rota.svg"],
        links: { site: "#", codigo: "#" },
      },
      {
        titulo: "Forja CLI",
        ano: "2025",
        categoria: "Ferramenta",
        resumo: "Ferramenta de linha de comando que cria, testa e publica APIs com um único comando.",
        descricao:
          "A Forja automatiza o trabalho repetitivo de começar um projeto: gera a estrutura, configura banco, testes e pipeline de deploy. Reduziu o tempo de setup de novos serviços de horas para segundos.",
        papel: "Autor",
        tags: ["Go", "Docker", "CI/CD"],
        imagens: ["assets/projetos/forja-cli.svg"],
        links: { site: "", codigo: "#" },
      },
      {
        titulo: "Quadro",
        ano: "2024",
        categoria: "Web",
        resumo: "Gerenciador de tarefas em kanban, colaborativo e em tempo real para times pequenos.",
        descricao:
          "O Quadro é um kanban minimalista com colaboração em tempo real: vários membros editam o mesmo quadro ao mesmo tempo, com histórico de alterações e atalhos de teclado para tudo.",
        papel: "Front-end",
        tags: ["Next.js", "WebSockets", "Tailwind"],
        imagens: ["assets/projetos/quadro.svg"],
        links: { site: "#", codigo: "" },
      },
    ],
  },

  sobre: {
    titulo: "Sobre",
    destaque: "Gosto de pegar uma ideia bagunçada e transformar em um produto claro e fácil de usar.",
    texto:
      "Trabalho de ponta a ponta: do banco de dados à interface. Me importo com código limpo, performance e com os detalhes que fazem a experiência ser boa de verdade.",
    stack: [
      { rotulo: "Front-end", valor: "React, TypeScript, Next.js, Tailwind" },
      { rotulo: "Back-end", valor: "Node.js, Python, PostgreSQL, Redis" },
      { rotulo: "Mobile", valor: "React Native, Expo" },
      { rotulo: "Infra", valor: "Docker, AWS, Vercel, CI/CD" },
    ],
  },

  contato: {
    rotulo: "Contato",
    titulo: "Bora construir algo juntos?",
    email: "seuemail@exemplo.com",
    redes: [
      { nome: "GitHub", url: "https://github.com/" },
      { nome: "LinkedIn", url: "https://linkedin.com/" },
      { nome: "Instagram", url: "https://instagram.com/" },
    ],
  },

  rodape: {
    texto: "© {ano} PK",
    voltarTopo: "Voltar ao topo ↑",
  },

  // Tema usado na primeira visita
  temaPadrao: "laranja",

  // Cada clique na logo passa para o próximo tema da lista
  temas: [
    {
      id: "laranja",
      nome: "Laranja",
      logo: "assets/logo.jpg",
      cores: {
        fundo: "#F2EADB",
        texto: "#151515",
        textoSuave: "#5E5850",
        superficie: "#E6DAC3",
        superficieClara: "#FBF7EF",
        linha: "#E0D3BA",
        destaque: "#FF3B00",
        sobreDestaque: "#FBF7EF",
        invertido: "#151515",
        sobreInvertido: "#F2EADB",
        contatoFundo: "#FF3B00",
        contatoTexto: "#151515",
        contatoHover: "#FBF7EF",
      },
    },
    {
      id: "vinho",
      nome: "Vinho",
      logo: "assets/logo-vinho.jpg",
      cores: {
        fundo: "#2E0610",
        texto: "#F2EADB",
        textoSuave: "#C2ABA6",
        superficie: "#42101C",
        superficieClara: "#3A0B17",
        linha: "#4C1825",
        destaque: "#F2EADB",
        sobreDestaque: "#2E0610",
        invertido: "#151515",
        sobreInvertido: "#F2EADB",
        contatoFundo: "#151515",
        contatoTexto: "#F2EADB",
        contatoHover: "#C2ABA6",
      },
    },
    {
      id: "lavanda",
      nome: "Lavanda",
      logo: "assets/logo-lavanda.jpg",
      cores: {
        fundo: "#9AA3C5",
        texto: "#151515",
        textoSuave: "#353A52",
        superficie: "#8B94B9",
        superficieClara: "#F2EADB",
        linha: "#8790B4",
        destaque: "#2F3563",
        sobreDestaque: "#F2EADB",
        invertido: "#151515",
        sobreInvertido: "#F2EADB",
        contatoFundo: "#F2EADB",
        contatoTexto: "#151515",
        contatoHover: "#2F3563",
      },
    },
    {
      id: "verde",
      nome: "Verde",
      logo: "assets/logo-verde.png",
      cores: {
        fundo: "#5DB297",
        texto: "#151515",
        textoSuave: "#1C4436",
        superficie: "#51A388",
        superficieClara: "#F2EADB",
        linha: "#4F9E84",
        destaque: "#0E3A2C",
        sobreDestaque: "#F2EADB",
        invertido: "#151515",
        sobreInvertido: "#F2EADB",
        contatoFundo: "#151515",
        contatoTexto: "#F2EADB",
        contatoHover: "#5DB297",
      },
    },
  ],
};
