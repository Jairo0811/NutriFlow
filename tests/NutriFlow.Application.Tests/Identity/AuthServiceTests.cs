using NutriFlow.Application.Abstractions;
using NutriFlow.Application.Identity;
using NutriFlow.Domain.Identity;

namespace NutriFlow.Application.Tests.Identity;

public sealed class AuthServiceTests
{
    [Fact]
    public async Task RegisterAsync_WithValidData_CreatesUserAndSession()
    {
        var fixture = new AuthFixture();

        var result = await fixture.Service.RegisterAsync(
            new RegisterCommand("jairo@example.com", "Jairo Matías", "NutriFlow123!"),
            CancellationToken.None);

        Assert.True(result.Succeeded);
        Assert.NotNull(result.Session);
        Assert.Equal("jairo@example.com", result.Session.Email);
        Assert.Equal("token-1", result.Session.RefreshToken);

        var user = Assert.Single(fixture.Users.Items);
        Assert.Equal("JAIRO@EXAMPLE.COM", user.NormalizedEmail);
        Assert.Equal("hash:NutriFlow123!", user.PasswordHash);

        var refreshToken = Assert.Single(fixture.RefreshTokens.Items);
        Assert.Equal(user.Id, refreshToken.UserId);
        Assert.Equal("sha:token-1", refreshToken.TokenHash);
        Assert.Equal(1, fixture.UnitOfWork.SaveCount);
    }

    [Fact]
    public async Task RegisterAsync_WithWeakPassword_DoesNotPersistUser()
    {
        var fixture = new AuthFixture();

        var result = await fixture.Service.RegisterAsync(
            new RegisterCommand("jairo@example.com", "Jairo", "weak"),
            CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Equal("weak_password", result.ErrorCode);
        Assert.Empty(fixture.Users.Items);
        Assert.Empty(fixture.RefreshTokens.Items);
        Assert.Equal(0, fixture.UnitOfWork.SaveCount);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ReturnsConflictWithoutCreatingSession()
    {
        var fixture = new AuthFixture();
        fixture.Users.Add(User.CreateWithPassword(
            "jairo@example.com",
            "JAIRO@EXAMPLE.COM",
            "Jairo",
            "hash:Existing123!",
            DateTime.UtcNow));

        var result = await fixture.Service.RegisterAsync(
            new RegisterCommand("JAIRO@example.com", "Otro nombre", "NutriFlow123!"),
            CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Equal("email_in_use", result.ErrorCode);
        Assert.Single(fixture.Users.Items);
        Assert.Empty(fixture.RefreshTokens.Items);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ReturnsGenericCredentialError()
    {
        var fixture = new AuthFixture();
        fixture.Users.Add(User.CreateWithPassword(
            "jairo@example.com",
            "JAIRO@EXAMPLE.COM",
            "Jairo",
            "hash:NutriFlow123!",
            DateTime.UtcNow));

        var result = await fixture.Service.LoginAsync(
            new LoginCommand("jairo@example.com", "Incorrect123!"),
            CancellationToken.None);

        Assert.False(result.Succeeded);
        Assert.Equal("invalid_credentials", result.ErrorCode);
        Assert.Empty(fixture.RefreshTokens.Items);
    }

    [Fact]
    public async Task ForgotPasswordAsync_ForUnknownEmail_DoesNotRevealAccountExistence()
    {
        var fixture = new AuthFixture();

        var result = await fixture.Service.ForgotPasswordAsync(
            new ForgotPasswordCommand("unknown@example.com"),
            CancellationToken.None);

        Assert.True(result.Accepted);
        Assert.Null(result.DevelopmentToken);
        Assert.Empty(fixture.PasswordResetTokens.Items);
        Assert.Equal(0, fixture.UnitOfWork.SaveCount);
    }

    [Fact]
    public async Task ForgotPasswordAsync_ForExistingUser_CreatesHashedOneTimeToken()
    {
        var fixture = new AuthFixture();
        fixture.Users.Add(User.CreateWithPassword(
            "jairo@example.com",
            "JAIRO@EXAMPLE.COM",
            "Jairo",
            "hash:NutriFlow123!",
            DateTime.UtcNow));

        var result = await fixture.Service.ForgotPasswordAsync(
            new ForgotPasswordCommand("jairo@example.com"),
            CancellationToken.None);

        Assert.True(result.Accepted);
        Assert.Equal("token-1", result.DevelopmentToken);
        var resetToken = Assert.Single(fixture.PasswordResetTokens.Items);
        Assert.Equal("sha:token-1", resetToken.TokenHash);
        Assert.Equal(1, fixture.UnitOfWork.SaveCount);
    }

    private sealed class AuthFixture
    {
        public AuthFixture()
        {
            Service = new AuthService(
                Users,
                RefreshTokens,
                PasswordResetTokens,
                PasswordHasher,
                OpaqueTokens,
                AccessTokens,
                GoogleIdentityVerifier,
                UnitOfWork,
                TimeProvider.System);
        }

        public FakeUserRepository Users { get; } = new();
        public FakeRefreshTokenRepository RefreshTokens { get; } = new();
        public FakePasswordResetTokenRepository PasswordResetTokens { get; } = new();
        public FakePasswordHasher PasswordHasher { get; } = new();
        public FakeOpaqueTokenGenerator OpaqueTokens { get; } = new();
        public FakeAccessTokenIssuer AccessTokens { get; } = new();
        public FakeGoogleIdentityVerifier GoogleIdentityVerifier { get; } = new();
        public FakeUnitOfWork UnitOfWork { get; } = new();
        public AuthService Service { get; }
    }

    private sealed class FakeUserRepository : IUserRepository
    {
        public List<User> Items { get; } = [];

        public Task<User?> GetByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken) =>
            Task.FromResult(Items.SingleOrDefault(user => user.NormalizedEmail == normalizedEmail));

        public Task<User?> GetByIdAsync(Guid userId, CancellationToken cancellationToken) =>
            Task.FromResult(Items.SingleOrDefault(user => user.Id == userId));

        public void Add(User user) => Items.Add(user);
    }

    private sealed class FakeRefreshTokenRepository : IRefreshTokenRepository
    {
        public List<RefreshToken> Items { get; } = [];

        public Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken) =>
            Task.FromResult(Items.SingleOrDefault(token => token.TokenHash == tokenHash));

        public Task<IReadOnlyList<RefreshToken>> GetActiveByUserIdAsync(
            Guid userId,
            DateTime nowUtc,
            CancellationToken cancellationToken)
        {
            IReadOnlyList<RefreshToken> result = Items
                .Where(token => token.UserId == userId && token.IsActive(nowUtc))
                .ToList();
            return Task.FromResult(result);
        }

        public void Add(RefreshToken refreshToken) => Items.Add(refreshToken);
    }

    private sealed class FakePasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        public List<PasswordResetToken> Items { get; } = [];

        public Task<PasswordResetToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken) =>
            Task.FromResult(Items.SingleOrDefault(token => token.TokenHash == tokenHash));

        public void Add(PasswordResetToken token) => Items.Add(token);
    }

    private sealed class FakePasswordHasher : IPasswordHasher
    {
        public string Hash(string password) => $"hash:{password}";

        public bool Verify(string password, string passwordHash) => passwordHash == Hash(password);
    }

    private sealed class FakeOpaqueTokenGenerator : IOpaqueTokenGenerator
    {
        private int _counter;

        public string Generate() => $"token-{++_counter}";

        public string Hash(string token) => $"sha:{token}";
    }

    private sealed class FakeAccessTokenIssuer : IAccessTokenIssuer
    {
        public TimeSpan RefreshTokenLifetime => TimeSpan.FromDays(30);
        public TimeSpan PasswordResetTokenLifetime => TimeSpan.FromMinutes(30);

        public AccessTokenValue Issue(User user, DateTime nowUtc) =>
            new($"access:{user.Id}", nowUtc.AddMinutes(15));
    }

    private sealed class FakeGoogleIdentityVerifier : IGoogleIdentityVerifier
    {
        public Task<GoogleIdentity?> VerifyAsync(string idToken, CancellationToken cancellationToken) =>
            Task.FromResult<GoogleIdentity?>(null);
    }

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public int SaveCount { get; private set; }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveCount++;
            return Task.FromResult(1);
        }
    }
}
