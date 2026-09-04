using NutriFlow.Domain.Billing;

namespace NutriFlow.Application.Billing;

public static class EntitlementCodes
{
    public const string BarcodeUnlimited = "barcode.unlimited";
    public const string HistoryUnlimited = "history.unlimited";
    public const string AnalyticsAdvanced = "analytics.advanced";
    public const string NutritionMicronutrients = "nutrition.micronutrients";
    public const string AiCoach = "ai.coach";
    public const string MealPhotoAnalysis = "ai.meal-photo";
    public const string VoiceLogging = "ai.voice-logging";
    public const string MealPlanner = "meal-planner";
    public const string ShoppingList = "shopping-list";
    public const string DataExport = "data-export";
    public const string Fasting = "fasting";
    public const string HealthAdvanced = "health.advanced";
}

public sealed record PlanDefinition(
    SubscriptionPlan Plan,
    string DisplayName,
    IReadOnlySet<string> Entitlements,
    IReadOnlyDictionary<string, int> UsageLimits);

public sealed record UserAccessSnapshot(
    SubscriptionPlan Plan,
    string DisplayName,
    IReadOnlyCollection<string> Entitlements,
    IReadOnlyDictionary<string, int> UsageLimits);

public interface ISubscriptionAccessService
{
    UserAccessSnapshot GetAccess(Guid userId);
}

public sealed class SubscriptionAccessService : ISubscriptionAccessService
{
    private static readonly PlanDefinition Free = new(
        SubscriptionPlan.Free,
        "NutriFlow Free",
        new HashSet<string>(StringComparer.Ordinal),
        new Dictionary<string, int>(StringComparer.Ordinal)
        {
            [UsageLimitCodes.BarcodeScansMonthly] = 10,
            [UsageLimitCodes.AiRequestsMonthly] = 5,
            [UsageLimitCodes.HistoryDays] = 30
        });

    private static readonly PlanDefinition Premium = new(
        SubscriptionPlan.Premium,
        "NutriFlow Premium",
        new HashSet<string>(StringComparer.Ordinal)
        {
            EntitlementCodes.BarcodeUnlimited,
            EntitlementCodes.HistoryUnlimited,
            EntitlementCodes.AnalyticsAdvanced,
            EntitlementCodes.NutritionMicronutrients,
            EntitlementCodes.AiCoach,
            EntitlementCodes.MealPhotoAnalysis,
            EntitlementCodes.VoiceLogging,
            EntitlementCodes.MealPlanner,
            EntitlementCodes.ShoppingList,
            EntitlementCodes.DataExport,
            EntitlementCodes.Fasting,
            EntitlementCodes.HealthAdvanced
        },
        new Dictionary<string, int>(StringComparer.Ordinal)
        {
            [UsageLimitCodes.AiRequestsMonthly] = 100
        });

    public UserAccessSnapshot GetAccess(Guid userId)
    {
        _ = userId;

        // Phase 11/12 intentionally defaults every account to Free. A billing provider
        // will become the source of truth in the payment integration phase.
        return ToSnapshot(Free);
    }

    public static PlanDefinition GetPlanDefinition(SubscriptionPlan plan)
        => plan == SubscriptionPlan.Premium ? Premium : Free;

    private static UserAccessSnapshot ToSnapshot(PlanDefinition definition)
        => new(
            definition.Plan,
            definition.DisplayName,
            definition.Entitlements.ToArray(),
            new Dictionary<string, int>(definition.UsageLimits, StringComparer.Ordinal));
}
