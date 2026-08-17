var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapHealthChecks("/health");

app.MapGet("/", () => Results.Ok(new
{
    name = "NutriFlow API",
    status = "running",
    version = "0.1.0"
}));

app.Run();

public partial class Program;
