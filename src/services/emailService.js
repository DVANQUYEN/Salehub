const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const {
  welcomeTemplate,
  dealAssignedTemplate,
  quoteTemplate,
  dealStageChangeTemplate,
  passwordResetTemplate,
} = require('../templates/emailTemplates');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  NODE_ENV,
} = process.env;

let transporter = null;
let etherealAccount = null;

/**
 * Create and cache a Nodemailer transporter.
 * Uses real SMTP when configured; otherwise falls back to Ethereal in non-production,
 * or a console logger in production if no SMTP config exists.
 */
async function createTransporter() {
  if (transporter) return transporter;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    try {
      await transporter.verify();
      logger.info(`Email transporter configured for ${SMTP_HOST}`);
    } catch (error) {
      logger.error(`SMTP verification failed: ${error.message}`);
      transporter = null;
      throw error;
    }

    return transporter;
  }

  if (NODE_ENV !== 'production') {
    etherealAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass,
      },
    });
    logger.info(`Email transporter using Ethereal (${etherealAccount.user})`);
    return transporter;
  }

  logger.warn('No SMTP config provided. Emails will be logged to console.');
  return null;
}

/**
 * Send an email. Logs to console as a fallback if no transporter is available.
 */
async function sendEmail({ to, subject, html, text }) {
  if (!to) {
    logger.warn('sendEmail called without recipient; skipping.');
    return { skipped: true };
  }

  try {
    const mailer = await createTransporter();
    const from = EMAIL_FROM || 'SalesHub <noreply@saleshub.com>';

    if (!mailer) {
      logger.info(`[EMAIL] To: ${to} | Subject: ${subject}`);
      return { skipped: true, logged: true };
    }

    const info = await mailer.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);

    if (etherealAccount) {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function sendWelcomeEmail(user) {
  if (!user || !user.email) return { skipped: true };
  const html = welcomeTemplate(user.fullName);
  return sendEmail({
    to: user.email,
    subject: 'Welcome to SalesHub',
    html,
    text: `Hi ${user.fullName || 'there'}, welcome to SalesHub! Your account has been created successfully.`,
  });
}

async function sendDealAssignedEmail(deal, salesRep) {
  if (!salesRep || !salesRep.email) return { skipped: true };
  const html = dealAssignedTemplate(
    salesRep.fullName,
    deal.title,
    deal.customer?.companyName || deal.customerName,
    deal.value,
    `${process.env.APP_URL}/deals/${deal.id}`
  );
  return sendEmail({
    to: salesRep.email,
    subject: `New deal assigned: ${deal.title}`,
    html,
    text: `You have been assigned a new deal: ${deal.title}. Value: ${deal.value}`,
  });
}

async function sendQuoteEmail(quote, customer) {
  const recipient = customer?.email;
  if (!recipient) return { skipped: true };
  const html = quoteTemplate(
    customer.contactName || customer.companyName,
    quote.quoteNumber,
    quote.totalAmount,
    quote.validUntil,
    `${process.env.APP_URL}/quotes/${quote.id}`
  );
  return sendEmail({
    to: recipient,
    subject: `Quote ${quote.quoteNumber || ''} from SalesHub`,
    html,
    text: `Please find your quote attached. Total: ${quote.totalAmount}`,
  });
}

async function sendDealStageChangeEmail(deal, oldStage, newStage) {
  const recipient = deal.salesRep?.email;
  if (!recipient) return { skipped: true };
  const html = dealStageChangeTemplate(
    deal.salesRep.fullName,
    deal.title,
    oldStage,
    newStage,
    `${process.env.APP_URL}/deals/${deal.id}`
  );
  return sendEmail({
    to: recipient,
    subject: `Deal stage updated: ${deal.title}`,
    html,
    text: `Deal "${deal.title}" moved from ${oldStage} to ${newStage}.`,
  });
}

async function sendPasswordResetEmail(user, resetToken) {
  if (!user || !user.email) return { skipped: true };
  const resetLink = `${process.env.APP_URL || 'https://saleshub.example.com'}/reset-password?token=${resetToken}`;
  const html = passwordResetTemplate(user.fullName, resetLink);
  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html,
    text: `Reset your password here: ${resetLink}. This link expires in 1 hour.`,
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendDealAssignedEmail,
  sendQuoteEmail,
  sendDealStageChangeEmail,
  sendPasswordResetEmail,
};
