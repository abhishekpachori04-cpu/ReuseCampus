import nodemailer from 'nodemailer';

/**
 * Sends a 6-digit OTP to the student's registered college email address.
 * Falls back to formatted console output in local development when SMTP credentials are not configured.
 *
 * @param {string} recipientEmail - Recipient student email (@rjit.ac.in)
 * @param {string} otp - 6-digit one-time password
 * @returns {Promise<{ success: boolean, devFallback?: boolean }>}
 */
export const sendEmailOtp = async (recipientEmail, otp) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Local development fallback if SMTP credentials are not configured
  if (!smtpUser || !smtpPass) {
    console.info(`
┌─────────────────────────────────────────────────────────────┐
│                [DEV EMAIL OTP FALLBACK]                     │
├─────────────────────────────────────────────────────────────┤
│ Recipient : ${recipientEmail.padEnd(46, ' ')}│
│ 6-Digit OTP : ${otp}                                      │
│ Validity  : 10 Minutes                                      │
│ Note      : Configure SMTP_USER and SMTP_PASS for live SMTP │
└─────────────────────────────────────────────────────────────┘
`);
    return { success: true, devFallback: true };
  }

  // Create nodemailer transporter with configured SMTP settings
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: `"ReuseCampus Security" <${smtpUser}>`,
    to: recipientEmail,
    subject: `Your ReuseCampus Password Reset Code: ${otp}`,
    text: `Your 6-digit password reset verification code for ReuseCampus (RJIT Tekanpur) is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request a password reset, please ignore this email.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP - ReuseCampus</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Reuse<span style="color: #a7f3d0;">Campus</span></h1>
                    <p style="margin: 6px 0 0 0; color: #d1fae5; font-size: 13px; font-weight: 500;">Official RJIT Tekanpur Marketplace</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px; text-align: left;">
                    <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 700;">Password Reset Request</h2>
                    <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                      We received a request to reset the password for your campus marketplace account (<strong>${recipientEmail}</strong>). Use the one-time verification code below to proceed:
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background-color: #ecfdf5; border: 2px dashed #10b981; border-radius: 14px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #065f46; display: inline-block;">
                        ${otp}
                      </span>
                      <p style="margin: 10px 0 0 0; color: #047857; font-size: 12px; font-weight: 600;">
                        ⏱️ Valid for 10 minutes
                      </p>
                    </div>

                    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                      Security note: Never share this code with anyone. ReuseCampus staff will never ask for your verification code or password.
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                      If you did not initiate this request, you can safely disregard this email. Your password will remain unchanged.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                    <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                      © ${new Date().getFullYear()} ReuseCampus · RJIT Tekanpur, Gwalior (M.P.)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true, devFallback: false };
};

export default sendEmailOtp;
