using ApiFortnite.Data;
using ApiFortnite.Dtos;
using ApiFortnite.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuração do banco
builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Middleware de tratamento de exceções
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(new
        {
            mensagem = "Ocorreu um erro interno. Tente novamente mais tarde."
        });
    });
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/itens", async (ApiDbContext db) =>
    await db.Itens.ToListAsync());

app.MapGet("/api/itens/{id:int}", async (int id, ApiDbContext db) =>
{
    var item = await db.Itens.FindAsync(id);
    if (item is null) return Results.NotFound(new { mensagem = "Item não encontrado." });
    return Results.Ok(item);
});

app.MapPost("/api/itens", async (ItemEntrada dados, ApiDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(dados.Nome))
        return Results.BadRequest(new { mensagem = "O nome é obrigatório." });

    if (string.IsNullOrWhiteSpace(dados.Tipo))
        return Results.BadRequest(new { mensagem = "O tipo é obrigatório." });

    // Criando o item no banco a partir dos dados que vieram do DTO
    var novoItem = new ItemEntity
    {
        Nome = dados.Nome,
        Tipo = dados.Tipo,
        Disponivel = dados.Disponivel
    };

    db.Itens.Add(novoItem);
    await db.SaveChangesAsync();
    return Results.Created($"/api/itens/{novoItem.Id}", novoItem);
});

app.MapPut("/api/itens/{id:int}", async (int id, ItemEntrada dados, ApiDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(dados.Nome))
        return Results.BadRequest(new { mensagem = "O nome é obrigatório." });

    if (string.IsNullOrWhiteSpace(dados.Tipo))
        return Results.BadRequest(new { mensagem = "O tipo é obrigatório." });

    var item = await db.Itens.FindAsync(id);
    if (item is null) return Results.NotFound(new { mensagem = "Item não encontrado." });

    item.Nome = dados.Nome;
    item.Tipo = dados.Tipo;
    item.Disponivel = dados.Disponivel;

    await db.SaveChangesAsync();
    return Results.Ok(item);
});

app.MapDelete("/api/itens/{id:int}", async (int id, ApiDbContext db) =>
{
    var item = await db.Itens.FindAsync(id);
    if (item is null) return Results.NotFound(new { mensagem = "Item não encontrado." });

    db.Itens.Remove(item);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();