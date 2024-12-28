using DotNetBackend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://localhost:5200");

// Add services to the container.
builder.Services.AddControllers();

// Add SendGridEmailService with environment variable
builder.Services.AddSingleton(provider =>
{
    // First try to load the API key from the environment variable
    var apiKey = Environment.GetEnvironmentVariable("SENDGRID_API_KEY");

    // If it's not in the environment variable, try to load it from appsettings.json
    if (string.IsNullOrEmpty(apiKey))
    {
        apiKey = builder.Configuration["SendGrid:ApiKey"];
    }

    // Throw an exception if the key is missing
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
