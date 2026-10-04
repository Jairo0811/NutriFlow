using NutriFlow.Application.Abstractions;
using NutriFlow.Application.Ai;
using NutriFlow.Application.Billing;
using NutriFlow.Application.Meals;
using NutriFlow.Application.Nutrition;
using NutriFlow.Domain.Foods;
using NutriFlow.Domain.Meals;
using NutriFlow.Domain.Nutrition;

namespace NutriFlow.Application.Tests.Ai;

public sealed class NutriFlowAiServiceTests
{
    [Fact]
    public async Task Coach_UsesExistingMonthlyAiQuota_ForFreeUser()
    {
        var usage = new FakeUsageLimitService();
        var provider = new FakeProvider();
        var service = CreateService(provider, usage, [], null, []);

        var result = await service.AskCoachAsync(Guid.NewGuid(), "What should I eat?", new DateOnly(2026, 9, 4));

        Assert.Equal("Test coach answer", result.Answer);
        Assert.Equal(1, usage.ConsumeCalls);
        Assert.Equal(UsageLimitCodes.AiRequestsMonthly, usage.LastCode);
        Assert.Equal(1, provider.CoachCalls);
    }

    [Fact]
    public async Task MealPhoto_RequiresPremiumBeforeConsumingQuota()
    {
        var usage = new FakeUsageLimitService();
        var service = CreateService(new FakeProvider(), usage, [], null, []);

        var exception = await Assert.ThrowsAsync<AiPremiumRequiredException>(() =>
            service.AnalyzeMealPhotoAsync(Guid.NewGuid(), "data:image/jpeg;base64,AAAA", new DateOnly(2026, 9, 4)));

        Assert.Equal(EntitlementCodes.MealPhotoAnalysis, exception.Entitlement);
        Assert.Equal(0, usage.ConsumeCalls);
    }

    [Fact]
    public async Task ConfirmMeal_BlocksSavedDietaryConflictBeforeLogging()
    {
        var userId = Guid.NewGuid();
        var profile = new NutritionProfile(userId);
        profile.SetDietaryRestrictions(["milk"]);
        var food = new Food(
            Guid.NewGuid(), "Queso", "dairy", 1m, "serving", 120m, 7m, 2m, 9m,
            allergenCodes: ["milk"]);
        var mealTracking = new FakeMealTrackingService();
        var service = CreateService(new FakeProvider(), new FakeUsageLimitService(), [], profile, [food], mealTracking);

        var exception = await Assert.ThrowsAsync<AiDietaryConflictException>(() =>
            service.ConfirmMealAsync(userId, new ConfirmAiMealCommand(
                new DateOnly(2026, 9, 4),
                MealType.Lunch,
                [new ConfirmAiMealItem(food.Id, 1m)])));

        Assert.Equal("Queso", exception.FoodName);
        Assert.Contains("milk", exception.Restrictions);
        Assert.Equal(0, mealTracking.AddCalls);
    }

    [Fact]
    public async Task VoiceAnalysis_MapsCatalogFoodAndFlagsRestrictionConflict()
    {
        var userId = Guid.NewGuid();
        var profile = new NutritionProfile(userId);
        profile.SetDietaryRestrictions(["milk"]);
        var food = new Food(
            Guid.NewGuid(), "Queso de freír", "dairy", 1m, "serving", 180m, 10m, 2m, 14m,
            allergenCodes: ["milk"]);
        var provider = new FakeProvider
        {
            Detected = [new AiDetectedFood("Queso de freír", 1.5m, 0.92m)]
        };
        var service = CreateService(
            provider,
            new FakeUsageLimitService(),
            [EntitlementCodes.VoiceLogging],
            profile,
            [food]);

        var result = await service.ParseVoiceTranscriptAsync(userId, "Comí queso de freír", new DateOnly(2026, 9, 4));

        var proposal = Assert.Single(result.Items);
        Assert.Equal(food.Id, proposal.FoodId);
        Assert.True(proposal.HasCatalogMatch);
        Assert.True(proposal.HasDietaryConflict);
        Assert.Contains("milk", proposal.ConflictingRestrictionCodes);
    }

    private static NutriFlowAiService CreateService(
        FakeProvider provider,
        FakeUsageLimitService usage,
        IReadOnlyCollection<string> entitlements,
        NutritionProfile? profile,
        IReadOnlyList<Food> foods,
        FakeMealTrackingService? mealTracking = null)
        => new(
            provider,
            usage,
            new FakeFeatureGateService(entitlements),
            new FakeNutritionProfileRepository(profile),
            new FakeNutritionCalculationService(),
            mealTracking ?? new FakeMealTrackingService(),
            new FakeFoodRepository(foods));

    private sealed class FakeProvider : INutritionAiProvider
    {
        public bool IsConfigured { get; set; } = true;
        public string ProviderName => "fake-ai";
        public int CoachCalls { get; private set; }
        public IReadOnlyList<AiDetectedFood> Detected { get; init; } = [];

        public Task<string> AskCoachAsync(string message, AiNutritionContext context, CancellationToken cancellationToken = default)
        {
            CoachCalls++;
            return Task.FromResult("Test coach answer");
        }

        public Task<IReadOnlyList<AiDetectedFood>> AnalyzeMealPhotoAsync(string imageDataUrl, AiNutritionContext context, CancellationToken cancellationToken = default)
            => Task.FromResult(Detected);

        public Task<IReadOnlyList<AiDetectedFood>> ParseVoiceTranscriptAsync(string transcript, AiNutritionContext context, CancellationToken cancellationToken = default)
            => Task.FromResult(Detected);
    }

    private sealed class FakeUsageLimitService : IUsageLimitService
    {
        public int ConsumeCalls { get; private set; }
        public string? LastCode { get; private set; }
        private readonly UsageSnapshot _snapshot = new(
            UsageLimitCodes.AiRequestsMonthly, 5, 1, 4, false,
            new DateTimeOffset(2026, 9, 1, 0, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 10, 1, 0, 0, 0, TimeSpan.Zero));

        public Task<IReadOnlyList<UsageSnapshot>> GetCurrentAsync(Guid userId, CancellationToken cancellationToken = default)
            => Task.FromResult<IReadOnlyList<UsageSnapshot>>([_snapshot]);

        public Task<UsageConsumeResult> TryConsumeAsync(Guid userId, string code, CancellationToken cancellationToken = default)
        {
            ConsumeCalls++;
            LastCode = code;
            return Task.FromResult(new UsageConsumeResult(true, _snapshot));
        }
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

    private sealed class FakeNutritionProfileRepository(NutritionProfile? profile) : INutritionProfileRepository
    {
        public Task<NutritionProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
            => Task.FromResult(profile);
        public Task AddAsync(NutritionProfile profileToAdd, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }

    private sealed class FakeNutritionCalculationService : INutritionCalculationService
    {
        public Task<NutritionCalculation> CalculateAsync(Guid userId, DateOnly today, CancellationToken cancellationToken = default)
            => Task.FromResult(new NutritionCalculation(1600m, 2100m, 1900m, 130m, 210m, 60m, "test"));
    }

    private sealed class FakeMealTrackingService : IMealTrackingService
    {
        public int AddCalls { get; private set; }

        public Task<DailyMealSummaryDto> GetDayAsync(Guid userId, DateOnly date, CancellationToken cancellationToken)
            => Task.FromResult(Empty(date));

        public Task<DailyMealSummaryDto> AddEntryAsync(Guid userId, AddMealEntryCommand command, CancellationToken cancellationToken)
        {
            AddCalls++;
            return Task.FromResult(Empty(command.Date));
        }

        public Task<DailyMealSummaryDto> UpdateEntryAsync(Guid userId, UpdateMealEntryCommand command, CancellationToken cancellationToken)
            => Task.FromResult(Empty(command.Date));

        public Task<DailyMealSummaryDto> RemoveEntryAsync(Guid userId, RemoveMealEntryCommand command, CancellationToken cancellationToken)
            => Task.FromResult(Empty(command.Date));

        private static DailyMealSummaryDto Empty(DateOnly date) => new(date, [], 0m, 0m, 0m, 0m);
    }

    private sealed class FakeFoodRepository(IReadOnlyList<Food> foods) : IFoodRepository
    {
        public Task<IReadOnlyList<Food>> SearchAsync(string? query, string? category, int take, CancellationToken cancellationToken = default)
            => Task.FromResult<IReadOnlyList<Food>>(foods
                .Where(food => query is null || food.Name.Contains(query, StringComparison.OrdinalIgnoreCase))
                .Take(take)
                .ToArray());

        public Task<Food?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => Task.FromResult(foods.FirstOrDefault(food => food.Id == id));

        public Task<Food?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default)
            => Task.FromResult<Food?>(null);

        public Task AddAsync(Food food, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
