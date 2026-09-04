using NutriFlow.Application.Abstractions;
using NutriFlow.Application.Analytics;
using NutriFlow.Application.Billing;
using NutriFlow.Application.Nutrition;
using NutriFlow.Domain.Foods;
using NutriFlow.Domain.Meals;
using NutriFlow.Domain.Nutrition;

namespace NutriFlow.Application.Tests.Analytics;

public sealed class PremiumAnalyticsServiceTests
{
    [Fact]
    public async Task AdvancedAnalytics_RequiresPremiumEntitlement()
    {
        var service = CreateService([], []);

        var exception = await Assert.ThrowsAsync<PremiumFeatureRequiredException>(() =>
            service.GetAdvancedAsync(Guid.NewGuid(), 30, new DateOnly(2026, 9, 4)));

        Assert.Equal(EntitlementCodes.AnalyticsAdvanced, exception.Entitlement);
    }

    [Fact]
    public async Task AdvancedAnalytics_ComputesLoggingAndTargetKpis()
    {
        var userId = Guid.NewGuid();
        var food = new Food(Guid.NewGuid(), "Chicken", "protein", 1m, "serving", 500m, 100m, 20m, 10m);
        var meal1 = MealWithFood(userId, new DateOnly(2026, 9, 3), food);
        var meal2 = MealWithFood(userId, new DateOnly(2026, 9, 4), food);
        var service = CreateService([meal1, meal2], [EntitlementCodes.AnalyticsAdvanced]);

        var result = await service.GetAdvancedAsync(userId, 7, new DateOnly(2026, 9, 4));

        Assert.Equal(2, result.LoggedDays);
        Assert.Equal(28.6m, result.LoggingRatePercent);
        Assert.Equal(500m, result.AverageCalories);
        Assert.Equal(100m, result.AverageProteinGrams);
        Assert.Equal(100m, result.CalorieAdherencePercent);
        Assert.Equal(100m, result.ProteinTargetHitRatePercent);
        Assert.Equal(7, result.Daily.Count);
    }

    [Fact]
    public async Task Micronutrients_UseMealSnapshotsAndAverageLoggedDays()
    {
        var userId = Guid.NewGuid();
        var food = new Food(
            Guid.NewGuid(), "Micronutrient Bowl", "meal", 1m, "bowl", 400m, 30m, 50m, 10m,
            fiberGrams: 12m,
            sodiumMilligrams: 600m,
            potassiumMilligrams: 900m,
            calciumMilligrams: 250m,
            ironMilligrams: 6m,
            vitaminCMilligrams: 45m,
            vitaminDMicrograms: 5m);
        var meal = MealWithFood(userId, new DateOnly(2026, 9, 4), food, 2m);
        var service = CreateService([meal], [EntitlementCodes.NutritionMicronutrients]);

        var result = await service.GetMicronutrientsAsync(userId, 30, new DateOnly(2026, 9, 4));

        Assert.Equal(1, result.LoggedDays);
        Assert.Equal(24m, result.AverageFiberGrams);
        Assert.Equal(1200m, result.AverageSodiumMilligrams);
        Assert.Equal(1800m, result.AveragePotassiumMilligrams);
        Assert.Equal(500m, result.AverageCalciumMilligrams);
        Assert.Equal(12m, result.AverageIronMilligrams);
        Assert.Equal(90m, result.AverageVitaminCMilligrams);
        Assert.Equal(10m, result.AverageVitaminDMicrograms);
    }

    [Fact]
    public async Task Analytics_RejectsUnsupportedPeriods()
    {
        var service = CreateService([], [EntitlementCodes.AnalyticsAdvanced]);

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() =>
            service.GetAdvancedAsync(Guid.NewGuid(), 14, new DateOnly(2026, 9, 4)));
    }

    private static PremiumAnalyticsService CreateService(IReadOnlyList<Meal> meals, IReadOnlyCollection<string> entitlements)
        => new(
            new FakeMealRepository(meals),
            new FakeNutritionCalculationService(),
            new FakeFeatureGateService(entitlements));

    private static Meal MealWithFood(Guid userId, DateOnly date, Food food, decimal servings = 1m)
    {
        var meal = new Meal(Guid.NewGuid(), userId, date, MealType.Lunch);
        meal.AddEntry(food, servings);
        return meal;
    }

    private sealed class FakeMealRepository(IReadOnlyList<Meal> meals) : IMealRepository
    {
        public Task<Meal?> GetAsync(Guid userId, DateOnly date, MealType type, CancellationToken cancellationToken = default)
            => Task.FromResult(meals.FirstOrDefault(meal => meal.UserId == userId && meal.Date == date && meal.Type == type));

        public Task<IReadOnlyList<Meal>> GetDayAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
            => Task.FromResult<IReadOnlyList<Meal>>(meals.Where(meal => meal.UserId == userId && meal.Date == date).ToArray());

        public Task<IReadOnlyList<Meal>> GetRangeAsync(Guid userId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default)
            => Task.FromResult<IReadOnlyList<Meal>>(meals.Where(meal => meal.UserId == userId && meal.Date >= startDate && meal.Date <= endDate).ToArray());

        public Task AddAsync(Meal meal, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }

    private sealed class FakeNutritionCalculationService : INutritionCalculationService
    {
        public Task<NutritionCalculation> CalculateAsync(Guid userId, DateOnly today, CancellationToken cancellationToken = default)
            => Task.FromResult(new NutritionCalculation(1500m, 2000m, 500m, 100m, 50m, 20m, "test"));
    }

    private sealed class FakeFeatureGateService(IReadOnlyCollection<string> entitlements) : IFeatureGateService
    {
        public bool HasEntitlement(Guid userId, string entitlement) => entitlements.Contains(entitlement);
        public int? GetUsageLimit(Guid userId, string limitCode) => null;
        public FeatureGateDecision CheckEntitlement(Guid userId, string entitlement)
            => HasEntitlement(userId, entitlement)
                ? new FeatureGateDecision(true, entitlement)
                : new FeatureGateDecision(false, entitlement, "premium_required");
    }
}
