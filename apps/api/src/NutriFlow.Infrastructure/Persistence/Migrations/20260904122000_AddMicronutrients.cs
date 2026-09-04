using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutriFlow.Infrastructure.Persistence.Migrations;

public partial class AddMicronutrients : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        AddFoodColumns(migrationBuilder);
        AddMealEntryColumns(migrationBuilder);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        var columns = new[]
        {
            "FiberGrams",
            "SodiumMilligrams",
            "PotassiumMilligrams",
            "CalciumMilligrams",
            "IronMilligrams",
            "VitaminCMilligrams",
            "VitaminDMicrograms"
        };

        foreach (var column in columns)
            migrationBuilder.DropColumn(name: column, table: "Foods");

        var mealColumns = new[]
        {
            "FiberGramsPerServing",
            "SodiumMilligramsPerServing",
            "PotassiumMilligramsPerServing",
            "CalciumMilligramsPerServing",
            "IronMilligramsPerServing",
            "VitaminCMilligramsPerServing",
            "VitaminDMicrogramsPerServing"
        };

        foreach (var column in mealColumns)
            migrationBuilder.DropColumn(name: column, table: "MealEntries");
    }

    private static void AddFoodColumns(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<decimal>(name: "FiberGrams", table: "Foods", type: "numeric(8,2)", precision: 8, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "SodiumMilligrams", table: "Foods", type: "numeric(10,2)", precision: 10, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "PotassiumMilligrams", table: "Foods", type: "numeric(10,2)", precision: 10, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "CalciumMilligrams", table: "Foods", type: "numeric(10,2)", precision: 10, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "IronMilligrams", table: "Foods", type: "numeric(8,2)", precision: 8, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "VitaminCMilligrams", table: "Foods", type: "numeric(10,2)", precision: 10, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "VitaminDMicrograms", table: "Foods", type: "numeric(8,2)", precision: 8, scale: 2, nullable: false, defaultValue: 0m);
    }

    private static void AddMealEntryColumns(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<decimal>(name: "FiberGramsPerServing", table: "MealEntries", type: "numeric(8,2)", precision: 8, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "SodiumMilligramsPerServing", table: "MealEntries", type: "numeric(10,2)", precision: 10, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "PotassiumMilligramsPerServing", table: "MealEntries", type: "numeric(10,2)", precision: 10, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "CalciumMilligramsPerServing", table: "MealEntries", type: "numeric(10,2)", precision: 10, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "IronMilligramsPerServing", table: "MealEntries", type: "numeric(8,2)", precision: 8, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "VitaminCMilligramsPerServing", table: "MealEntries", type: "numeric(10,2)", precision: 10, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<decimal>(name: "VitaminDMicrogramsPerServing", table: "MealEntries", type: "numeric(8,2)", precision: 8, scale: 2, nullable: false, defaultValue: 0m);
    }
}
