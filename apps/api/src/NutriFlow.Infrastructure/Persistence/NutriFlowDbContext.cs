using Microsoft.EntityFrameworkCore;
using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Identity;
using NutriFlow.Domain.Nutrition;

namespace NutriFlow.Infrastructure.Persistence;

public sealed class NutriFlowDbContext(DbContextOptions<NutriFlowDbContext> options)
    : DbContext(options), IUnitOfWork
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<NutritionProfile> NutritionProfiles => Set<NutritionProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var users = modelBuilder.Entity<User>();
        users.ToTable("Users");
        users.HasKey(user => user.Id);
        users.Property(user => user.Email).HasMaxLength(320).IsRequired();
        users.Property(user => user.NormalizedEmail).HasMaxLength(320).IsRequired();
        users.Property(user => user.DisplayName).HasMaxLength(80).IsRequired();
        users.Property(user => user.PasswordHash).HasMaxLength(512);
        users.Property(user => user.GoogleSubject).HasMaxLength(128);
        users.HasIndex(user => user.NormalizedEmail).IsUnique();
        users.HasIndex(user => user.GoogleSubject).IsUnique();

        var refreshTokens = modelBuilder.Entity<RefreshToken>();
        refreshTokens.ToTable("RefreshTokens");
        refreshTokens.HasKey(token => token.Id);
        refreshTokens.Property(token => token.TokenHash).HasMaxLength(64).IsRequired();
        refreshTokens.Property(token => token.ReplacedByTokenHash).HasMaxLength(64);
        refreshTokens.HasIndex(token => token.TokenHash).IsUnique();
        refreshTokens.HasIndex(token => new { token.UserId, token.ExpiresAtUtc });
        refreshTokens.HasOne(token => token.User).WithMany().HasForeignKey(token => token.UserId).OnDelete(DeleteBehavior.Cascade);

        var passwordResetTokens = modelBuilder.Entity<PasswordResetToken>();
        passwordResetTokens.ToTable("PasswordResetTokens");
        passwordResetTokens.HasKey(token => token.Id);
        passwordResetTokens.Property(token => token.TokenHash).HasMaxLength(64).IsRequired();
        passwordResetTokens.HasIndex(token => token.TokenHash).IsUnique();
        passwordResetTokens.HasIndex(token => new { token.UserId, token.ExpiresAtUtc });
        passwordResetTokens.HasOne(token => token.User).WithMany().HasForeignKey(token => token.UserId).OnDelete(DeleteBehavior.Cascade);

        var nutritionProfiles = modelBuilder.Entity<NutritionProfile>();
        nutritionProfiles.ToTable("NutritionProfiles");
        nutritionProfiles.HasKey(profile => profile.UserId);
        nutritionProfiles.Property(profile => profile.CurrentWeightPounds).HasPrecision(6, 2);
        nutritionProfiles.Property(profile => profile.TargetWeightPounds).HasPrecision(6, 2);
        nutritionProfiles.Property(profile => profile.BiologicalSex).HasConversion<string>().HasMaxLength(16);
        nutritionProfiles.Property(profile => profile.ActivityLevel).HasConversion<string>().HasMaxLength(16);
        nutritionProfiles.Property(profile => profile.GoalType).HasConversion<string>().HasMaxLength(24);
        nutritionProfiles.HasOne<User>().WithOne().HasForeignKey<NutritionProfile>(profile => profile.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
