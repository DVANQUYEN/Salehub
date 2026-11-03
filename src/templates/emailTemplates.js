const baseTemplate = (title, bodyHtml) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px 24px; color: #334155; font-size: 16px; line-height: 1.6; }
    .content p { margin: 0 0 16px 0; }
    .highlight { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .highlight p { margin: 0 0 6px 0; }
    .btn { display: inline-block; margin: 16px 0; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .footer { padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; background-color: #f8fafc; }
    @media only screen and (max-width: 600px) {
      .content, .header, .footer { padding: 24px 16px; }
      .header h1 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 24px 0;">
        <div class="wrapper">
          <div class="header">
            <h1>SalesHub</h1>
          </div>
          <div class="content">
            ${bodyHtml}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SalesHub. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCurrency(value) {
  const amount = typeof value === 'object' && value !== null ? Number(value) : Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function welcomeTemplate(userName) {
  const title = 'Welcome to SalesHub';
  const body = `
    <p>Hi ${escapeHtml(userName) || 'there'},</p>
    <p>Welcome to <strong>SalesHub</strong>! Your account has been successfully created and you are ready to start managing your sales pipeline.</p>
    <div class="highlight">
      <p><strong>What's next?</strong></p>
      <p>Log in to explore your dashboard, track deals, manage customers, and send quotes with ease.</p>
    </div>
    <a href="${escapeHtml(process.env.APP_URL || 'https://saleshub.example.com')}" class="btn">Go to Dashboard</a>
    <p>If you have any questions, feel free to reach out to our support team.</p>
  `;
  return baseTemplate(title, body);
}

function dealAssignedTemplate(userName, dealTitle, customerName, dealValue, dealUrl) {
  const title = 'New Deal Assigned';
  const body = `
    <p>Hi ${escapeHtml(userName) || 'there'},</p>
    <p>A new deal has been assigned to you in SalesHub.</p>
    <div class="highlight">
      <p><strong>Deal:</strong> ${escapeHtml(dealTitle)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(customerName) || 'N/A'}</p>
      <p><strong>Value:</strong> ${escapeHtml(formatCurrency(dealValue))}</p>
    </div>
    <a href="${escapeHtml(dealUrl || process.env.APP_URL || 'https://saleshub.example.com')}" class="btn">View Deal</a>
    <p>Good luck closing this opportunity!</p>
  `;
  return baseTemplate(title, body);
}

function quoteTemplate(customerName, quoteNumber, totalAmount, validUntil, quoteUrl) {
  const title = 'New Quote from SalesHub';
  const formattedValidUntil = validUntil ? new Date(validUntil).toLocaleDateString('en-US') : 'N/A';
  const body = `
    <p>Dear ${escapeHtml(customerName) || 'Valued Customer'},</p>
    <p>Thank you for your interest. We have prepared a new quote for your review.</p>
    <div class="highlight">
      <p><strong>Quote Number:</strong> ${escapeHtml(quoteNumber) || 'N/A'}</p>
      <p><strong>Total Amount:</strong> ${escapeHtml(formatCurrency(totalAmount))}</p>
      <p><strong>Valid Until:</strong> ${escapeHtml(formattedValidUntil)}</p>
    </div>
    <a href="${escapeHtml(quoteUrl || process.env.APP_URL || 'https://saleshub.example.com')}" class="btn">View Quote</a>
    <p>If you have any questions, please contact your sales representative.</p>
  `;
  return baseTemplate(title, body);
}

function dealStageChangeTemplate(userName, dealTitle, oldStage, newStage, dealUrl) {
  const title = 'Deal Stage Updated';
  const body = `
    <p>Hi ${escapeHtml(userName) || 'there'},</p>
    <p>The stage of one of your deals has been updated.</p>
    <div class="highlight">
      <p><strong>Deal:</strong> ${escapeHtml(dealTitle)}</p>
      <p><strong>Previous Stage:</strong> ${escapeHtml(oldStage)}</p>
      <p><strong>New Stage:</strong> ${escapeHtml(newStage)}</p>
    </div>
    <a href="${escapeHtml(dealUrl || process.env.APP_URL || 'https://saleshub.example.com')}" class="btn">View Deal</a>
  `;
  return baseTemplate(title, body);
}

function passwordResetTemplate(userName, resetLink) {
  const title = 'Password Reset Request';
  const body = `
    <p>Hi ${escapeHtml(userName) || 'there'},</p>
    <p>We received a request to reset your SalesHub password. Click the button below to set a new password.</p>
    <a href="${escapeHtml(resetLink)}" class="btn">Reset Password</a>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>If you did not request a password reset, please ignore this email or contact support.</p>
  `;
  return baseTemplate(title, body);
}

module.exports = {
  welcomeTemplate,
  dealAssignedTemplate,
  quoteTemplate,
  dealStageChangeTemplate,
  passwordResetTemplate,
};
