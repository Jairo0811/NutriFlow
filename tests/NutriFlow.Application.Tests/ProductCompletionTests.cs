using NutriFlow.Domain.Foods;
using NutriFlow.Domain.Progress;

namespace NutriFlow.Application.Tests;

public sealed class ProductCompletionTests
{
    [Fact]
    public void WeightEntry_UsesPoundsAndRejectsOutOfRangeValues()
    {
        var entry = new WeightEntry(Guid.NewGuid(), Guid.NewGuid(), new DateOnly(2026, 8, 17), 218.5m, "Weekly check-in");

        Assert.Equal(218.5m, entry.WeightPounds);
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            new WeightEntry(Guid.NewGuid(), Guid.NewGuid(), new DateOnly(2026, 8, 17), 20m));
    }

    [Fact]
    public void Food_NormalizesAndDeduplicatesAllergenCodes()
    {
        var food = new Food(
            Guid.NewGuid(), "Protein Bar", "protein", 1m, "bar", 210m, 20m, 22m, 7m,
            FoodSource.System, "NutriFlow", "1234567890123", new[] { " PEANUTS ", "peanuts", "milk" });

        Assert.Equal(new[] { "peanuts", "milk" }, food.AllergenCodes);
    }

    [Fact]
    public void Food_RejectsUnsupportedAllergenCodes()
    {
        Assert.Throws<ArgumentException>(() =>
            new Food(Guid.NewGuid(), "Food", "other", 1m, "unit", 10m, 1m, 1m, 1m,
                allergenCodes: new[] { "unsupported" }));
    }
}
