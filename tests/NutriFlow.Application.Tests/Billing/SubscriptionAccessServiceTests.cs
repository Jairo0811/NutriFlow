using NutriFlow.Application.Billing;
using NutriFlow.Domain.Billing;

namespace NutriFlow.Application.Tests.Billing;

public sealed class SubscriptionAccessServiceTests
{
    [Fact]
    public void GetAccess_DefaultsUserToFreePlan()
    {
        var service = new SubscriptionAccessService();

        var access = service.GetAccess(Guid.NewGuid());

        Assert.Equal(SubscriptionPlan.Free, access.Plan);
        Assert.Equal("NutriFlow Free", access.DisplayName);
        Assert.Empty(access.Entitlements);
        Assert.Equal(10, access.UsageLimits["barcode.scans.monthly"]);
        Assert.Equal(5, access.UsageLimits["ai.requests.monthly"]);
        Assert.Equal(30, access.UsageLimits["history.days"]);
    }

    [Fact]
    public void PremiumDefinition_ContainsCorePremiumEntitlements()
    {
        var premium = SubscriptionAccessService.GetPlanDefinition(SubscriptionPlan.Premium);

        Assert.Contains(EntitlementCodes.BarcodeUnlimited, premium.Entitlements);
        Assert.Contains(EntitlementCodes.AnalyticsAdvanced, premium.Entitlements);
        Assert.Contains(EntitlementCodes.AiCoach, premium.Entitlements);
        Assert.Contains(EntitlementCodes.MealPlanner, premium.Entitlements);
        Assert.Equal(100, premium.UsageLimits["ai.requests.monthly"]);
    }
}
