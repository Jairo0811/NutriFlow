using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutriFlow.Infrastructure.Persistence.Migrations;

public partial class AddFoodAllergens : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string[]>(
            name: "AllergenCodes",
            table: "Foods",
            type: "text[]",
            nullable: false,
            defaultValue: Array.Empty<string>());
    }

    protected override void Down(MigrationBuilder migrationBuilder)
        => migrationBuilder.DropColumn(name: "AllergenCodes", table: "Foods");
}
