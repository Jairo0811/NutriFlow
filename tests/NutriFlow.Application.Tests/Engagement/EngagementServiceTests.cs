using NutriFlow.Application.Abstractions;
using NutriFlow.Application.Engagement;
using NutriFlow.Domain.Engagement;
using NutriFlow.Domain.Foods;

namespace NutriFlow.Application.Tests.Engagement;

public sealed class EngagementServiceTests
{
    private static readonly Guid UserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly DateOnly Today = new(2026, 9, 4);

    [Fact]
    public async Task AddWater_AccumulatesDailyProgress()
    {
        var repository = new FakeEngagementRepository();
        var service = CreateService(repository);

        await service.AddWaterAsync(UserId, new AddWaterCommand(Today, 16m));
        var summary = await service.AddWaterAsync(UserId, new AddWaterCommand(Today, 24m));

        Assert.Equal(40m, summary.ConsumedOunces);
        Assert.Equal(24m, summary.RemainingOunces);
        Assert.Equal(2, summary.Entries.Count);
    }

    [Fact]
    public void CalculateStreaks_UsesTodayOrYesterdayAsCurrentAnchor()
    {
        var dates = new[]
        {
            Today.AddDays(-6),
            Today.AddDays(-5),
            Today.AddDays(-4),
            Today.AddDays(-2),
            Today.AddDays(-1),
            Today
        };

        var streaks = EngagementService.CalculateStreaks(dates, Today);

        Assert.Equal(3, streaks.Current);
        Assert.Equal(3, streaks.Longest);
    }

    [Fact]
    public async Task AddFavorite_IsIdempotent()
    {
        var food = CreateFood("Mangú", 240m, 4m, 52m, 2m);
        var foods = new FakeFoodRepository(food);
        var repository = new FakeEngagementRepository();
        var service = CreateService(repository, foods);

        await service.AddFavoriteAsync(UserId, food.Id);
        var favorites = await service.AddFavoriteAsync(UserId, food.Id);

        Assert.Single(favorites);
        Assert.Equal("Mangú", favorites[0].Name);
        Assert.Single(repository.Favorites);
    }

    [Fact]
    public async Task CreateRecipe_CalculatesNutritionPerRecipeServing()
    {
        var rice = CreateFood("Arroz blanco", 200m, 4m, 44m, 1m);
        var chicken = CreateFood("Pollo guisado", 180m, 28m, 4m, 6m);
        var foods = new FakeFoodRepository(rice, chicken);
        var service = CreateService(new FakeEngagementRepository(), foods);

        var recipe = await service.CreateRecipeAsync(UserId, new CreateRecipeCommand(
            "La bandera rápida",
            2,
            null,
            new[]
            {
                new CreateRecipeIngredientCommand(rice.Id, 2m),
                new CreateRecipeIngredientCommand(chicken.Id, 2m)
            }));

        Assert.Equal(380m, recipe.CaloriesPerServing);
        Assert.Equal(32m, recipe.ProteinGramsPerServing);
        Assert.Equal(48m, recipe.CarbohydrateGramsPerServing);
        Assert.Equal(7m, recipe.FatGramsPerServing);
        Assert.Equal(2, recipe.Ingredients.Count);
    }

    private static EngagementService CreateService(
        FakeEngagementRepository repository,
        IFoodRepository? foods = null)
        => new(
            repository,
            foods ?? new FakeFoodRepository(),
            new FakeUnitOfWork(),
            new FixedTimeProvider(new DateTimeOffset(2026, 9, 4, 12, 0, 0, TimeSpan.Zero)));

    private static Food CreateFood(string name, decimal calories, decimal protein, decimal carbs, decimal fat)
        => new(Guid.NewGuid(), name, "dominican", 1m, "serving", calories, protein, carbs, fat);

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken) => Task.FromResult(1);
    }

    private sealed class FakeFoodRepository(params Food[] initial) : IFoodRepository
    {
        private readonly Dictionary<Guid, Food> _foods = initial.ToDictionary(food => food.Id);

        public Task<IReadOnlyList<Food>> SearchAsync(string? query, string? category, int take, CancellationToken cancellationToken = default)
            => Task.FromResult<IReadOnlyList<Food>>(_foods.Values.Take(take).ToArray());
        public Task<Food?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
            => Task.FromResult(_foods.GetValueOrDefault(id));
        public Task<Food?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken = default)
            => Task.FromResult<Food?>(null);
        public Task AddAsync(Food food, CancellationToken cancellationToken = default)
        {
            _foods[food.Id] = food;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeEngagementRepository : IEngagementRepository
    {
        public List<WaterEntry> Water { get; } = [];
        public List<FavoriteFood> Favorites { get; } = [];
        public List<Recipe> Recipes { get; } = [];
        public List<DateOnly> ActivityDates { get; } = [];

        public Task<IReadOnlyList<WaterEntry>> GetWaterEntriesAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
            => Task.FromResult<IReadOnlyList<WaterEntry>>(Water.Where(entry => entry.UserId == userId && entry.Date == date).ToArray());
        public Task<WaterEntry?> GetWaterEntryAsync(Guid userId, Guid entryId, CancellationToken cancellationToken = default)
            => Task.FromResult(Water.SingleOrDefault(entry => entry.UserId == userId && entry.Id == entryId));
        public Task AddWaterEntryAsync(WaterEntry entry, CancellationToken cancellationToken = default)
        {
            Water.Add(entry);
            ActivityDates.Add(entry.Date);
            return Task.CompletedTask;
        }
        public void RemoveWaterEntry(WaterEntry entry) => Water.Remove(entry);

        public Task<IReadOnlyList<FavoriteFood>> GetFavoriteFoodsAsync(Guid userId, CancellationToken cancellationToken = default)
            => Task.FromResult<IReadOnlyList<FavoriteFood>>(Favorites.Where(item => item.UserId == userId).ToArray());
        public Task<FavoriteFood?> GetFavoriteFoodAsync(Guid userId, Guid foodId, CancellationToken cancellationToken = default)
            => Task.FromResult(Favorites.SingleOrDefault(item => item.UserId == userId && item.FoodId == foodId));
        public Task AddFavoriteFoodAsync(FavoriteFood favorite, CancellationToken cancellationToken = default)
        {
            Favorites.Add(favorite);
            return Task.CompletedTask;
        }
        public void RemoveFavoriteFood(FavoriteFood favorite) => Favorites.Remove(favorite);

        public Task<IReadOnlyList<Recipe>> GetRecipesAsync(Guid userId, CancellationToken cancellationToken = default)
            => Task.FromResult<IReadOnlyList<Recipe>>(Recipes.Where(item => item.UserId == userId).ToArray());
        public Task<Recipe?> GetRecipeAsync(Guid userId, Guid recipeId, CancellationToken cancellationToken = default)
            => Task.FromResult(Recipes.SingleOrDefault(item => item.UserId == userId && item.Id == recipeId));
        public Task AddRecipeAsync(Recipe recipe, CancellationToken cancellationToken = default)
        {
            Recipes.Add(recipe);
            return Task.CompletedTask;
        }
        public void RemoveRecipe(Recipe recipe) => Recipes.Remove(recipe);

        public Task<IReadOnlyList<DateOnly>> GetActivityDatesAsync(Guid userId, DateOnly from, DateOnly to, CancellationToken cancellationToken = default)
            => Task.FromResult<IReadOnlyList<DateOnly>>(ActivityDates.Where(date => date >= from && date <= to).Distinct().ToArray());
    }
}
