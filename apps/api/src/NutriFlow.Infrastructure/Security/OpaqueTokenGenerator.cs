using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using NutriFlow.Application.Abstractions;

namespace NutriFlow.Infrastructure.Security;

internal sealed class OpaqueTokenGenerator : IOpaqueTokenGenerator
{
    public string Generate() => WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(64));

    public string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();
}
