using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Identity;

namespace NutriFlow.Application.Identity;

public sealed class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IRefreshTokenRepository _refreshTokens;
    private readonly IPasswordResetTokenRepository _passwordResetTokens;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IOpaqueTokenGenerator _opaqueTokens;
    private readonly IAccessTokenIssuer _accessTokens;
    private readonly IGoogleIdentityVerifier _googleIdentityVerifier;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public AuthService(
        IUserRepository users,
        IRefreshTokenRepository refreshTokens,
        IPasswordResetTokenRepository passwordResetTokens,
        IPasswordHasher passwordHasher,
        IOpaqueTokenGenerator opaqueTokens,
        IAccessTokenIssuer accessTokens,
        IGoogleIdentityVerifier googleIdentityVerifier,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        _users = users;
        _refreshTokens = refreshTokens;
        _passwordResetTokens = passwordResetTokens;
        _passwordHasher = passwordHasher;
        _opaqueTokens = opaqueTokens;
        _accessTokens = accessTokens;
        _googleIdentityVerifier = googleIdentityVerifier;
        _unitOfWork = unitOfWork;
        _timeProvider = timeProvider;
    }

    public async Task<AuthResult> RegisterAsync(RegisterCommand command, CancellationToken cancellationToken)
    {
        var email = command.Email.Trim();
        var normalizedEmail = NormalizeEmail(email);
        var displayName = command.DisplayName.Trim();

        if (!IsValidEmail(email))
        {
            return AuthResult.Failure("invalid_email", "Introduce un correo electrónico válido.");
        }

        if (displayName.Length is < 2 or > 80)
        {
            return AuthResult.Failure("invalid_display_name", "El nombre debe tener entre 2 y 80 caracteres.");
        }

        var passwordError = ValidatePassword(command.Password);
        if (passwordError is not null)
        {
            return AuthResult.Failure("weak_password", passwordError);
        }

        if (await _users.GetByNormalizedEmailAsync(normalizedEmail, cancellationToken) is not null)
        {
            return AuthResult.Failure("email_in_use", "Ya existe una cuenta asociada a ese correo.");
        }

        var nowUtc = UtcNow();
        var user = User.CreateWithPassword(
            email,
            normalizedEmail,
            displayName,
            _passwordHasher.Hash(command.Password),
            nowUtc);

        _users.Add(user);
        var session = CreateSession(user, nowUtc);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return AuthResult.Success(session);
    }

    public async Task<AuthResult> LoginAsync(LoginCommand command, CancellationToken cancellationToken)
    {
        var user = await _users.GetByNormalizedEmailAsync(NormalizeEmail(command.Email), cancellationToken);

        if (user is null || !user.IsActive || user.PasswordHash is null ||
            !_passwordHasher.Verify(command.Password, user.PasswordHash))
        {
            return AuthResult.Failure("invalid_credentials", "Correo o contraseña incorrectos.");
        }

        var nowUtc = UtcNow();
        var session = CreateSession(user, nowUtc);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return AuthResult.Success(session);
    }

    public async Task<AuthResult> RefreshAsync(RefreshSessionCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.RefreshToken))
        {
            return AuthResult.Failure("invalid_refresh_token", "La sesión no es válida.");
        }

        var nowUtc = UtcNow();
        var current = await _refreshTokens.GetByHashAsync(_opaqueTokens.Hash(command.RefreshToken), cancellationToken);

        if (current is null || !current.IsActive(nowUtc) || !current.User.IsActive)
        {
            return AuthResult.Failure("invalid_refresh_token", "La sesión expiró o fue revocada.");
        }

        var rawRefreshToken = _opaqueTokens.Generate();
        var refreshTokenHash = _opaqueTokens.Hash(rawRefreshToken);
        var refreshTokenExpiresAtUtc = nowUtc.Add(_accessTokens.RefreshTokenLifetime);

        current.Revoke(nowUtc, refreshTokenHash);
        _refreshTokens.Add(RefreshToken.Create(current.UserId, refreshTokenHash, refreshTokenExpiresAtUtc, nowUtc));

        var accessToken = _accessTokens.Issue(current.User, nowUtc);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return AuthResult.Success(new AuthSession(
            current.User.Id,
            current.User.Email,
            current.User.DisplayName,
            accessToken.Value,
            rawRefreshToken,
            accessToken.ExpiresAtUtc,
            refreshTokenExpiresAtUtc));
    }

    public async Task<OperationResult> LogoutAsync(LogoutCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.RefreshToken))
        {
            return OperationResult.Success();
        }

        var token = await _refreshTokens.GetByHashAsync(_opaqueTokens.Hash(command.RefreshToken), cancellationToken);
        if (token is not null && token.RevokedAtUtc is null)
        {
            token.Revoke(UtcNow());
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return OperationResult.Success();
    }

    public async Task<PasswordResetRequestResult> ForgotPasswordAsync(
        ForgotPasswordCommand command,
        CancellationToken cancellationToken)
    {
        var user = await _users.GetByNormalizedEmailAsync(NormalizeEmail(command.Email), cancellationToken);
        if (user is null || !user.IsActive)
        {
            return new PasswordResetRequestResult(true, null);
        }

        var nowUtc = UtcNow();
        var rawToken = _opaqueTokens.Generate();
        var tokenHash = _opaqueTokens.Hash(rawToken);
        var token = PasswordResetToken.Create(
            user.Id,
            tokenHash,
            nowUtc.Add(_accessTokens.PasswordResetTokenLifetime),
            nowUtc);

        _passwordResetTokens.Add(token);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new PasswordResetRequestResult(true, rawToken);
    }

    public async Task<OperationResult> ResetPasswordAsync(
        ResetPasswordCommand command,
        CancellationToken cancellationToken)
    {
        var passwordError = ValidatePassword(command.NewPassword);
        if (passwordError is not null)
        {
            return OperationResult.Failure("weak_password", passwordError);
        }

        if (string.IsNullOrWhiteSpace(command.Token))
        {
            return OperationResult.Failure("invalid_reset_token", "El token de recuperación no es válido.");
        }

        var nowUtc = UtcNow();
        var token = await _passwordResetTokens.GetByHashAsync(_opaqueTokens.Hash(command.Token), cancellationToken);

        if (token is null || !token.IsActive(nowUtc) || !token.User.IsActive)
        {
            return OperationResult.Failure("invalid_reset_token", "El token de recuperación expiró o ya fue utilizado.");
        }

        token.User.ChangePassword(_passwordHasher.Hash(command.NewPassword), nowUtc);
        token.MarkAsUsed(nowUtc);

        var activeSessions = await _refreshTokens.GetActiveByUserIdAsync(token.UserId, nowUtc, cancellationToken);
        foreach (var session in activeSessions)
        {
            session.Revoke(nowUtc);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return OperationResult.Success();
    }

    public async Task<AuthResult> SignInWithGoogleAsync(
        GoogleSignInCommand command,
        CancellationToken cancellationToken)
    {
        var identity = await _googleIdentityVerifier.VerifyAsync(command.IdToken, cancellationToken);
        if (identity is null)
        {
            return AuthResult.Failure("invalid_google_token", "No fue posible validar la identidad de Google.");
        }

        var normalizedEmail = NormalizeEmail(identity.Email);
        var user = await _users.GetByNormalizedEmailAsync(normalizedEmail, cancellationToken);
        var nowUtc = UtcNow();

        if (user is null)
        {
            user = User.CreateWithGoogle(
                identity.Email,
                normalizedEmail,
                identity.DisplayName,
                identity.Subject,
                nowUtc);
            _users.Add(user);
        }
        else
        {
            if (!user.IsActive)
            {
                return AuthResult.Failure("account_disabled", "La cuenta se encuentra deshabilitada.");
            }

            if (!string.IsNullOrWhiteSpace(user.GoogleSubject) && user.GoogleSubject != identity.Subject)
            {
                return AuthResult.Failure("google_account_conflict", "El correo ya está vinculado a otra identidad de Google.");
            }

            user.LinkGoogleAccount(identity.Subject, nowUtc);
        }

        var session = CreateSession(user, nowUtc);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return AuthResult.Success(session);
    }

    private AuthSession CreateSession(User user, DateTime nowUtc)
    {
        var accessToken = _accessTokens.Issue(user, nowUtc);
        var rawRefreshToken = _opaqueTokens.Generate();
        var refreshTokenExpiresAtUtc = nowUtc.Add(_accessTokens.RefreshTokenLifetime);

        _refreshTokens.Add(RefreshToken.Create(
            user.Id,
            _opaqueTokens.Hash(rawRefreshToken),
            refreshTokenExpiresAtUtc,
            nowUtc));

        return new AuthSession(
            user.Id,
            user.Email,
            user.DisplayName,
            accessToken.Value,
            rawRefreshToken,
            accessToken.ExpiresAtUtc,
            refreshTokenExpiresAtUtc);
    }

    private DateTime UtcNow() => _timeProvider.GetUtcNow().UtcDateTime;

    private static string NormalizeEmail(string email) => email.Trim().ToUpperInvariant();

    private static bool IsValidEmail(string email)
    {
        try
        {
            var address = new System.Net.Mail.MailAddress(email);
            return string.Equals(address.Address, email, StringComparison.OrdinalIgnoreCase);
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private static string? ValidatePassword(string password)
    {
        if (password.Length < 12)
        {
            return "La contraseña debe tener al menos 12 caracteres.";
        }

        if (!password.Any(char.IsUpper) || !password.Any(char.IsLower) ||
            !password.Any(char.IsDigit) || !password.Any(character => !char.IsLetterOrDigit(character)))
        {
            return "La contraseña debe incluir mayúsculas, minúsculas, números y símbolos.";
        }

        return null;
    }
}
