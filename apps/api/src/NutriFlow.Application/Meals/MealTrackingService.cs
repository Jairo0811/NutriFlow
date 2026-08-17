using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Meals;

namespace NutriFlow.Application.Meals;

public sealed record AddMealEntryCommand(DateOnly Date, MealType MealType, Guid FoodId, decimal Servings);
public sealed record UpdateMealEntryCommand(DateOnly Date, MealType MealType, Guid EntryId, decimal Servings);
public sealed record RemoveMealEntryCommand(DateOnly Date, MealType MealType, Guid EntryId);

public sealed record MealEntryDto(
    Guid Id,
    Guid FoodId,
    string FoodName,
    string? Brand,
    decimal ServingSize,
    string ServingUnit,
    decimal Servings,
    decimal Calories,
    decimal ProteinGrams,
    decimal CarbohydrateGrams,
    decimal FatGrams);

public sealed record MealDto(
    Guid Id,
    DateOnly Date,
    MealType Type,
    IReadOnlyList<MealEntryDto> Entries,
    decimal Calories,
    decimal ProteinGrams,
    decimal CarbohydrateGrams,
    decimal FatGrams);

public sealed record DailyMealSummaryDto(
    DateOnly Date,
    IReadOnlyList<MealDto> Meals,
    decimal Calories,
    decimal ProteinGrams,
    decimal CarbohydrateGrams,
    decimal FatGrams);

public interface IMealTrackingService
{
    Task<DailyMealSummaryDto> GetDayAsync(Guid userId, DateOnly date, CancellationToken cancellationToken);
    Task<DailyMealSummaryDto> AddEntryAsync(Guid userId, AddMealEntryCommand command, CancellationToken cancellationToken);
    Task<DailyMealSummaryDto> UpdateEntryAsync(Guid userId, UpdateMealEntryCommand command, CancellationToken cancellationToken);
    Task<DailyMealSummaryDto> RemoveEntryAsync(Guid userId, RemoveMealEntryCommand command, CancellationToken cancellationToken);
}

public sealed class MealTrackingService(
    IMealRepository meals,
    IFoodRepository foods,
    IUnitOfWork unitOfWork) : IMealTrackingService
{
    public async Task<DailyMealSummaryDto> GetDayAsync(Guid userId, DateOnly date, CancellationToken cancellationToken)
        => ToDailySummary(date, await meals.GetDayAsync(userId, date, cancellationToken));

    public async Task<DailyMealSummaryDto> AddEntryAsync(Guid userId, AddMealEntryCommand command, CancellationToken cancellationToken)
    {
        var food = await foods.GetByIdAsync(command.FoodId, cancellationToken)
            ?? throw new InvalidOperationException("Food was not found.");

        var meal = await meals.GetAsync(userId, command.Date, command.MealType, cancellationToken);
        if (meal is null)
        {
            meal = new Meal(Guid.NewGuid(), userId, command.Date, command.MealType);
            await meals.AddAsync(meal, cancellationToken);
        }

        meal.AddEntry(food, command.Servings);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetDayAsync(userId, command.Date, cancellationToken);
    }

    public async Task<DailyMealSummaryDto> UpdateEntryAsync(Guid userId, UpdateMealEntryCommand command, CancellationToken cancellationToken)
    {
        var meal = await meals.GetAsync(userId, command.Date, command.MealType, cancellationToken)
            ?? throw new InvalidOperationException("Meal was not found.");

        meal.UpdateEntryServings(command.EntryId, command.Servings);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetDayAsync(userId, command.Date, cancellationToken);
    }

    public async Task<DailyMealSummaryDto> RemoveEntryAsync(Guid userId, RemoveMealEntryCommand command, CancellationToken cancellationToken)
    {
        var meal = await meals.GetAsync(userId, command.Date, command.MealType, cancellationToken)
            ?? throw new InvalidOperationException("Meal was not found.");

        meal.RemoveEntry(command.EntryId);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetDayAsync(userId, command.Date, cancellationToken);
    }

    private static DailyMealSummaryDto ToDailySummary(DateOnly date, IReadOnlyList<Meal> meals)
    {
        var mapped = meals
            .OrderBy(meal => meal.Type)
            .Select(ToDto)
            .ToArray();

        return new DailyMealSummaryDto(
            date,
            mapped,
            mapped.Sum(meal => meal.Calories),
            mapped.Sum(meal => meal.ProteinGrams),
            mapped.Sum(meal => meal.CarbohydrateGrams),
            mapped.Sum(meal => meal.FatGrams));
    }

    private static MealDto ToDto(Meal meal)
    {
        var entries = meal.Entries
            .OrderBy(entry => entry.CreatedAtUtc)
            .Select(entry => new MealEntryDto(
                entry.Id,
                entry.FoodId,
                entry.FoodName,
                entry.Brand,
                entry.ServingSize,
                entry.ServingUnit,
                entry.Servings,
                entry.TotalCalories,
                entry.TotalProteinGrams,
                entry.TotalCarbohydrateGrams,
                entry.TotalFatGrams))
            .ToArray();

        return new MealDto(
            meal.Id,
            meal.Date,
            meal.Type,
            entries,
            entries.Sum(entry => entry.Calories),
            entries.Sum(entry => entry.ProteinGrams),
            entries.Sum(entry => entry.CarbohydrateGrams),
            entries.Sum(entry => entry.FatGrams));
    }
}
