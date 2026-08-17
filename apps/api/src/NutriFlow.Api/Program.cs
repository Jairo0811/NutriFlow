using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NutriFlow.Api.Endpoints;
using NutriFlow.Application.Abstractions;
using NutriFlow.Application.Dashboard;
using NutriFlow.Application.Foods;
using NutriFlow.Application.Identity;
using NutriFlow.Application.Meals;
using NutriFlow.Application.Nutrition;
using NutriFlow.Application.Progress;
using NutriFlow.Infrastructure;
using NutriFlow.Infrastructure.Persistence;
using NutriFlow.Infrastructure.Security;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INutritionOnboardingService, NutritionOnboardingService>();
builder.Services.AddScoped<INutritionCalculationService, NutritionCalculationService>();
builder.Services.AddScoped<IFoodCatalogService, FoodCatalogService>();
builder.Services.AddScoped<IMealTrackingService, MealTrackingService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IProgressService, ProgressService>();
builder.Services.AddInfrastructure(builder.Configuration);

var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("Jwt configuration is required.");

if (Encoding.UTF8.GetByteCount(jwt.SigningKey) < 32)
{
    throw new InvalidOperationException("Jwt:SigningKey must contain at least 32 bytes.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    await using var scope = app.Services.CreateAsyncScope();
    var database = scope.ServiceProvider.GetRequiredService<NutriFlowDbContext>();
    await database.Database.MigrateAsync();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapAuthEndpoints();
app.MapNutritionOnboardingEndpoints();
app.MapNutritionCalculationEndpoints();
app.MapFoodCatalogEndpoints();
app.MapMealTrackingEndpoints();
app.MapDashboardEndpoints();
app.MapProgressEndpoints();

app.MapGet("/", () => Results.Ok(new
{
    name = "NutriFlow API",
    status = "running",
    version = "0.9.0"
}));

app.Run();

public partial class Program;
