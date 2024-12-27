using SendGrid;
using SendGrid.Helpers.Mail;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DotNetBackend.Services
{
    public class SendGridEmailService
    {
        private readonly string _apiKey;
        private readonly EmailAddress _fromAddress;

        public SendGridEmailService(string apiKey)
        {
            _apiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey), "SendGrid API key is not configured.");
            _fromAddress = new EmailAddress("tnsn@axi.be", "Cambre Services");
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string plainTextContent, string? htmlContent = null)
        {
            var client = new SendGridClient(_apiKey);
            var to = new EmailAddress(toEmail);

            var msg = MailHelper.CreateSingleEmail(_fromAddress, to, subject, plainTextContent, htmlContent);

            var response = await client.SendEmailAsync(msg);

            return response.StatusCode == System.Net.HttpStatusCode.Accepted;
        }

        public async Task<bool> SendEmailWithTemplateAsync(string toEmail, string templateId, Dictionary<string, string> dynamicData)
        {
            var client = new SendGridClient(_apiKey);
            var to = new EmailAddress(toEmail);

            var msg = new SendGridMessage
            {
                From = _fromAddress,
                TemplateId = templateId,
                Personalizations = new List<Personalization>
                {
                    new Personalization
                    {
                        Tos = new List<EmailAddress> { to }
                    }
                }
            };

            // Set the dynamic template data on the SendGridMessage itself
            msg.SetTemplateData(dynamicData);

            var response = await client.SendEmailAsync(msg);

            return response.StatusCode == System.Net.HttpStatusCode.Accepted;
        }

        public async Task<bool> SendEmailWithTemplateWithoutDynamicDataAsync(string toEmail, string templateId)
        {
            var client = new SendGridClient(_apiKey);
            var to = new EmailAddress(toEmail);

            var msg = new SendGridMessage
            {
                From = _fromAddress,
                TemplateId = templateId,
                Personalizations = new List<Personalization>
                {
                    new Personalization
                    {
                        Tos = new List<EmailAddress> { to }
                    }
                }
            };

            var response = await client.SendEmailAsync(msg);

            return response.StatusCode == System.Net.HttpStatusCode.Accepted;
        }
    }
}