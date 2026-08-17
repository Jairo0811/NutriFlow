using NutriFlow.Domain.Foods;

namespace NutriFlow.Domain.Meals;

public enum MealType
{
    Breakfast = 1,
    Lunch = 2,
    Dinner = 3,
    Snack = 4
}

public sealed class Meal
{
    private readonly List<MealEntry> _entries = [];

    private Meal() { }

    public Meal(Guid id, Guid userId, DateOnly date, MealType type)
    {
        if (id == Guid.Empty) throw new ArgumentException("Meal id is required.", nameof(id));
        if (userId == Guid.Empty) throw new ArgumentException("User id is required.", nameof(userId));

        Id = id;
        UserId = userId;
        Date = date;
        Type = type;
        CreatedAtUtc = DateTimeOffset.UtcNow;
        UpdatedAtUtc = CreatedAtUtc;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public DateOnly Date { get; private set; }
    public MealType Type { get; private set; }
    public IReadOnlyCollection<MealEntry> Entries => _entries.AsReadOnly();
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public MealEntry AddEntry(Food food, decimal servings)
    {
        ArgumentNullException.ThrowIfNull(food);
        if (!food.IsActive) throw new InvalidOperationException("Inactive foods cannot be logged.");
        if (servings <= 0 || servings > 100) throw new ArgumentOutOfRangeException(nameof(servings));

        var entry = new MealEntry(Guid.NewGuid(), Id, food, servings);
        _entries.Add(entry);
        Touch();
        return entry;
    }

    public void UpdateEntryServings(Guid entryId, decimal servings)
    {
        if (servings <= 0 || servings > 100) throw new ArgumentOutOfRangeException(nameof(servings));

        var entry = _entries.SingleOrDefault(item => item.Id == entryId)
            ?? throw new InvalidOperationException("Meal entry was not found.");

        entry.UpdateServings(servings);
        Touch();
    }

    public void RemoveEntry(Guid entryId)
    {
        var entry = _entries.SingleOrDefault(item => item.Id == entryId)
            ?? throw new InvalidOperationException("Meal entry was not found.");

        _entries.Remove(entry);
        Touch();
    }

    private void Touch() => UpdatedAtUtc = DateTimeOffset.UtcNow;
}

public sealed class MealEntry
{
    private MealEntry() { }

    internal MealEntry(Guid id, Guid mealId, Food food, decimal servings)
    {
        Id = id;
        MealId = mealId;
        FoodId = food.Id;
        FoodName = food.Name;
        Brand = food.Brand;
        ServingSize = food.ServingSize;
        ServingUnit = food.ServingUnit;
        CaloriesPerServing = food.Calories;
        ProteinGramsPerServing = food.ProteinGrams;
        CarbohydrateGramsPerServing = food.CarbohydrateGrams;
        FatGramsPerServing = food.FatGrams;
        Servings = servings;
        CreatedAtUtc = DateTimeOffset.UtcNow;
        UpdatedAtUtc = CreatedAtUtc;
    }

    public Guid Id { get; private set; }
    public Guid MealId { get; private set; }
    public Guid FoodId { get; private set; }
    public string FoodName { get; private set; } = string.Empty;
    public string? Brand { get; private set; }
    public decimal ServingSize { get; private set; }
    public string ServingUnit { get; private set; } = string.Empty;
    public decimal Servings { get; private set; }
    public decimal CaloriesPerServing { get; private set; }
    public decimal ProteinGramsPerServing { get; private set; }
    public decimal CarbohydrateGramsPerServing { get; private set; }
    public decimal FatGramsPerServing { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public decimal TotalCalories => CaloriesPerServing * Servings;
    public decimal TotalProteinGrams => ProteinGramsPerServing * Servings;
    public decimal TotalCarbohydrateGrams => CarbohydrateGramsPerServing * Servings;
    public decimal TotalFatGrams => FatGramsPerServing * Servings;

    internal void UpdateServings(decimal servings)
    {
        Servings = servings;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
}
