namespace NutriFlow.Application.Identity;

public sealed record RegisterCommand(string Email, string DisplayName, string Password);
public sealed record LoginCommand(string Email, string Password);
public sealed record RefreshSessionCommand(string RefreshToken);
public sealed record LogoutCommand(string RefreshToken);
public sealed record ForgotPasswordCommand(string Email);
public sealed record ResetPasswordCommand(string Token, string NewPassword);
public sealed record GoogleSignInCommand(string IdToken);

public sealed record AuthSession(
    Guid UserId,
    string Email,
    string DisplayName,
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAtUtc,
    DateTime RefreshTokenExpiresAtUtc);

public sealed record AuthResult(
    bool Succeeded,
    AuthSession? Session,
    string? ErrorCode,
    string? ErrorMessage)
{
    public static AuthResult Success(AuthSession session) => new(true, session, null, null);

    public static AuthResult Failure(string code, string message) => new(false, null, code, message);
}

public sealed record OperationResult(bool Succeeded, string? ErrorCode, string? ErrorMessage)
{
    public static OperationResult Success() => new(true, null, null);

    public static OperationResult Failure(string code, string message) => new(false, code, message);
}

public sealed record PasswordResetRequestResult(bool Accepted, string? DevelopmentToken);
