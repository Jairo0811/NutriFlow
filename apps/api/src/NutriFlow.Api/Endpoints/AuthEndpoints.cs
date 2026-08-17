using System.Security.Claims;
using Microsoft.AspNetCore.RateLimiting;
using NutriFlow.Application.Abstractions;
using NutriFlow.Application.Identity;

namespace NutriFlow.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/auth")
            .WithTags("Authentication")
            .RequireRateLimiting("auth");

        group.MapPost("/register", RegisterAsync);
        group.MapPost("/login", LoginAsync);
        group.MapPost("/refresh", RefreshAsync);
        group.MapPost("/logout", LogoutAsync);
        group.MapPost("/forgot-password", ForgotPasswordAsync);
        group.MapPost("/reset-password", ResetPasswordAsync);
        group.MapPost("/google", GoogleSignInAsync);
        group.MapGet("/me", Me).RequireAuthorization();

        return endpoints;
    }

    private static async Task<IResult> RegisterAsync(RegisterRequest request, IAuthService authService, CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(new RegisterCommand(request.Email, request.DisplayName, request.Password), cancellationToken);
        return ToAuthResponse(result, StatusCodes.Status201Created);
    }

    private static async Task<IResult> LoginAsync(LoginRequest request, IAuthService authService, CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(new LoginCommand(request.Email, request.Password), cancellationToken);
        return ToAuthResponse(result, StatusCodes.Status200OK);
    }

    private static async Task<IResult> RefreshAsync(RefreshRequest request, IAuthService authService, CancellationToken cancellationToken)
    {
        var result = await authService.RefreshAsync(new RefreshSessionCommand(request.RefreshToken), cancellationToken);
        return ToAuthResponse(result, StatusCodes.Status200OK);
    }

    private static async Task<IResult> LogoutAsync(RefreshRequest request, IAuthService authService, CancellationToken cancellationToken)
    {
        await authService.LogoutAsync(new LogoutCommand(request.RefreshToken), cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> ForgotPasswordAsync(ForgotPasswordRequest request, IAuthService authService, IHostEnvironment environment, CancellationToken cancellationToken)
    {
        var result = await authService.ForgotPasswordAsync(new ForgotPasswordCommand(request.Email), cancellationToken);
        return Results.Accepted(value: new
        {
            message = "Si el correo está registrado, se generó una solicitud de recuperación.",
            developmentResetToken = environment.IsDevelopment() ? result.DevelopmentToken : null
        });
    }

    private static async Task<IResult> ResetPasswordAsync(ResetPasswordRequest request, IAuthService authService, CancellationToken cancellationToken)
    {
        var result = await authService.ResetPasswordAsync(new ResetPasswordCommand(request.Token, request.NewPassword), cancellationToken);
        return result.Succeeded ? Results.NoContent() : Problem(result, StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> GoogleSignInAsync(GoogleSignInRequest request, IAuthService authService, CancellationToken cancellationToken)
    {
        var result = await authService.SignInWithGoogleAsync(new GoogleSignInCommand(request.IdToken), cancellationToken);
        return ToAuthResponse(result, StatusCodes.Status200OK);
    }

    private static IResult Me(ClaimsPrincipal principal)
    {
        var subject = principal.FindFirstValue("sub") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(subject, out var userId)
            ? Results.Ok(new
            {
                userId,
                email = principal.FindFirstValue("email") ?? principal.FindFirstValue(ClaimTypes.Email),
                displayName = principal.FindFirstValue("name") ?? principal.FindFirstValue(ClaimTypes.Name)
            })
            : Results.Unauthorized();
    }

    private static IResult ToAuthResponse(AuthResult result, int successStatusCode)
    {
        if (!result.Succeeded || result.Session is null)
        {
            var statusCode = result.ErrorCode switch
            {
                "email_in_use" => StatusCodes.Status409Conflict,
                "invalid_credentials" or "invalid_refresh_token" or "invalid_google_token" => StatusCodes.Status401Unauthorized,
                _ => StatusCodes.Status400BadRequest
            };
            return Problem(result, statusCode);
        }

        return Results.Json(result.Session, statusCode: successStatusCode);
    }

    private static IResult Problem(AuthResult result, int statusCode) => Results.Problem(statusCode: statusCode, title: result.ErrorCode, detail: result.ErrorMessage);
    private static IResult Problem(OperationResult result, int statusCode) => Results.Problem(statusCode: statusCode, title: result.ErrorCode, detail: result.ErrorMessage);

    private sealed record RegisterRequest(string Email, string DisplayName, string Password);
    private sealed record LoginRequest(string Email, string Password);
    private sealed record RefreshRequest(string RefreshToken);
    private sealed record ForgotPasswordRequest(string Email);
    private sealed record ResetPasswordRequest(string Token, string NewPassword);
    private sealed record GoogleSignInRequest(string IdToken);
}
