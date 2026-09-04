using Microsoft.EntityFrameworkCore;
using NutriFlow.Application.Abstractions;
using NutriFlow.Domain.Billing;
using NutriFlow.Domain.Foods;
using NutriFlow.Domain.Identity;
using NutriFlow.Domain.Meals;
using NutriFlow.Domain.Nutrition;
using NutriFlow.Domain.Progress;

namespace NutriFlow.Infrastructure.Persistence;

public sealed class NutriFlowDbContext(DbContextOptions<NutriFlowDbContext> options)
    : DbContext(options), IUnitOfWork
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<UsageCounter> UsageCounters => Set<UsageCounter>();
    public DbSet<NutritionProfile> NutritionProfiles => Set<NutritionProfile>();
    public DbSet<Food> Foods => Set<Food>();
    public DbSet<Meal> Meals => Set<Meal>();
    public DbSet<MealEntry> MealEntries => Set<MealEntry>();
    public DbSet<WeightEntry> WeightEntries => Set<WeightEntry>();

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

        var usageCounters = modelBuilder.Entity<UsageCounter>();
        usageCounters.ToTable("UsageCounters");
        usageCounters.HasKey(counter => new { counter.UserId, counter.Code, counter.PeriodStartUtc });
        usageCounters.Property(counter => counter.Code).HasMaxLength(80).IsRequired();
        usageCounters.Property(counter => counter.Count).IsRequired();
        usageCounters.HasIndex(counter => new { counter.UserId, counter.PeriodStartUtc });
        usageCounters.HasOne<User>().WithMany().HasForeignKey(counter => counter.UserId).OnDelete(DeleteBehavior.Cascade);

        var nutritionProfiles = modelBuilder.Entity<NutritionProfile>();
        nutritionProfiles.ToTable("NutritionProfiles");
        nutritionProfiles.HasKey(profile => profile.UserId);
        nutritionProfiles.Property(profile => profile.CurrentWeightPounds).HasPrecision(6, 2);
        nutritionProfiles.Property(profile => profile.TargetWeightPounds).HasPrecision(6, 2);
        nutritionProfiles.Property(profile => profile.BiologicalSex).HasConversion<string>().HasMaxLength(16);
        nutritionProfiles.Property(profile => profile.ActivityLevel).HasConversion<string>().HasMaxLength(16);
        nutritionProfiles.Property(profile => profile.GoalType).HasConversion<string>().HasMaxLength(24);
        nutritionProfiles.Property(profile => profile.FoodPreferenceCodes).HasColumnType("text[]").IsRequired();
        nutritionProfiles.Property(profile => profile.DietaryRestrictionCodes).HasColumnType("text[]").IsRequired();
        nutritionProfiles.HasOne<User>().WithOne().HasForeignKey<NutritionProfile>(profile => profile.UserId).OnDelete(DeleteBehavior.Cascade);

        var foods = modelBuilder.Entity<Food>();
        foods.ToTable("Foods");
        foods.HasKey(food => food.Id);
        foods.Property(food => food.Name).HasMaxLength(120).IsRequired();
        foods.Property(food => food.Brand).HasMaxLength(120);
        foods.Property(food => food.Category).HasMaxLength(60).IsRequired();
        foods.Property(food => food.ServingUnit).HasMaxLength(24).IsRequired();
        foods.Property(food => food.ServingSize).HasPrecision(8, 2);
        foods.Property(food => food.Calories).HasPrecision(8, 2);
        foods.Property(food => food.ProteinGrams).HasPrecision(8, 2);
        foods.Property(food => food.CarbohydrateGrams).HasPrecision(8, 2);
        foods.Property(food => food.FatGrams).HasPrecision(8, 2);
        foods.Property(food => food.Barcode).HasMaxLength(32);
        foods.Property(food => food.AllergenCodes).HasColumnType("text[]").IsRequired();
        foods.Property(food => food.Source).HasConversion<string>().HasMaxLength(16);
        foods.HasIndex(food => food.Name);
        foods.HasIndex(food => food.Category);
        foods.HasIndex(food => food.Barcode).IsUnique();

        var meals = modelBuilder.Entity<Meal>();
        meals.ToTable("Meals");
        meals.HasKey(meal => meal.Id);
        meals.Property(meal => meal.Type).HasConversion<string>().HasMaxLength(16).IsRequired();
        meals.HasIndex(meal => new { meal.UserId, meal.Date, meal.Type }).IsUnique();
        meals.HasOne<User>().WithMany().HasForeignKey(meal => meal.UserId).OnDelete(DeleteBehavior.Cascade);
        meals.HasMany(meal => meal.Entries).WithOne().HasForeignKey(entry => entry.MealId).OnDelete(DeleteBehavior.Cascade);
        meals.Navigation(meal => meal.Entries).UsePropertyAccessMode(PropertyAccessMode.Field);

        var mealEntries = modelBuilder.Entity<MealEntry>();
        mealEntries.ToTable("MealEntries");
        mealEntries.HasKey(entry => entry.Id);
        mealEntries.Property(entry => entry.FoodName).HasMaxLength(120).IsRequired();
        mealEntries.Property(entry => entry.Brand).HasMaxLength(120);
        mealEntries.Property(entry => entry.ServingUnit).HasMaxLength(24).IsRequired();
        mealEntries.Property(entry => entry.ServingSize).HasPrecision(8, 2);
        mealEntries.Property(entry => entry.Servings).HasPrecision(8, 3);
        mealEntries.Property(entry => entry.CaloriesPerServing).HasPrecision(8, 2);
        mealEntries.Property(entry => entry.ProteinGramsPerServing).HasPrecision(8, 2);
        mealEntries.Property(entry => entry.CarbohydrateGramsPerServing).HasPrecision(8, 2);
        mealEntries.Property(entry => entry.FatGramsPerServing).HasPrecision(8, 2);
        mealEntries.HasIndex(entry => entry.MealId);
        mealEntries.HasIndex(entry => entry.FoodId);
        mealEntries.HasOne<Food>().WithMany().HasForeignKey(entry => entry.FoodId).OnDelete(DeleteBehavior.Restrict);

        var weightEntries = modelBuilder.Entity<WeightEntry>();
        weightEntries.ToTable("WeightEntries");
        weightEntries.HasKey(entry => entry.Id);
        weightEntries.Property(entry => entry.WeightPounds).HasPrecision(6, 2);
        weightEntries.Property(entry => entry.Note).HasMaxLength(240);
        weightEntries.HasIndex(entry => new { entry.UserId, entry.Date }).IsUnique();
        weightEntries.HasOne<User>().WithMany().HasForeignKey(entry => entry.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
