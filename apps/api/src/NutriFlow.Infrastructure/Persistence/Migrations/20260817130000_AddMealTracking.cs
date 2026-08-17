using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NutriFlow.Infrastructure.Persistence.Migrations;

[DbContext(typeof(NutriFlowDbContext))]
[Migration("20260817130000_AddMealTracking")]
public sealed class AddMealTracking : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Meals",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                Date = table.Column<DateOnly>(type: "date", nullable: false),
                Type = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Meals", x => x.Id);
                table.ForeignKey("FK_Meals_Users_UserId", x => x.UserId, "Users", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "MealEntries",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                MealId = table.Column<Guid>(type: "uuid", nullable: false),
                FoodId = table.Column<Guid>(type: "uuid", nullable: false),
                FoodName = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                Brand = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                ServingSize = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                ServingUnit = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                Servings = table.Column<decimal>(type: "numeric(8,3)", precision: 8, scale: 3, nullable: false),
                CaloriesPerServing = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                ProteinGramsPerServing = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                CarbohydrateGramsPerServing = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                FatGramsPerServing = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_MealEntries", x => x.Id);
                table.ForeignKey("FK_MealEntries_Foods_FoodId", x => x.FoodId, "Foods", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_MealEntries_Meals_MealId", x => x.MealId, "Meals", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex("IX_Meals_UserId_Date_Type", "Meals", new[] { "UserId", "Date", "Type" }, unique: true);
        migrationBuilder.CreateIndex("IX_MealEntries_MealId", "MealEntries", "MealId");
        migrationBuilder.CreateIndex("IX_MealEntries_FoodId", "MealEntries", "FoodId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("MealEntries");
        migrationBuilder.DropTable("Meals");
    }
}
