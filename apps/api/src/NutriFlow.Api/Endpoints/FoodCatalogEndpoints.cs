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

    private static async Task<IResult> GetByBarcodeAsync(string barcode, IFoodCatalogService service, CancellationToken cancellationToken)
        => await service.GetByBarcodeAsync(barcode, cancellationToken) is { } food ? Results.Ok(food) : Results.NotFound();

    private static async Task<IResult> CreateAsync(CreateFoodRequest request, IFoodCatalogService service, CancellationToken cancellationToken)
    {
        try
        {
            var food = await service.CreateAsync(new CreateFoodCommand(
                request.Name, request.Brand, request.Category, request.ServingSize, request.ServingUnit,
                request.Calories, request.ProteinGrams, request.CarbohydrateGrams, request.FatGrams, request.Barcode), cancellationToken);
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
        string? Barcode);
}
