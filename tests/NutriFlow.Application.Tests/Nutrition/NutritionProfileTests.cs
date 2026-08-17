using NutriFlow.Domain.Nutrition;

namespace NutriFlow.Application.Tests.Nutrition;

public sealed class NutritionProfileTests
{
    [Fact]
    public void SetPhysicalProfile_WithValidImperialValues_PersistsCanonicalInchesAndPounds()
    {
        var profile = new NutritionProfile(Guid.NewGuid());

        profile.SetPhysicalProfile(new DateOnly(1997, 11, 8), BiologicalSex.Male, 68, 220m);

        Assert.Equal(68, profile.HeightInches);
        Assert.Equal(220m, profile.CurrentWeightPounds);
    }

    [Fact]
    public void SetPhysicalProfile_WithInvalidHeight_Throws()
    {
        var profile = new NutritionProfile(Guid.NewGuid());

        Assert.Throws<ArgumentOutOfRangeException>(() =>
            profile.SetPhysicalProfile(new DateOnly(1997, 11, 8), BiologicalSex.Male, 20, 220m));
    }

    [Fact]
    public void Complete_WhenRequiredDataExists_CompletesOnboarding()
    {
        var profile = new NutritionProfile(Guid.NewGuid());
        profile.SetPhysicalProfile(new DateOnly(1997, 11, 8), BiologicalSex.Male, 68, 220m);
        profile.SetActivity(ActivityLevel.Moderate);
        profile.SetGoal(NutritionGoalType.LoseFat, 185m);

        profile.Complete();

        Assert.True(profile.IsCompleted);
        Assert.NotNull(profile.CompletedAtUtc);
    }
}
