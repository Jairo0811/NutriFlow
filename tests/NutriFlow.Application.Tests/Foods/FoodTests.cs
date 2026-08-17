using NutriFlow.Domain.Foods;

namespace NutriFlow.Application.Tests.Foods;

public sealed class FoodTests
{
    [Fact]
    public void Create_WithValidNutritionData_NormalizesCatalogFields()
    {
        var food = new Food(
            Guid.NewGuid(),
            "  Greek Yogurt  ",
            "  Dairy  ",
            170m,
            "  g  ",
            100m,
            17m,
            6m,
            0m,
            FoodSource.User,
            "NutriFlow Test");

        Assert.Equal("Greek Yogurt", food.Name);
        Assert.Equal("dairy", food.Category);
        Assert.Equal("g", food.ServingUnit);
        Assert.Equal(17m, food.ProteinGrams);
        Assert.True(food.IsActive);
    }

    [Fact]
    public void Create_WithNegativeMacronutrients_Throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new Food(
            Guid.NewGuid(), "Invalid food", "protein", 100m, "g", 100m, -1m, 10m, 2m));
    }

    [Fact]
    public void Create_WithInvalidServingSize_Throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new Food(
            Guid.NewGuid(), "Invalid food", "protein", 0m, "g", 100m, 10m, 10m, 2m));
    }

    [Fact]
    public void Deactivate_MarksFoodUnavailable()
    {
        var food = new Food(Guid.NewGuid(), "Banana", "fruits", 1m, "item", 105m, 1.3m, 27m, 0.4m);

        food.Deactivate();

        Assert.False(food.IsActive);
    }
}
