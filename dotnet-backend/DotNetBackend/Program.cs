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
    {
        policy.WithOrigins(
            "http://localhost:4200", 
            "https://toinonsoph.github.io",
            "https://lakensdehaan.be"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

// // Add middleware to handle OPTIONS preflight requests
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type, Authorization");
        context.Response.StatusCode = 204;
        return;
    }
    await next();
});


// Enable CORS
app.UseCors("AllowAngularApp");

// Uncomment HTTPS redirection if you use HTTPS
// app.UseHttpsRedirection();

app.MapControllers();

app.Run();