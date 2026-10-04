using System.Security.Claims;
using NutriFlow.Application.Ai;

namespace NutriFlow.Api.Endpoints;

public static class AiEndpoints
{
    public static IEndpointRouteBuilder MapAiEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/ai")
            .WithTags("NutriFlow AI")
            .RequireAuthorization();

        group.MapGet("/status", GetStatus);
        group.MapPost("/coach", AskCoach);
        group.MapPost("/meal-photo", AnalyzeMealPhoto);
        group.MapPost("/voice-log", ParseVoiceLog);
        group.MapPost("/confirm-meal", ConfirmMeal);
        return endpoints;
    }

    private static async Task<IResult> GetStatus(
        ClaimsPrincipal principal,
        INutriFlowAiService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();
        return Results.Ok(await service.GetStatusAsync(userId, cancellationToken));
    }

    private static async Task<IResult> AskCoach(
        ClaimsPrincipal principal,
        INutriFlowAiService service,
        CoachRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();
        return await ExecuteAi(async () => Results.Ok(await service.AskCoachAsync(
            userId,
            request.Message,
            request.Date ?? DateOnly.FromDateTime(DateTime.UtcNow),
            cancellationToken)));
    }

    private static async Task<IResult> AnalyzeMealPhoto(
        ClaimsPrincipal principal,
        INutriFlowAiService service,
        MealPhotoRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();
        return await ExecuteAi(async () => Results.Ok(await service.AnalyzeMealPhotoAsync(
            userId,
            request.ImageDataUrl,
            request.Date ?? DateOnly.FromDateTime(DateTime.UtcNow),
            cancellationToken)));
    }

    private static async Task<IResult> ParseVoiceLog(
        ClaimsPrincipal principal,
        INutriFlowAiService service,
        VoiceLogRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();
        return await ExecuteAi(async () => Results.Ok(await service.ParseVoiceTranscriptAsync(
            userId,
            request.Transcript,
            request.Date ?? DateOnly.FromDateTime(DateTime.UtcNow),
            cancellationToken)));
    }

    private static async Task<IResult> ConfirmMeal(
        ClaimsPrincipal principal,
        INutriFlowAiService service,
        ConfirmAiMealCommand command,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();

        try
        {
            return Results.Ok(await service.ConfirmMealAsync(userId, command, cancellationToken));
        }
        catch (AiDietaryConflictException exception)
        {
            return Results.Conflict(new
            {
                error = "dietary_conflict",
                food = exception.FoodName,
                restrictions = exception.Restrictions,
                message = "NutriFlow blocked this AI-assisted meal because it conflicts with your saved dietary restrictions."
            });
        }
        catch (ArgumentException exception)
        {
            return Results.BadRequest(new { error = "invalid_ai_meal", message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Results.BadRequest(new { error = "ai_meal_not_confirmable", message = exception.Message });
        }
    }

    private static async Task<IResult> ExecuteAi(Func<Task<IResult>> action)
    {
        try
        {
            return await action();
        }
        catch (AiProviderUnavailableException exception)
        {
            return Results.Json(new { error = "ai_provider_unavailable", message = exception.Message }, statusCode: StatusCodes.Status503ServiceUnavailable);
        }
        catch (AiPremiumRequiredException exception)
        {
            return Results.Json(new
            {
                error = "premium_required",
                entitlement = exception.Entitlement,
                message = exception.Message
            }, statusCode: StatusCodes.Status403Forbidden);
        }
        catch (AiUsageLimitException exception)
        {
            return Results.Json(new
            {
                error = "usage_limit_reached",
                message = exception.Message,
                usage = exception.Usage
            }, statusCode: StatusCodes.Status429TooManyRequests);
        }
        catch (ArgumentException exception)
        {
            return Results.BadRequest(new { error = "invalid_ai_request", message = exception.Message });
        }
        catch (InvalidOperationException)
        {
            return Results.Json(new
            {
                error = "ai_provider_error",
                message = "NutriFlow AI could not complete the request. Try again later."
            }, statusCode: StatusCodes.Status502BadGateway);
        }
    }

    private static bool TryGetUserId(ClaimsPrincipal principal, out Guid userId)
        => Guid.TryParse(principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

    public sealed record CoachRequest(string Message, DateOnly? Date = null);
    public sealed record MealPhotoRequest(string ImageDataUrl, DateOnly? Date = null);
    public sealed record VoiceLogRequest(string Transcript, DateOnly? Date = null);
}
