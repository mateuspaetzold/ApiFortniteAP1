var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var itens = new List<Item>
{
    new Item(1, "Picareta de Batalha", "Ferramenta", true),
    new Item(2, "Escudo Potente", "Consumível", true)
};

app.MapGet("/", () => "API de Itens do Fortnite está no ar!");

app.MapGet("/api/itens", () =>
{
    return Results.Ok(itens);
});

app.MapGet("/api/itens/{id}", (int id) =>
{
    var item = itens.Find(i => i.Id == id);

    if (item == null)
    {
        return Results.NotFound(new { mensagem = "Item não encontrado." });
    }

    return Results.Ok(item);
});

app.MapPost("/api/itens", (ItemEntrada dados) =>
{
    if (string.IsNullOrWhiteSpace(dados.Nome))
    {
        return Results.BadRequest(new { mensagem = "O nome é obrigatório." });
    }

    int novoId = itens.Count + 1;
    var novoItem = new Item(novoId, dados.Nome, dados.Tipo, true);

    itens.Add(novoItem);

    return Results.Created($"/api/itens/{novoItem.Id}", novoItem);
});

app.MapPut("/api/itens/{id}", (int id, ItemEntrada dados) =>
{
    if (string.IsNullOrWhiteSpace(dados.Nome))
    {
        return Results.BadRequest(new { mensagem = "O nome é obrigatório." });
    }

    var item = itens.Find(i => i.Id == id);

    if (item == null)
    {
        return Results.NotFound(new { mensagem = "Item não encontrado." });
    }

    var itemAtualizado = new Item(id, dados.Nome, dados.Tipo, true);
    int posicao = itens.IndexOf(item);
    itens[posicao] = itemAtualizado;

    return Results.Ok(itemAtualizado);
});

app.MapDelete("/api/itens/{id}", (int id) =>
{
    var item = itens.Find(i => i.Id == id);

    if (item == null)
    {
        return Results.NotFound(new { mensagem = "Item não encontrado." });
    }

    itens.Remove(item);

    return Results.NoContent();
});

app.Run();

record Item(int Id, string Nome, string Tipo, bool Disponivel);
record ItemEntrada(string Nome, string Tipo);