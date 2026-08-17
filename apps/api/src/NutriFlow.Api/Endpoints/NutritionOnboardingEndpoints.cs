using System.Security.Claims;
using NutriFlow.Application.Nutrition;
using NutriFlow.Domain.Nutrition;

namespace NutriFlow.Api.Endpoints;

public static class NutritionOnboardingEndpoints
{
    public static IEndpointRouteBuilder MapNutritionOnboardingEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/onboarding")
            .WithTags("Nutritional Onboarding")
            .RequireAuthorization();

        group.MapGet("/", GetAsync);
        group.MapPut("/physical-profile", SavePhysicalProfileAsync);
        group.MapPut("/activity", SaveActivityAsync);
        group.MapPut("/goal", SaveGoalAsync);
        group.MapPut("/preferences", SavePreferencesAsync);
        group.MapPut("/restrictions", SaveRestrictionsAsync);
        group.MapPost("/complete", CompleteAsync);

        return endpoints;
    }

    private static async Task<IResult> GetAsync(ClaimsPrincipal principal, INutritionOnboardingService service, CancellationToken cancellationToken)
        => TryGetUserId(principal, out var userId)
            ? Results.Ok(await service.GetAsync(userId, cancellationToken))
            : Results.Unauthorized();

    private static async Task<IResult> SavePhysicalProfileAsync(PhysicalProfileRequest request, ClaimsPrincipal principal, INutritionOnboardingService service, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();
        try
        {
            var profile = await service.SavePhysicalProfileAsync(
                userId,
                new PhysicalProfileCommand(request.DateOfBirth, request.BiologicalSex, request.HeightFeet, request.HeightInches, request.CurrentWeightPounds),
                cancellationToken);
            return Results.Ok(profile);
        }
        catch (ArgumentException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }

    private static async Task<IResult> SaveActivityAsync(ActivityRequest request, ClaimsPrincipal principal, INutritionOnboardingService service, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();
        return Results.Ok(await service.SaveActivityAsync(userId, request.ActivityLevel, cancellationToken));
    }

    private static async Task<IResult> SaveGoalAsync(GoalRequest request, ClaimsPrincipal principal, INutritionOnboardingService service, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();
        try
        {
            return Results.Ok(await service.SaveGoalAsync(userId, new GoalCommand(request.GoalType, request.TargetWeightPounds), cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }

    private static async Task<IResult> SavePreferencesAsync(CodesRequest request, ClaimsPrincipal principal, INutritionOnboardingService service, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();
        try
        {
            return Results.Ok(await service.SaveFoodPreferencesAsync(userId, request.Codes, cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }

    private static async Task<IResult> SaveRestrictionsAsync(CodesRequest request, ClaimsPrincipal principal, INutritionOnboardingService service, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();
        try
        {
            return Results.Ok(await service.SaveDietaryRestrictionsAsync(userId, request.Codes, cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }

    private static async Task<IResult> CompleteAsync(ClaimsPrincipal principal, INutritionOnboardingService service, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();
        try
        {
            return Results.Ok(await service.CompleteAsync(userId, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }

    private static bool TryGetUserId(ClaimsPrincipal principal, out Guid userId)
        => Guid.TryParse(principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

    private sealed record PhysicalProfileRequest(DateOnly DateOfBirth, BiologicalSex BiologicalSex, int HeightFeet, int HeightInches, decimal CurrentWeightPounds);
    private sealed record ActivityRequest(ActivityLevel ActivityLevel);
    private sealed record GoalRequest(NutritionGoalType GoalType, decimal? TargetWeightPounds);
    private sealed record CodesRequest(string[] Codes);
}
