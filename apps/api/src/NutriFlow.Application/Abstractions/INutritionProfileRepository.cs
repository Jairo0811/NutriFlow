using NutriFlow.Domain.Nutrition;

namespace NutriFlow.Application.Abstractions;

public interface INutritionProfileRepository
{
    Task<NutritionProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(NutritionProfile profile, CancellationToken cancellationToken = default);
}
