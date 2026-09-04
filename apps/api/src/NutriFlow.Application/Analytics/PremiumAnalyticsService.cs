using NutriFlow.Application.Abstractions;
using NutriFlow.Application.Billing;
using NutriFlow.Application.Nutrition;
using NutriFlow.Domain.Meals;

namespace NutriFlow.Application.Analytics;

public sealed class PremiumFeatureRequiredException(string entitlement)
    : Exception("NutriFlow Premium is required for this feature.")
{
    public string Entitlement { get; } = entitlement;
}

public sealed record DailyNutritionPoint(
    DateOnly Date,
    decimal Calories,
    decimal ProteinGrams,
    decimal CarbohydrateGrams,
    decimal FatGrams);

public sealed record AdvancedAnalyticsResult(
    int PeriodDays,
    DateOnly StartDate,
    DateOnly EndDate,
    int LoggedDays,
    decimal LoggingRatePercent,
    decimal AverageCalories,
    decimal AverageProteinGrams,
    decimal AverageCarbohydrateGrams,
    decimal AverageFatGrams,
    decimal? TargetCalories,
    decimal? CalorieAdherencePercent,
    decimal? ProteinTargetHitRatePercent,
    IReadOnlyList<DailyNutritionPoint> Daily);

public sealed record MicronutrientAnalyticsResult(
    int PeriodDays,
    DateOnly StartDate,
    DateOnly EndDate,
    int LoggedDays,
    decimal AverageFiberGrams,
    decimal AverageSodiumMilligrams,
    decimal AveragePotassiumMilligrams,
    decimal AverageCalciumMilligrams,
    decimal AverageIronMilligrams,
    decimal AverageVitaminCMilligrams,
    decimal AverageVitaminDMicrograms);

public interface IPremiumAnalyticsService
{
    Task<AdvancedAnalyticsResult> GetAdvancedAsync(Guid userId, int periodDays, DateOnly endDate, CancellationToken cancellationToken = default);
    Task<MicronutrientAnalyticsResult> GetMicronutrientsAsync(Guid userId, int periodDays, DateOnly endDate, CancellationToken cancellationToken = default);
}

public sealed class PremiumAnalyticsService(
    IMealRepository meals,
    INutritionCalculationService nutritionCalculation,
    IFeatureGateService featureGates) : IPremiumAnalyticsService
{
    public async Task<AdvancedAnalyticsResult> GetAdvancedAsync(
        Guid userId,
        int periodDays,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        RequireEntitlement(userId, EntitlementCodes.AnalyticsAdvanced);
        ValidatePeriod(periodDays);

        var startDate = endDate.AddDays(-(periodDays - 1));
        var rangeMeals = await meals.GetRangeAsync(userId, startDate, endDate, cancellationToken);
        var daily = BuildDailySeries(rangeMeals, startDate, endDate);
        var logged = daily.Where(point => point.Calories > 0).ToArray();

        decimal? targetCalories = null;
        decimal? targetProtein = null;
        try
        {
            var target = await nutritionCalculation.CalculateAsync(userId, endDate, cancellationToken);
            targetCalories = target.TargetCalories;
            targetProtein = target.ProteinGrams;
        }
        catch (InvalidOperationException)
        {
            // Analytics remains useful when onboarding is incomplete; target-based KPIs are omitted.
        }

        decimal? adherence = targetCalories is > 0 && logged.Length > 0
            ? Round(logged.Average(point => Math.Max(0m, 100m - (Math.Abs(point.Calories - targetCalories.Value) / targetCalories.Value * 100m))))
            : null;

        decimal? proteinHitRate = targetProtein is > 0 && logged.Length > 0
            ? Round(logged.Count(point => point.ProteinGrams >= targetProtein.Value * 0.9m) * 100m / logged.Length)
            : null;

        return new AdvancedAnalyticsResult(
            periodDays,
            startDate,
            endDate,
            logged.Length,
            Round(logged.Length * 100m / periodDays),
            Average(logged.Select(point => point.Calories)),
            Average(logged.Select(point => point.ProteinGrams)),
            Average(logged.Select(point => point.CarbohydrateGrams)),
            Average(logged.Select(point => point.FatGrams)),
            targetCalories,
            adherence,
            proteinHitRate,
            daily);
    }

    public async Task<MicronutrientAnalyticsResult> GetMicronutrientsAsync(
        Guid userId,
        int periodDays,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        RequireEntitlement(userId, EntitlementCodes.NutritionMicronutrients);
        ValidatePeriod(periodDays);

        var startDate = endDate.AddDays(-(periodDays - 1));
        var rangeMeals = await meals.GetRangeAsync(userId, startDate, endDate, cancellationToken);
        var grouped = rangeMeals
            .Where(meal => meal.Entries.Count > 0)
            .GroupBy(meal => meal.Date)
            .Select(group => group.SelectMany(meal => meal.Entries).ToArray())
            .ToArray();

        return new MicronutrientAnalyticsResult(
            periodDays,
            startDate,
            endDate,
            grouped.Length,
            Average(grouped.Select(entries => entries.Sum(entry => entry.TotalFiberGrams))),
            Average(grouped.Select(entries => entries.Sum(entry => entry.TotalSodiumMilligrams))),
            Average(grouped.Select(entries => entries.Sum(entry => entry.TotalPotassiumMilligrams))),
            Average(grouped.Select(entries => entries.Sum(entry => entry.TotalCalciumMilligrams))),
            Average(grouped.Select(entries => entries.Sum(entry => entry.TotalIronMilligrams))),
            Average(grouped.Select(entries => entries.Sum(entry => entry.TotalVitaminCMilligrams))),
            Average(grouped.Select(entries => entries.Sum(entry => entry.TotalVitaminDMicrograms))));
    }

    private void RequireEntitlement(Guid userId, string entitlement)
    {
        var decision = featureGates.CheckEntitlement(userId, entitlement);
        if (!decision.Allowed) throw new PremiumFeatureRequiredException(entitlement);
    }

    private static IReadOnlyList<DailyNutritionPoint> BuildDailySeries(
        IReadOnlyList<Meal> rangeMeals,
        DateOnly startDate,
        DateOnly endDate)
    {
        var totals = rangeMeals
            .GroupBy(meal => meal.Date)
            .ToDictionary(
                group => group.Key,
                group => group.SelectMany(meal => meal.Entries).ToArray());

        var result = new List<DailyNutritionPoint>();
        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            totals.TryGetValue(date, out var entries);
            entries ??= [];
            result.Add(new DailyNutritionPoint(
                date,
                Round(entries.Sum(entry => entry.TotalCalories)),
                Round(entries.Sum(entry => entry.TotalProteinGrams)),
                Round(entries.Sum(entry => entry.TotalCarbohydrateGrams)),
                Round(entries.Sum(entry => entry.TotalFatGrams))));
        }

        return result;
    }

    private static void ValidatePeriod(int periodDays)
    {
        if (periodDays is not (7 or 30 or 90))
            throw new ArgumentOutOfRangeException(nameof(periodDays), "Analytics period must be 7, 30 or 90 days.");
    }

    private static decimal Average(IEnumerable<decimal> values)
    {
        var items = values.ToArray();
        return items.Length == 0 ? 0m : Round(items.Average());
    }

    private static decimal Round(decimal value) => Math.Round(value, 1, MidpointRounding.AwayFromZero);
}
