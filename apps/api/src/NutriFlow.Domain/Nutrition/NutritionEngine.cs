namespace NutriFlow.Domain.Nutrition;

public sealed record NutritionCalculation(
    decimal RestingEnergyCalories,
    decimal TotalDailyEnergyCalories,
    decimal TargetCalories,
    decimal ProteinGrams,
    decimal CarbohydrateGrams,
    decimal FatGrams,
    string FormulaVersion);

public static class NutritionEngine
{
    private const decimal PoundsToKilograms = 0.45359237m;
    private const decimal InchesToCentimeters = 2.54m;

    public static NutritionCalculation Calculate(NutritionProfile profile, DateOnly today)
    {
        if (!profile.IsCompleted || profile.DateOfBirth is null || profile.BiologicalSex is null ||
            profile.HeightInches is null || profile.CurrentWeightPounds is null ||
            profile.ActivityLevel is null || profile.GoalType is null)
        {
            throw new InvalidOperationException("A completed nutritional profile is required.");
        }

        var age = CalculateAge(profile.DateOfBirth.Value, today);
        if (age < 18)
            throw new InvalidOperationException("The current nutrition engine is restricted to adults 18 years or older.");

        var weightKg = profile.CurrentWeightPounds.Value * PoundsToKilograms;
        var heightCm = profile.HeightInches.Value * InchesToCentimeters;
        var sexConstant = profile.BiologicalSex.Value == BiologicalSex.Male ? 5m : -161m;

        // Mifflin-St Jeor resting-energy equation. Imperial data remains the product contract;
        // metric conversion is intentionally encapsulated inside this engine.
        var ree = (10m * weightKg) + (6.25m * heightCm) - (5m * age) + sexConstant;
        var tdee = ree * ActivityMultiplier(profile.ActivityLevel.Value);
        var target = tdee * GoalMultiplier(profile.GoalType.Value);
        var macroSplit = MacroSplit(profile.GoalType.Value);

        var protein = target * macroSplit.Protein / 4m;
        var carbohydrates = target * macroSplit.Carbohydrates / 4m;
        var fat = target * macroSplit.Fat / 9m;

        return new NutritionCalculation(
            RoundCalories(ree),
            RoundCalories(tdee),
            RoundCalories(target),
            RoundGrams(protein),
            RoundGrams(carbohydrates),
            RoundGrams(fat),
            "mifflin-st-jeor-v1");
    }

    private static int CalculateAge(DateOnly birthDate, DateOnly today)
    {
        var age = today.Year - birthDate.Year;
        if (birthDate > today.AddYears(-age)) age--;
        return age;
    }

    private static decimal ActivityMultiplier(ActivityLevel level) => level switch
    {
        ActivityLevel.Sedentary => 1.20m,
        ActivityLevel.Light => 1.375m,
        ActivityLevel.Moderate => 1.55m,
        ActivityLevel.High => 1.725m,
        _ => throw new ArgumentOutOfRangeException(nameof(level))
    };

    // Product defaults, intentionally centralized so they can later be versioned/configured.
    private static decimal GoalMultiplier(NutritionGoalType goal) => goal switch
    {
        NutritionGoalType.LoseFat => 0.90m,
        NutritionGoalType.MaintainWeight => 1.00m,
        NutritionGoalType.GainMuscle => 1.10m,
        _ => throw new ArgumentOutOfRangeException(nameof(goal))
    };

    private static (decimal Protein, decimal Carbohydrates, decimal Fat) MacroSplit(NutritionGoalType goal) => goal switch
    {
        NutritionGoalType.LoseFat => (0.30m, 0.40m, 0.30m),
        NutritionGoalType.MaintainWeight => (0.25m, 0.45m, 0.30m),
        NutritionGoalType.GainMuscle => (0.30m, 0.45m, 0.25m),
        _ => throw new ArgumentOutOfRangeException(nameof(goal))
    };

    private static decimal RoundCalories(decimal value) => Math.Round(value, 0, MidpointRounding.AwayFromZero);
    private static decimal RoundGrams(decimal value) => Math.Round(value, 1, MidpointRounding.AwayFromZero);
}
