# Aula 14 - Erros, exceções e middleware

## 1. Onde o middleware foi colocado
O middleware `UseExceptionHandler` foi colocado no `Program.cs` logo após o `builder.Build()`, antes dos arquivos estáticos e das rotas, garantindo que ele envolva toda a execução da API.

## 2. Resultado do teste temporário
- **Método:** GET
- **Rota:** `/api/teste-erro`
- **Status:** 500 Internal Server Error
- **Corpo da resposta:** `{"mensagem":"Ocorreu um erro interno. Tente novamente mais tarde."}`
*Nota: A mensagem real da exceção ("Falha simulada para teste.") foi ocultada com sucesso.*

## 3. Resultado do teste com ID inexistente
- **Método:** GET
- **Rota:** `/api/itens/999`
- **Status:** 404 Not Found
*Nota: O erro esperado (não encontrado) continuou funcionando normalmente, sem ser convertido em erro 500 pelo middleware.*

## 4. Por que não enviar a mensagem bruta da exceção?
Não devemos enviar a mensagem bruta porque ela pode expor detalhes internos da aplicação, como caminhos de pastas, nomes de tabelas do banco e falhas de lógica. O cliente precisa de uma resposta amigável e o desenvolvedor precisa do log interno seguro para investigar.