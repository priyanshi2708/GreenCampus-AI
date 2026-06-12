import nodemailer from 'nodemailer';

/**
 * Creates a transporter from environment variables.
 * Supports Gmail, Outlook/Office 365, or any SMTP provider.
 * Falls back to Ethereal (fake SMTP for dev/testing) if no config found.
 */
async function createTransporter() {
  // Production SMTP (e.g. Gmail with App Password, SendGrid, Mailgun…)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Gmail shortcut: set GMAIL_USER + GMAIL_APP_PASSWORD
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Dev fallback: Ethereal fake SMTP (prints a preview URL to console)
  const testAccount = await nodemailer.createTestAccount();
  console.warn('⚠️  No SMTP env vars found. Using Ethereal test account for email preview.');
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

/**
 * Sends a report notification email to all listed recipients.
 * @param {object} report - Mongoose report document
 * @param {string[]} recipients - array of email addresses
 */
export async function sendReportEmail(report, recipients) {
  if (!recipients || recipients.length === 0) return;

  try {
    const transporter = await createTransporter();

    const findingsHtml = report.findings
      .map((f) => `<li style="margin-bottom:8px;color:#ccc;">${f}</li>`)
      .join('');
    const recsHtml = report.recommendations
      .map((r) => `<li style="margin-bottom:8px;color:#ccc;">▶ ${r}</li>`)
      .join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#050816;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;">
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#050816 0%,#0a0f2b 100%);padding:36px 40px 24px;border-bottom:1px solid rgba(0,229,255,0.15);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="background:rgba(0,229,255,0.1);border:1px solid rgba(0,229,255,0.3);border-radius:12px;width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;">
            <span style="color:#00E5FF;font-size:20px;">🌿</span>
          </div>
          <div>
            <div style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">GreenCampus AI</div>
            <div style="color:#00E5FF;font-size:11px;letter-spacing:2px;font-weight:600;text-transform:uppercase;">Sustainability Report</div>
          </div>
        </div>
      </td>
    </tr>

    <!-- Score Banner -->
    <tr>
      <td style="background:rgba(0,229,255,0.05);border-bottom:1px solid rgba(0,229,255,0.1);padding:20px 40px;">
        <table width="100%">
          <tr>
            <td>
              <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">New Report Available</div>
              <div style="color:#fff;font-size:20px;font-weight:800;">${report.title}</div>
              <div style="color:#888;font-size:12px;margin-top:4px;">Period: ${report.period} &nbsp;·&nbsp; Generated: ${new Date(report.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </td>
            <td align="right" style="min-width:80px;">
              <div style="background:rgba(0,229,255,0.1);border:2px solid #00E5FF;border-radius:50%;width:72px;height:72px;display:inline-flex;align-items:center;justify-content:center;flex-direction:column;">
                <span style="color:#fff;font-size:22px;font-weight:900;line-height:1;">${report.sustainabilityScore}%</span>
                <span style="color:#00E5FF;font-size:8px;font-weight:700;letter-spacing:1px;">SCORE</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="background:#080c1a;padding:32px 40px;">

        <!-- Executive Summary -->
        <div style="margin-bottom:28px;">
          <div style="color:#00E5FF;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Executive Summary</div>
          <p style="color:#aaa;font-size:13px;line-height:1.7;margin:0;">${report.summary}</p>
        </div>

        <!-- Key Findings -->
        <div style="margin-bottom:28px;">
          <div style="color:#00E5FF;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Key Findings</div>
          <ul style="margin:0;padding-left:16px;">${findingsHtml}</ul>
        </div>

        <!-- Recommendations -->
        <div style="margin-bottom:28px;">
          <div style="color:#4ADE80;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Recommendations</div>
          <ul style="margin:0;padding-left:0;list-style:none;">${recsHtml}</ul>
        </div>

        <!-- Savings -->
        <div style="background:rgba(74,222,128,0.05);border:1px solid rgba(74,222,128,0.2);border-radius:12px;padding:16px 20px;">
          <div style="color:#4ADE80;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Estimated Savings</div>
          <div style="color:#fff;font-size:14px;font-weight:600;">${report.savings}</div>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#050816;padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
        <div style="color:#444;font-size:11px;">GreenCampus AI · Auto-generated Sustainability Report · Confidential</div>
        <div style="color:#333;font-size:10px;margin-top:4px;">You received this because you are listed as a campus sustainability administrator.</div>
      </td>
    </tr>
  </table>

</body>
</html>`;

    const info = await transporter.sendMail({
      from: `"GreenCampus AI" <${process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@greencampus.ai'}>`,
      to: recipients.join(', '),
      subject: `📊 ${report.title} — GreenCampus AI`,
      html,
    });

    // In dev with Ethereal, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Email preview (Ethereal): ${previewUrl}`);
    } else {
      console.log(`📧 Report email sent to: ${recipients.join(', ')} (Message ID: ${info.messageId})`);
    }

    return info;
  } catch (err) {
    // Never crash the report generation if email fails — just warn
    console.error('❌ Email delivery failed:', err.message);
  }
}

/**
 * Sends a password reset email to a user with a secure link.
 * @param {object} user - User mongoose document
 * @param {string} resetUrl - Password reset URL
 */
export async function sendResetPasswordEmail(user, resetUrl) {
  try {
    const transporter = await createTransporter();

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#050816;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;">
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#050816 0%,#0a0f2b 100%);padding:36px 40px 24px;border-bottom:1px solid rgba(0,229,255,0.15);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="background:rgba(0,229,255,0.1);border:1px solid rgba(0,229,255,0.3);border-radius:12px;width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;">
            <span style="color:#00E5FF;font-size:20px;">🌿</span>
          </div>
          <div>
            <div style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">GreenCampus AI</div>
            <div style="color:#00E5FF;font-size:11px;letter-spacing:2px;font-weight:600;text-transform:uppercase;">Security Center</div>
          </div>
        </div>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="background:#080c1a;padding:32px 40px;">
        <div style="margin-bottom:24px;">
          <h2 style="color:#fff;font-size:20px;font-weight:800;margin-bottom:8px;">Reset Your Password</h2>
          <p style="color:#aaa;font-size:13px;line-height:1.7;margin:0;">
            Hello ${user.adminName || 'there'}, we received a request to reset your password for GreenCampus AI. Click the button below to choose a new password. This link is valid for 1 hour.
          </p>
        </div>

        <div style="margin-bottom:32px;text-align:center;">
          <a href="${resetUrl}" style="display:inline-block;background:#00E5FF;color:#050816;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:12px;box-shadow:0 0 20px rgba(0,229,255,0.3);">
            Reset Password
          </a>
        </div>

        <div style="color:#555;font-size:11px;line-height:1.5;margin-bottom:12px;">
          If the button above does not work, copy and paste the following URL into your browser:
          <br/>
          <a href="${resetUrl}" style="color:#00E5FF;text-decoration:underline;">${resetUrl}</a>
        </div>

        <div style="color:#555;font-size:11px;">
          If you did not request a password reset, you can safely ignore this email.
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#050816;padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
        <div style="color:#444;font-size:11px;">GreenCampus AI · Security Notification</div>
      </td>
    </tr>
  </table>

</body>
</html>`;

    const info = await transporter.sendMail({
      from: `"GreenCampus AI" <${process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@greencampus.ai'}>`,
      to: user.email,
      subject: `🔒 Reset Your Password — GreenCampus AI`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Password Reset Email preview (Ethereal): ${previewUrl}`);
      return { success: true, previewUrl };
    } else {
      console.log(`📧 Password Reset email sent to: ${user.email}`);
      return { success: true };
    }
  } catch (err) {
    console.error('❌ Password reset email delivery failed:', err.message);
    throw err;
  }
}
