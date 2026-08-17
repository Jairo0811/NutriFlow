using Microsoft.EntityFrameworkCore;
using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Identity;

namespace NutriFlow.Infrastructure.Persistence.Repositories;

internal sealed class PasswordResetTokenRepository(NutriFlowDbContext dbContext) : IPasswordResetTokenRepository
{
    public Task<PasswordResetToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken) =>
        dbContext.PasswordResetTokens
            .Include(token => token.User)
            .SingleOrDefaultAsync(token => token.TokenHash == tokenHash, cancellationToken);

    public void Add(PasswordResetToken token) => dbContext.PasswordResetTokens.Add(token);
}
