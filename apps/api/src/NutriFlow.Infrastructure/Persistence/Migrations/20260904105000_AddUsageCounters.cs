using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutriFlow.Infrastructure.Persistence.Migrations;

[DbContext(typeof(NutriFlowDbContext))]
[Migration("20260904105000_AddUsageCounters")]
public sealed class AddUsageCounters : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "UsageCounters",
            columns: table => new
            {
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                Code = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                PeriodStartUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                Count = table.Column<int>(type: "integer", nullable: false),
                UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_UsageCounters", x => new { x.UserId, x.Code, x.PeriodStartUtc });
                table.ForeignKey(
                    name: "FK_UsageCounters_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_UsageCounters_UserId_PeriodStartUtc",
            table: "UsageCounters",
            columns: new[] { "UserId", "PeriodStartUtc" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
        => migrationBuilder.DropTable(name: "UsageCounters");
}
