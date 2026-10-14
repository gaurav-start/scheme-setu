import nodemailer from 'nodemailer';

/**
 * Create Nodemailer SMTP Transporter
 * For Gmail accounts, uses Nodemailer's built-in 'gmail' service driver for instant & reliable dispatch.
 */
const createTransporter = () => {
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim().replace(/^["']|["']$/g, '');
  const pass = (process.env.EMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').trim().replace(/^["']|["']$/g, '');
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT) || 587;

  // Use Nodemailer's built-in Gmail service driver for Gmail accounts
  if (host.includes('gmail.com') || user.endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  // Standard SMTP configuration for non-Gmail hosts
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Singleton transporter instance
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Send transactional email via Nodemailer Gmail / SMTP
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  // Mock mode for automated unit test execution
  if (process.env.NODE_ENV === 'test') {
    return {
      messageId: `test-mock-${Date.now()}`,
      response: '250 OK (test-mode-mock)',
      envelope: {
        from: (process.env.EMAIL_USER || process.env.SMTP_USER || 'test@example.com').trim(),
        to: [to],
      },
    };
  }

  const senderUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim().replace(/^["']|["']$/g, '');
  const senderName = (process.env.EMAIL_FROM_NAME || 'Scheme Setu').trim().replace(/^["']|["']$/g, '');

  const mailOptions = {
    from: `"${senderName}" <${senderUser}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>?/gm, ''),
    priority: 'high',
    headers: {
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High',
      'Importance': 'high',
    },
  };

  try {
    const transport = getTransporter();
    const info = await transport.sendMail(mailOptions);
    console.log(`[Mailer] Email dispatched successfully to ${to} (Message ID: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`[Mailer] Transport failed (${err.message}). Re-initializing transport...`);
    transporter = createTransporter();
    const retryInfo = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Email dispatched successfully on retry to ${to} (Message ID: ${retryInfo.messageId})`);
    return retryInfo;
  }
};
