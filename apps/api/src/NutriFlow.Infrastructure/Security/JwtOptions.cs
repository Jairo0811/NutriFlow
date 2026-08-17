namespace NutriFlow.Infrastructure.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = "NutriFlow";
    public string Audience { get; init; } = "NutriFlow.Mobile";
    public string SigningKey { get; init; } = string.Empty;
    public int AccessTokenMinutes { get; init; } = 15;
    public int RefreshTokenDays { get; init; } = 30;
    public int PasswordResetTokenMinutes { get; init; } = 30;
    public string[] GoogleClientIds { get; init; } = [];
}
