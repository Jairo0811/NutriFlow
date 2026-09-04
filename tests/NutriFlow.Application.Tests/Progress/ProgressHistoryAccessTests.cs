using NutriFlow.Application.Abstractions;
using NutriFlow.Application.Billing;
using NutriFlow.Application.Progress;
using NutriFlow.Domain.Billing;
using NutriFlow.Domain.Nutrition;
using NutriFlow.Domain.Progress;

namespace NutriFlow.Application.Tests.Progress;

public sealed class ProgressHistoryAccessTests
{
    [Fact]
    public async Task FreePlan_ReturnsOnlyLastThirtyDays()
    {
        var userId = Guid.NewGuid();
        var repository = CreateRepository(userId);
        var service = new ProgressService(
            repository,
            new EmptyProfileRepository(),
            new NoOpUnitOfWork(),
            new FeatureGateService(new SubscriptionAccessService()),
            new FixedTimeProvider(new DateTimeOffset(2026, 9, 4, 12, 0, 0, TimeSpan.Zero)));

        var result = await service.GetAsync(userId);

        Assert.Equal(2, result.Entries.Count);
        Assert.DoesNotContain(result.Entries, entry => entry.Date == new DateOnly(2026, 8, 1));
        Assert.Contains(result.Entries, entry => entry.Date == new DateOnly(2026, 8, 20));
        Assert.Contains(result.Entries, entry => entry.Date == new DateOnly(2026, 9, 1));
    }

    [Fact]
    public async Task PremiumPlan_ReturnsHistoryOutsideFreeWindow()
    {
        var userId = Guid.NewGuid();
        var repository = CreateRepository(userId);
        var service = new ProgressService(
            repository,
            new EmptyProfileRepository(),
            new NoOpUnitOfWork(),
            new FeatureGateService(new PremiumAccessService()),
            new FixedTimeProvider(new DateTimeOffset(2026, 9, 4, 12, 0, 0, TimeSpan.Zero)));

        var result = await service.GetAsync(userId);

        Assert.Equal(3, result.Entries.Count);
        Assert.Contains(result.Entries, entry => entry.Date == new DateOnly(2026, 8, 1));
    }

    private static FakeWeightEntryRepository CreateRepository(Guid userId)
        => new(
        [
            new WeightEntry(Guid.NewGuid(), userId, new DateOnly(2026, 8, 1), 220),
            new WeightEntry(Guid.NewGuid(), userId, new DateOnly(2026, 8, 20), 216),
            new WeightEntry(Guid.NewGuid(), userId, new DateOnly(2026, 9, 1), 212)
        ]);

    private sealed class PremiumAccessService : ISubscriptionAccessService
    {
        public UserAccessSnapshot GetAccess(Guid userId)
        {
            _ = userId;
            var definition = SubscriptionAccessService.GetPlanDefinition(SubscriptionPlan.Premium);
            return new UserAccessSnapshot(
                definition.Plan,
                definition.DisplayName,
                definition.Entitlements.ToArray(),
                new Dictionary<string, int>(definition.UsageLimits, StringComparer.Ordinal));
        }
    }

    private sealed class FakeWeightEntryRepository(IReadOnlyList<WeightEntry> seed) : IWeightEntryRepository
    {
        private readonly List<WeightEntry> _entries = seed.ToList();

        public Task<IReadOnlyList<WeightEntry>> GetByUserAsync(Guid userId, int take, CancellationToken cancellationToken = default)
        {
            _ = cancellationToken;
            IReadOnlyList<WeightEntry> result = _entries
                .Where(entry => entry.UserId == userId)
                .OrderByDescending(entry => entry.Date)
                .Take(take)
                .ToArray();
            return Task.FromResult(result);
        }

        public Task<WeightEntry?> GetByUserAndDateAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
        {
            _ = cancellationToken;
            return Task.FromResult(_entries.SingleOrDefault(entry => entry.UserId == userId && entry.Date == date));
        }

        public Task AddAsync(WeightEntry entry, CancellationToken cancellationToken = default)
        {
            _ = cancellationToken;
            _entries.Add(entry);
            return Task.CompletedTask;
        }

        public void Remove(WeightEntry entry) => _entries.Remove(entry);
    }

    private sealed class EmptyProfileRepository : INutritionProfileRepository
    {
        public Task<NutritionProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            _ = userId;
            _ = cancellationToken;
            return Task.FromResult<NutritionProfile?>(null);
        }

        public Task AddAsync(NutritionProfile profile, CancellationToken cancellationToken = default)
            => Task.CompletedTask;
    }

    private sealed class NoOpUnitOfWork : IUnitOfWork
    {
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
            => Task.FromResult(1);
    }

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }
}
