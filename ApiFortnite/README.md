# API de Itens do Fortnite

**Aluno:** Mateus Bandeira Paetzold
**Tema:** Catálogo de Itens do Fortnite
**Objetivo:** API REST e interface web para gerenciar o inventário de itens do jogo Fortnite, com persistência em banco de dados SQLite.

## Tecnologias
- .NET 10 SDK
- ASP.NET Core (Minimal API)
- Entity Framework Core com SQLite
- HTML, CSS e JavaScript puro
- Bruno (testes de API)

## Como preparar o banco e executar o projeto

1. Abra o terminal na pasta do projeto:
   ```bash
   cd ApiFortnite
   ```

2. Restaure as dependências:
   ```bash
   dotnet restore
   ```

3. Aplique as migrations para criar o banco:
   ```bash
   dotnet ef database update
   ```

4. Rode a API:
   ```bash
   dotnet run --urls http://localhost:5050
   ```

5. Abra a interface no navegador:
   ```
   http://localhost:5050/
   ```

## Endpoints da API

| Método | Rota | Descrição | Status esperado |
|--------|------|-----------|-----------------|
| GET | `/api/itens` | Lista todos os itens | 200 OK |
| GET | `/api/itens/{id}` | Busca um item pelo id | 200 OK ou 404 |
| POST | `/api/itens` | Cadastra um novo item | 201 Created |
| PUT | `/api/itens/{id}` | Atualiza um item existente | 200 OK ou 404 |
| DELETE | `/api/itens/{id}` | Remove um item | 204 No Content ou 404 |

### Exemplo de JSON para POST e PUT

```json
{
  "nome": "Rifle de Assalto",
  "tipo": "Arma",
  "disponivel": true
}
```

## Estrutura do projeto
- `Program.cs` — configuração, rotas, Model `ItemEntity` e `ApiDbContext`
- `wwwroot/` — interface (HTML, CSS e JavaScript)
- `bruno/` — Collection do Bruno com os testes das rotas
- `Migrations/` — migrations do Entity Framework Core

## Testes com Bruno
A Collection do Bruno está na pasta `bruno/` do projeto. Ela contém as requisições de GET da lista, GET por id, POST, PUT, DELETE e uma requisição extra para confirmar o 404 depois da exclusão.

## Observação sobre os dados
O banco SQLite é armazenado em um arquivo local (`.db`). Em uma instalação nova, execute `dotnet ef database update` para criar o banco e aplicar as migrations existentes. O arquivo local do banco **não é versionado** no Git.

## Vídeo de demonstração — AP2
https://youtu.be/Cr5pAXUJWlg