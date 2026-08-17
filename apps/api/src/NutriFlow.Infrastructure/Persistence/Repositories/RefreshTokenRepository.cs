using Microsoft.EntityFrameworkCore;
using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Identity;

namespace NutriFlow.Infrastructure.Persistence.Repositories;

internal sealed class RefreshTokenRepository(NutriFlowDbContext dbContext) : IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken) =>
        dbContext.RefreshTokens
            .Include(token => token.User)
            .SingleOrDefaultAsync(token => token.TokenHash == tokenHash, cancellationToken);

    public async Task<IReadOnlyList<RefreshToken>> GetActiveByUserIdAsync(
        Guid userId,
        DateTime nowUtc,
        CancellationToken cancellationToken) =>
        await dbContext.RefreshTokens
            .Where(token => token.UserId == userId && token.RevokedAtUtc == null && token.ExpiresAtUtc > nowUtc)
            .ToListAsync(cancellationToken);

    public void Add(RefreshToken refreshToken) => dbContext.RefreshTokens.Add(refreshToken);
}
