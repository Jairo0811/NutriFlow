using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NutriFlow.Api.Endpoints;
using NutriFlow.Application.Abstractions;
using NutriFlow.Application.Billing;
using NutriFlow.Application.Dashboard;
using NutriFlow.Application.Foods;
using NutriFlow.Application.Identity;
using NutriFlow.Application.Meals;
using NutriFlow.Application.Nutrition;
using NutriFlow.Application.Preferences;
using NutriFlow.Application.Progress;
using NutriFlow.Infrastructure;
using NutriFlow.Infrastructure.Persistence;
using NutriFlow.Infrastructure.Security;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISubscriptionAccessService, SubscriptionAccessService>();
builder.Services.AddScoped<IFeatureGateService, FeatureGateService>();
builder.Services.AddScoped<IUsageLimitService, UsageLimitService>();
builder.Services.AddScoped<INutritionOnboardingService, NutritionOnboardingService>();
builder.Services.AddScoped<INutritionCalculationService, NutritionCalculationService>();
builder.Services.AddScoped<IFoodCatalogService, FoodCatalogService>();
builder.Services.AddScoped<IMealTrackingService, MealTrackingService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IProgressService, ProgressService>();
builder.Services.AddScoped<IFoodCompatibilityService, FoodCompatibilityService>();
builder.Services.AddInfrastructure(builder.Configuration);

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddPolicy("Mobile", policy =>
{
    if (allowedOrigins.Length > 0)
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
}));

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("auth", limiter =>
    {
        limiter.PermitLimit = 20;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
        limiter.AutoReplenishment = true;
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("Jwt configuration is required.");

if (Encoding.UTF8.GetByteCount(jwt.SigningKey) < 32)
    throw new InvalidOperationException("Jwt:SigningKey must contain at least 32 bytes.");

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

app.UseForwardedHeaders();
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    await using var scope = app.Services.CreateAsyncScope();
    var database = scope.ServiceProvider.GetRequiredService<NutriFlowDbContext>();
    await database.Database.MigrateAsync();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors("Mobile");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.Use(async (context, next) =>
{
    context.Response.Headers.TryAdd("X-Content-Type-Options", "nosniff");
    context.Response.Headers.TryAdd("X-Frame-Options", "DENY");
    context.Response.Headers.TryAdd("Referrer-Policy", "no-referrer");
    await next();
});

app.MapHealthChecks("/health");
app.MapAuthEndpoints();
app.MapBillingEndpoints();
app.MapNutritionOnboardingEndpoints();
app.MapNutritionCalculationEndpoints();
app.MapFoodCatalogEndpoints();
app.MapMealTrackingEndpoints();
app.MapDashboardEndpoints();
app.MapProgressEndpoints();
app.MapPreferenceEndpoints();

app.MapGet("/", () => Results.Ok(new
{
    name = "NutriFlow API",
    status = "running",
    version = "1.1.0-dev"
}));

app.Run();

public partial class Program;
