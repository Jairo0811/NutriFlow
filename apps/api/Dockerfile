FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY apps/api/src/NutriFlow.Domain/NutriFlow.Domain.csproj apps/api/src/NutriFlow.Domain/
COPY apps/api/src/NutriFlow.Application/NutriFlow.Application.csproj apps/api/src/NutriFlow.Application/
COPY apps/api/src/NutriFlow.Infrastructure/NutriFlow.Infrastructure.csproj apps/api/src/NutriFlow.Infrastructure/
COPY apps/api/src/NutriFlow.Api/NutriFlow.Api.csproj apps/api/src/NutriFlow.Api/
RUN dotnet restore apps/api/src/NutriFlow.Api/NutriFlow.Api.csproj

COPY apps/api/src apps/api/src
RUN dotnet publish apps/api/src/NutriFlow.Api/NutriFlow.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "NutriFlow.Api.dll"]
