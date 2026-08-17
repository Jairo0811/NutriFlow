using NutriFlow.Application.Abstractions;

namespace NutriFlow.Application.Preferences;

public sealed record FoodCompatibilityDto(Guid FoodId, bool HasConflict, IReadOnlyList<string> ConflictingRestrictionCodes);

public interface IFoodCompatibilityService
{
    Task<FoodCompatibilityDto> CheckAsync(Guid userId, Guid foodId, CancellationToken cancellationToken = default);
}

public sealed class FoodCompatibilityService(
    IFoodRepository foods,
    INutritionProfileRepository profiles) : IFoodCompatibilityService
{
    public async Task<FoodCompatibilityDto> CheckAsync(Guid userId, Guid foodId, CancellationToken cancellationToken = default)
    {
        var food = await foods.GetByIdAsync(foodId, cancellationToken)
            ?? throw new InvalidOperationException("Food was not found.");
        var profile = await profiles.GetByUserIdAsync(userId, cancellationToken)
            ?? throw new InvalidOperationException("Nutritional profile was not found.");

        var conflicts = food.AllergenCodes
            .Intersect(profile.DietaryRestrictionCodes, StringComparer.OrdinalIgnoreCase)
            .OrderBy(code => code)
            .ToArray();

        return new FoodCompatibilityDto(food.Id, conflicts.Length > 0, conflicts);
    }
}
