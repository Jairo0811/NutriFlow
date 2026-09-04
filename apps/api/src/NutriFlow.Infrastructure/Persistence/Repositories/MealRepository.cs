using Microsoft.EntityFrameworkCore;
using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Meals;

namespace NutriFlow.Infrastructure.Persistence.Repositories;

public sealed class MealRepository(NutriFlowDbContext dbContext) : IMealRepository
{
    public Task<Meal?> GetAsync(Guid userId, DateOnly date, MealType type, CancellationToken cancellationToken = default)
        => dbContext.Meals
            .Include(meal => meal.Entries)
            .SingleOrDefaultAsync(meal => meal.UserId == userId && meal.Date == date && meal.Type == type, cancellationToken);

    public async Task<IReadOnlyList<Meal>> GetDayAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
        => await dbContext.Meals
            .AsNoTracking()
            .Include(meal => meal.Entries)
            .Where(meal => meal.UserId == userId && meal.Date == date)
            .OrderBy(meal => meal.Type)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Meal>> GetRangeAsync(Guid userId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default)
        => await dbContext.Meals
            .AsNoTracking()
            .Include(meal => meal.Entries)
            .Where(meal => meal.UserId == userId && meal.Date >= startDate && meal.Date <= endDate)
            .OrderBy(meal => meal.Date)
            .ThenBy(meal => meal.Type)
            .ToListAsync(cancellationToken);

    public Task AddAsync(Meal meal, CancellationToken cancellationToken = default)
        => dbContext.Meals.AddAsync(meal, cancellationToken).AsTask();
}
