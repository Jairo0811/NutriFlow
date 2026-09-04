using System.Security.Claims;
using NutriFlow.Application.Billing;
using NutriFlow.Application.Foods;

namespace NutriFlow.Api.Endpoints;

public static class FoodCatalogEndpoints
{
    public static IEndpointRouteBuilder MapFoodCatalogEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/foods")
            .WithTags("Food Catalog")
            .RequireAuthorization();

        group.MapGet("/", SearchAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapGet("/barcode/{barcode}", GetByBarcodeAsync);
        group.MapPost("/", CreateAsync);

        return endpoints;
    }

    private static async Task<IResult> SearchAsync(string? q, string? category, int? take, IFoodCatalogService service, CancellationToken cancellationToken)
        => Results.Ok(await service.SearchAsync(q, category, take ?? 30, cancellationToken));

    private static async Task<IResult> GetByIdAsync(Guid id, IFoodCatalogService service, CancellationToken cancellationToken)
        => await service.GetByIdAsync(id, cancellationToken) is { } food ? Results.Ok(food) : Results.NotFound();

    private static async Task<IResult> GetByBarcodeAsync(
        string barcode,
        ClaimsPrincipal principal,
        IFoodCatalogService service,
        IUsageLimitService usageLimits,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(principal, out var userId)) return Results.Unauthorized();

        barcode = barcode.Trim();
        if (barcode.Length is 0 or > 32)
            return Results.BadRequest(new { error = "Barcode must contain between 1 and 32 characters." });

        var usage = await usageLimits.TryConsumeAsync(userId, UsageLimitCodes.BarcodeScansMonthly, cancellationToken);
        if (!usage.Allowed)
        {
            return Results.Json(new
            {
                error = usage.ErrorCode,
                message = "Monthly barcode scan limit reached. Upgrade to Premium for unlimited barcode scans.",
                usage = usage.Usage
            }, statusCode: StatusCodes.Status429TooManyRequests);
        }

        return await service.GetByBarcodeAsync(barcode, cancellationToken) is { } food
            ? Results.Ok(food)
            : Results.NotFound(new { usage = usage.Usage });
    }

    private static async Task<IResult> CreateAsync(CreateFoodRequest request, IFoodCatalogService service, CancellationToken cancellationToken)
    {
        try
        {
            var food = await service.CreateAsync(new CreateFoodCommand(
                request.Name, request.Brand, request.Category, request.ServingSize, request.ServingUnit,
                request.Calories, request.ProteinGrams, request.CarbohydrateGrams, request.FatGrams,
                request.Barcode, request.AllergenCodes), cancellationToken);
            return Results.Created($"/api/foods/{food.Id}", food);
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

    private static bool TryGetUserId(ClaimsPrincipal principal, out Guid userId)
        => Guid.TryParse(principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

    private sealed record CreateFoodRequest(
        string Name,
        string? Brand,
        string Category,
        decimal ServingSize,
        string ServingUnit,
        decimal Calories,
        decimal ProteinGrams,
        decimal CarbohydrateGrams,
        decimal FatGrams,
        string? Barcode,
        IReadOnlyList<string>? AllergenCodes);
}
