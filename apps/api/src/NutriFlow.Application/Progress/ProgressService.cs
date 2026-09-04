using NutriFlow.Application.Abstractions;
using NutriFlow.Application.Billing;
using NutriFlow.Domain.Progress;

namespace NutriFlow.Application.Progress;

public sealed record WeightEntryDto(Guid Id, DateOnly Date, decimal WeightPounds, string? Note);
public sealed record ProgressSummaryDto(decimal? StartingWeightPounds, decimal? CurrentWeightPounds, decimal? TargetWeightPounds, decimal? ChangePounds, IReadOnlyList<WeightEntryDto> Entries);
public sealed record LogWeightCommand(DateOnly Date, decimal WeightPounds, string? Note);

public interface IProgressService
{
    Task<ProgressSummaryDto> GetAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<ProgressSummaryDto> LogWeightAsync(Guid userId, LogWeightCommand command, CancellationToken cancellationToken = default);
    Task<ProgressSummaryDto> RemoveAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default);
}

public sealed class ProgressService(
    IWeightEntryRepository entries,
    INutritionProfileRepository profiles,
    IUnitOfWork unitOfWork,
    IFeatureGateService featureGates,
    TimeProvider timeProvider) : IProgressService
{
    public async Task<ProgressSummaryDto> GetAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var profile = await profiles.GetByUserIdAsync(userId, cancellationToken);
        var history = await entries.GetByUserAsync(userId, 3650, cancellationToken);

        if (!featureGates.HasEntitlement(userId, EntitlementCodes.HistoryUnlimited)
            && featureGates.GetUsageLimit(userId, UsageLimitCodes.HistoryDays) is { } historyDays)
        {
            var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
            var earliestVisibleDate = today.AddDays(-(Math.Max(1, historyDays) - 1));
            history = history.Where(item => item.Date >= earliestVisibleDate).ToArray();
        }

        var ordered = history.OrderBy(item => item.Date).ToArray();
        var starting = ordered.FirstOrDefault()?.WeightPounds ?? profile?.CurrentWeightPounds;
        var current = ordered.LastOrDefault()?.WeightPounds ?? profile?.CurrentWeightPounds;

        return new ProgressSummaryDto(
            starting,
            current,
            profile?.TargetWeightPounds,
            starting is null || current is null ? null : Math.Round(current.Value - starting.Value, 2),
            ordered.Select(item => new WeightEntryDto(item.Id, item.Date, item.WeightPounds, item.Note)).ToArray());
    }

    public async Task<ProgressSummaryDto> LogWeightAsync(Guid userId, LogWeightCommand command, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
        if (command.Date > today.AddDays(1))
            throw new ArgumentOutOfRangeException(nameof(command.Date), "Weight date cannot be in the future.");

        if (await entries.GetByUserAndDateAsync(userId, command.Date, cancellationToken) is not null)
            throw new InvalidOperationException("A weight entry already exists for this date.");

        await entries.AddAsync(new WeightEntry(Guid.NewGuid(), userId, command.Date, command.WeightPounds, command.Note), cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetAsync(userId, cancellationToken);
    }

    public async Task<ProgressSummaryDto> RemoveAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var entry = await entries.GetByUserAndDateAsync(userId, date, cancellationToken)
            ?? throw new InvalidOperationException("Weight entry was not found.");
        entries.Remove(entry);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetAsync(userId, cancellationToken);
    }
}
