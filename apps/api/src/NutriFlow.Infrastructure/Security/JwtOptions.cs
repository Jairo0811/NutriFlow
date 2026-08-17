namespace NutriFlow.Infrastructure.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "NutriFlow";
    public string Audience { get; set; } = "NutriFlow.Mobile";
    public string SigningKey { get; set; } = string.Empty;
    public int AccessTokenMinutes { get; set; } = 15;
    public int RefreshTokenDays { get; set; } = 30;
    public int PasswordResetTokenMinutes { get; set; } = 30;
    public string[] GoogleClientIds { get; set; } = [];
}
