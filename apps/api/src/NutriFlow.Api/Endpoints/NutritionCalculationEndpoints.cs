using System.Security.Claims;
using NutriFlow.Application.Nutrition;

namespace NutriFlow.Api.Endpoints;

public static class NutritionCalculationEndpoints
{
    public static IEndpointRouteBuilder MapNutritionCalculationEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/nutrition")
            .WithTags("Nutrition Engine")
            .RequireAuthorization();

        group.MapGet("/targets", GetTargetsAsync);
        return endpoints;
    }

    private static async Task<IResult> GetTargetsAsync(
        ClaimsPrincipal principal,
        INutritionCalculationService service,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Results.Unauthorized();

        try
        {
            return Results.Ok(await service.CalculateAsync(userId, DateOnly.FromDateTime(DateTime.UtcNow), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }
}
