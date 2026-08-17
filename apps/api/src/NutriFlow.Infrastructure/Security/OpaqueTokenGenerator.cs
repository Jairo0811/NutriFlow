using System.Security.Cryptography;
using System.Text;
using NutriFlow.Application.Abstractions;

namespace NutriFlow.Infrastructure.Security;

internal sealed class OpaqueTokenGenerator : IOpaqueTokenGenerator
{
    public string Generate()
    {
        var value = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        return value.TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();
}
