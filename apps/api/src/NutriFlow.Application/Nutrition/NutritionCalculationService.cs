using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Nutrition;

namespace NutriFlow.Application.Nutrition;

public interface INutritionCalculationService
{
    Task<NutritionCalculation> CalculateAsync(Guid userId, DateOnly today, CancellationToken cancellationToken = default);
}

public sealed class NutritionCalculationService(INutritionProfileRepository profiles) : INutritionCalculationService
{
    public async Task<NutritionCalculation> CalculateAsync(Guid userId, DateOnly today, CancellationToken cancellationToken = default)
    {
        var profile = await profiles.GetByUserIdAsync(userId, cancellationToken)
            ?? throw new InvalidOperationException("Nutritional profile not found.");

        return NutritionEngine.Calculate(profile, today);
    }
}
