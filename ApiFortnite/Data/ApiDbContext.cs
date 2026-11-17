using Microsoft.EntityFrameworkCore;
using ApiFortnite.Models;

namespace ApiFortnite.Data;

public sealed class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options) 
    { 
    }

    public DbSet<ItemEntity> Itens => Set<ItemEntity>();
}