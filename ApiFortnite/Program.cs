using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

var itens = new List<Item>
{
    new Item(1, "Picareta de Batalha", "Ferramenta", true),
    new Item(2, "Escudo Potente", "Consumível", true)
};

app.MapGet("/", () => "API de Itens do Fortnite está no ar!");

// ✅ AULA 10 - GET lista usando o banco
app.MapGet("/api/itens", async (ApiDbContext db) =>
    await db.Itens.ToListAsync());

app.MapGet("/api/itens/{id}", (int id) =>
{
    var item = itens.Find(i => i.Id == id);

    if (item == null)
    {
        return Results.NotFound(new { mensagem = "Item não encontrado." });
    }

    return Results.Ok(item);
});

// ✅ AULA 10 - POST gravando no banco
app.MapPost("/api/itens", async (ItemEntity dados, ApiDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(dados.Nome))
    {
        return Results.BadRequest(new { mensagem = "O nome é obrigatório." });
    }

    db.Itens.Add(dados);
    await db.SaveChangesAsync();

    return Results.Created($"/api/itens/{dados.Id}", dados);
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

class ItemEntity
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public bool Disponivel { get; set; }
}

class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }

    public DbSet<ItemEntity> Itens => Set<ItemEntity>();
}