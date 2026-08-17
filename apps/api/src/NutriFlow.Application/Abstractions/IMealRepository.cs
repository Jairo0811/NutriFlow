using NutriFlow.Domain.Meals;

namespace NutriFlow.Application.Abstractions;

public interface IMealRepository
{
    Task<Meal?> GetAsync(Guid userId, DateOnly date, MealType type, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Meal>> GetDayAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default);
    Task AddAsync(Meal meal, CancellationToken cancellationToken = default);
}
