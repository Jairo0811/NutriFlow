namespace NutriFlow.Domain.Nutrition;

public enum BiologicalSex
{
    Female = 1,
    Male = 2
}

public enum ActivityLevel
{
    Sedentary = 1,
    Light = 2,
    Moderate = 3,
    High = 4
}

public enum NutritionGoalType
{
    LoseFat = 1,
    MaintainWeight = 2,
    GainMuscle = 3
}

public sealed class NutritionProfile
{
    private static readonly HashSet<string> AllowedPreferenceCodes = new(StringComparer.OrdinalIgnoreCase)
    {
        "protein", "carbohydrates", "fats", "dairy", "fruits"
    };

    private static readonly HashSet<string> AllowedRestrictionCodes = new(StringComparer.OrdinalIgnoreCase)
    {
        "gluten", "wheat", "milk", "eggs", "fish", "shellfish", "peanuts", "tree_nuts", "soy", "sesame"
    };

    private NutritionProfile() { }

    public NutritionProfile(Guid userId)
    {
        UserId = userId;
        CreatedAtUtc = DateTimeOffset.UtcNow;
        UpdatedAtUtc = CreatedAtUtc;
    }

    public Guid UserId { get; private set; }
    public DateOnly? DateOfBirth { get; private set; }
    public BiologicalSex? BiologicalSex { get; private set; }
    public int? HeightInches { get; private set; }
    public decimal? CurrentWeightPounds { get; private set; }
    public ActivityLevel? ActivityLevel { get; private set; }
    public NutritionGoalType? GoalType { get; private set; }
    public decimal? TargetWeightPounds { get; private set; }
    public string[] FoodPreferenceCodes { get; private set; } = [];
    public string[] DietaryRestrictionCodes { get; private set; } = [];
    public bool IsCompleted { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }
    public DateTimeOffset? CompletedAtUtc { get; private set; }

    public void SetPhysicalProfile(DateOnly dateOfBirth, BiologicalSex biologicalSex, int heightInches, decimal currentWeightPounds)
    {
        if (dateOfBirth >= DateOnly.FromDateTime(DateTime.UtcNow)) throw new ArgumentOutOfRangeException(nameof(dateOfBirth));
        if (heightInches is < 36 or > 96) throw new ArgumentOutOfRangeException(nameof(heightInches), "Height must be between 3 ft and 8 ft.");
        if (currentWeightPounds is < 60 or > 800) throw new ArgumentOutOfRangeException(nameof(currentWeightPounds), "Weight must be between 60 lb and 800 lb.");

        DateOfBirth = dateOfBirth;
        BiologicalSex = biologicalSex;
        HeightInches = heightInches;
        CurrentWeightPounds = currentWeightPounds;
        Touch();
    }

    public void SetActivity(ActivityLevel activityLevel)
    {
        ActivityLevel = activityLevel;
        Touch();
    }

    public void SetGoal(NutritionGoalType goalType, decimal? targetWeightPounds)
    {
        if (goalType != NutritionGoalType.MaintainWeight && targetWeightPounds is null)
            throw new ArgumentException("A target weight is required for this goal.", nameof(targetWeightPounds));
        if (targetWeightPounds is < 60 or > 800) throw new ArgumentOutOfRangeException(nameof(targetWeightPounds));

        GoalType = goalType;
        TargetWeightPounds = goalType == NutritionGoalType.MaintainWeight ? CurrentWeightPounds : targetWeightPounds;
        Touch();
    }

    public void SetFoodPreferences(IEnumerable<string> codes)
    {
        FoodPreferenceCodes = NormalizeCodes(codes, AllowedPreferenceCodes, "food preference");
        Touch();
    }

    public void SetDietaryRestrictions(IEnumerable<string> codes)
    {
        DietaryRestrictionCodes = NormalizeCodes(codes, AllowedRestrictionCodes, "dietary restriction");
        Touch();
    }

    public void Complete()
    {
        if (DateOfBirth is null || BiologicalSex is null || HeightInches is null || CurrentWeightPounds is null || ActivityLevel is null || GoalType is null)
            throw new InvalidOperationException("The nutritional profile is incomplete.");

        IsCompleted = true;
        CompletedAtUtc = DateTimeOffset.UtcNow;
        Touch();
    }

    private static string[] NormalizeCodes(IEnumerable<string> codes, HashSet<string> allowed, string label)
    {
        var normalized = codes.Where(code => !string.IsNullOrWhiteSpace(code)).Select(code => code.Trim().ToLowerInvariant()).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        var invalid = normalized.FirstOrDefault(code => !allowed.Contains(code));
        if (invalid is not null) throw new ArgumentException($"Unsupported {label} code: {invalid}.", nameof(codes));
        return normalized;
    }

    private void Touch() => UpdatedAtUtc = DateTimeOffset.UtcNow;
}
