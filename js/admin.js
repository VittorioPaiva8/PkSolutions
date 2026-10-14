// =====================================================
//  PAINEL ADMINISTRATIVO
//  Login pelo Supabase + editor gerado a partir do
//  js/esquema.js. Você não precisa mexer aqui para
//  adicionar campos: edite o esquema.
// =====================================================
(function () {
  const { escapar: e, cor: corValida, ehObjeto } = PK.util;
  const $ = (seletor) => document.querySelector(seletor);

  const telas = {
    carregando: $("#tela-carregando"),
    config: $("#tela-config"),
    login: $("#tela-login"),
    editor: $("#tela-editor"),
  };
  const painel = $("#painel");
  const abas = $("#abas");
  const status = $("#status");
  const botaoSalvar = $("#salvar");

  const BUCKET = "imagens";
  const TAMANHO_MAX = 5 * 1024 * 1024; // 5 MB

  let cliente = null;
  let conteudo = null;
  let abaAtual = PK.ESQUEMA[0].id;
  let alterado = false;
  let contador = 0;
  const abertos = new WeakSet(); // itens de lista que estão expandidos

  // ---------- Utilidades ----------
  function mostrar(nome) {
    for (const [chave, el] of Object.entries(telas)) el.hidden = chave !== nome;
  }

  let timerAviso;
  function avisar(mensagem, erro = false) {
    const el = $("#aviso");
    el.textContent = mensagem;
    el.classList.toggle("erro-aviso", erro);
    el.hidden = false;
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => (el.hidden = true), erro ? 7000 : 3000);
  }

  function ler(obj, caminho) {
    return caminho.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function gravar(obj, caminho, valor) {
    const partes = caminho.split(".");
    const ultima = partes.pop();
    let o = obj;
    for (const p of partes) {
      if (!ehObjeto(o[p])) o[p] = {};
      o = o[p];
    }
    o[ultima] = valor;
  }

  function criar(tag, classe, texto) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  // Botão que pede um segundo clique para confirmar
  function botaoConfirmar(botao, textoConfirmar, acao) {
    const original = botao.textContent;
    let timer;
    botao.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (!botao.classList.contains("confirmando")) {
        botao.classList.add("confirmando");
        botao.textContent = textoConfirmar;
        timer = setTimeout(() => {
          botao.classList.remove("confirmando");
          botao.textContent = original;
        }, 3000);
        return;
      }
      clearTimeout(timer);
      acao();
    });
  }

  function marcarAlterado() {
    alterado = true;
    status.textContent = "Alterações não salvas";
    status.classList.add("pendente");
  }

  function marcarSalvo(texto) {
    alterado = false;
    status.textContent = texto;
    status.classList.remove("pendente");
  }

  // ---------- Abas ----------
  function desenharAbas() {
    abas.innerHTML =
      PK.ESQUEMA.map((a) => `<button data-aba="${e(a.id)}">${e(a.titulo)}</button>`).join("") +
      `<hr><button data-aba="backup">Backup</button>`;
    atualizarAbaAtiva();
  }

  function atualizarAbaAtiva() {
    abas.querySelectorAll("button").forEach((b) => b.classList.toggle("ativa", b.dataset.aba === abaAtual));
  }

  abas.addEventListener("click", (ev) => {
    const b = ev.target.closest("button");
    if (!b) return;
    abaAtual = b.dataset.aba;
    atualizarAbaAtiva();
    desenharPainel();
    window.scrollTo(0, 0);
  });

  function cabecalhoPainel(titulo, descricao) {
    const cabeca = criar("div", "painel-cabeca");
    cabeca.appendChild(criar("h2", "", titulo));
    if (descricao) cabeca.appendChild(criar("p", "", descricao));
    painel.appendChild(cabeca);
  }

  function desenharPainel() {
    painel.innerHTML = "";
    if (abaAtual === "backup") return desenharBackup();
    const aba = PK.ESQUEMA.find((a) => a.id === abaAtual);
    cabecalhoPainel(aba.titulo, aba.descricao);
    painel.appendChild(blocoCampos(aba.campos, conteudo));
  }

  function blocoCampos(campos, obj) {
    const grade = criar("div", "campos");
    campos.forEach((def) => grade.appendChild(criarCampo(def, obj)));
    return grade;
  }

  // ---------- Campos ----------
  function criarCampo(def, obj) {
    const wrap = criar("div", `campo campo-${def.tipo}${def.meia ? " meia" : ""}`);
    const id = "campo-" + ++contador;
    const valor = ler(obj, def.chave);
    const mudar = (novo) => {
      gravar(obj, def.chave, novo);
      marcarAlterado();
    };

    const montar = TIPOS[def.tipo];
    if (!montar) {
      wrap.textContent = `Tipo de campo desconhecido: ${def.tipo}`;
      return wrap;
    }

    if (def.tipo === "checkbox") {
      wrap.appendChild(montar(def, valor, mudar, id, obj));
      const rotulo = criar("label", "", def.rotulo);
      rotulo.htmlFor = id;
      wrap.appendChild(rotulo);
    } else {
      if (def.rotulo) {
        const rotulo = criar("label", "", def.rotulo);
        rotulo.htmlFor = id;
        wrap.appendChild(rotulo);
      }
      wrap.appendChild(montar(def, valor, mudar, id, obj));
    }

    if (def.ajuda) wrap.appendChild(criar("p", "ajuda", def.ajuda));
    return wrap;
  }

  function campoTexto(tipo) {
    return (def, valor, mudar, id) => {
      const input = document.createElement("input");
      input.type = tipo;
      input.id = id;
      input.value = valor ?? "";
      input.addEventListener("input", () => mudar(input.value));
      return input;
    };
  }

  const TIPOS = {
    texto: campoTexto("text"),
    url: campoTexto("url"),
    email: campoTexto("email"),

    textarea(def, valor, mudar, id) {
      const t = document.createElement("textarea");
      t.id = id;
      t.rows = def.linhas || 3;
      t.value = valor ?? "";
      t.addEventListener("input", () => mudar(t.value));
      return t;
    },

    checkbox(def, valor, mudar, id) {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = id;
      input.checked = !!valor;
      input.addEventListener("change", () => mudar(input.checked));
      return input;
    },

    select(def, valor, mudar, id) {
      const lista = typeof def.opcoes === "function" ? def.opcoes(conteudo) : def.opcoes;
      const opcoes = lista.map((o) => (typeof o === "string" ? { valor: o, rotulo: o } : o));
      if (valor && !opcoes.some((o) => o.valor === valor)) opcoes.unshift({ valor, rotulo: valor });
      const select = document.createElement("select");
      select.id = id;
      select.innerHTML = opcoes.map((o) => `<option value="${e(o.valor)}">${e(o.rotulo)}</option>`).join("");
      select.value = valor ?? "";
      select.addEventListener("change", () => mudar(select.value));
      return select;
    },

    tags(def, valor, mudar, id) {
      const input = document.createElement("input");
      input.type = "text";
      input.id = id;
      input.value = (Array.isArray(valor) ? valor : []).join(", ");
      input.addEventListener("input", () =>
        mudar(input.value.split(",").map((t) => t.trim()).filter(Boolean))
      );
      return input;
    },

    cor(def, valor, mudar, id) {
      const paraSeletor = (v) => {
        let c = corValida(v);
        if (!c) return null;
        if (c.length === 4) c = "#" + [...c.slice(1)].map((x) => x + x).join("");
        return c.slice(0, 7).toLowerCase();
      };
      const linha = criar("div", "cor-linha");
      const seletor = document.createElement("input");
      seletor.type = "color";
      seletor.value = paraSeletor(valor) || "#000000";
      seletor.setAttribute("aria-label", `Escolher cor: ${def.rotulo}`);
      const texto = document.createElement("input");
      texto.type = "text";
      texto.id = id;
      texto.value = valor || "";
      texto.maxLength = 9;
      seletor.addEventListener("input", () => {
        texto.value = seletor.value.toUpperCase();
        mudar(texto.value);
      });
      texto.addEventListener("input", () => {
        const c = paraSeletor(texto.value);
        if (c) {
          seletor.value = c;
          mudar(texto.value.trim());
        }
      });
      linha.append(seletor, texto);
      return linha;
    },

    imagem(def, valor, mudar, id) {
      const linha = criar("div", "imagem-linha");
      const previa = document.createElement("img");
      previa.className = "imagem-previa";
      previa.alt = "";
      if (valor) previa.src = valor;

      const controles = criar("div", "imagem-controles");
      const input = document.createElement("input");
      input.type = "text";
      input.id = id;
      input.placeholder = "Link da imagem";
      input.value = valor ?? "";
      input.addEventListener("input", () => {
        previa.src = input.value;
        mudar(input.value.trim());
      });

      const arquivo = document.createElement("input");
      arquivo.type = "file";
      arquivo.accept = "image/*";
      arquivo.hidden = true;
      const botao = criar("button", "btn btn-pequeno", "Enviar imagem");
      botao.type = "button";
      botao.addEventListener("click", () => arquivo.click());
      arquivo.addEventListener("change", async () => {
        const f = arquivo.files[0];
        arquivo.value = "";
        if (!f) return;
        botao.disabled = true;
        botao.textContent = "Enviando…";
        const url = await enviarImagem(f);
        botao.disabled = false;
        botao.textContent = "Enviar imagem";
        if (url) {
          input.value = url;
          previa.src = url;
          mudar(url);
        }
      });

      controles.append(input, botao, arquivo);
      linha.append(previa, controles);
      return linha;
    },

    imagens(def, valor, mudar, id) {
      const lista = Array.isArray(valor) ? valor : [];
      if (!Array.isArray(valor)) mudar(lista);

      const caixa = criar("div");
      const galeria = criar("div", "galeria");
      const arquivo = document.createElement("input");
      arquivo.type = "file";
      arquivo.accept = "image/*";
      arquivo.multiple = true;
      arquivo.hidden = true;

      const desenhar = () => {
        galeria.innerHTML = "";
        lista.forEach((src, i) => {
          const item = criar("div", "galeria-item");
          const img = document.createElement("img");
          img.src = src;
          img.alt = `Imagem ${i + 1}`;
          item.appendChild(img);
          if (i === 0) item.appendChild(criar("span", "capa", "Capa"));
          const acoes = criar("div", "galeria-acoes");
          const acao = (texto, rotulo, fn, desativado) => {
            const b = criar("button", "", texto);
            b.type = "button";
            b.title = rotulo;
            b.setAttribute("aria-label", rotulo);
            if (desativado) b.hidden = true;
            b.addEventListener("click", () => {
              fn();
              mudar(lista);
              desenhar();
            });
            acoes.appendChild(b);
          };
          acao("←", "Mover para a esquerda", () => ([lista[i - 1], lista[i]] = [lista[i], lista[i - 1]]), i === 0);
          acao("→", "Mover para a direita", () => ([lista[i + 1], lista[i]] = [lista[i], lista[i + 1]]), i === lista.length - 1);
          acao("✕", "Remover imagem", () => lista.splice(i, 1));
          item.appendChild(acoes);
          galeria.appendChild(item);
        });

        const adicionar = criar("button", "galeria-adicionar");
        adicionar.type = "button";
        adicionar.id = id;
        adicionar.innerHTML = `<span style="font-size:22px">+</span><span>Enviar imagens</span>`;
        adicionar.addEventListener("click", () => arquivo.click());
        galeria.appendChild(adicionar);
      };

      arquivo.addEventListener("change", async () => {
        const arquivos = [...arquivo.files];
        arquivo.value = "";
        for (const f of arquivos) {
          const url = await enviarImagem(f);
          if (url) lista.push(url);
        }
        mudar(lista);
        desenhar();
      });

      const linhaUrl = criar("div", "galeria-url");
      const inputUrl = document.createElement("input");
      inputUrl.type = "text";
      inputUrl.placeholder = "Ou cole o link de uma imagem";
      inputUrl.setAttribute("aria-label", "Link de uma imagem");
      const botaoUrl = criar("button", "btn btn-pequeno", "Adicionar");
      botaoUrl.type = "button";
      botaoUrl.addEventListener("click", () => {
        const v = inputUrl.value.trim();
        if (!v) return;
        lista.push(v);
        inputUrl.value = "";
        mudar(lista);
        desenhar();
      });
      linhaUrl.append(inputUrl, botaoUrl);

      desenhar();
      caixa.append(galeria, linhaUrl, arquivo);
      return caixa;
    },

    lista(def, valor, mudar, id) {
      const itens = Array.isArray(valor) ? valor : [];
      if (!Array.isArray(valor)) mudar(itens);
      const caixa = criar("div", "lista");
      caixa.id = id;

      const desenhar = () => {
        caixa.innerHTML = "";

        itens.forEach((item, i) => {
          const det = document.createElement("details");
          det.className = "item" + (def.campos.length <= 1 ? " item-simples" : "");
          det.open = abertos.has(item);
          det.addEventListener("toggle", () => (det.open ? abertos.add(item) : abertos.delete(item)));

          const resumo = document.createElement("summary");
          const titulo = criar("span", "item-titulo");
          const amostras = criar("span", "item-amostras");
          const atualizarResumo = () => {
            titulo.textContent = def.tituloItem ? def.tituloItem(item, i) : `Item ${i + 1}`;
            if (def.amostras) {
              amostras.innerHTML = "";
              def.amostras(item).forEach((c) => {
                const s = criar("span");
                s.style.background = corValida(c) || "transparent";
                amostras.appendChild(s);
              });
            }
          };
          atualizarResumo();
          resumo.appendChild(titulo);
          if (def.amostras) resumo.appendChild(amostras);

          const acoes = criar("span", "item-acoes");
          const mover = (texto, rotulo, alvo) => {
            const b = criar("button", "", texto);
            b.type = "button";
            b.title = rotulo;
            b.setAttribute("aria-label", rotulo);
            b.disabled = alvo < 0 || alvo >= itens.length;
            b.addEventListener("click", (ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              [itens[alvo], itens[i]] = [itens[i], itens[alvo]];
              mudar(itens);
              desenhar();
            });
            acoes.appendChild(b);
          };
          mover("↑", "Mover para cima", i - 1);
          mover("↓", "Mover para baixo", i + 1);

          if (!def.fixa) {
            const remover = criar("button", "", "Remover");
            remover.type = "button";
            remover.disabled = itens.length <= (def.minimo || 0);
            botaoConfirmar(remover, "Confirmar", () => {
              itens.splice(i, 1);
              mudar(itens);
              desenhar();
            });
            acoes.appendChild(remover);
          }
          resumo.appendChild(acoes);
          det.appendChild(resumo);

          const corpo = criar("div", "item-corpo");
          corpo.appendChild(blocoCampos(def.campos, item));
          corpo.addEventListener("input", atualizarResumo);
          corpo.addEventListener("change", atualizarResumo);
          det.appendChild(corpo);

          caixa.appendChild(det);
        });

        if (!def.fixa) {
          const adicionar = criar("button", "btn lista-adicionar", "+ " + (def.textoAdicionar || "Adicionar"));
          adicionar.type = "button";
          adicionar.addEventListener("click", () => {
            const novo = def.novo(conteudo);
            itens.push(novo);
            abertos.add(novo);
            mudar(itens);
            desenhar();
          });
          caixa.appendChild(adicionar);
        }
      };

      desenhar();
      return caixa;
    },
  };

  // ---------- Imagens ----------
  async function enviarImagem(arquivo) {
    if (!arquivo.type.startsWith("image/")) {
      avisar(`"${arquivo.name}" não é uma imagem.`, true);
      return null;
    }
    if (arquivo.size > TAMANHO_MAX) {
      avisar(`"${arquivo.name}" passa de 5 MB. Diminua a imagem e tente de novo.`, true);
      return null;
    }
    const extensao = (arquivo.name.split(".").pop() || "img").toLowerCase().replace(/[^a-z0-9]/g, "") || "img";
    const base =
      arquivo.name
        .replace(/\.[^.]+$/, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "imagem";
    const caminho = `${Date.now().toString(36)}-${base}.${extensao}`;

    avisar("Enviando imagem…");
    const { error } = await cliente.storage
      .from(BUCKET)
      .upload(caminho, arquivo, { contentType: arquivo.type, cacheControl: "31536000" });
    if (error) {
      avisar("Não foi possível enviar a imagem: " + error.message, true);
      return null;
    }
    avisar("Imagem enviada. Clique em Salvar para publicar.");
    return cliente.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
  }

  // ---------- Backup ----------
  function desenharBackup() {
    cabecalhoPainel("Backup", "Guarde uma cópia de todo o conteúdo do site ou volte para uma versão anterior.");

    const bloco = (titulo, texto) => {
      const b = criar("div", "bloco-acao");
      b.appendChild(criar("h3", "", titulo));
      b.appendChild(criar("p", "", texto));
      painel.appendChild(b);
      return b;
    };

    const baixar = bloco("Baixar uma cópia", "Salva um arquivo .json com todos os textos, projetos e cores.");
    const botaoBaixar = criar("button", "btn", "Baixar cópia");
    botaoBaixar.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(conteudo, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `pk-site-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    });
    baixar.appendChild(botaoBaixar);

    const restaurar = bloco("Restaurar uma cópia", "Carrega um arquivo baixado antes. Depois clique em Salvar para publicar.");
    const arquivo = document.createElement("input");
    arquivo.type = "file";
    arquivo.accept = "application/json,.json";
    arquivo.hidden = true;
    const botaoRestaurar = criar("button", "btn", "Escolher arquivo");
    botaoRestaurar.addEventListener("click", () => arquivo.click());
    arquivo.addEventListener("change", async () => {
      const f = arquivo.files[0];
      arquivo.value = "";
      if (!f) return;
      try {
        conteudo = PK.dados.normalizar(JSON.parse(await f.text()));
        marcarAlterado();
        avisar("Cópia carregada. Clique em Salvar para publicar.");
      } catch (err) {
        avisar("Esse arquivo não é uma cópia válida do site.", true);
      }
    });
    restaurar.append(botaoRestaurar, arquivo);

    const original = bloco("Voltar ao conteúdo original", "Troca tudo pelo conteúdo de exemplo que veio com o site. Só vale depois de Salvar.");
    const botaoOriginal = criar("button", "btn btn-perigo", "Voltar ao original");
    botaoConfirmar(botaoOriginal, "Clique de novo para confirmar", () => {
      conteudo = PK.dados.normalizar(null);
      marcarAlterado();
      avisar("Conteúdo original carregado. Clique em Salvar para publicar.");
      desenharPainel();
    });
    original.appendChild(botaoOriginal);
  }

  // ---------- Salvar ----------
  function mensagemErro(erro) {
    const m = erro.message || "";
    if (erro.code === "42501" || /row-level security/i.test(m))
      return "Sua conta não tem permissão para salvar. Confira se o seu e-mail está na tabela admins (passo 4 do LEIA-ME).";
    if (/jwt|token/i.test(m)) return "Sua sessão expirou. Saia e entre de novo.";
    return "Não foi possível salvar: " + m;
  }

  async function salvar() {
    if (!conteudo) return;
    botaoSalvar.disabled = true;
    status.textContent = "Salvando…";
    const { error } = await cliente
      .from("site")
      .upsert({ id: 1, conteudo, atualizado_em: new Date().toISOString() });
    botaoSalvar.disabled = false;
    if (error) {
      status.textContent = "Erro ao salvar";
      status.classList.add("pendente");
      avisar(mensagemErro(error), true);
      return;
    }
    PK.dados.salvarCache(conteudo);
    marcarSalvo("Salvo às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    avisar("Salvo! O site já mostra as alterações.");
  }

  botaoSalvar.addEventListener("click", salvar);

  document.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "s" && !telas.editor.hidden) {
      ev.preventDefault();
      salvar();
    }
  });

  window.addEventListener("beforeunload", (ev) => {
    if (alterado) {
      ev.preventDefault();
      ev.returnValue = "";
    }
  });

  // ---------- Login e sessão ----------
  async function abrirEditor() {
    mostrar("carregando");
    const erroLogin = $("#login-erro");

    const { data: admin, error: erroAdmin } = await cliente.from("admins").select("email").maybeSingle();
    if (erroAdmin || !admin) {
      await cliente.auth.signOut();
      mostrar("login");
      erroLogin.textContent = erroAdmin
        ? "Não foi possível verificar sua conta: " + erroAdmin.message
        : "Essa conta não tem permissão para editar o site.";
      return;
    }

    const { data: linha, error } = await cliente.from("site").select("conteudo").eq("id", 1).maybeSingle();
    if (error) {
      mostrar("login");
      erroLogin.textContent = "Não foi possível carregar o conteúdo: " + error.message;
      return;
    }

    conteudo = PK.dados.normalizar(linha?.conteudo);
    desenharAbas();
    desenharPainel();
    if (linha) marcarSalvo("Tudo salvo");
    else {
      marcarAlterado();
      status.textContent = "Conteúdo de exemplo. Salve para publicar";
    }
    mostrar("editor");
  }

  $("#form-login").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const botao = $("#login-botao");
    const erro = $("#login-erro");
    erro.textContent = "";
    botao.disabled = true;
    botao.textContent = "Entrando…";
    const { error } = await cliente.auth.signInWithPassword({
      email: $("#login-email").value.trim(),
      password: $("#login-senha").value,
    });
    botao.disabled = false;
    botao.textContent = "Entrar";
    if (error) {
      erro.textContent = /invalid login/i.test(error.message)
        ? "E-mail ou senha incorretos."
        : "Não foi possível entrar: " + error.message;
      return;
    }
    $("#login-senha").value = "";
    await abrirEditor();
  });

  const botaoSair = $("#sair");
  botaoSair.addEventListener("click", async () => {
    if (alterado && !botaoSair.classList.contains("confirmando")) {
      botaoSair.classList.add("confirmando");
      botaoSair.textContent = "Sair sem salvar?";
      setTimeout(() => {
        botaoSair.classList.remove("confirmando");
        botaoSair.textContent = "Sair";
      }, 3000);
      return;
    }
    botaoSair.classList.remove("confirmando");
    botaoSair.textContent = "Sair";
    alterado = false;
    conteudo = null;
    await cliente.auth.signOut();
    mostrar("login");
  });

  // ---------- Início ----------
  async function iniciar() {
    if (!PK.dados.configurado()) return mostrar("config");

    if (!window.supabase?.createClient) {
      $("#tela-config h1").textContent = "Não foi possível carregar o painel";
      $("#tela-config p").textContent = "Verifique sua conexão com a internet e recarregue a página.";
      return mostrar("config");
    }

    cliente = window.supabase.createClient(PK.config.supabaseUrl, PK.config.supabaseChave);
    const { data } = await cliente.auth.getSession();
    if (data.session) await abrirEditor();
    else mostrar("login");
  }

  iniciar();
})();
