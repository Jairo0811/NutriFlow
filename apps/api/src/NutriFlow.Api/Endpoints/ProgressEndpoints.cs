using System.Security.Claims;
using NutriFlow.Application.Progress;

namespace NutriFlow.Api.Endpoints;

public static class ProgressEndpoints
{
    public static IEndpointRouteBuilder MapProgressEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/progress")
            .WithTags("Progress")
            .RequireAuthorization();

        group.MapGet("/", GetAsync);
        group.MapPost("/weight", LogWeightAsync);
        group.MapDelete("/weight/{date}", RemoveAsync);
        return endpoints;
    }

    private static async Task<IResult> GetAsync(ClaimsPrincipal principal, IProgressService service, CancellationToken cancellationToken)
        => TryGetUserId(principal, out var userId)
            ? Results.Ok(await service.GetAsync(userId, cancellationToken))
            : Results.Unauthorized();

    private static async Task<IResult> LogWeightAsync(
        LogWeightRequest request,
        ClaimsPrincipal principal,
        IProgressService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();

        try
        {
            return Results.Ok(await service.LogWeightAsync(userId, new LogWeightCommand(request.Date, request.WeightPounds, request.Note), cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Results.Conflict(new { error = exception.Message });
        }
    }

    private static async Task<IResult> RemoveAsync(
        DateOnly date,
        ClaimsPrincipal principal,
        IProgressService service,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();

        try
        {
            return Results.Ok(await service.RemoveAsync(userId, date, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Results.NotFound(new { error = exception.Message });
        }
    }

    private static bool TryGetUserId(ClaimsPrincipal principal, out Guid userId)
        => Guid.TryParse(principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

    private sealed record LogWeightRequest(DateOnly Date, decimal WeightPounds, string? Note);
}
