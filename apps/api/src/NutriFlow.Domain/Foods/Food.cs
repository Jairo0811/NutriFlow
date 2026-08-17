namespace NutriFlow.Domain.Foods;

public enum FoodSource
{
    System = 1,
    User = 2,
    External = 3
}

public sealed class Food
{
    private Food() { }

    public Food(
        Guid id,
        string name,
        string category,
        decimal servingSize,
        string servingUnit,
        decimal calories,
        decimal proteinGrams,
        decimal carbohydrateGrams,
        decimal fatGrams,
        FoodSource source = FoodSource.System,
        string? brand = null,
        string? barcode = null)
    {
        if (id == Guid.Empty) throw new ArgumentException("Food id is required.", nameof(id));

        Id = id;
        Name = Required(name, nameof(name), 120);
        Category = Required(category, nameof(category), 60).ToLowerInvariant();
        ServingUnit = Required(servingUnit, nameof(servingUnit), 24).ToLowerInvariant();
        Brand = Optional(brand, 120);
        Barcode = Optional(barcode, 32);

        if (servingSize <= 0 || servingSize > 10_000) throw new ArgumentOutOfRangeException(nameof(servingSize));
        if (calories < 0 || calories > 10_000) throw new ArgumentOutOfRangeException(nameof(calories));
        if (proteinGrams < 0 || carbohydrateGrams < 0 || fatGrams < 0) throw new ArgumentOutOfRangeException(nameof(proteinGrams), "Macronutrients cannot be negative.");

        ServingSize = servingSize;
        Calories = calories;
        ProteinGrams = proteinGrams;
        CarbohydrateGrams = carbohydrateGrams;
        FatGrams = fatGrams;
        Source = source;
        IsActive = true;
        CreatedAtUtc = DateTimeOffset.UtcNow;
        UpdatedAtUtc = CreatedAtUtc;
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Brand { get; private set; }
    public string Category { get; private set; } = string.Empty;
    public decimal ServingSize { get; private set; }
    public string ServingUnit { get; private set; } = string.Empty;
    public decimal Calories { get; private set; }
    public decimal ProteinGrams { get; private set; }
    public decimal CarbohydrateGrams { get; private set; }
    public decimal FatGrams { get; private set; }
    public string? Barcode { get; private set; }
    public FoodSource Source { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    private static string Required(string value, string parameter, int maxLength)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (normalized.Length is 0 || normalized.Length > maxLength) throw new ArgumentException($"{parameter} is required and must not exceed {maxLength} characters.", parameter);
        return normalized;
    }

    private static string? Optional(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var normalized = value.Trim();
        if (normalized.Length > maxLength) throw new ArgumentException($"Value must not exceed {maxLength} characters.");
        return normalized;
    }
}
