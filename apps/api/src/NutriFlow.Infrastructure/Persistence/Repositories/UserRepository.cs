using Microsoft.EntityFrameworkCore;
using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Identity;

namespace NutriFlow.Infrastructure.Persistence.Repositories;

internal sealed class UserRepository(NutriFlowDbContext dbContext) : IUserRepository
{
    public Task<User?> GetByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken) =>
        dbContext.Users.SingleOrDefaultAsync(user => user.NormalizedEmail == normalizedEmail, cancellationToken);

    public Task<User?> GetByIdAsync(Guid userId, CancellationToken cancellationToken) =>
        dbContext.Users.SingleOrDefaultAsync(user => user.Id == userId, cancellationToken);

    public void Add(User user) => dbContext.Users.Add(user);
}
