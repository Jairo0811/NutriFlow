using Microsoft.EntityFrameworkCore;
using NutriFlow.Application.Engagement;
using NutriFlow.Domain.Engagement;

namespace NutriFlow.Infrastructure.Persistence.Repositories;

public sealed class EngagementRepository(NutriFlowDbContext dbContext) : IEngagementRepository
{
    public async Task<IReadOnlyList<WaterEntry>> GetWaterEntriesAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
        => await dbContext.WaterEntries
            .Where(entry => entry.UserId == userId && entry.Date == date)
            .OrderBy(entry => entry.CreatedAtUtc)
            .ToListAsync(cancellationToken);

    public Task<WaterEntry?> GetWaterEntryAsync(Guid userId, Guid entryId, CancellationToken cancellationToken = default)
        => dbContext.WaterEntries.SingleOrDefaultAsync(entry => entry.UserId == userId && entry.Id == entryId, cancellationToken);

    public async Task AddWaterEntryAsync(WaterEntry entry, CancellationToken cancellationToken = default)
        => await dbContext.WaterEntries.AddAsync(entry, cancellationToken);

    public void RemoveWaterEntry(WaterEntry entry) => dbContext.WaterEntries.Remove(entry);

    public async Task<IReadOnlyList<FavoriteFood>> GetFavoriteFoodsAsync(Guid userId, CancellationToken cancellationToken = default)
        => await dbContext.FavoriteFoods
            .Where(favorite => favorite.UserId == userId)
            .OrderByDescending(favorite => favorite.CreatedAtUtc)
            .ToListAsync(cancellationToken);

    public Task<FavoriteFood?> GetFavoriteFoodAsync(Guid userId, Guid foodId, CancellationToken cancellationToken = default)
        => dbContext.FavoriteFoods.SingleOrDefaultAsync(favorite => favorite.UserId == userId && favorite.FoodId == foodId, cancellationToken);

    public async Task AddFavoriteFoodAsync(FavoriteFood favorite, CancellationToken cancellationToken = default)
        => await dbContext.FavoriteFoods.AddAsync(favorite, cancellationToken);

    public void RemoveFavoriteFood(FavoriteFood favorite) => dbContext.FavoriteFoods.Remove(favorite);

    public async Task<IReadOnlyList<Recipe>> GetRecipesAsync(Guid userId, CancellationToken cancellationToken = default)
        => await dbContext.Recipes
            .Include(recipe => recipe.Ingredients)
            .Where(recipe => recipe.UserId == userId)
            .OrderByDescending(recipe => recipe.CreatedAtUtc)
            .ToListAsync(cancellationToken);

    public Task<Recipe?> GetRecipeAsync(Guid userId, Guid recipeId, CancellationToken cancellationToken = default)
        => dbContext.Recipes
            .Include(recipe => recipe.Ingredients)
            .SingleOrDefaultAsync(recipe => recipe.UserId == userId && recipe.Id == recipeId, cancellationToken);

    public async Task AddRecipeAsync(Recipe recipe, CancellationToken cancellationToken = default)
        => await dbContext.Recipes.AddAsync(recipe, cancellationToken);

    public void RemoveRecipe(Recipe recipe) => dbContext.Recipes.Remove(recipe);

    public async Task<IReadOnlyList<DateOnly>> GetActivityDatesAsync(Guid userId, DateOnly from, DateOnly to, CancellationToken cancellationToken = default)
    {
        var waterDates = dbContext.WaterEntries
            .Where(entry => entry.UserId == userId && entry.Date >= from && entry.Date <= to)
            .Select(entry => entry.Date);
        var mealDates = dbContext.Meals
            .Where(meal => meal.UserId == userId && meal.Date >= from && meal.Date <= to)
            .Select(meal => meal.Date);
        var weightDates = dbContext.WeightEntries
            .Where(entry => entry.UserId == userId && entry.Date >= from && entry.Date <= to)
            .Select(entry => entry.Date);

        return await waterDates
            .Union(mealDates)
            .Union(weightDates)
            .Distinct()
            .OrderByDescending(date => date)
            .ToListAsync(cancellationToken);
    }
}
