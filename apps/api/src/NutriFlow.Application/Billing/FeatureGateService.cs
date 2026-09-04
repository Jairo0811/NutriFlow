namespace NutriFlow.Application.Billing;

public sealed record FeatureGateDecision(
    bool Allowed,
    string Entitlement,
    string? ErrorCode = null);

public interface IFeatureGateService
{
    bool HasEntitlement(Guid userId, string entitlement);
    int? GetUsageLimit(Guid userId, string limitCode);
    FeatureGateDecision CheckEntitlement(Guid userId, string entitlement);
}

public sealed class FeatureGateService(ISubscriptionAccessService accessService) : IFeatureGateService
{
    public bool HasEntitlement(Guid userId, string entitlement)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(entitlement);
        return accessService.GetAccess(userId).Entitlements.Contains(entitlement, StringComparer.Ordinal);
    }

    public int? GetUsageLimit(Guid userId, string limitCode)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(limitCode);
        var access = accessService.GetAccess(userId);
        return access.UsageLimits.TryGetValue(limitCode, out var limit) ? limit : null;
    }

    public FeatureGateDecision CheckEntitlement(Guid userId, string entitlement)
        => HasEntitlement(userId, entitlement)
            ? new FeatureGateDecision(true, entitlement)
            : new FeatureGateDecision(false, entitlement, "premium_required");
}
