using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Permite servir a interface (wwwroot)
app.UseStaticFiles();

app.MapGet("/", () => "API de Itens do Fortnite está no ar!");

// 1. GET - Listar todos (BANCO)
app.MapGet("/api/itens", async (ApiDbContext db) =>
    await db.Itens.ToListAsync());

// 2. GET - Buscar por ID (BANCO)
app.MapGet("/api/itens/{id:int}", async (int id, ApiDbContext db) =>
{
    var item = await db.Itens.FindAsync(id);
    if (item is null)
    {
        return Results.NotFound(new { mensagem = "Item não encontrado." });
    }
    return Results.Ok(item);
});

// 3. POST - Criar (BANCO)
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

// 4. PUT - Atualizar (BANCO)
app.MapPut("/api/itens/{id:int}", async (int id, ItemEntity dados, ApiDbContext db) =>
{
    var item = await db.Itens.FindAsync(id);
    if (item is null)
    {
        return Results.NotFound(new { mensagem = "Item não encontrado." });
    }

    item.Nome = dados.Nome;
    item.Tipo = dados.Tipo;
    item.Disponivel = dados.Disponivel;

    await db.SaveChangesAsync();
    return Results.Ok(item);
});

// 5. DELETE - Excluir (BANCO)
app.MapDelete("/api/itens/{id:int}", async (int id, ApiDbContext db) =>
{
    var item = await db.Itens.FindAsync(id);
    if (item is null)
    {
        return Results.NotFound(new { mensagem = "Item não encontrado." });
    }

    db.Itens.Remove(item);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

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