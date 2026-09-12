# Fase 1.15-0 — Contratos e Regras

Piloto oficial: **Avaliação Atuarial**
Data: 2026-09-11
Branch: `refatoracao/paginas-fixas`
Checkpoint de referência: `1aafad2` / tag `checkpoint-pre-refatoracao-paginas-fixas-2026-09-11`

---

## 1. Objetivo

Definir formalmente, **antes da implementação**, o contrato de dados e as regras de
comportamento que a consulta documental de Avaliação Atuarial deve cumprir, de modo que:

- a mesma página atenda a todos os exercícios, sem duplicação estrutural;
- os dados fiquem separados da apresentação;
- a origem dos dados possa ser substituída futuramente (integração FAC) sem reconstruir o layout;
- nenhuma URL antiga seja removida ou redirecionada nesta fase.

Esta fase **não** decide framework, **não** cria backend e **não** inicia centralização de
header, menu, sidebar, footer, CSS ou JS globais (isso pertence à Fase 1.15-2).

### Origem dos dados utilizados

Todo o conteúdo do contrato foi extraído **exclusivamente** do HTML já existente em
`investimentos-avaliacao-atuarial.html` (estado do checkpoint `1aafad2`). Nada foi inventado.

O que existe de real no projeto hoje:

- 10 exercícios listados como cards: 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016;
- o card 2025 é o único com a classe `act` e o rótulo `Vigente`;
- todos os cards de exercício apontam para `href="#"` (sem destino real);
- 2 documentos na lista:
  - `Avaliação Atuarial — Exercício 2024` · meta `Publicada em 2024 · Atuário habilitado` · selo `Vigente`
  - `Avaliação Atuarial — Exercício 2023` · meta `Publicada em 2023` · selo `Anterior`
- ambos os documentos apontam para `href="#"`;
- **não existe nenhum arquivo PDF/DOC/XLS no repositório** — os links são placeholders.

Derivação declarada (não é invenção, é leitura literal do título institucional):
o documento cujo título termina em `Exercício 2024` pertence ao exercício `2024`, e o que
termina em `Exercício 2023` pertence ao exercício `2023`. Os demais exercícios ficam **sem
documento**, o que é a representação honesta do que existe no projeto — não se cria documento
para exercício que não tem documento.

---

## 2. Contrato de dados

O contrato é composto por três entidades: **assunto**, **exercício** e **documento**.

### 2.1 Assunto

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `id` | string (slug) | sim | Identificador estável. Piloto: `avaliacao-atuarial` |
| `nome` | string | sim | Rótulo institucional. Piloto: `Avaliação Atuarial` |
| `exercicioPadrao` | string \| null | não | Quando ausente, aplica-se a regra 3.2 |

### 2.2 Exercício

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `exercicio` | string `AAAA` | sim | Chave do exercício. É o valor usado na URL |
| `vigente` | boolean | sim | No máximo um exercício vigente por assunto |
| `rotulo` | string \| null | não | Rótulo alternativo; quando nulo usa-se `exercicio` |

### 2.3 Documento

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `id` | string | sim | Identificador estável do documento |
| `assunto` | string (slug) | sim | Chave estrangeira para o assunto |
| `exercicio` | string `AAAA` | sim | Chave estrangeira para o exercício |
| `titulo` | string | sim | Título exibido |
| `arquivo` | string \| null | sim (pode ser nulo) | URL/caminho do arquivo. Hoje `null` — não há arquivo real |
| `tipo` | string \| null | não | Tipo/categoria. Piloto: `relatorio` |
| `dataDocumento` | string \| null | não | Data do documento. **Não existe no projeto hoje** → `null` |
| `dataPublicacao` | string \| null | não | Hoje só o ano está disponível (`"2024"`, `"2023"`) |
| `descricao` | string \| null | não | Metadado complementar. Ex.: `Atuário habilitado` |
| `situacao` | `vigente` \| `anterior` \| `null` | não | Alimenta o selo visual (`Vigente` / `Anterior`) |

### 2.4 Regras do contrato

1. A linha de metadados exibida é **derivada**, nunca armazenada pronta:
   `Publicada em {dataPublicacao}` + (se houver `descricao`) `" · " + descricao`.
   Isso reproduz exatamente o texto atual sem duplicar informação.
2. `arquivo` nulo ou vazio **não** pode gerar um link quebrado: o documento é exibido com o
   botão de download desabilitado e rotulado como indisponível.
3. Um exercício sem nenhum documento é um estado **válido** (estado "vazio"), não um erro.
4. Nenhum campo institucional pode ser preenchido por inferência. Campo sem dado real = `null`.

---

## 3. Regra de URL

A seleção de exercício é representada por um parâmetro de consulta:

```
piloto-investimentos-avaliacao-atuarial.html?exercicio=AAAA
```

### 3.1 Formato aceito

O parâmetro é válido quando, após remoção de espaços nas bordas, casa com `^\d{4}$`
**e** corresponde a um exercício existente na lista de exercícios do assunto.

### 3.2 Comportamento por situação

| Situação | Comportamento | URL resultante |
|---|---|---|
| Acesso **sem** parâmetro | Abre o exercício padrão: o marcado como `vigente`; não havendo vigente, o mais recente | URL preservada como está (sem parâmetro). Não há reescrita |
| Parâmetro **válido e existente** | Abre esse exercício | Inalterada |
| Parâmetro **inválido** (vazio, não numérico, formato errado) | Abre o exercício padrão + aviso visível não bloqueante | Normalizada para o exercício padrão via `replaceState` |
| Exercício **inexistente** (ex.: `2015`, numérico mas fora da lista) | Abre o exercício padrão + aviso visível não bloqueante | Normalizada para o exercício padrão via `replaceState` |
| Usuário **troca** de exercício | Renderiza o novo exercício sem recarregar | `pushState` com `?exercicio=AAAA` |
| Usuário clica no exercício **já selecionado** | Nada muda | Sem novo registro de histórico |
| **Reload** | Reexecuta a leitura da URL e restaura o mesmo exercício | Inalterada |

**Motivo do `replaceState` no caso inválido:** normaliza a URL sem criar um registro de
histórico para um endereço inválido — assim o botão Voltar não devolve o usuário ao erro.

**Motivo de não reescrever a URL no acesso sem parâmetro:** a URL curta continua sendo um
endereço válido e estável para o assunto, e o Voltar não ganha um passo artificial.

### 3.3 Aviso de parâmetro inválido

O aviso é informativo, aparece na área de conteúdo, não impede a leitura dos documentos e não
usa `alert()`. Texto: indica o valor recebido e qual exercício foi aberto no lugar.

---

## 4. Regra de histórico

| Ação | Comportamento exigido |
|---|---|
| Selecionar exercício | `history.pushState({exercicio}, '', '?exercicio=AAAA')` |
| **Voltar** | `popstate` → relê a URL atual e restaura o exercício correspondente |
| **Avançar** | `popstate` → idem |
| **Reload** | Leitura inicial da URL (mesma função usada pelo `popstate`) |
| **URL compartilhada** | Abre diretamente no exercício informado |

Regras:

1. A URL é a **única fonte de verdade** do exercício selecionado. Nenhum estado de exercício é
   mantido fora dela. O `state` do `pushState` é redundante por segurança, nunca autoritativo.
2. `popstate` **nunca** empurra novo estado (evita laço de histórico).
3. A mesma função de aplicação é usada na carga inicial, no `popstate` e no clique — um único
   caminho de código, sem divergência de comportamento.
4. Se a `History API` não estiver disponível, a navegação degrada para navegação normal por
   link (os cards são `<a href="?exercicio=AAAA">` reais).

---

## 5. Comportamento de parâmetros inválidos (resumo normativo)

A página **não pode quebrar** em nenhuma destas entradas:

- `?exercicio=` (vazio)
- `?exercicio=abc`
- `?exercicio=20`
- `?exercicio=99999`
- `?exercicio=2015` (formato válido, exercício inexistente)
- `?exercicio=2024&exercicio=2023` (repetido — vale a primeira ocorrência, conforme `URLSearchParams.get`)
- `?exercicio=%zz` (sequência percent-encoding malformada — leitura protegida por `try/catch`)
- ausência de `URLSearchParams` no navegador (fallback de parsing manual)

Em todos os casos: exercício padrão + aviso + URL normalizada. Nunca erro de JavaScript.

---

## 6. Compatibilidade futura

Nesta fase **nenhuma URL é removida ou redirecionada**.

- `investimentos-avaliacao-atuarial.html` permanece intacta e publicada.
- O piloto vive em `piloto-investimentos-avaliacao-atuarial.html`.

Estratégia registrada para consolidações futuras (apenas documentada, **não executada**):

1. A URL canônica futura do assunto passa a ser a página única com `?exercicio=AAAA`.
2. Páginas antigas por ano/assunto, quando existirem, permanecem publicadas e passam a
   apontar para a URL canônica — preferencialmente por `<link rel="canonical">` e link
   institucional no corpo, **sem** remover o arquivo.
3. Redirecionamento só pode ser considerado quando houver hospedagem que o suporte.
   GitHub Pages é **ambiente provisório de validação**, não requisito da arquitetura
   definitiva — e não suporta redirecionamento de servidor. A hospedagem definitiva será
   definida posteriormente, em conjunto com a FAC (`vercel.json` já existe no diretório de
   trabalho, mas nenhuma decisão de hospedagem foi tomada nesta fase). Enquanto o ambiente
   em uso não oferecer redirecionamento, a regra é **manter o arquivo antigo**, não
   redirecionar.
4. Nenhuma URL existente pode deixar de responder em consequência da refatoração.

---

## 7. Separação dados / apresentação

Três camadas, em arquivos distintos:

```
dados-avaliacao-atuarial.js     -> DADOS        (somente conteúdo, zero HTML)
piloto-avaliacao-atuarial.js    -> LÓGICA       (resolução de URL, filtro, render em string)
piloto-...-atuarial.html        -> APRESENTAÇÃO (estrutura, CSS, pontos de montagem)
```

### 7.1 Camada de dados

- Arquivo estático, sem framework, sem `fetch` (compatível com GitHub Pages **e** com abertura
  direta via `file://`, o que permite conferência local sem servidor).
- Expõe um único objeto: `window.IPREMB_DADOS_AVALIACAO_ATUARIAL` com `assunto`,
  `exercicios[]` e `documentos[]`, exatamente conforme a seção 2.
- Não contém nenhuma marcação HTML, classe CSS, ícone ou texto de interface.

### 7.2 Camada de lógica

- Funções **puras** (sem DOM) responsáveis por: ler o parâmetro, resolver o exercício efetivo,
  filtrar documentos, derivar a linha de metadados e **gerar as strings de HTML** de cada
  estado.
- Uma camada fina de ligação com o DOM apenas atribui as strings e registra os eventos.
- Consequência prática: todo o comportamento é testável fora do navegador.

### 7.3 Ponto de substituição pela FAC

A obtenção dos dados é isolada num único provedor que devolve uma `Promise`:

```
carregarDados() -> Promise<{assunto, exercicios, documentos}>
```

Hoje resolve a partir do arquivo estático. Para integrar a FAC no futuro, substitui-se
**somente o corpo desse provedor** por uma chamada de rede que devolva o mesmo contrato da
seção 2. Nenhuma alteração de HTML, CSS ou de lógica de apresentação será necessária.

É por isso que os estados de carregamento e de erro existem **desde agora**, mesmo com dados
estáticos: a arquitetura já opera de forma assíncrona.

---

## 8. Critérios que o piloto deverá cumprir

O piloto da Fase 1.15-1 só é considerado concluído se atender a todos os itens:

| # | Critério |
|---|---|
| 1 | Cards de exercício **gerados a partir dos dados**, sem bloco HTML manual por exercício |
| 2 | Card ativo em azul-escuro e destacado visualmente |
| 3 | Estado ativo identificável **além da cor** (`aria-current`, texto e ícone) |
| 4 | Dados fora da estrutura de apresentação, em arquivo próprio |
| 5 | Seleção atualiza `?exercicio=AAAA` e a URL é compartilhável |
| 6 | Reload restaura o exercício da URL |
| 7 | Acesso direto com exercício válido abre esse exercício |
| 8 | Voltar e Avançar funcionam via `popstate` |
| 9 | Parâmetro inválido e exercício inexistente não quebram a página |
| 10 | Operação completa por teclado, com foco visível |
| 11 | Região de resultado anunciada a tecnologia assistiva (`aria-live="polite"`) |
| 12 | Quatro estados distintos: carregando, conteúdo, vazio, erro |
| 13 | Sem erros de JavaScript no console |
| 14 | Documento sem arquivo real não gera link quebrado |
| 15 | Responsivo em desktop, largura intermediária e mobile, sem quebra de layout |
| 16 | Header, menu, breadcrumb, sidebar, footer, busca e botão WhatsApp preservados |
| 17 | Nenhum framework, nenhum backend, nenhuma dependência nova |
| 18 | `investimentos-avaliacao-atuarial.html` permanece inalterada |
