using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NutriFlow.Infrastructure.Persistence.Migrations;

[DbContext(typeof(NutriFlowDbContext))]
[Migration("20260817040000_AddNutritionProfile")]
public sealed class AddNutritionProfile : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "NutritionProfiles",
            columns: table => new
            {
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                DateOfBirth = table.Column<DateOnly>(type: "date", nullable: true),
                BiologicalSex = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                HeightInches = table.Column<int>(type: "integer", nullable: true),
                CurrentWeightPounds = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                ActivityLevel = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                GoalType = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: true),
                TargetWeightPounds = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                CompletedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_NutritionProfiles", x => x.UserId);
                table.ForeignKey("FK_NutritionProfiles_Users_UserId", x => x.UserId, "Users", "Id", onDelete: ReferentialAction.Cascade);
            });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
        => migrationBuilder.DropTable("NutritionProfiles");
}
