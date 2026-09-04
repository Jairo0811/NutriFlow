using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Foods;

namespace NutriFlow.Application.Foods;

public sealed record FoodDto(Guid Id, string Name, string? Brand, string Category, decimal ServingSize, string ServingUnit, decimal Calories, decimal ProteinGrams, decimal CarbohydrateGrams, decimal FatGrams, string? Barcode, IReadOnlyList<string> AllergenCodes, FoodSource Source);
public sealed record CreateFoodCommand(
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
    IReadOnlyList<string>? AllergenCodes = null,
    decimal FiberGrams = 0,
    decimal SodiumMilligrams = 0,
    decimal PotassiumMilligrams = 0,
    decimal CalciumMilligrams = 0,
    decimal IronMilligrams = 0,
    decimal VitaminCMilligrams = 0,
    decimal VitaminDMicrograms = 0);

public interface IFoodCatalogService
{
    Task<IReadOnlyList<FoodDto>> SearchAsync(string? query, string? category, int take, CancellationToken cancellationToken);
    Task<FoodDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<FoodDto?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken);
    Task<FoodDto> CreateAsync(CreateFoodCommand command, CancellationToken cancellationToken);
}

public sealed class FoodCatalogService(IFoodRepository foods, IUnitOfWork unitOfWork) : IFoodCatalogService
{
    public async Task<IReadOnlyList<FoodDto>> SearchAsync(string? query, string? category, int take, CancellationToken cancellationToken)
    {
        var boundedTake = Math.Clamp(take, 1, 100);
        var result = await foods.SearchAsync(Normalize(query), Normalize(category), boundedTake, cancellationToken);
        return result.Select(ToDto).ToArray();
    }

    public async Task<FoodDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        => (await foods.GetByIdAsync(id, cancellationToken)) is { } food ? ToDto(food) : null;

    public async Task<FoodDto?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken)
    {
        var normalized = Normalize(barcode);
        if (normalized is null || normalized.Length > 32) return null;
        return (await foods.GetByBarcodeAsync(normalized, cancellationToken)) is { } food ? ToDto(food) : null;
    }

    public async Task<FoodDto> CreateAsync(CreateFoodCommand command, CancellationToken cancellationToken)
    {
        var barcode = Normalize(command.Barcode);
        if (barcode is not null && await foods.GetByBarcodeAsync(barcode, cancellationToken) is not null)
            throw new InvalidOperationException("A food with this barcode already exists.");

        var food = new Food(
            Guid.NewGuid(), command.Name, command.Category, command.ServingSize, command.ServingUnit,
            command.Calories, command.ProteinGrams, command.CarbohydrateGrams, command.FatGrams,
            FoodSource.User, command.Brand, barcode, command.AllergenCodes,
            command.FiberGrams, command.SodiumMilligrams, command.PotassiumMilligrams,
            command.CalciumMilligrams, command.IronMilligrams, command.VitaminCMilligrams,
            command.VitaminDMicrograms);

        await foods.AddAsync(food, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToDto(food);
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static FoodDto ToDto(Food food) => new(food.Id, food.Name, food.Brand, food.Category, food.ServingSize, food.ServingUnit, food.Calories, food.ProteinGrams, food.CarbohydrateGrams, food.FatGrams, food.Barcode, food.AllergenCodes, food.Source);
}
