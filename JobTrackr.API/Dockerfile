# Build aþamasý
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Proje dosyalarýný kopyala
COPY ["JobTrackr.API/JobTrackr.API.csproj", "JobTrackr.API/"]
COPY ["JobTrackr.Application/JobTrackr.Application.csproj", "JobTrackr.Application/"]
COPY ["JobTrackr.Domain/JobTrackr.Domain.csproj", "JobTrackr.Domain/"]
COPY ["JobTrackr.Infrastructure/JobTrackr.Infrastructure.csproj", "JobTrackr.Infrastructure/"]

# Restore
RUN dotnet restore "JobTrackr.API/JobTrackr.API.csproj"

# Tüm dosyalarý kopyala ve build et
COPY . .
WORKDIR "/src/JobTrackr.API"
RUN dotnet build "JobTrackr.API.csproj" -c Release -o /app/build

# Publish aþamasý
FROM build AS publish
RUN dotnet publish "JobTrackr.API.csproj" -c Release -o /app/publish

# Runtime aþamasý
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "JobTrackr.API.dll"]