namespace NutriFlow.Domain.Engagement;

public sealed class WaterEntry
{
    private WaterEntry() { }

    public WaterEntry(Guid id, Guid userId, DateOnly date, decimal amountOunces)
    {
        if (id == Guid.Empty) throw new ArgumentException("Water entry id is required.", nameof(id));
        if (userId == Guid.Empty) throw new ArgumentException("User id is required.", nameof(userId));
        if (amountOunces is < 1 or > 128) throw new ArgumentOutOfRangeException(nameof(amountOunces), "Water amount must be between 1 oz and 128 oz.");

        Id = id;
        UserId = userId;
        Date = date;
        AmountOunces = amountOunces;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public DateOnly Date { get; private set; }
    public decimal AmountOunces { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
}

public sealed class FavoriteFood
{
    private FavoriteFood() { }

    public FavoriteFood(Guid userId, Guid foodId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("User id is required.", nameof(userId));
        if (foodId == Guid.Empty) throw new ArgumentException("Food id is required.", nameof(foodId));

        UserId = userId;
        FoodId = foodId;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid UserId { get; private set; }
    public Guid FoodId { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
}

public sealed class Recipe
{
    private readonly List<RecipeIngredient> _ingredients = [];

    private Recipe() { }

    public Recipe(Guid id, Guid userId, string name, int servings, string? instructions = null)
    {
        if (id == Guid.Empty) throw new ArgumentException("Recipe id is required.", nameof(id));
        if (userId == Guid.Empty) throw new ArgumentException("User id is required.", nameof(userId));
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Recipe name is required.", nameof(name));
        if (name.Trim().Length > 120) throw new ArgumentException("Recipe name must not exceed 120 characters.", nameof(name));
        if (servings is < 1 or > 24) throw new ArgumentOutOfRangeException(nameof(servings), "Recipe servings must be between 1 and 24.");

        Id = id;
        UserId = userId;
        Name = name.Trim();
        Servings = servings;
        Instructions = string.IsNullOrWhiteSpace(instructions) ? null : instructions.Trim();
        if (Instructions?.Length > 2000) throw new ArgumentException("Recipe instructions must not exceed 2000 characters.", nameof(instructions));
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public int Servings { get; private set; }
    public string? Instructions { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public IReadOnlyCollection<RecipeIngredient> Ingredients => _ingredients.AsReadOnly();

    public void AddIngredient(
        Guid ingredientId,
        Guid foodId,
        string foodName,
        string? brand,
        decimal servings,
        decimal caloriesPerServing,
        decimal proteinGramsPerServing,
        decimal carbohydrateGramsPerServing,
        decimal fatGramsPerServing)
    {
        _ingredients.Add(new RecipeIngredient(
            ingredientId,
            Id,
            foodId,
            foodName,
            brand,
            servings,
            caloriesPerServing,
            proteinGramsPerServing,
            carbohydrateGramsPerServing,
            fatGramsPerServing));
    }
}

public sealed class RecipeIngredient
{
    private RecipeIngredient() { }

    public RecipeIngredient(
        Guid id,
        Guid recipeId,
        Guid foodId,
        string foodName,
        string? brand,
        decimal servings,
        decimal caloriesPerServing,
        decimal proteinGramsPerServing,
        decimal carbohydrateGramsPerServing,
        decimal fatGramsPerServing)
    {
        if (id == Guid.Empty) throw new ArgumentException("Ingredient id is required.", nameof(id));
        if (recipeId == Guid.Empty) throw new ArgumentException("Recipe id is required.", nameof(recipeId));
        if (foodId == Guid.Empty) throw new ArgumentException("Food id is required.", nameof(foodId));
        if (string.IsNullOrWhiteSpace(foodName)) throw new ArgumentException("Food name is required.", nameof(foodName));
        if (servings is <= 0 or > 100) throw new ArgumentOutOfRangeException(nameof(servings), "Ingredient servings must be greater than 0 and at most 100.");

        Id = id;
        RecipeId = recipeId;
        FoodId = foodId;
        FoodName = foodName.Trim();
        Brand = string.IsNullOrWhiteSpace(brand) ? null : brand.Trim();
        Servings = servings;
        CaloriesPerServing = caloriesPerServing;
        ProteinGramsPerServing = proteinGramsPerServing;
        CarbohydrateGramsPerServing = carbohydrateGramsPerServing;
        FatGramsPerServing = fatGramsPerServing;
    }

    public Guid Id { get; private set; }
    public Guid RecipeId { get; private set; }
    public Guid FoodId { get; private set; }
    public string FoodName { get; private set; } = string.Empty;
    public string? Brand { get; private set; }
    public decimal Servings { get; private set; }
    public decimal CaloriesPerServing { get; private set; }
    public decimal ProteinGramsPerServing { get; private set; }
    public decimal CarbohydrateGramsPerServing { get; private set; }
    public decimal FatGramsPerServing { get; private set; }
}
