# Astronáutica

Planner pessoal gamificado, inspirado na Argonáutica: convés do dia (rota, foco, prioridades, faixas de horário), expedição (projetos), biblioteca (concurso, idiomas, runas), porão (ficha antiga) e tesouro (finanças).

## Estrutura

O app continua sem etapa de build e funciona aberto direto no navegador. Cada área tem o seu arquivo:

- `index.html`: só a casca — o HTML das telas e a lista de estilos e scripts, na ordem em que carregam.
- `css/`: estilos dos componentes, na ordem da cascata (01 a 04).
- `temas/`: tudo o que muda de um tema para outro.
  - `paleta-base.css`: escala, modo claro e as quatro cores por área.
  - `motor.js`: aplica o tema escolhido (rótulos, abas, níveis e seletor de tema).
  - `astronautica.css` e `astronautica.js`: o tema Astronáutica (paleta do acampamento, nomes das abas, rótulos, níveis e frase de abertura).
- `js/`: o script, um arquivo por área.
  - `00-fila.js`: a fila de abertura (ver abaixo).
  - `01-nucleo.js`: estado `S`, constantes, normalização e gravação.
  - `02` a `04`: captura, hábitos e projetos; cronômetro e progresso; painel de línguas.
  - `05` a `09`: fluxo operacional; nuvem (Supabase); cabeçalho; concurso; gamificação.
  - `10-acampamento.js`: ficha do campista, rotina, cofre, cartões, painel direito e planner.
  - `11` e `12`: Tesouro (moldes e ponte do AxisHub; a função `AXRUN`).
  - `13` a `16`: painéis nativos; estudos e Eumátheia; caixa da extensão; abertura e início.
  - `99-inicio.js`: executa a fila de abertura.
- `assets/img/` e `assets/fontes/`: imagens e fontes que antes ficavam embutidas no código.
- `supabase/migrations/`: a tabela `vertice_estado`, com RLS (cada usuário só vê a própria linha).

### Fila de abertura

Os scripts compartilham o mesmo escopo global. Cada módulo declara as suas funções e põe na fila, com `aoIniciar(function(){ ... })`, o que precisa rodar quando o app abre. O `99-inicio.js` executa a fila na ordem, depois que todos os arquivos carregaram. Assim qualquer módulo pode usar funções de outro, mesmo que ele carregue depois. Código novo que roda na abertura vai dentro de `aoIniciar`; funções e constantes ficam fora.

### Novo tema

Para criar outro tema (Hotel Valhala, Casa do Brooklyn):

1. Copie `temas/astronautica.js` para `temas/<nome>.js` e troque `TEMAS.astro=` pela chave nova (por exemplo, `TEMAS.valhala=`) e os textos.
2. Copie `temas/astronautica.css` para `temas/<nome>.css` e troque `[data-skin="astro"]` pela chave nova e as cores. Ainda há cerca de 70 regras `[data-skin="astro"]` dentro de `css/03-tesouro-e-paineis.css` e `css/04-acampamento-cartoes.css`. Elas ficaram no lugar para não mudar a ordem da cascata; a próxima etapa é trazê-las para o arquivo do tema, conferindo tela a tela.
3. Acrescente as duas linhas no `index.html`, logo depois das do tema Astronáutica.
4. Em `temas/motor.js`, `apTema()` ainda devolve sempre `astro`, e a `normaliza` força `S.ap` para `astro`. Para o seletor passar a valer, as duas precisam aceitar a chave nova. O seletor aparece sozinho quando houver dois temas registrados.

## Dados

- Sem login, o registro fica no navegador (localStorage, chave `arquivo-sigma-vertice-v2`).
- Com login, cada gravação também vai para o Supabase. Ao abrir em outro aparelho, o app compara as versões: baixa o que mudou na nuvem, envia o que mudou no aparelho e, se os dois mudaram, fica o mais recente e o outro vira cópia local (`arquivo-sigma-vertice-v2-conflito`).
- A URL do projeto e a chave publicável do Supabase ficam em `js/06-nuvem.js` (variável `NUVEM`). A chave publicável é pública por natureza; quem protege os dados é a RLS.

## Publicação

O projeto na Vercel está ligado a este repositório: cada push na `main` publica sozinho. Não há etapa de build.

## Tesouro (finanças)

- `financas.html` é o AxisHub (WeekHub, FinanceHub, Mapa, Saúde, Projetos), aberto na aba **05 / Tesouro** direto no FinanceHub.
- A versão publicada começa vazia. Os dados entram pelo botão **Importar** (backup JSON) e sobem para o Supabase nas colunas `financas` e `fin_ts`, com relógio próprio.
- Nunca coloque backups de finanças neste repositório.

## Extensão do Chrome (`extensao/`)

- Instalar: `chrome://extensions` → ativar **Modo do desenvolvedor** → **Carregar sem compactação** → escolher a pasta `extensao`.
- Atalho: **Alt+Shift+A** abre o registro rápido.
- Faz: captura (vai para o Cérebro), timer de foco de 25 ou 50 min com aviso no fim, +1 copo d'água, marcar hábitos e as três prioridades do dia, registrar gasto (vai para o Tesouro), aviso no começo de cada faixa da grade (06, 09, 12, 15, 18 e 21h).
- Como conversa com o app: entra na mesma conta do Supabase, lê só grade, hábitos, prioridades e água, e deposita eventos na tabela `vertice_inbox`. O app aplica os eventos e os apaga. A extensão nunca regrava o registro inteiro.
- Sem rede, os eventos ficam guardados e saem sozinhos a cada 5 minutos.
- Em `extensao/api.js`, `CFG.app` recebe o endereço do site publicado para mostrar o botão "abrir o app".
