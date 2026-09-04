using NutriFlow.Application.Billing;
using NutriFlow.Domain.Billing;

namespace NutriFlow.Application.Tests.Billing;

public sealed class UsageLimitServiceTests
{
    [Fact]
    public async Task FreePlan_BlocksEleventhBarcodeScanInSameMonth()
    {
        var userId = Guid.NewGuid();
        var repository = new FakeUsageCounterRepository();
        var time = new FixedTimeProvider(new DateTimeOffset(2026, 9, 4, 12, 0, 0, TimeSpan.Zero));
        var service = new UsageLimitService(new StubAccessService(SubscriptionPlan.Free), repository, time);

        for (var index = 0; index < 10; index++)
        {
            var allowed = await service.TryConsumeAsync(userId, UsageLimitCodes.BarcodeScansMonthly);
            Assert.True(allowed.Allowed);
            Assert.Equal(9 - index, allowed.Usage.Remaining);
        }

        var blocked = await service.TryConsumeAsync(userId, UsageLimitCodes.BarcodeScansMonthly);

        Assert.False(blocked.Allowed);
        Assert.Equal("usage_limit_reached", blocked.ErrorCode);
        Assert.Equal(10, blocked.Usage.Used);
        Assert.Equal(0, blocked.Usage.Remaining);
    }

    [Fact]
    public async Task MonthlyQuota_ResetsWhenCalendarMonthChanges()
    {
        var userId = Guid.NewGuid();
        var repository = new FakeUsageCounterRepository();
        var time = new FixedTimeProvider(new DateTimeOffset(2026, 9, 30, 23, 0, 0, TimeSpan.Zero));
        var service = new UsageLimitService(new StubAccessService(SubscriptionPlan.Free), repository, time);

        for (var index = 0; index < 10; index++)
            Assert.True((await service.TryConsumeAsync(userId, UsageLimitCodes.BarcodeScansMonthly)).Allowed);

        Assert.False((await service.TryConsumeAsync(userId, UsageLimitCodes.BarcodeScansMonthly)).Allowed);

        time.SetUtcNow(new DateTimeOffset(2026, 10, 1, 0, 1, 0, TimeSpan.Zero));
        var october = await service.TryConsumeAsync(userId, UsageLimitCodes.BarcodeScansMonthly);

        Assert.True(october.Allowed);
        Assert.Equal(1, october.Usage.Used);
        Assert.Equal(9, october.Usage.Remaining);
    }

    [Fact]
    public async Task PremiumPlan_BypassesBarcodeCounter()
    {
        var userId = Guid.NewGuid();
        var repository = new FakeUsageCounterRepository();
        var time = new FixedTimeProvider(new DateTimeOffset(2026, 9, 4, 12, 0, 0, TimeSpan.Zero));
        var service = new UsageLimitService(new StubAccessService(SubscriptionPlan.Premium), repository, time);

        var result = await service.TryConsumeAsync(userId, UsageLimitCodes.BarcodeScansMonthly);

        Assert.True(result.Allowed);
        Assert.True(result.Usage.IsUnlimited);
        Assert.Null(result.Usage.Limit);
        Assert.Equal(0, repository.WriteCount);
    }

    [Fact]
    public void FeatureGate_DeniesFreeAndAllowsPremiumEntitlement()
    {
        var userId = Guid.NewGuid();
        var freeGate = new FeatureGateService(new StubAccessService(SubscriptionPlan.Free));
        var premiumGate = new FeatureGateService(new StubAccessService(SubscriptionPlan.Premium));

        var denied = freeGate.CheckEntitlement(userId, EntitlementCodes.AnalyticsAdvanced);
        var allowed = premiumGate.CheckEntitlement(userId, EntitlementCodes.AnalyticsAdvanced);

        Assert.False(denied.Allowed);
        Assert.Equal("premium_required", denied.ErrorCode);
        Assert.True(allowed.Allowed);
    }

    private sealed class StubAccessService(SubscriptionPlan plan) : ISubscriptionAccessService
    {
        public UserAccessSnapshot GetAccess(Guid userId)
        {
            _ = userId;
            var definition = SubscriptionAccessService.GetPlanDefinition(plan);
            return new UserAccessSnapshot(
                definition.Plan,
                definition.DisplayName,
                definition.Entitlements.ToArray(),
                new Dictionary<string, int>(definition.UsageLimits, StringComparer.Ordinal));
        }
    }

    private sealed class FakeUsageCounterRepository : IUsageCounterRepository
    {
        private readonly Dictionary<(Guid UserId, string Code, DateTimeOffset PeriodStartUtc), int> _counts = [];

        public int WriteCount { get; private set; }

        public Task<int> GetCountAsync(Guid userId, string code, DateTimeOffset periodStartUtc, CancellationToken cancellationToken = default)
        {
            _ = cancellationToken;
            return Task.FromResult(_counts.GetValueOrDefault((userId, code, periodStartUtc)));
        }

        public Task<(bool Consumed, int Count)> TryConsumeAsync(
            Guid userId,
            string code,
            DateTimeOffset periodStartUtc,
            int limit,
            DateTimeOffset updatedAtUtc,
            CancellationToken cancellationToken = default)
        {
            _ = updatedAtUtc;
            _ = cancellationToken;
            var key = (userId, code, periodStartUtc);
            var current = _counts.GetValueOrDefault(key);
            if (current >= limit) return Task.FromResult((false, current));

            current++;
            _counts[key] = current;
            WriteCount++;
            return Task.FromResult((true, current));
        }
    }

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        private DateTimeOffset _utcNow = utcNow;

        public override DateTimeOffset GetUtcNow() => _utcNow;
        public void SetUtcNow(DateTimeOffset value) => _utcNow = value;
    }
}
