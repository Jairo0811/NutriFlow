using Microsoft.EntityFrameworkCore;
using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Nutrition;

namespace NutriFlow.Infrastructure.Persistence.Repositories;

internal sealed class NutritionProfileRepository(NutriFlowDbContext dbContext) : INutritionProfileRepository
{
    public Task<NutritionProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        => dbContext.NutritionProfiles.SingleOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

    public async Task AddAsync(NutritionProfile profile, CancellationToken cancellationToken = default)
        => await dbContext.NutritionProfiles.AddAsync(profile, cancellationToken);
}
