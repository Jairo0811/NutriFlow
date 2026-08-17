namespace NutriFlow.Domain.Identity;

public sealed class PasswordResetToken
{
    private PasswordResetToken()
    {
    }

    private PasswordResetToken(
        Guid id,
        Guid userId,
        string tokenHash,
        DateTime expiresAtUtc,
        DateTime createdAtUtc)
    {
        Id = id;
        UserId = userId;
        TokenHash = tokenHash;
        ExpiresAtUtc = expiresAtUtc;
        CreatedAtUtc = createdAtUtc;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? UsedAtUtc { get; private set; }
    public User User { get; private set; } = null!;

    public bool IsActive(DateTime nowUtc) => UsedAtUtc is null && ExpiresAtUtc > nowUtc;

    public static PasswordResetToken Create(
        Guid userId,
        string tokenHash,
        DateTime expiresAtUtc,
        DateTime createdAtUtc) =>
        new(Guid.NewGuid(), userId, tokenHash, expiresAtUtc, createdAtUtc);

    public void MarkAsUsed(DateTime usedAtUtc)
    {
        UsedAtUtc ??= usedAtUtc;
    }
}
