namespace NutriFlow.Domain.Billing;

public sealed class UsageCounter
{
    private UsageCounter() { }

    public Guid UserId { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public DateTimeOffset PeriodStartUtc { get; private set; }
    public int Count { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }
}
