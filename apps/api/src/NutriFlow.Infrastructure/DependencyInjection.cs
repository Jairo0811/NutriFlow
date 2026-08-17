using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NutriFlow.Application.Abstractions;
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
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<NutriFlowDbContext>());

        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IOpaqueTokenGenerator, OpaqueTokenGenerator>();
        services.AddSingleton<IAccessTokenIssuer, JwtTokenIssuer>();
        services.AddSingleton<IGoogleIdentityVerifier, GoogleIdentityVerifier>();

        return services;
    }
}
