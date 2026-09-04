using System.Security.Claims;
using NutriFlow.Application.Engagement;

namespace NutriFlow.Api.Endpoints;

public static class EngagementEndpoints
{
    public static IEndpointRouteBuilder MapEngagementEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/engagement")
            .WithTags("Engagement")
            .RequireAuthorization();

        group.MapGet("/overview", GetOverviewAsync);
        group.MapGet("/water", GetWaterAsync);
        group.MapPost("/water", AddWaterAsync);
        group.MapDelete("/water/{entryId:guid}", RemoveWaterAsync);
        group.MapGet("/favorites", GetFavoritesAsync);
        group.MapPost("/favorites/{foodId:guid}", AddFavoriteAsync);
        group.MapDelete("/favorites/{foodId:guid}", RemoveFavoriteAsync);
        group.MapGet("/recipes", GetRecipesAsync);
        group.MapGet("/recipes/{recipeId:guid}", GetRecipeAsync);
        group.MapPost("/recipes", CreateRecipeAsync);
        group.MapDelete("/recipes/{recipeId:guid}", RemoveRecipeAsync);

        return endpoints;
    }

    private static async Task<IResult> GetOverviewAsync(DateOnly? date, ClaimsPrincipal principal, IEngagementService service, CancellationToken cancellationToken)
        => TryUserId(principal, out var userId)
            ? Results.Ok(await service.GetOverviewAsync(userId, date, cancellationToken))
            : Results.Unauthorized();

    private static async Task<IResult> GetWaterAsync(DateOnly? date, ClaimsPrincipal principal, IEngagementService service, CancellationToken cancellationToken)
        => TryUserId(principal, out var userId)
            ? Results.Ok(await service.GetWaterAsync(userId, date, cancellationToken))
            : Results.Unauthorized();

    private static async Task<IResult> AddWaterAsync(AddWaterRequest request, ClaimsPrincipal principal, IEngagementService service, CancellationToken cancellationToken)
    {
        if (!TryUserId(principal, out var userId)) return Results.Unauthorized();
        try
        {
            return Results.Ok(await service.AddWaterAsync(userId, new AddWaterCommand(request.Date, request.AmountOunces), cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }

    private static async Task<IResult> RemoveWaterAsync(Guid entryId, ClaimsPrincipal principal, IEngagementService service, CancellationToken cancellationToken)
    {
        if (!TryUserId(principal, out var userId)) return Results.Unauthorized();
        try
        {
            return Results.Ok(await service.RemoveWaterAsync(userId, entryId, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Results.NotFound(new { error = exception.Message });
        }
    }

    private static async Task<IResult> GetFavoritesAsync(ClaimsPrincipal principal, IEngagementService service, CancellationToken cancellationToken)
        => TryUserId(principal, out var userId)
            ? Results.Ok(await service.GetFavoritesAsync(userId, cancellationToken))
            : Results.Unauthorized();

    private static async Task<IResult> AddFavoriteAsync(Guid foodId, ClaimsPrincipal principal, IEngagementService service, CancellationToken cancellationToken)
    {
        if (!TryUserId(principal, out var userId)) return Results.Unauthorized();
        try
        {
            return Results.Ok(await service.AddFavoriteAsync(userId, foodId, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Results.NotFound(new { error = exception.Message });
        }
    }

    private static async Task<IResult> RemoveFavoriteAsync(Guid foodId, ClaimsPrincipal principal, IEngagementService service, CancellationToken cancellationToken)
        => TryUserId(principal, out var userId)
            ? Results.Ok(await service.RemoveFavoriteAsync(userId, foodId, cancellationToken))
            : Results.Unauthorized();

    private static async Task<IResult> GetRecipesAsync(ClaimsPrincipal principal, IEngagementService service, CancellationToken cancellationToken)
        => TryUserId(principal, out var userId)
            ? Results.Ok(await service.GetRecipesAsync(userId, cancellationToken))
            : Results.Unauthorized();

    private static async Task<IResult> GetRecipeAsync(Guid recipeId, ClaimsPrincipal principal, IEngagementService service, CancellationToken cancellationToken)
    {
        if (!TryUserId(principal, out var userId)) return Results.Unauthorized();
        return await service.GetRecipeAsync(userId, recipeId, cancellationToken) is { } recipe
            ? Results.Ok(recipe)
            : Results.NotFound();
    }

    private static async Task<IResult> CreateRecipeAsync(CreateRecipeRequest request, ClaimsPrincipal principal, IEngagementService service, CancellationToken cancellationToken)
    {
        if (!TryUserId(principal, out var userId)) return Results.Unauthorized();
        try
        {
            var ingredients = request.Ingredients
                .Select(item => new CreateRecipeIngredientCommand(item.FoodId, item.Servings))
                .ToArray();
            var recipe = await service.CreateRecipeAsync(
                userId,
                new CreateRecipeCommand(request.Name, request.Servings, request.Instructions, ingredients),
                cancellationToken);
            return Results.Created($"/api/engagement/recipes/{recipe.Id}", recipe);
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

    private static async Task<IResult> RemoveRecipeAsync(Guid recipeId, ClaimsPrincipal principal, IEngagementService service, CancellationToken cancellationToken)
    {
        if (!TryUserId(principal, out var userId)) return Results.Unauthorized();
        try
        {
            await service.RemoveRecipeAsync(userId, recipeId, cancellationToken);
            return Results.NoContent();
        }
        catch (InvalidOperationException exception)
        {
            return Results.NotFound(new { error = exception.Message });
        }
    }

    private static bool TryUserId(ClaimsPrincipal principal, out Guid userId)
        => Guid.TryParse(principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

    private sealed record AddWaterRequest(DateOnly? Date, decimal AmountOunces);
    private sealed record CreateRecipeIngredientRequest(Guid FoodId, decimal Servings);
    private sealed record CreateRecipeRequest(string Name, int Servings, string? Instructions, IReadOnlyList<CreateRecipeIngredientRequest> Ingredients);
}
