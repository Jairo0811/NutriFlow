using NutriFlow.Domain.Nutrition;

namespace NutriFlow.Application.Tests.Nutrition;

public sealed class NutritionEngineTests
{
    [Fact]
    public void Calculate_CompletedAdultProfile_ReturnsDeterministicTargets()
    {
        var profile = BuildCompletedProfile();

        var result = NutritionEngine.Calculate(profile, new DateOnly(2026, 8, 17));

        Assert.True(result.RestingEnergyCalories > 0);
        Assert.True(result.TotalDailyEnergyCalories > result.RestingEnergyCalories);
        Assert.True(result.TargetCalories > 0);
        Assert.True(result.ProteinGrams > 0);
        Assert.True(result.CarbohydrateGrams > 0);
        Assert.True(result.FatGrams > 0);
        Assert.Equal("mifflin-st-jeor-v1", result.FormulaVersion);
    }

    [Fact]
    public void Calculate_LoseFat_UsesLowerTargetThanTdee()
    {
        var profile = BuildCompletedProfile();

        var result = NutritionEngine.Calculate(profile, new DateOnly(2026, 8, 17));

        Assert.True(result.TargetCalories < result.TotalDailyEnergyCalories);
    }

    [Fact]
    public void Calculate_IncompleteProfile_Throws()
    {
        var profile = new NutritionProfile(Guid.NewGuid());

        Assert.Throws<InvalidOperationException>(() =>
            NutritionEngine.Calculate(profile, new DateOnly(2026, 8, 17)));
    }

    [Fact]
    public void Calculate_MinorProfile_Throws()
    {
        var profile = new NutritionProfile(Guid.NewGuid());
        profile.SetPhysicalProfile(new DateOnly(2010, 1, 1), BiologicalSex.Male, 68, 160m);
        profile.SetActivity(ActivityLevel.Moderate);
        profile.SetGoal(NutritionGoalType.MaintainWeight, null);
        profile.SetFoodPreferences([]);
        profile.SetDietaryRestrictions([]);
        profile.Complete();

        Assert.Throws<InvalidOperationException>(() =>
            NutritionEngine.Calculate(profile, new DateOnly(2026, 8, 17)));
    }

    private static NutritionProfile BuildCompletedProfile()
    {
        var profile = new NutritionProfile(Guid.NewGuid());
        profile.SetPhysicalProfile(new DateOnly(1997, 11, 8), BiologicalSex.Male, 68, 220m);
        profile.SetActivity(ActivityLevel.Moderate);
        profile.SetGoal(NutritionGoalType.LoseFat, 185m);
        profile.SetFoodPreferences(["protein", "fruits"]);
        profile.SetDietaryRestrictions(["shellfish"]);
        profile.Complete();
        return profile;
    }
}
