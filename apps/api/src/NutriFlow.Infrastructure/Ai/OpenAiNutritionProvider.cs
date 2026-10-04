using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Configuration;
using NutriFlow.Application.Ai;

namespace NutriFlow.Infrastructure.Ai;

public sealed class OpenAiNutritionProvider : INutritionAiProvider
{
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(45) };
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly string _apiKey;
    private readonly string _model;
    private readonly string _baseUrl;

    public OpenAiNutritionProvider(IConfiguration configuration)
    {
        var section = configuration.GetSection("OpenAI");
        _apiKey = section["ApiKey"]?.Trim() ?? string.Empty;
        _model = section["Model"]?.Trim() ?? "gpt-5.4";
        _baseUrl = (section["BaseUrl"]?.Trim() ?? "https://api.openai.com/v1").TrimEnd('/');
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_apiKey) && !string.IsNullOrWhiteSpace(_model);
    public string ProviderName => "openai-responses";

    public async Task<string> AskCoachAsync(
        string message,
        AiNutritionContext context,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();
        var payload = new JsonObject
        {
            ["model"] = _model,
            ["store"] = false,
            ["max_output_tokens"] = 500,
            ["instructions"] = CoachInstructions,
            ["input"] = $"User question: {message}\n\nNutriFlow context:\n{ContextText(context)}"
        };

        var root = await SendResponsesAsync(payload, cancellationToken);
        var text = ExtractOutputText(root);
        if (string.IsNullOrWhiteSpace(text))
            throw new InvalidOperationException("The AI provider returned an empty coach response.");
        return text.Trim();
    }

    public async Task<IReadOnlyList<AiDetectedFood>> AnalyzeMealPhotoAsync(
        string imageDataUrl,
        AiNutritionContext context,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();
        var input = new JsonArray
        {
            new JsonObject
            {
                ["role"] = "user",
                ["content"] = new JsonArray
                {
                    new JsonObject
                    {
                        ["type"] = "input_text",
                        ["text"] = $"Identify the foods visible in this meal and estimate servings. Do not invent invisible ingredients. Context: {ContextText(context)}"
                    },
                    new JsonObject
                    {
                        ["type"] = "input_image",
                        ["image_url"] = imageDataUrl,
                        ["detail"] = "auto"
                    }
                }
            }
        };

        return await DetectFoodsAsync(input, cancellationToken);
    }

    public async Task<IReadOnlyList<AiDetectedFood>> ParseVoiceTranscriptAsync(
        string transcript,
        AiNutritionContext context,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();
        var input = new JsonArray
        {
            new JsonObject
            {
                ["role"] = "user",
                ["content"] = new JsonArray
                {
                    new JsonObject
                    {
                        ["type"] = "input_text",
                        ["text"] = $"Convert this spoken meal log into foods and estimated servings. Transcript: {transcript}\nContext: {ContextText(context)}"
                    }
                }
            }
        };

        return await DetectFoodsAsync(input, cancellationToken);
    }

    private async Task<IReadOnlyList<AiDetectedFood>> DetectFoodsAsync(JsonArray input, CancellationToken cancellationToken)
    {
        var payload = new JsonObject
        {
            ["model"] = _model,
            ["store"] = false,
            ["max_output_tokens"] = 500,
            ["instructions"] = DetectionInstructions,
            ["input"] = input,
            ["text"] = new JsonObject
            {
                ["format"] = BuildDetectionFormat()
            }
        };

        var root = await SendResponsesAsync(payload, cancellationToken);
        var text = ExtractOutputText(root);
        if (string.IsNullOrWhiteSpace(text)) return [];

        var envelope = JsonSerializer.Deserialize<DetectedFoodEnvelope>(text, JsonOptions);
        if (envelope?.Items is null) return [];

        return envelope.Items
            .Where(item => !string.IsNullOrWhiteSpace(item.Name))
            .Take(12)
            .Select(item => new AiDetectedFood(item.Name.Trim(), item.Servings, item.Confidence))
            .ToArray();
    }

    private async Task<JsonDocument> SendResponsesAsync(JsonObject payload, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/responses")
        {
            Content = JsonContent.Create(payload)
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        using var response = await Http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"The AI provider request failed with HTTP {(int)response.StatusCode}.");

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
    }

    private static string ExtractOutputText(JsonDocument document)
    {
        if (!document.RootElement.TryGetProperty("output", out var output) || output.ValueKind != JsonValueKind.Array)
            return string.Empty;

        foreach (var item in output.EnumerateArray())
        {
            if (!item.TryGetProperty("content", out var content) || content.ValueKind != JsonValueKind.Array) continue;
            foreach (var part in content.EnumerateArray())
            {
                if (part.TryGetProperty("type", out var type) && type.GetString() == "output_text" &&
                    part.TryGetProperty("text", out var text))
                    return text.GetString() ?? string.Empty;
            }
        }

        return string.Empty;
    }

    private static JsonObject BuildDetectionFormat()
        => new()
        {
            ["type"] = "json_schema",
            ["name"] = "nutriflow_detected_foods",
            ["strict"] = true,
            ["schema"] = new JsonObject
            {
                ["type"] = "object",
                ["additionalProperties"] = false,
                ["properties"] = new JsonObject
                {
                    ["items"] = new JsonObject
                    {
                        ["type"] = "array",
                        ["maxItems"] = 12,
                        ["items"] = new JsonObject
                        {
                            ["type"] = "object",
                            ["additionalProperties"] = false,
                            ["properties"] = new JsonObject
                            {
                                ["name"] = new JsonObject { ["type"] = "string" },
                                ["servings"] = new JsonObject { ["type"] = "number", ["minimum"] = 0.1, ["maximum"] = 20 },
                                ["confidence"] = new JsonObject { ["type"] = "number", ["minimum"] = 0, ["maximum"] = 1 }
                            },
                            ["required"] = new JsonArray("name", "servings", "confidence")
                        }
                    }
                },
                ["required"] = new JsonArray("items")
            }
        };

    private static string ContextText(AiNutritionContext context)
    {
        var restrictions = context.DietaryRestrictions.Count == 0 ? "none recorded" : string.Join(", ", context.DietaryRestrictions);
        var preferences = context.FoodPreferences.Count == 0 ? "none recorded" : string.Join(", ", context.FoodPreferences);
        return $"date={context.Date:yyyy-MM-dd}; consumed={context.ConsumedCalories:0.#} kcal, P {context.ConsumedProteinGrams:0.#} g, C {context.ConsumedCarbohydrateGrams:0.#} g, F {context.ConsumedFatGrams:0.#} g; targets={context.TargetCalories?.ToString("0.#") ?? "unknown"} kcal, P {context.TargetProteinGrams?.ToString("0.#") ?? "unknown"} g, C {context.TargetCarbohydrateGrams?.ToString("0.#") ?? "unknown"} g, F {context.TargetFatGrams?.ToString("0.#") ?? "unknown"} g; restrictions={restrictions}; preferences={preferences}.";
    }

    private void EnsureConfigured()
    {
        if (!IsConfigured) throw new InvalidOperationException("OpenAI configuration is incomplete.");
    }

    private sealed record DetectedFoodEnvelope(IReadOnlyList<DetectedFoodItem> Items);
    private sealed record DetectedFoodItem(string Name, decimal Servings, decimal Confidence);

    private const string CoachInstructions = """
You are NutriFlow AI Coach, a general nutrition and habit assistant. Use only the supplied NutriFlow context when personalizing. Never diagnose, treat, prescribe, or replace a physician or registered dietitian. For medical conditions, pregnancy, eating disorders, severe symptoms, medication interactions, or disease-specific diet questions, recommend qualified clinical care. Never recommend a food that conflicts with the supplied dietary restrictions. Clearly label calorie, portion, and nutrition estimates as estimates. Keep the answer practical, concise, supportive, and in the same language as the user's question.
""";

    private const string DetectionInstructions = """
You convert meal images or spoken meal descriptions into a short structured list of foods and estimated serving counts. Return only foods that are reasonably supported by the input. Do not infer hidden ingredients. Serving counts are estimates that the user must confirm before logging. Dietary restrictions are context for caution, not permission to alter or hide detected foods.
""";
}
