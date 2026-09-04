using NutriFlow.Application.Abstractions;
using NutriFlow.Application.Billing;
using NutriFlow.Application.Meals;
using NutriFlow.Application.Nutrition;
using NutriFlow.Domain.Meals;
using NutriFlow.Domain.Nutrition;

namespace NutriFlow.Application.Ai;

public sealed record AiNutritionContext(
    DateOnly Date,
    decimal ConsumedCalories,
    decimal ConsumedProteinGrams,
    decimal ConsumedCarbohydrateGrams,
    decimal ConsumedFatGrams,
    decimal? TargetCalories,
    decimal? TargetProteinGrams,
    decimal? TargetCarbohydrateGrams,
    decimal? TargetFatGrams,
    IReadOnlyList<string> DietaryRestrictions,
    IReadOnlyList<string> FoodPreferences);

public sealed record AiDetectedFood(string Name, decimal Servings, decimal Confidence);

public interface INutritionAiProvider
{
    bool IsConfigured { get; }
    string ProviderName { get; }
    Task<string> AskCoachAsync(string message, AiNutritionContext context, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AiDetectedFood>> AnalyzeMealPhotoAsync(string imageDataUrl, AiNutritionContext context, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AiDetectedFood>> ParseVoiceTranscriptAsync(string transcript, AiNutritionContext context, CancellationToken cancellationToken = default);
}

public sealed record AiCoachResult(string Answer, string Provider, UsageSnapshot Usage);

public sealed record AiFoodProposal(
    Guid? FoodId,
    string DetectedName,
    string? CatalogName,
    decimal Servings,
    decimal Confidence,
    bool HasCatalogMatch,
    bool HasDietaryConflict,
    IReadOnlyList<string> ConflictingRestrictionCodes);

public sealed record AiMealAnalysisResult(
    string Source,
    string Provider,
    IReadOnlyList<AiFoodProposal> Items,
    UsageSnapshot Usage);

public sealed record ConfirmAiMealItem(Guid FoodId, decimal Servings);
public sealed record ConfirmAiMealCommand(DateOnly Date, MealType MealType, IReadOnlyList<ConfirmAiMealItem> Items);

public sealed record AiStatusResult(
    bool ProviderConfigured,
    string Provider,
    bool MealPhotoEnabled,
    bool VoiceLoggingEnabled,
    UsageSnapshot? AiUsage);

public sealed class AiProviderUnavailableException : Exception
{
    public AiProviderUnavailableException() : base("NutriFlow AI is not configured for this environment.") { }
}

public sealed class AiPremiumRequiredException(string entitlement)
    : Exception("NutriFlow Premium is required for this AI feature.")
{
    public string Entitlement { get; } = entitlement;
}

public sealed class AiUsageLimitException(UsageSnapshot usage)
    : Exception("The monthly NutriFlow AI request limit has been reached.")
{
    public UsageSnapshot Usage { get; } = usage;
}

public sealed class AiDietaryConflictException(string foodName, IReadOnlyList<string> restrictions)
    : Exception($"{foodName} conflicts with the user's dietary restrictions.")
{
    public string FoodName { get; } = foodName;
    public IReadOnlyList<string> Restrictions { get; } = restrictions;
}

public interface INutriFlowAiService
{
    Task<AiStatusResult> GetStatusAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<AiCoachResult> AskCoachAsync(Guid userId, string message, DateOnly date, CancellationToken cancellationToken = default);
    Task<AiMealAnalysisResult> AnalyzeMealPhotoAsync(Guid userId, string imageDataUrl, DateOnly date, CancellationToken cancellationToken = default);
    Task<AiMealAnalysisResult> ParseVoiceTranscriptAsync(Guid userId, string transcript, DateOnly date, CancellationToken cancellationToken = default);
    Task<DailyMealSummaryDto> ConfirmMealAsync(Guid userId, ConfirmAiMealCommand command, CancellationToken cancellationToken = default);
}

public sealed class NutriFlowAiService(
    INutritionAiProvider provider,
    IUsageLimitService usageLimits,
    IFeatureGateService featureGates,
    INutritionProfileRepository profiles,
    INutritionCalculationService nutrition,
    IMealTrackingService meals,
    IFoodRepository foods) : INutriFlowAiService
{
    private const int MaxCoachMessageLength = 1_200;
    private const int MaxTranscriptLength = 2_000;
    private const int MaxImageDataUrlLength = 8_000_000;

    public async Task<AiStatusResult> GetStatusAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var usage = (await usageLimits.GetCurrentAsync(userId, cancellationToken))
            .FirstOrDefault(item => item.Code == UsageLimitCodes.AiRequestsMonthly);

        return new AiStatusResult(
            provider.IsConfigured,
            provider.ProviderName,
            featureGates.HasEntitlement(userId, EntitlementCodes.MealPhotoAnalysis),
            featureGates.HasEntitlement(userId, EntitlementCodes.VoiceLogging),
            usage);
    }

    public async Task<AiCoachResult> AskCoachAsync(
        Guid userId,
        string message,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var normalized = RequiredText(message, MaxCoachMessageLength, nameof(message));
        EnsureProvider();
        var usage = await ConsumeAiRequestAsync(userId, cancellationToken);
        var context = await BuildContextAsync(userId, date, cancellationToken);
        var answer = await provider.AskCoachAsync(normalized, context, cancellationToken);
        return new AiCoachResult(answer, provider.ProviderName, usage);
    }

    public async Task<AiMealAnalysisResult> AnalyzeMealPhotoAsync(
        Guid userId,
        string imageDataUrl,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        RequirePremium(userId, EntitlementCodes.MealPhotoAnalysis);
        EnsureProvider();

        if (string.IsNullOrWhiteSpace(imageDataUrl) ||
            imageDataUrl.Length > MaxImageDataUrlLength ||
            !imageDataUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase) ||
            !imageDataUrl.Contains(";base64,", StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("A valid base64 image data URL is required.", nameof(imageDataUrl));
        }

        var usage = await ConsumeAiRequestAsync(userId, cancellationToken);
        var context = await BuildContextAsync(userId, date, cancellationToken);
        var detected = await provider.AnalyzeMealPhotoAsync(imageDataUrl, context, cancellationToken);
        return new AiMealAnalysisResult(
            "meal-photo",
            provider.ProviderName,
            await ResolveDetectedFoodsAsync(userId, detected, cancellationToken),
            usage);
    }

    public async Task<AiMealAnalysisResult> ParseVoiceTranscriptAsync(
        Guid userId,
        string transcript,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        RequirePremium(userId, EntitlementCodes.VoiceLogging);
        EnsureProvider();
        var normalized = RequiredText(transcript, MaxTranscriptLength, nameof(transcript));
        var usage = await ConsumeAiRequestAsync(userId, cancellationToken);
        var context = await BuildContextAsync(userId, date, cancellationToken);
        var detected = await provider.ParseVoiceTranscriptAsync(normalized, context, cancellationToken);
        return new AiMealAnalysisResult(
            "voice",
            provider.ProviderName,
            await ResolveDetectedFoodsAsync(userId, detected, cancellationToken),
            usage);
    }

    public async Task<DailyMealSummaryDto> ConfirmMealAsync(
        Guid userId,
        ConfirmAiMealCommand command,
        CancellationToken cancellationToken = default)
    {
        if (command.Items.Count is < 1 or > 20)
            throw new ArgumentOutOfRangeException(nameof(command), "AI meal confirmation requires between 1 and 20 items.");

        var profile = await profiles.GetByUserIdAsync(userId, cancellationToken);
        var restrictions = profile?.DietaryRestrictionCodes ?? [];

        foreach (var item in command.Items)
        {
            if (item.Servings <= 0 || item.Servings > 20)
                throw new ArgumentOutOfRangeException(nameof(command), "Each serving amount must be greater than 0 and at most 20.");

            var food = await foods.GetByIdAsync(item.FoodId, cancellationToken)
                ?? throw new InvalidOperationException("A proposed food was not found in the catalog.");

            var conflicts = food.AllergenCodes
                .Intersect(restrictions, StringComparer.OrdinalIgnoreCase)
                .OrderBy(code => code)
                .ToArray();

            if (conflicts.Length > 0)
                throw new AiDietaryConflictException(food.Name, conflicts);
        }

        DailyMealSummaryDto? summary = null;
        foreach (var item in command.Items)
        {
            summary = await meals.AddEntryAsync(
                userId,
                new AddMealEntryCommand(command.Date, command.MealType, item.FoodId, item.Servings),
                cancellationToken);
        }

        return summary ?? await meals.GetDayAsync(userId, command.Date, cancellationToken);
    }

    private async Task<AiNutritionContext> BuildContextAsync(Guid userId, DateOnly date, CancellationToken cancellationToken)
    {
        var profile = await profiles.GetByUserIdAsync(userId, cancellationToken);
        var consumed = await meals.GetDayAsync(userId, date, cancellationToken);

        NutritionCalculation? targets = null;
        try
        {
            targets = await nutrition.CalculateAsync(userId, date, cancellationToken);
        }
        catch (InvalidOperationException)
        {
            // AI can still provide general nutrition guidance when onboarding is incomplete.
        }

        return new AiNutritionContext(
            date,
            consumed.Calories,
            consumed.ProteinGrams,
            consumed.CarbohydrateGrams,
            consumed.FatGrams,
            targets?.TargetCalories,
            targets?.ProteinGrams,
            targets?.CarbohydrateGrams,
            targets?.FatGrams,
            profile?.DietaryRestrictionCodes ?? [],
            profile?.FoodPreferenceCodes ?? []);
    }

    private async Task<IReadOnlyList<AiFoodProposal>> ResolveDetectedFoodsAsync(
        Guid userId,
        IReadOnlyList<AiDetectedFood> detected,
        CancellationToken cancellationToken)
    {
        var profile = await profiles.GetByUserIdAsync(userId, cancellationToken);
        var restrictions = profile?.DietaryRestrictionCodes ?? [];
        var proposals = new List<AiFoodProposal>(Math.Min(detected.Count, 12));

        foreach (var item in detected.Take(12))
        {
            var name = RequiredText(item.Name, 120, nameof(item.Name));
            var matches = await foods.SearchAsync(name, null, 5, cancellationToken);
            var food = matches.FirstOrDefault();
            var conflicts = food is null
                ? []
                : food.AllergenCodes
                    .Intersect(restrictions, StringComparer.OrdinalIgnoreCase)
                    .OrderBy(code => code)
                    .ToArray();

            proposals.Add(new AiFoodProposal(
                food?.Id,
                name,
                food?.Name,
                Math.Clamp(item.Servings, 0.1m, 20m),
                Math.Clamp(item.Confidence, 0m, 1m),
                food is not null,
                conflicts.Length > 0,
                conflicts));
        }

        return proposals;
    }

    private async Task<UsageSnapshot> ConsumeAiRequestAsync(Guid userId, CancellationToken cancellationToken)
    {
        var result = await usageLimits.TryConsumeAsync(userId, UsageLimitCodes.AiRequestsMonthly, cancellationToken);
        if (!result.Allowed) throw new AiUsageLimitException(result.Usage);
        return result.Usage;
    }

    private void RequirePremium(Guid userId, string entitlement)
    {
        if (!featureGates.HasEntitlement(userId, entitlement))
            throw new AiPremiumRequiredException(entitlement);
    }

    private void EnsureProvider()
    {
        if (!provider.IsConfigured) throw new AiProviderUnavailableException();
    }

    private static string RequiredText(string? value, int maxLength, string parameterName)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (normalized.Length == 0 || normalized.Length > maxLength)
            throw new ArgumentException($"{parameterName} is required and must not exceed {maxLength} characters.", parameterName);
        return normalized;
    }
}
