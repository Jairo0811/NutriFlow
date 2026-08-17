using NutriFlow.Application.Identity;
using NutriFlow.Domain.Identity;

namespace NutriFlow.Application.Abstractions;

public interface IAuthService
{
    Task<AuthResult> RegisterAsync(RegisterCommand command, CancellationToken cancellationToken);
    Task<AuthResult> LoginAsync(LoginCommand command, CancellationToken cancellationToken);
    Task<AuthResult> RefreshAsync(RefreshSessionCommand command, CancellationToken cancellationToken);
    Task<OperationResult> LogoutAsync(LogoutCommand command, CancellationToken cancellationToken);
    Task<PasswordResetRequestResult> ForgotPasswordAsync(ForgotPasswordCommand command, CancellationToken cancellationToken);
    Task<OperationResult> ResetPasswordAsync(ResetPasswordCommand command, CancellationToken cancellationToken);
    Task<AuthResult> SignInWithGoogleAsync(GoogleSignInCommand command, CancellationToken cancellationToken);
}

public interface IUserRepository
{
    Task<User?> GetByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken);
    Task<User?> GetByIdAsync(Guid userId, CancellationToken cancellationToken);
    void Add(User user);
}

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken);
    Task<IReadOnlyList<RefreshToken>> GetActiveByUserIdAsync(Guid userId, DateTime nowUtc, CancellationToken cancellationToken);
    void Add(RefreshToken refreshToken);
}

public interface IPasswordResetTokenRepository
{
    Task<PasswordResetToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken);
    void Add(PasswordResetToken token);
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string passwordHash);
}

public interface IOpaqueTokenGenerator
{
    string Generate();
    string Hash(string token);
}

public sealed record AccessTokenValue(string Value, DateTime ExpiresAtUtc);

public interface IAccessTokenIssuer
{
    AccessTokenValue Issue(User user, DateTime nowUtc);
    TimeSpan RefreshTokenLifetime { get; }
    TimeSpan PasswordResetTokenLifetime { get; }
}

public sealed record GoogleIdentity(string Subject, string Email, string DisplayName);

public interface IGoogleIdentityVerifier
{
    Task<GoogleIdentity?> VerifyAsync(string idToken, CancellationToken cancellationToken);
}

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
