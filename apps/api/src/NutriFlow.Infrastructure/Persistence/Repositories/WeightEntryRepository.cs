using Microsoft.EntityFrameworkCore;
using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Progress;

namespace NutriFlow.Infrastructure.Persistence.Repositories;

public sealed class WeightEntryRepository(NutriFlowDbContext dbContext) : IWeightEntryRepository
{
    public async Task<IReadOnlyList<WeightEntry>> GetByUserAsync(Guid userId, int take, CancellationToken cancellationToken = default)
        => await dbContext.WeightEntries
            .Where(entry => entry.UserId == userId)
            .OrderByDescending(entry => entry.Date)
            .Take(Math.Clamp(take, 1, 3650))
            .ToListAsync(cancellationToken);

    public Task<WeightEntry?> GetByUserAndDateAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
        => dbContext.WeightEntries.SingleOrDefaultAsync(entry => entry.UserId == userId && entry.Date == date, cancellationToken);

    public async Task AddAsync(WeightEntry entry, CancellationToken cancellationToken = default)
        => await dbContext.WeightEntries.AddAsync(entry, cancellationToken);

    public void Remove(WeightEntry entry) => dbContext.WeightEntries.Remove(entry);
}
