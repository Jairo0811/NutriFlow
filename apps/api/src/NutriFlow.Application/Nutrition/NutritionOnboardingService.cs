using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Nutrition;

namespace NutriFlow.Application.Nutrition;

public sealed record PhysicalProfileCommand(DateOnly DateOfBirth, BiologicalSex BiologicalSex, int HeightFeet, int HeightInches, decimal CurrentWeightPounds);
public sealed record GoalCommand(NutritionGoalType GoalType, decimal? TargetWeightPounds);
public sealed record NutritionProfileDto(
    Guid UserId,
    DateOnly? DateOfBirth,
    BiologicalSex? BiologicalSex,
    int? HeightFeet,
    int? HeightInches,
    decimal? CurrentWeightPounds,
    ActivityLevel? ActivityLevel,
    NutritionGoalType? GoalType,
    decimal? TargetWeightPounds,
    string[] FoodPreferenceCodes,
    string[] DietaryRestrictionCodes,
    bool IsCompleted);

public interface INutritionOnboardingService
{
    Task<NutritionProfileDto> GetAsync(Guid userId, CancellationToken cancellationToken);
    Task<NutritionProfileDto> SavePhysicalProfileAsync(Guid userId, PhysicalProfileCommand command, CancellationToken cancellationToken);
    Task<NutritionProfileDto> SaveActivityAsync(Guid userId, ActivityLevel activityLevel, CancellationToken cancellationToken);
    Task<NutritionProfileDto> SaveGoalAsync(Guid userId, GoalCommand command, CancellationToken cancellationToken);
    Task<NutritionProfileDto> SaveFoodPreferencesAsync(Guid userId, IEnumerable<string> codes, CancellationToken cancellationToken);
    Task<NutritionProfileDto> SaveDietaryRestrictionsAsync(Guid userId, IEnumerable<string> codes, CancellationToken cancellationToken);
    Task<NutritionProfileDto> CompleteAsync(Guid userId, CancellationToken cancellationToken);
}

public sealed class NutritionOnboardingService(INutritionProfileRepository profiles, IUnitOfWork unitOfWork) : INutritionOnboardingService
{
    public async Task<NutritionProfileDto> GetAsync(Guid userId, CancellationToken cancellationToken)
        => ToDto(await GetOrCreateAsync(userId, cancellationToken));

    public async Task<NutritionProfileDto> SavePhysicalProfileAsync(Guid userId, PhysicalProfileCommand command, CancellationToken cancellationToken)
    {
        if (command.HeightInches is < 0 or > 11)
            throw new ArgumentOutOfRangeException(nameof(command.HeightInches), "Inches must be between 0 and 11.");

        var profile = await GetOrCreateAsync(userId, cancellationToken);
        profile.SetPhysicalProfile(
            command.DateOfBirth,
            command.BiologicalSex,
            checked((command.HeightFeet * 12) + command.HeightInches),
            command.CurrentWeightPounds);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToDto(profile);
    }

    public async Task<NutritionProfileDto> SaveActivityAsync(Guid userId, ActivityLevel activityLevel, CancellationToken cancellationToken)
    {
        var profile = await GetOrCreateAsync(userId, cancellationToken);
        profile.SetActivity(activityLevel);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToDto(profile);
    }

    public async Task<NutritionProfileDto> SaveGoalAsync(Guid userId, GoalCommand command, CancellationToken cancellationToken)
    {
        var profile = await GetOrCreateAsync(userId, cancellationToken);
        profile.SetGoal(command.GoalType, command.TargetWeightPounds);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToDto(profile);
    }

    public async Task<NutritionProfileDto> SaveFoodPreferencesAsync(Guid userId, IEnumerable<string> codes, CancellationToken cancellationToken)
    {
        var profile = await GetOrCreateAsync(userId, cancellationToken);
        profile.SetFoodPreferences(codes);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToDto(profile);
    }

    public async Task<NutritionProfileDto> SaveDietaryRestrictionsAsync(Guid userId, IEnumerable<string> codes, CancellationToken cancellationToken)
    {
        var profile = await GetOrCreateAsync(userId, cancellationToken);
        profile.SetDietaryRestrictions(codes);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToDto(profile);
    }

    public async Task<NutritionProfileDto> CompleteAsync(Guid userId, CancellationToken cancellationToken)
    {
        var profile = await GetOrCreateAsync(userId, cancellationToken);
        profile.Complete();
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToDto(profile);
    }

    private async Task<NutritionProfile> GetOrCreateAsync(Guid userId, CancellationToken cancellationToken)
    {
        var profile = await profiles.GetByUserIdAsync(userId, cancellationToken);
        if (profile is not null) return profile;

        profile = new NutritionProfile(userId);
        await profiles.AddAsync(profile, cancellationToken);
        return profile;
    }

    private static NutritionProfileDto ToDto(NutritionProfile profile)
        => new(
            profile.UserId,
            profile.DateOfBirth,
            profile.BiologicalSex,
            profile.HeightInches / 12,
            profile.HeightInches % 12,
            profile.CurrentWeightPounds,
            profile.ActivityLevel,
            profile.GoalType,
            profile.TargetWeightPounds,
            profile.FoodPreferenceCodes,
            profile.DietaryRestrictionCodes,
            profile.IsCompleted);
}
