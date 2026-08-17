using System.Security.Claims;
using NutriFlow.Application.Preferences;

namespace NutriFlow.Api.Endpoints;

public static class PreferenceEndpoints
{
    public static IEndpointRouteBuilder MapPreferenceEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/preferences")
            .WithTags("Allergies & Preferences")
            .RequireAuthorization();

        group.MapGet("/options", GetOptions);
        group.MapGet("/foods/{foodId:guid}/compatibility", CheckFoodAsync);
        return endpoints;
    }

    private static IResult GetOptions() => Results.Ok(new
    {
        preferences = new[] { "protein", "carbohydrates", "fats", "dairy", "fruits" },
        restrictions = new[] { "gluten", "wheat", "milk", "eggs", "fish", "shellfish", "peanuts", "tree_nuts", "soy", "sesame" }
    });

    private static async Task<IResult> CheckFoodAsync(
        Guid foodId,
        ClaimsPrincipal principal,
        IFoodCompatibilityService service,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Results.Unauthorized();

        try
        {
            return Results.Ok(await service.CheckAsync(userId, foodId, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Results.NotFound(new { error = exception.Message });
        }
    }
}
