using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NutriFlow.Application.Abstractions;
using NutriFlow.Application.Billing;
using NutriFlow.Application.Engagement;
using NutriFlow.Infrastructure.Persistence;
using NutriFlow.Infrastructure.Persistence.Repositories;
using NutriFlow.Infrastructure.Security;

namespace NutriFlow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("NutriFlow")
            ?? throw new InvalidOperationException("ConnectionStrings:NutriFlow is required.");

        services.AddDbContext<NutriFlowDbContext>(options => options.UseNpgsql(connectionString));
        services.Configure<JwtOptions>(options => ConfigureJwt(options, configuration));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
        services.AddScoped<INutritionProfileRepository, NutritionProfileRepository>();
        services.AddScoped<IFoodRepository, FoodRepository>();
        services.AddScoped<IMealRepository, MealRepository>();
        services.AddScoped<IWeightEntryRepository, WeightEntryRepository>();
        services.AddScoped<IUsageCounterRepository, UsageCounterRepository>();
        services.AddScoped<IEngagementRepository, EngagementRepository>();
        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<NutriFlowDbContext>());

        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IOpaqueTokenGenerator, OpaqueTokenGenerator>();
        services.AddSingleton<IAccessTokenIssuer, JwtTokenIssuer>();
        services.AddSingleton<IGoogleIdentityVerifier, GoogleIdentityVerifier>();

        return services;
    }

    private static void ConfigureJwt(JwtOptions options, IConfiguration configuration)
    {
        var section = configuration.GetSection(JwtOptions.SectionName);

        options.Issuer = section["Issuer"] ?? options.Issuer;
        options.Audience = section["Audience"] ?? options.Audience;
        options.SigningKey = section["SigningKey"] ?? string.Empty;
        options.AccessTokenMinutes = ReadPositiveInt(section["AccessTokenMinutes"], options.AccessTokenMinutes);
        options.RefreshTokenDays = ReadPositiveInt(section["RefreshTokenDays"], options.RefreshTokenDays);
        options.PasswordResetTokenMinutes = ReadPositiveInt(section["PasswordResetTokenMinutes"], options.PasswordResetTokenMinutes);
        options.GoogleClientIds = section.GetSection("GoogleClientIds").GetChildren()
            .Select(child => child.Value)
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value!)
            .ToArray();
    }

    private static int ReadPositiveInt(string? value, int fallback) =>
        int.TryParse(value, out var parsed) && parsed > 0 ? parsed : fallback;
}
