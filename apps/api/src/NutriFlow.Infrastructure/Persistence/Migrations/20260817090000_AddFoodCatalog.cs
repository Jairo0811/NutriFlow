using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NutriFlow.Infrastructure.Persistence.Migrations;

[DbContext(typeof(NutriFlowDbContext))]
[Migration("20260817090000_AddFoodCatalog")]
public sealed class AddFoodCatalog : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Foods",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                Brand = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                Category = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                ServingSize = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                ServingUnit = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                Calories = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                ProteinGrams = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                CarbohydrateGrams = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                FatGrams = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                Barcode = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                Source = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                IsActive = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Foods", x => x.Id));

        migrationBuilder.CreateIndex("IX_Foods_Name", "Foods", "Name");
        migrationBuilder.CreateIndex("IX_Foods_Category", "Foods", "Category");
        migrationBuilder.CreateIndex("IX_Foods_Barcode", "Foods", "Barcode", unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
        => migrationBuilder.DropTable("Foods");
}
