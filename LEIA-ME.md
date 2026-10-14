# Portfólio PK

Site de portfólio com painel administrativo. O site é só arquivos (HTML, CSS e JS); os textos, projetos, imagens e cores ficam salvos no Supabase e são editados pelo painel em `admin.html`.

## Estrutura

```
index.html              o site (a página é montada pelo js/site.js)
admin.html              o painel de edição (login)
css/site.css            visual do site
css/admin.css           visual do painel
js/config.js            URL e chave do Supabase  ← você preenche
js/conteudo-padrao.js   conteúdo inicial / de exemplo
js/dados.js             funções compartilhadas (leitura, segurança, cache)
js/site.js              monta as seções do site
js/esquema.js           define os campos de cada aba do painel
js/admin.js             login, editor e upload de imagens
supabase/setup.sql      cria as tabelas e as regras de acesso
assets/                 logos e imagens de exemplo
```

## Configurar o painel (uma vez só, uns 10 minutos)

### 1. Criar o projeto no Supabase
1. Entre em **supabase.com** e crie uma conta grátis.
2. Clique em **New project**, dê um nome (ex: `portfolio`), crie uma senha do banco (guarde, mas você não vai usar no site) e escolha a região **South America (São Paulo)**.
3. Espere o projeto terminar de criar.

### 2. Rodar o setup
1. Abra o arquivo `supabase/setup.sql` e, na última linha, troque `SEU-EMAIL-AQUI` pelo e-mail que você vai usar no login.
2. No Supabase, vá em **SQL Editor** (menu da esquerda), clique em **New query**, cole o conteúdo inteiro do arquivo e clique em **Run**.
3. Deve aparecer "Success. No rows returned".

### 3. Criar seu usuário
1. Vá em **Authentication → Users → Add user → Create new user**.
2. Use o **mesmo e-mail** do passo anterior, crie uma senha e marque **Auto Confirm User**.
3. Ainda em Authentication, vá em **Sign In / Providers** (ou **Settings**) e **desligue "Allow new users to sign up"**. Assim ninguém mais consegue criar conta.

### 4. Ligar o site ao Supabase
1. Vá em **Project Settings → API** (ou no botão **Connect** no topo).
2. Copie a **Project URL** e a chave **anon / publishable**.
3. Cole as duas em `js/config.js`:

```js
PK.config = {
  supabaseUrl: "https://abcdefgh.supabase.co",
  supabaseChave: "eyJhbGciOi...",
};
```

> Nunca use a chave **service_role / secret** no site. A chave anon é pública por natureza: quem protege os dados são as regras do `setup.sql`.

### 5. Primeiro acesso
1. Abra `admin.html`, entre com seu e-mail e senha.
2. O painel abre com o conteúdo de exemplo. Edite o que quiser e clique em **Salvar** (ou Ctrl+S).
3. Abra o site: ele já mostra o que você salvou.

## Usando o painel

- **Geral**: nome, título da aba, descrição para o Google e fontes.
- **Seções**: ordem das seções e quais aparecem.
- **Início, Projetos, Sobre, Contato, Rodapé**: todos os textos, links e imagens.
- **Cores e logos**: cada tema tem uma logo e 13 cores. Clicar na logo do site passa para o próximo tema. Dá pra adicionar, remover e reordenar temas.
- **Backup**: baixar uma cópia de tudo, restaurar uma cópia ou voltar ao conteúdo original.

Imagens enviadas pelo painel ficam no Supabase (limite de 5 MB por imagem).

## Colocar online

Arraste a pasta inteira em **app.netlify.com/drop**. O painel fica em `seu-site.netlify.app/admin.html`.

Depois de configurado, você não precisa subir os arquivos de novo para mudar o conteúdo: é só editar pelo painel. Só precisa subir de novo se mudar o código (CSS/JS).

## Para desenvolvedores: adicionar coisas

- **Novo campo editável**: adicione uma linha na aba certa em `js/esquema.js` e use o valor em `js/site.js`. Se quiser um valor inicial, coloque em `js/conteudo-padrao.js`.
- **Nova seção**: crie o bloco em `SECOES` no `js/site.js` (`html` e, se precisar, `montar`), adicione o id em `secoes` no `conteudo-padrao.js` e crie a aba no `esquema.js`.
- **Nova cor de tema**: adicione a chave em `cores` no `conteudo-padrao.js`, em `CORES_TEMA` no `esquema.js` e use a variável CSS no `site.css` (a chave `minhaCor` vira `--minha-cor`).
