using NutriFlow.Domain.Foods;
using NutriFlow.Domain.Meals;

namespace NutriFlow.Application.Tests.Meals;

public sealed class MealTests
{
    [Fact]
    public void AddEntry_CapturesFoodSnapshotAndTotals()
    {
        var food = CreateFood();
        var meal = new Meal(Guid.NewGuid(), Guid.NewGuid(), new DateOnly(2026, 8, 17), MealType.Breakfast);

        var entry = meal.AddEntry(food, 1.5m);

        Assert.Single(meal.Entries);
        Assert.Equal("Greek Yogurt", entry.FoodName);
        Assert.Equal(150m, entry.ServingSize);
        Assert.Equal(180m, entry.TotalCalories);
        Assert.Equal(15m, entry.TotalProteinGrams);
        Assert.Equal(21m, entry.TotalCarbohydrateGrams);
        Assert.Equal(4.5m, entry.TotalFatGrams);
    }

    [Fact]
    public void AddEntry_RejectsInvalidServings()
    {
        var meal = new Meal(Guid.NewGuid(), Guid.NewGuid(), new DateOnly(2026, 8, 17), MealType.Lunch);

        Assert.Throws<ArgumentOutOfRangeException>(() => meal.AddEntry(CreateFood(), 0));
        Assert.Throws<ArgumentOutOfRangeException>(() => meal.AddEntry(CreateFood(), 101));
    }

    [Fact]
    public void UpdateEntryServings_RecalculatesTotalsFromSnapshot()
    {
        var meal = new Meal(Guid.NewGuid(), Guid.NewGuid(), new DateOnly(2026, 8, 17), MealType.Dinner);
        var entry = meal.AddEntry(CreateFood(), 1);

        meal.UpdateEntryServings(entry.Id, 2);

        Assert.Equal(2m, entry.Servings);
        Assert.Equal(240m, entry.TotalCalories);
        Assert.Equal(20m, entry.TotalProteinGrams);
    }

    [Fact]
    public void RemoveEntry_RemovesOnlyRequestedEntry()
    {
        var meal = new Meal(Guid.NewGuid(), Guid.NewGuid(), new DateOnly(2026, 8, 17), MealType.Snack);
        var first = meal.AddEntry(CreateFood(), 1);
        meal.AddEntry(new Food(Guid.NewGuid(), "Banana", "fruits", 1, "unit", 105, 1.3m, 27, 0.4m), 1);

        meal.RemoveEntry(first.Id);

        var remaining = Assert.Single(meal.Entries);
        Assert.Equal("Banana", remaining.FoodName);
    }

    [Fact]
    public void AddEntry_RejectsInactiveFood()
    {
        var food = CreateFood();
        food.Deactivate();
        var meal = new Meal(Guid.NewGuid(), Guid.NewGuid(), new DateOnly(2026, 8, 17), MealType.Breakfast);

        Assert.Throws<InvalidOperationException>(() => meal.AddEntry(food, 1));
    }

    private static Food CreateFood()
        => new(
            Guid.NewGuid(),
            "Greek Yogurt",
            "dairy",
            150,
            "g",
            120,
            10,
            14,
            3,
            FoodSource.System,
            "NutriFlow");
}
