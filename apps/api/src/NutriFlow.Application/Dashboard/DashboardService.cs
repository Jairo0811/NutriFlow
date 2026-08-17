using NutriFlow.Application.Meals;
using NutriFlow.Application.Nutrition;

namespace NutriFlow.Application.Dashboard;

public sealed record MacroProgressDto(decimal Target, decimal Consumed, decimal Remaining, decimal ProgressPercent);

public sealed record DailyDashboardDto(
    DateOnly Date,
    decimal TargetCalories,
    decimal ConsumedCalories,
    decimal RemainingCalories,
    decimal CalorieProgressPercent,
    MacroProgressDto Protein,
    MacroProgressDto Carbohydrates,
    MacroProgressDto Fat,
    IReadOnlyList<MealDto> Meals);

public interface IDashboardService
{
    Task<DailyDashboardDto> GetDailyAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default);
}

public sealed class DashboardService(
    INutritionCalculationService nutrition,
    IMealTrackingService meals) : IDashboardService
{
    public async Task<DailyDashboardDto> GetDailyAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var targets = await nutrition.CalculateAsync(userId, date, cancellationToken);
        var consumed = await meals.GetDayAsync(userId, date, cancellationToken);

        return new DailyDashboardDto(
            date,
            targets.TargetCalories,
            consumed.Calories,
            Math.Max(0, targets.TargetCalories - consumed.Calories),
            Percent(consumed.Calories, targets.TargetCalories),
            Macro(targets.ProteinGrams, consumed.ProteinGrams),
            Macro(targets.CarbohydrateGrams, consumed.CarbohydrateGrams),
            Macro(targets.FatGrams, consumed.FatGrams),
            consumed.Meals);
    }

    private static MacroProgressDto Macro(decimal target, decimal consumed)
        => new(target, consumed, Math.Max(0, target - consumed), Percent(consumed, target));

    private static decimal Percent(decimal consumed, decimal target)
        => target <= 0 ? 0 : Math.Round(Math.Clamp(consumed / target * 100m, 0m, 999m), 1);
}
