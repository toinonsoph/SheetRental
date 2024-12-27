using DotNetBackend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://localhost:5200");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSingleton(provider =>
{
    var apiKey = builder.Configuration["SendGrid:ApiKey"];
    if (string.IsNullOrEmpty(apiKey))
    {
        throw new ArgumentNullException(nameof(apiKey), "SendGrid API key is not configured.");
    }
    return new SendGridEmailService(apiKey);
});

// Add CORS for Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("AllowAngularApp");

// app.UseHttpsRedirection();

app.MapControllers();

app.Run();