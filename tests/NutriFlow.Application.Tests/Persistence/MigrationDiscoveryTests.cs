using Microsoft.EntityFrameworkCore;
using NutriFlow.Infrastructure.Persistence;

namespace NutriFlow.Application.Tests.Persistence;

public sealed class MigrationDiscoveryTests
{
    [Fact]
    public void TodasLasMigracionesHistoricasSonDescubiertasPorEfCore()
    {
        // Database.GetMigrations() consulta metadatos del ensamblado; no abre una conexión.
        var options = new DbContextOptionsBuilder<NutriFlowDbContext>()
            .UseNpgsql("Host=localhost;Database=ignored;Username=unused;Password=unused")
            .Options;

        using var db = new NutriFlowDbContext(options);
        var found = db.Database.GetMigrations().ToHashSet(StringComparer.Ordinal);

        var required = new[]
        {
            "20260817030000_InitialIdentity",
            "20260817040000_AddNutritionProfile",
            "20260817090000_AddFoodCatalog",
            "20260817130000_AddMealTracking",
            "20260817150000_AddWeightProgress",
            "20260817160000_AddFoodAllergens",
            "20260904105000_AddUsageCounters",
            "20260904113000_AddEngagement",
            "20260904122000_AddMicronutrients"
        };

        foreach (var migration in required)
            Assert.Contains(migration, found);
    }
}
