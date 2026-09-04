namespace NutriFlow.Domain.Foods;

public enum FoodSource
{
    System = 1,
    User = 2,
    External = 3
}

public sealed class Food
{
    private static readonly HashSet<string> AllowedAllergenCodes = new(StringComparer.OrdinalIgnoreCase)
    {
        "gluten", "wheat", "milk", "eggs", "fish", "shellfish", "peanuts", "tree_nuts", "soy", "sesame"
    };

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
        string? barcode = null,
        IEnumerable<string>? allergenCodes = null,
        decimal fiberGrams = 0,
        decimal sodiumMilligrams = 0,
        decimal potassiumMilligrams = 0,
        decimal calciumMilligrams = 0,
        decimal ironMilligrams = 0,
        decimal vitaminCMilligrams = 0,
        decimal vitaminDMicrograms = 0)
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
        if (fiberGrams < 0 || sodiumMilligrams < 0 || potassiumMilligrams < 0 || calciumMilligrams < 0 || ironMilligrams < 0 || vitaminCMilligrams < 0 || vitaminDMicrograms < 0)
            throw new ArgumentOutOfRangeException(nameof(fiberGrams), "Micronutrients cannot be negative.");

        ServingSize = servingSize;
        Calories = calories;
        ProteinGrams = proteinGrams;
        CarbohydrateGrams = carbohydrateGrams;
        FatGrams = fatGrams;
        FiberGrams = fiberGrams;
        SodiumMilligrams = sodiumMilligrams;
        PotassiumMilligrams = potassiumMilligrams;
        CalciumMilligrams = calciumMilligrams;
        IronMilligrams = ironMilligrams;
        VitaminCMilligrams = vitaminCMilligrams;
        VitaminDMicrograms = vitaminDMicrograms;
        AllergenCodes = NormalizeAllergens(allergenCodes ?? []);
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
    public decimal FiberGrams { get; private set; }
    public decimal SodiumMilligrams { get; private set; }
    public decimal PotassiumMilligrams { get; private set; }
    public decimal CalciumMilligrams { get; private set; }
    public decimal IronMilligrams { get; private set; }
    public decimal VitaminCMilligrams { get; private set; }
    public decimal VitaminDMicrograms { get; private set; }
    public string? Barcode { get; private set; }
    public string[] AllergenCodes { get; private set; } = [];
    public FoodSource Source { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    private static string[] NormalizeAllergens(IEnumerable<string> codes)
    {
        var normalized = codes.Where(code => !string.IsNullOrWhiteSpace(code)).Select(code => code.Trim().ToLowerInvariant()).Distinct().ToArray();
        var invalid = normalized.FirstOrDefault(code => !AllowedAllergenCodes.Contains(code));
        if (invalid is not null) throw new ArgumentException($"Unsupported allergen code: {invalid}.", nameof(codes));
        return normalized;
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
