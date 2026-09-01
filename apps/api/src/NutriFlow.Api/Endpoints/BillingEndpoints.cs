using System.Security.Claims;
using NutriFlow.Application.Billing;

namespace NutriFlow.Api.Endpoints;

public static class BillingEndpoints
{
    public static IEndpointRouteBuilder MapBillingEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/billing")
            .WithTags("Billing")
            .RequireAuthorization();

        group.MapGet("/access", GetAccess);
        return endpoints;
    }

    private static IResult GetAccess(ClaimsPrincipal principal, ISubscriptionAccessService service)
    {
        if (!Guid.TryParse(principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Results.Unauthorized();

        return Results.Ok(service.GetAccess(userId));
    }
}
