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

        return endpoints;
    }

    private static async Task<IResult> SearchAsync(string? q, string? category, int? take, IFoodCatalogService service, CancellationToken cancellationToken)
        => Results.Ok(await service.SearchAsync(q, category, take ?? 30, cancellationToken));

    private static async Task<IResult> GetByIdAsync(Guid id, IFoodCatalogService service, CancellationToken cancellationToken)
        => await service.GetByIdAsync(id, cancellationToken) is { } food ? Results.Ok(food) : Results.NotFound();

    private static async Task<IResult> GetByBarcodeAsync(string barcode, IFoodCatalogService service, CancellationToken cancellationToken)
        => await service.GetByBarcodeAsync(barcode, cancellationToken) is { } food ? Results.Ok(food) : Results.NotFound();
}
