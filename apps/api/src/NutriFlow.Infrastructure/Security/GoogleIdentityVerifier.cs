using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using NutriFlow.Application.Abstractions;

namespace NutriFlow.Infrastructure.Security;

internal sealed class GoogleIdentityVerifier(IOptions<JwtOptions> options) : IGoogleIdentityVerifier
{
    private readonly JwtOptions _options = options.Value;

    public async Task<GoogleIdentity?> VerifyAsync(string idToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(idToken) || _options.GoogleClientIds.Length == 0)
        {
            return null;
        }

        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(
                idToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = _options.GoogleClientIds
                });

            if (string.IsNullOrWhiteSpace(payload.Subject) || string.IsNullOrWhiteSpace(payload.Email) || !payload.EmailVerified)
            {
                return null;
            }

            var displayName = string.IsNullOrWhiteSpace(payload.Name)
                ? payload.Email.Split('@', 2)[0]
                : payload.Name;

            return new GoogleIdentity(payload.Subject, payload.Email, displayName);
        }
        catch (InvalidJwtException)
        {
            return null;
        }
    }
}
