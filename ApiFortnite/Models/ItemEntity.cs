namespace ApiFortnite.Models;

public sealed class ItemEntity
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public bool Disponivel { get; set; }
}