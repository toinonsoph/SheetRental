using DotNetBackend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace DotNetBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailController : ControllerBase
    {
        private readonly SendGridEmailService _emailService;

        public EmailController(SendGridEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendEmail([FromBody] EmailRequest request)
        {
            if (string.IsNullOrEmpty(request.To) || string.IsNullOrEmpty(request.Subject) || string.IsNullOrEmpty(request.Body))
            {
                return BadRequest("Invalid email request");
            }

            var result = await _emailService.SendEmailAsync(request.To, request.Subject, request.Body, request.HtmlBody);

            if (result)
                return Ok("Email sent successfully!");
            else
                return StatusCode(500, "Failed to send email.");
        }

        [HttpPost("send-template")]
        public async Task<IActionResult> SendEmailWithTemplate([FromBody] TemplateEmailRequest request)
        {

            if (string.IsNullOrEmpty(request.To) || string.IsNullOrEmpty(request.TemplateId))
            {
                return BadRequest("Invalid template email request");
            }

            var result = await _emailService.SendEmailWithTemplateAsync(request.To, request.TemplateId, request.DynamicData ?? new Dictionary<string, string>());

            if (result)
                return Ok("Template email sent successfully!");
            else
                return StatusCode(500, "Failed to send template email.");
        }

        [HttpPost("send-template-no-data")]
        public async Task<IActionResult> SendEmailWithTemplateWithoutDynamicData([FromBody] TemplateEmailNoDataRequest request)
        {
            if (string.IsNullOrEmpty(request.To) || string.IsNullOrEmpty(request.TemplateId))
            {
                return BadRequest("Invalid template email request");
            }

            var result = await _emailService.SendEmailWithTemplateAsync(request.To, request.TemplateId, new Dictionary<string, string>());

            if (result)
                return Ok("Template email sent successfully without dynamic data!");
            else
                return StatusCode(500, "Failed to send template email without dynamic data.");
        }
    }

    public class EmailRequest
    {
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? HtmlBody { get; set; }
    }

    public class TemplateEmailRequest
    {
        public string To { get; set; } = string.Empty;
        public string TemplateId { get; set; } = string.Empty;
        public Dictionary<string, string>? DynamicData { get; set; }
    }

    public class TemplateEmailNoDataRequest
    {
        public string To { get; set; } = string.Empty;
        public string TemplateId { get; set; } = string.Empty;
    }
}