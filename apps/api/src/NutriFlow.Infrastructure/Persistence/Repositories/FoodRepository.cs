using Microsoft.EntityFrameworkCore;
using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Foods;

namespace NutriFlow.Infrastructure.Persistence.Repositories;

public sealed class FoodRepository(NutriFlowDbContext dbContext) : IFoodRepository
{
    public async Task<IReadOnlyList<Food>> SearchAsync(string? query, string? category, int take, CancellationToken cancellationToken = default)
    {
        IQueryable<Food> foods = dbContext.Foods.AsNoTracking().Where(food => food.IsActive);

        if (!string.IsNullOrWhiteSpace(category))
        {
            var normalizedCategory = category.Trim().ToLowerInvariant();
            foods = foods.Where(food => food.Category == normalizedCategory);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var pattern = $"%{query.Trim()}%";
            foods = foods.Where(food =>
                EF.Functions.ILike(food.Name, pattern) ||
                (food.Brand != null && EF.Functions.ILike(food.Brand, pattern)) ||
                (food.Barcode != null && food.Barcode == query.Trim()));
        }

        return await foods
            .OrderBy(food => food.Name)
            .ThenBy(food => food.Brand)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public Task<Food?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => dbContext.Foods.AsNoTracking().SingleOrDefaultAsync(food => food.Id == id && food.IsActive, cancellationToken);

    public Task<Food?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default)
        => dbContext.Foods.AsNoTracking().SingleOrDefaultAsync(food => food.Barcode == barcode && food.IsActive, cancellationToken);
}
