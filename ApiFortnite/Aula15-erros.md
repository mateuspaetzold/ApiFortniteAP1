# Aula 15 - Erros, exceções e middleware

## 1. Por que um ID inexistente não deve virar exceção?
Um ID que não existe é apenas uma busca que não encontrou nada, não é um erro grave do sistema. Se a gente lançar uma exceção para isso, a API retorna erro 500, parecendo que quebrou toda. O certo é responder com um 404 (Not Found), avisando que aquele item não está lá.

## 2. Que informação não deve ser devolvida na mensagem pública?
Não devemos devolver a mensagem original do erro (a exceção) e nem os detalhes técnicos, como o caminho das pastas do projeto ou o nome das tabelas do banco. Essas informações podem dar pistas para pessoas mal-intencionadas tentarem invadir o sistema. O usuário final só precisa saber que deu erro e que deve tentar mais tarde.

## 3. Onde o middleware foi colocado?
Coloquei o `UseExceptionHandler` no `Program.cs`, logo depois do `var app = builder.Build();` e antes das rotas. Dessa forma, ele funciona como uma proteção que captura os erros de tudo o que vem depois dele.

## Testes Realizados
- **Antes do middleware:** Rodei no modo Development e a rota de teste mostrou o erro 500 com toda aquele texto técnico gigante na tela.
- **Depois do middleware:** Rodei no modo Production. A mesma rota deu erro 500, mas agora mostrou apenas o JSON limpo com a mensagem genérica.
- **Teste de ID inexistente:** Busquei um item com ID 999 e a API continuou respondendo com o 404 normal. O middleware não atrapalhou.