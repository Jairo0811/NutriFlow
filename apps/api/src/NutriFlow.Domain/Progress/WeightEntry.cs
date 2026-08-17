namespace NutriFlow.Domain.Progress;

public sealed class WeightEntry
{
    private WeightEntry() { }

    public WeightEntry(Guid id, Guid userId, DateOnly date, decimal weightPounds, string? note = null)
    {
        if (id == Guid.Empty) throw new ArgumentException("Weight entry id is required.", nameof(id));
        if (userId == Guid.Empty) throw new ArgumentException("User id is required.", nameof(userId));
        if (weightPounds is < 60 or > 800) throw new ArgumentOutOfRangeException(nameof(weightPounds), "Weight must be between 60 lb and 800 lb.");

        Id = id;
        UserId = userId;
        Date = date;
        WeightPounds = weightPounds;
        Note = string.IsNullOrWhiteSpace(note) ? null : note.Trim();
        if (Note?.Length > 240) throw new ArgumentException("Note must not exceed 240 characters.", nameof(note));
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public DateOnly Date { get; private set; }
    public decimal WeightPounds { get; private set; }
    public string? Note { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
}
