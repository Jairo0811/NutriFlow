namespace NutriFlow.Domain.Identity;

public sealed class User
{
    private User()
    {
    }

    private User(
        Guid id,
        string email,
        string normalizedEmail,
        string displayName,
        string? passwordHash,
        string? googleSubject,
        DateTime createdAtUtc)
    {
        Id = id;
        Email = email;
        NormalizedEmail = normalizedEmail;
        DisplayName = displayName;
        PasswordHash = passwordHash;
        GoogleSubject = googleSubject;
        IsActive = true;
        CreatedAtUtc = createdAtUtc;
        UpdatedAtUtc = createdAtUtc;
    }

    public Guid Id { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string NormalizedEmail { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public string? PasswordHash { get; private set; }
    public string? GoogleSubject { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime UpdatedAtUtc { get; private set; }

    public static User CreateWithPassword(
        string email,
        string normalizedEmail,
        string displayName,
        string passwordHash,
        DateTime createdAtUtc) =>
        new(Guid.NewGuid(), email, normalizedEmail, displayName, passwordHash, null, createdAtUtc);

    public static User CreateWithGoogle(
        string email,
        string normalizedEmail,
        string displayName,
        string googleSubject,
        DateTime createdAtUtc) =>
        new(Guid.NewGuid(), email, normalizedEmail, displayName, null, googleSubject, createdAtUtc);

    public void ChangePassword(string passwordHash, DateTime changedAtUtc)
    {
        PasswordHash = passwordHash;
        UpdatedAtUtc = changedAtUtc;
    }

    public void LinkGoogleAccount(string googleSubject, DateTime linkedAtUtc)
    {
        if (!string.IsNullOrWhiteSpace(GoogleSubject) && GoogleSubject != googleSubject)
        {
            throw new InvalidOperationException("A different Google account is already linked.");
        }

        GoogleSubject = googleSubject;
        UpdatedAtUtc = linkedAtUtc;
    }
}
