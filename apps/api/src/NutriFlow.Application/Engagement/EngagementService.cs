using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Engagement;

namespace NutriFlow.Application.Engagement;

public sealed record WaterEntryDto(Guid Id, DateOnly Date, decimal AmountOunces, DateTimeOffset CreatedAtUtc);
public sealed record WaterSummaryDto(DateOnly Date, decimal TargetOunces, decimal ConsumedOunces, decimal RemainingOunces, int PercentComplete, IReadOnlyList<WaterEntryDto> Entries);
public sealed record FavoriteFoodDto(Guid FoodId, string Name, string? Brand, string Category, decimal Calories, decimal ProteinGrams, decimal CarbohydrateGrams, decimal FatGrams, DateTimeOffset FavoritedAtUtc);
public sealed record RecipeIngredientDto(Guid FoodId, string FoodName, string? Brand, decimal Servings, decimal Calories, decimal ProteinGrams, decimal CarbohydrateGrams, decimal FatGrams);
public sealed record RecipeDto(Guid Id, string Name, int Servings, string? Instructions, decimal CaloriesPerServing, decimal ProteinGramsPerServing, decimal CarbohydrateGramsPerServing, decimal FatGramsPerServing, IReadOnlyList<RecipeIngredientDto> Ingredients, DateTimeOffset CreatedAtUtc);
public sealed record EngagementOverviewDto(WaterSummaryDto Water, int CurrentStreakDays, int LongestStreakDays, int FavoriteFoods, int Recipes);
public sealed record AddWaterCommand(DateOnly? Date, decimal AmountOunces);
public sealed record CreateRecipeIngredientCommand(Guid FoodId, decimal Servings);
public sealed record CreateRecipeCommand(string Name, int Servings, string? Instructions, IReadOnlyList<CreateRecipeIngredientCommand> Ingredients);

public interface IEngagementRepository
{
    Task<IReadOnlyList<WaterEntry>> GetWaterEntriesAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default);
    Task<WaterEntry?> GetWaterEntryAsync(Guid userId, Guid entryId, CancellationToken cancellationToken = default);
    Task AddWaterEntryAsync(WaterEntry entry, CancellationToken cancellationToken = default);
    void RemoveWaterEntry(WaterEntry entry);

    Task<IReadOnlyList<FavoriteFood>> GetFavoriteFoodsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<FavoriteFood?> GetFavoriteFoodAsync(Guid userId, Guid foodId, CancellationToken cancellationToken = default);
    Task AddFavoriteFoodAsync(FavoriteFood favorite, CancellationToken cancellationToken = default);
    void RemoveFavoriteFood(FavoriteFood favorite);

    Task<IReadOnlyList<Recipe>> GetRecipesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Recipe?> GetRecipeAsync(Guid userId, Guid recipeId, CancellationToken cancellationToken = default);
    Task AddRecipeAsync(Recipe recipe, CancellationToken cancellationToken = default);
    void RemoveRecipe(Recipe recipe);

    Task<IReadOnlyList<DateOnly>> GetActivityDatesAsync(Guid userId, DateOnly from, DateOnly to, CancellationToken cancellationToken = default);
}

public interface IEngagementService
{
    Task<EngagementOverviewDto> GetOverviewAsync(Guid userId, DateOnly? date = null, CancellationToken cancellationToken = default);
    Task<WaterSummaryDto> GetWaterAsync(Guid userId, DateOnly? date = null, CancellationToken cancellationToken = default);
    Task<WaterSummaryDto> AddWaterAsync(Guid userId, AddWaterCommand command, CancellationToken cancellationToken = default);
    Task<WaterSummaryDto> RemoveWaterAsync(Guid userId, Guid entryId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FavoriteFoodDto>> GetFavoritesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FavoriteFoodDto>> AddFavoriteAsync(Guid userId, Guid foodId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FavoriteFoodDto>> RemoveFavoriteAsync(Guid userId, Guid foodId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RecipeDto>> GetRecipesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<RecipeDto?> GetRecipeAsync(Guid userId, Guid recipeId, CancellationToken cancellationToken = default);
    Task<RecipeDto> CreateRecipeAsync(Guid userId, CreateRecipeCommand command, CancellationToken cancellationToken = default);
    Task RemoveRecipeAsync(Guid userId, Guid recipeId, CancellationToken cancellationToken = default);
}

public sealed class EngagementService(
    IEngagementRepository engagement,
    IFoodRepository foods,
    IUnitOfWork unitOfWork,
    TimeProvider timeProvider) : IEngagementService
{
    public const decimal DefaultWaterTargetOunces = 64m;

    public async Task<EngagementOverviewDto> GetOverviewAsync(Guid userId, DateOnly? date = null, CancellationToken cancellationToken = default)
    {
        var selectedDate = date ?? Today();
        var water = await GetWaterAsync(userId, selectedDate, cancellationToken);
        var favorites = await engagement.GetFavoriteFoodsAsync(userId, cancellationToken);
        var recipes = await engagement.GetRecipesAsync(userId, cancellationToken);
        var dates = await engagement.GetActivityDatesAsync(userId, selectedDate.AddDays(-364), selectedDate, cancellationToken);
        var (current, longest) = CalculateStreaks(dates, selectedDate);

        return new EngagementOverviewDto(water, current, longest, favorites.Count, recipes.Count);
    }

    public async Task<WaterSummaryDto> GetWaterAsync(Guid userId, DateOnly? date = null, CancellationToken cancellationToken = default)
    {
        var selectedDate = date ?? Today();
        var entries = await engagement.GetWaterEntriesAsync(userId, selectedDate, cancellationToken);
        var consumed = entries.Sum(entry => entry.AmountOunces);
        var remaining = Math.Max(0m, DefaultWaterTargetOunces - consumed);
        var percent = (int)Math.Clamp(Math.Round(consumed / DefaultWaterTargetOunces * 100m), 0m, 999m);

        return new WaterSummaryDto(
            selectedDate,
            DefaultWaterTargetOunces,
            consumed,
            remaining,
            percent,
            entries.OrderBy(entry => entry.CreatedAtUtc)
                .Select(entry => new WaterEntryDto(entry.Id, entry.Date, entry.AmountOunces, entry.CreatedAtUtc))
                .ToArray());
    }

    public async Task<WaterSummaryDto> AddWaterAsync(Guid userId, AddWaterCommand command, CancellationToken cancellationToken = default)
    {
        var date = command.Date ?? Today();
        if (date > Today()) throw new ArgumentOutOfRangeException(nameof(command.Date), "Water date cannot be in the future.");

        await engagement.AddWaterEntryAsync(new WaterEntry(Guid.NewGuid(), userId, date, command.AmountOunces), cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetWaterAsync(userId, date, cancellationToken);
    }

    public async Task<WaterSummaryDto> RemoveWaterAsync(Guid userId, Guid entryId, CancellationToken cancellationToken = default)
    {
        var entry = await engagement.GetWaterEntryAsync(userId, entryId, cancellationToken)
            ?? throw new InvalidOperationException("Water entry was not found.");
        var date = entry.Date;
        engagement.RemoveWaterEntry(entry);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetWaterAsync(userId, date, cancellationToken);
    }

    public async Task<IReadOnlyList<FavoriteFoodDto>> GetFavoritesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var favorites = await engagement.GetFavoriteFoodsAsync(userId, cancellationToken);
        var result = new List<FavoriteFoodDto>(favorites.Count);

        foreach (var favorite in favorites)
        {
            var food = await foods.GetByIdAsync(favorite.FoodId, cancellationToken);
            if (food is null) continue;
            result.Add(new FavoriteFoodDto(
                food.Id,
                food.Name,
                food.Brand,
                food.Category,
                food.Calories,
                food.ProteinGrams,
                food.CarbohydrateGrams,
                food.FatGrams,
                favorite.CreatedAtUtc));
        }

        return result;
    }

    public async Task<IReadOnlyList<FavoriteFoodDto>> AddFavoriteAsync(Guid userId, Guid foodId, CancellationToken cancellationToken = default)
    {
        _ = await foods.GetByIdAsync(foodId, cancellationToken)
            ?? throw new InvalidOperationException("Food was not found.");

        if (await engagement.GetFavoriteFoodAsync(userId, foodId, cancellationToken) is null)
        {
            await engagement.AddFavoriteFoodAsync(new FavoriteFood(userId, foodId), cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return await GetFavoritesAsync(userId, cancellationToken);
    }

    public async Task<IReadOnlyList<FavoriteFoodDto>> RemoveFavoriteAsync(Guid userId, Guid foodId, CancellationToken cancellationToken = default)
    {
        if (await engagement.GetFavoriteFoodAsync(userId, foodId, cancellationToken) is { } favorite)
        {
            engagement.RemoveFavoriteFood(favorite);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return await GetFavoritesAsync(userId, cancellationToken);
    }

    public async Task<IReadOnlyList<RecipeDto>> GetRecipesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var recipes = await engagement.GetRecipesAsync(userId, cancellationToken);
        return recipes.Select(ToRecipeDto).ToArray();
    }

    public async Task<RecipeDto?> GetRecipeAsync(Guid userId, Guid recipeId, CancellationToken cancellationToken = default)
        => (await engagement.GetRecipeAsync(userId, recipeId, cancellationToken)) is { } recipe ? ToRecipeDto(recipe) : null;

    public async Task<RecipeDto> CreateRecipeAsync(Guid userId, CreateRecipeCommand command, CancellationToken cancellationToken = default)
    {
        if (command.Ingredients.Count is < 1 or > 20)
            throw new ArgumentException("A recipe must contain between 1 and 20 ingredients.", nameof(command.Ingredients));
        if (command.Ingredients.Select(item => item.FoodId).Distinct().Count() != command.Ingredients.Count)
            throw new ArgumentException("A food can only appear once in a recipe.", nameof(command.Ingredients));

        var recipe = new Recipe(Guid.NewGuid(), userId, command.Name, command.Servings, command.Instructions);
        foreach (var ingredient in command.Ingredients)
        {
            var food = await foods.GetByIdAsync(ingredient.FoodId, cancellationToken)
                ?? throw new InvalidOperationException($"Food {ingredient.FoodId} was not found.");
            recipe.AddIngredient(
                Guid.NewGuid(),
                food.Id,
                food.Name,
                food.Brand,
                ingredient.Servings,
                food.Calories,
                food.ProteinGrams,
                food.CarbohydrateGrams,
                food.FatGrams);
        }

        await engagement.AddRecipeAsync(recipe, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToRecipeDto(recipe);
    }

    public async Task RemoveRecipeAsync(Guid userId, Guid recipeId, CancellationToken cancellationToken = default)
    {
        var recipe = await engagement.GetRecipeAsync(userId, recipeId, cancellationToken)
            ?? throw new InvalidOperationException("Recipe was not found.");
        engagement.RemoveRecipe(recipe);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public static (int Current, int Longest) CalculateStreaks(IEnumerable<DateOnly> activityDates, DateOnly today)
    {
        var dates = activityDates.Distinct().OrderBy(date => date).ToArray();
        if (dates.Length == 0) return (0, 0);

        var set = dates.ToHashSet();
        var cursor = set.Contains(today) ? today : today.AddDays(-1);
        var current = 0;
        while (set.Contains(cursor))
        {
            current++;
            cursor = cursor.AddDays(-1);
        }

        var longest = 1;
        var running = 1;
        for (var index = 1; index < dates.Length; index++)
        {
            if (dates[index] == dates[index - 1].AddDays(1))
                running++;
            else
                running = 1;
            longest = Math.Max(longest, running);
        }

        return (current, longest);
    }

    private static RecipeDto ToRecipeDto(Recipe recipe)
    {
        var ingredientDtos = recipe.Ingredients.Select(ingredient => new RecipeIngredientDto(
            ingredient.FoodId,
            ingredient.FoodName,
            ingredient.Brand,
            ingredient.Servings,
            ingredient.CaloriesPerServing * ingredient.Servings,
            ingredient.ProteinGramsPerServing * ingredient.Servings,
            ingredient.CarbohydrateGramsPerServing * ingredient.Servings,
            ingredient.FatGramsPerServing * ingredient.Servings)).ToArray();

        var servings = recipe.Servings;
        return new RecipeDto(
            recipe.Id,
            recipe.Name,
            servings,
            recipe.Instructions,
            Round(ingredientDtos.Sum(item => item.Calories) / servings),
            Round(ingredientDtos.Sum(item => item.ProteinGrams) / servings),
            Round(ingredientDtos.Sum(item => item.CarbohydrateGrams) / servings),
            Round(ingredientDtos.Sum(item => item.FatGrams) / servings),
            ingredientDtos,
            recipe.CreatedAtUtc);
    }

    private DateOnly Today() => DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
