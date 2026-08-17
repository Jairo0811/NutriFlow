using NutriFlow.Domain.Progress;

namespace NutriFlow.Application.Abstractions;

public interface IWeightEntryRepository
{
    Task<IReadOnlyList<WeightEntry>> GetByUserAsync(Guid userId, int take, CancellationToken cancellationToken = default);
    Task<WeightEntry?> GetByUserAndDateAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default);
    Task AddAsync(WeightEntry entry, CancellationToken cancellationToken = default);
    void Remove(WeightEntry entry);
}
