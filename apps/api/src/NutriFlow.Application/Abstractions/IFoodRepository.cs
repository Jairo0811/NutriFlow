using NutriFlow.Domain.Foods;

namespace NutriFlow.Application.Abstractions;

public interface IFoodRepository
{
    Task<IReadOnlyList<Food>> SearchAsync(string? query, string? category, int take, CancellationToken cancellationToken = default);
    Task<Food?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Food?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default);
    Task AddAsync(Food food, CancellationToken cancellationToken = default);
}
