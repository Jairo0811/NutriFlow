using System.Security.Claims;
using NutriFlow.Application.Meals;
using NutriFlow.Domain.Meals;

namespace NutriFlow.Api.Endpoints;

public static class MealTrackingEndpoints
{
    public static IEndpointRouteBuilder MapMealTrackingEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/meals")
            .WithTags("Meal Tracking")
            .RequireAuthorization();

        group.MapGet("/", GetDayAsync);
        group.MapPost("/entries", AddEntryAsync);
        group.MapPut("/entries/{entryId:guid}", UpdateEntryAsync);
        group.MapDelete("/entries/{entryId:guid}", RemoveEntryAsync);

        return endpoints;
    }

    private static async Task<IResult> GetDayAsync(
        DateOnly? date,
        ClaimsPrincipal principal,
        IMealTrackingService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();
        var requestedDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        return Results.Ok(await service.GetDayAsync(userId, requestedDate, cancellationToken));
    }

    private static async Task<IResult> AddEntryAsync(
        AddMealEntryRequest request,
        ClaimsPrincipal principal,
        IMealTrackingService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();

        try
        {
            return Results.Ok(await service.AddEntryAsync(
                userId,
                new AddMealEntryCommand(request.Date, request.MealType, request.FoodId, request.Servings),
                cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }

    private static async Task<IResult> UpdateEntryAsync(
        Guid entryId,
        UpdateMealEntryRequest request,
        ClaimsPrincipal principal,
        IMealTrackingService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();

        try
        {
            return Results.Ok(await service.UpdateEntryAsync(
                userId,
                new UpdateMealEntryCommand(request.Date, request.MealType, entryId, request.Servings),
                cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Results.NotFound(new { error = exception.Message });
        }
    }

    private static async Task<IResult> RemoveEntryAsync(
        Guid entryId,
        DateOnly date,
        MealType mealType,
        ClaimsPrincipal principal,
        IMealTrackingService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();

        try
        {
            return Results.Ok(await service.RemoveEntryAsync(
                userId,
                new RemoveMealEntryCommand(date, mealType, entryId),
                cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Results.NotFound(new { error = exception.Message });
        }
    }

    private static bool TryGetUserId(ClaimsPrincipal principal, out Guid userId)
        => Guid.TryParse(principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}

public sealed record AddMealEntryRequest(DateOnly Date, MealType MealType, Guid FoodId, decimal Servings);
public sealed record UpdateMealEntryRequest(DateOnly Date, MealType MealType, decimal Servings);
