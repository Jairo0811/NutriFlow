using Microsoft.EntityFrameworkCore;
using NutriFlow.Application.Billing;

namespace NutriFlow.Infrastructure.Persistence.Repositories;

public sealed class UsageCounterRepository(NutriFlowDbContext dbContext) : IUsageCounterRepository
{
    public Task<int> GetCountAsync(
        Guid userId,
        string code,
        DateTimeOffset periodStartUtc,
        CancellationToken cancellationToken = default)
        => dbContext.UsageCounters
            .Where(counter => counter.UserId == userId && counter.Code == code && counter.PeriodStartUtc == periodStartUtc)
            .Select(counter => counter.Count)
            .SingleOrDefaultAsync(cancellationToken);

    public async Task<(bool Consumed, int Count)> TryConsumeAsync(
        Guid userId,
        string code,
        DateTimeOffset periodStartUtc,
        int limit,
        DateTimeOffset updatedAtUtc,
        CancellationToken cancellationToken = default)
    {
        if (limit <= 0) return (false, 0);

        var affected = await dbContext.Database.ExecuteSqlInterpolatedAsync($$"""
            INSERT INTO "UsageCounters" ("UserId", "Code", "PeriodStartUtc", "Count", "UpdatedAtUtc")
            VALUES ({{userId}}, {{code}}, {{periodStartUtc}}, 1, {{updatedAtUtc}})
            ON CONFLICT ("UserId", "Code", "PeriodStartUtc")
            DO UPDATE SET
                "Count" = "UsageCounters"."Count" + 1,
                "UpdatedAtUtc" = EXCLUDED."UpdatedAtUtc"
            WHERE "UsageCounters"."Count" < {{limit}};
            """, cancellationToken);

        var count = await GetCountAsync(userId, code, periodStartUtc, cancellationToken);
        return (affected > 0, count);
    }
}
