using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutriFlow.Infrastructure.Persistence.Migrations;

public partial class AddEngagement : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Recipes",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                Servings = table.Column<int>(type: "integer", nullable: false),
                Instructions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Recipes", x => x.Id);
                table.ForeignKey(
                    name: "FK_Recipes_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "WaterEntries",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                Date = table.Column<DateOnly>(type: "date", nullable: false),
                AmountOunces = table.Column<decimal>(type: "numeric(7,2)", precision: 7, scale: 2, nullable: false),
                CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_WaterEntries", x => x.Id);
                table.ForeignKey(
                    name: "FK_WaterEntries_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "FavoriteFoods",
            columns: table => new
            {
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                FoodId = table.Column<Guid>(type: "uuid", nullable: false),
                CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_FavoriteFoods", x => new { x.UserId, x.FoodId });
                table.ForeignKey(
                    name: "FK_FavoriteFoods_Foods_FoodId",
                    column: x => x.FoodId,
                    principalTable: "Foods",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_FavoriteFoods_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "RecipeIngredients",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                RecipeId = table.Column<Guid>(type: "uuid", nullable: false),
                FoodId = table.Column<Guid>(type: "uuid", nullable: false),
                FoodName = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                Brand = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                Servings = table.Column<decimal>(type: "numeric(8,3)", precision: 8, scale: 3, nullable: false),
                CaloriesPerServing = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                ProteinGramsPerServing = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                CarbohydrateGramsPerServing = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                FatGramsPerServing = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_RecipeIngredients", x => x.Id);
                table.ForeignKey(
                    name: "FK_RecipeIngredients_Foods_FoodId",
                    column: x => x.FoodId,
                    principalTable: "Foods",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_RecipeIngredients_Recipes_RecipeId",
                    column: x => x.RecipeId,
                    principalTable: "Recipes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "IX_FavoriteFoods_FoodId", table: "FavoriteFoods", column: "FoodId");
        migrationBuilder.CreateIndex(name: "IX_FavoriteFoods_UserId_CreatedAtUtc", table: "FavoriteFoods", columns: new[] { "UserId", "CreatedAtUtc" });
        migrationBuilder.CreateIndex(name: "IX_RecipeIngredients_FoodId", table: "RecipeIngredients", column: "FoodId");
        migrationBuilder.CreateIndex(name: "IX_RecipeIngredients_RecipeId", table: "RecipeIngredients", column: "RecipeId");
        migrationBuilder.CreateIndex(name: "IX_Recipes_UserId_CreatedAtUtc", table: "Recipes", columns: new[] { "UserId", "CreatedAtUtc" });
        migrationBuilder.CreateIndex(name: "IX_WaterEntries_UserId_Date", table: "WaterEntries", columns: new[] { "UserId", "Date" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "FavoriteFoods");
        migrationBuilder.DropTable(name: "RecipeIngredients");
        migrationBuilder.DropTable(name: "WaterEntries");
        migrationBuilder.DropTable(name: "Recipes");
    }
}
