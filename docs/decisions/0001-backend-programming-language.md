---
status: Accepted
date: 2024-01-01
deciders: Daniel
---

# Backend Programming Language

## Context and Problem Statement

Qual linguagem devo usar no backend?

## Considered Options

- [Go](https://go.dev/)
- [Node.js](https://node.js.org/pt-br)
- [Bun](https://bun.sh/)
- [C#](https://dotnet.microsoft.com/en-us/)

## Decision Outcome

A primeira linguagem utilizada para o backend foi **Go**, uma linguagem que eu sempre quis experimentar em um projeto de API.

A decisão surgiu depois de assistir a alguns minicursos sobre Go na internet. A partir deles, decidi adaptar o que havia aprendido a algumas ideias que já estavam na minha cabeça, como:

- separar as operações (casos de uso) da interface de entrada e saída com o usuário (HTTP/CLI);
- normalizar erros;
- fazer testes end-to-end - poderia utilizar Postman, mas decidi criar um repositório separado e fazer chamadas HTTP com Axios.

Não me lembro exatamente de todos os detalhes, mas acredito que nesse curso foi apresentado o uso da maioria das bibliotecas que utilizo no backend, como `jackc/tern` para gerenciar alterações no banco de dados, `go-chi/chi` para mapear o roteamento HTTP, `x/crypto` para criptografar as senhas dos usuários e `dgrijalva/jwt-go` para criar tokens de acesso JWT.

Como sempre trabalhei com Node.js, eu já estava familiarizado com a maioria dos conceitos e requisitos necessários para desenvolver uma API. Algumas vezes me perguntava: "E como faço isso em Go? Será que existe uma biblioteca para isso?" Em outras, pensava em quando finalmente utilizaria `channels` ou `goroutines`. Eu já conhecia esses recursos por ter realizado o [Advent of Code](https://adventofcode.com/) de 2016 em Go ([aoc2016](https://github.com/danielbom/advent-of-code/tree/main/2016)).

A API em **C#** surgiu quando comecei a assistir a muitos vídeos do [Zoran Horvat no YouTube](https://www.youtube.com/@zoran-horvat). Fiquei fascinado pelo LINQ e pela forma como a linguagem me parecia um Java mais direto ao ponto. No entanto, é uma relação que teve seus altos e baixos.

Já o **Node.js** surgiu da vontade de experimentar novas ideias. Algumas delas vieram do [Igniter JS](https://github.com/niccdevs/igniter-js), apresentado em alguns vídeos do canal [Vibe Dev](https://www.youtube.com/@vibedev.official/) no YouTube.

A ideia de um template para o desenvolvimento rápido de APIs me pareceu muito interessante. Na época, eu estava interessado em _spec-driven development_ e tive a ideia de adicionar uma etapa de geração de código a partir de uma especificação OpenAPI.

Isso agilizou e padronizou tanto o meu trabalho que passei a acreditar que replicar a mesma abordagem em outro runtime de JavaScript, como Deno ou **Bun**, não seria um grande desafio.

O escolhido foi o **Bun**, e essa nova implementação do backend acabou sendo praticamente _plug and play_. Copiei todos os casos de uso e suas dependências para o novo diretório e implementei apenas a camada de roteamento e a configuração básica do servidor.

Simples assim.

Bem, foi necessário embrulhar a requisição em um _adapter_, mas isso também não representou nenhum um problema. A maior parte da lógica pôde permanecer independente da implementação HTTP.

Cada linguagem e runtime utilizados contribuíram para chegar ao estado atual da API: uma interface bastante resiliente e determinística.

Como eu sou o único desenvolvedor e também o único "usuário" do sistema, ou seja, não havia clientes ou outras pessoas para sugerir mudanças e impulsionar o projeto, ficava muito motivado quando uma nova implementação me obrigava a escrever mais testes e revelava inconsistências existentes.

Esse processo acabou sendo importante para alcançar um nível maior de consistência entre as diferentes implementações. Para isso, porém, precisei abrir mão de algumas funcionalidades oferecidas pelos frameworks.

Um exemplo foi a tentativa de evitar o uso excessivo de _middlewares_. Percebi que, quanto mais direto era o fluxo do código, mais fácil era determinar seu comportamento. Os _middlewares_ são convenientes, mas adicionam camadas de abstração que podem ocultar comportamentos e fazer com que implementações equivalentes apresentem diferenças sutis.

### Consequências

A decisão de não ficar preso a uma única linguagem ou framework acabou sendo menos sobre escolher "a melhor linguagem" e mais sobre definir uma arquitetura que pudesse sobreviver à troca da camada de infraestrutura.

O principal resultado foi uma separação mais rígida entre os casos de uso e os detalhes de implementação. HTTP, roteamento, autenticação, banco de dados e demais recursos específicos do runtime passaram a ser tratados como detalhes externos.

Isso tornou possível implementar a mesma API em diferentes linguagens e runtimes sem precisar reescrever sua lógica de negócio.

Por outro lado, essa abordagem também tem um custo: parte das conveniências oferecidas pelos frameworks precisa ser conscientemente abandonada para preservar esse nível de independência. A arquitetura fica menos idiomática em alguns contextos e exige mais disciplina para manter as fronteiras entre as camadas.

No fim, a escolha de Go foi o ponto de partida, mas a principal decisão arquitetural foi outra: **a linguagem do backend não deveria determinar a estrutura da aplicação**.
