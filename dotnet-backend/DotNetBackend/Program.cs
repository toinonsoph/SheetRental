using DotNetBackend.Services;

var builder = WebApplication.CreateBuilder(args);

// Use the port from the environment variable "PORT" or default to 5200
var port = Environment.GetEnvironmentVariable("PORT") ?? "5200";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Add services to the container.
builder.Services.AddControllers();

// Add SendGridEmailService with environment variable
builder.Services.AddSingleton(provider =>
{
    var apiKey = Environment.GetEnvironmentVariable("SENDGRID_API_KEY");

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

// Uncomment HTTPS redirection if you use HTTPS
// app.UseHttpsRedirection();

app.MapControllers();

app.Run();