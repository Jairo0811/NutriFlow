namespace NutriFlow.Application.Billing;

public static class UsageLimitCodes
{
    public const string BarcodeScansMonthly = "barcode.scans.monthly";
    public const string AiRequestsMonthly = "ai.requests.monthly";
    public const string HistoryDays = "history.days";
}

public sealed record UsageSnapshot(
    string Code,
    int? Limit,
    int Used,
    int? Remaining,
    bool IsUnlimited,
    DateTimeOffset? PeriodStartUtc,
    DateTimeOffset? PeriodEndUtc);

public sealed record UsageConsumeResult(
    bool Allowed,
    UsageSnapshot Usage,
    string? ErrorCode = null);

public interface IUsageCounterRepository
{
    Task<int> GetCountAsync(
        Guid userId,
        string code,
        DateTimeOffset periodStartUtc,
        CancellationToken cancellationToken = default);

    Task<(bool Consumed, int Count)> TryConsumeAsync(
        Guid userId,
        string code,
        DateTimeOffset periodStartUtc,
        int limit,
        DateTimeOffset updatedAtUtc,
        CancellationToken cancellationToken = default);
}

public interface IUsageLimitService
{
    Task<IReadOnlyList<UsageSnapshot>> GetCurrentAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UsageConsumeResult> TryConsumeAsync(Guid userId, string code, CancellationToken cancellationToken = default);
}

public sealed class UsageLimitService(
    ISubscriptionAccessService accessService,
    IUsageCounterRepository counters,
    TimeProvider timeProvider) : IUsageLimitService
{
    private static readonly string[] ConsumableCodes =
    [
        UsageLimitCodes.BarcodeScansMonthly,
        UsageLimitCodes.AiRequestsMonthly
    ];

    public async Task<IReadOnlyList<UsageSnapshot>> GetCurrentAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var snapshots = new List<UsageSnapshot>(ConsumableCodes.Length);
        foreach (var code in ConsumableCodes)
            snapshots.Add(await GetSnapshotAsync(userId, code, cancellationToken));
        return snapshots;
    }

    public async Task<UsageConsumeResult> TryConsumeAsync(Guid userId, string code, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        if (!TryResolveMonthlyWindow(code, timeProvider.GetUtcNow(), out var periodStartUtc, out var periodEndUtc))
        {
            return new UsageConsumeResult(
                false,
                new UsageSnapshot(code, null, 0, null, false, null, null),
                "usage_limit_not_configured");
        }

        var access = accessService.GetAccess(userId);
        var unlimitedEntitlement = GetUnlimitedEntitlement(code);
        if (unlimitedEntitlement is not null && access.Entitlements.Contains(unlimitedEntitlement, StringComparer.Ordinal))
        {
            return new UsageConsumeResult(
                true,
                new UsageSnapshot(code, null, 0, null, true, periodStartUtc, periodEndUtc));
        }

        if (!access.UsageLimits.TryGetValue(code, out var limit) || limit <= 0)
        {
            return new UsageConsumeResult(
                false,
                new UsageSnapshot(code, null, 0, null, false, periodStartUtc, periodEndUtc),
                "usage_limit_not_available");
        }

        var now = timeProvider.GetUtcNow();
        var (consumed, count) = await counters.TryConsumeAsync(
            userId, code, periodStartUtc, limit, now, cancellationToken);

        return new UsageConsumeResult(
            consumed,
            new UsageSnapshot(
                code,
                limit,
                count,
                Math.Max(0, limit - count),
                false,
                periodStartUtc,
                periodEndUtc),
            consumed ? null : "usage_limit_reached");
    }

    private async Task<UsageSnapshot> GetSnapshotAsync(Guid userId, string code, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        _ = TryResolveMonthlyWindow(code, now, out var periodStartUtc, out var periodEndUtc);

        var access = accessService.GetAccess(userId);
        var unlimitedEntitlement = GetUnlimitedEntitlement(code);
        if (unlimitedEntitlement is not null && access.Entitlements.Contains(unlimitedEntitlement, StringComparer.Ordinal))
            return new UsageSnapshot(code, null, 0, null, true, periodStartUtc, periodEndUtc);

        if (!access.UsageLimits.TryGetValue(code, out var limit) || limit <= 0)
            return new UsageSnapshot(code, null, 0, null, false, periodStartUtc, periodEndUtc);

        var used = await counters.GetCountAsync(userId, code, periodStartUtc, cancellationToken);
        return new UsageSnapshot(
            code,
            limit,
            used,
            Math.Max(0, limit - used),
            false,
            periodStartUtc,
            periodEndUtc);
    }

    private static string? GetUnlimitedEntitlement(string code)
        => code == UsageLimitCodes.BarcodeScansMonthly ? EntitlementCodes.BarcodeUnlimited : null;

    private static bool TryResolveMonthlyWindow(
        string code,
        DateTimeOffset now,
        out DateTimeOffset periodStartUtc,
        out DateTimeOffset periodEndUtc)
    {
        if (code is not (UsageLimitCodes.BarcodeScansMonthly or UsageLimitCodes.AiRequestsMonthly))
        {
            periodStartUtc = default;
            periodEndUtc = default;
            return false;
        }

        periodStartUtc = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero);
        periodEndUtc = periodStartUtc.AddMonths(1);
        return true;
    }
}
