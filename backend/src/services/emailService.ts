import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface SendActivationEmailParams {
  toEmail: string;
  userName: string;
  activationToken: string;
}

export interface SendActivationEmailResult {
  activationUrl: string;
  etherealUrl: string | null;
  delivered: boolean;
  isConfigured: boolean;
  smtpError?: string;
}

export const isRealSmtpConfigured = (): boolean => {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();

  if (!host || !user || !pass) return false;
  if (user.includes('your_real_gmail') || user.includes('example.com') || user.includes('your_email')) return false;
  if (pass.includes('your_16_character_app_password') || pass.includes('xxxx') || pass.length < 6) return false;

  return true;
};

export const sendActivationEmail = async ({ toEmail, userName, activationToken }: SendActivationEmailParams): Promise<SendActivationEmailResult> => {
  const activationUrl = `http://localhost:5173/verify-email?token=${activationToken}`;
  let delivered = false;
  let etherealUrl: string | null = null;
  let smtpError: string | undefined;

  const configured = isRealSmtpConfigured();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; padding: 36px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .logo { color: #4f46e5; font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 24px; }
        h2 { color: #0f172a; font-size: 20px; margin-bottom: 12px; text-align: center; }
        p { color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
        .btn-container { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3); }
        .url-box { background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; color: #64748b; word-break: break-all; margin-top: 16px; border: 1px solid #e2e8f0; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🎓 DigiNotice <span style="color: #4f46e5;">AI</span></div>
        <h2>Activate Your College Account</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>Thank you for signing up for DigiNotice AI. Please click the button below to verify your email address and activate your campus account:</p>
        
        <div class="btn-container">
          <a href="${activationUrl}" target="_blank" class="btn">Verify Email & Activate Account</a>
        </div>

        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <div class="url-box">${activationUrl}</div>

        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
          Note: This activation link is valid for 24 hours. Your account will only be created and activated after you click this link.
        </p>

        <div class="footer">
          If you did not request this registration, you can safely ignore this email.<br/>
          &copy; ${new Date().getFullYear()} DigiNotice AI Smart Notice Board. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  console.log('----------------------------------------------------');
  console.log(`📧 ACTIVATION EMAIL FOR: ${toEmail}`);
  console.log(`🔗 ACTIVATION LINK: ${activationUrl}`);
  console.log('----------------------------------------------------');

  // Try real SMTP if configured with non-placeholder credentials
  if (configured) {
    const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
    const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
    const SMTP_USER = process.env.SMTP_USER!.trim();
    const SMTP_PASS = process.env.SMTP_PASS!.trim();
    const FROM_EMAIL = process.env.FROM_EMAIL || `"DigiNotice AI Campus" <${SMTP_USER}>`;

    try {
      const transportConfig = SMTP_HOST.toLowerCase().includes('gmail')
        ? {
            service: 'gmail',
            auth: {
              user: SMTP_USER,
              pass: SMTP_PASS
            }
          }
        : {
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: {
              user: SMTP_USER,
              pass: SMTP_PASS
            },
            tls: {
              rejectUnauthorized: false
            }
          };

      const transporter = nodemailer.createTransport(transportConfig);

      await transporter.sendMail({
        from: FROM_EMAIL,
        to: toEmail,
        subject: '🎓 Activate Your DigiNotice AI Account',
        html: htmlContent
      });
      console.log(`✅ Live SMTP Email delivered directly to inbox: ${toEmail}`);
      delivered = true;
    } catch (err: any) {
      smtpError = err.message || 'SMTP delivery failed';
      console.error(`❌ Live SMTP delivery failed for ${toEmail}: ${smtpError}`);
    }
  } else {
    console.warn(`⚠️ Real SMTP is not configured in backend/.env (contains default placeholders).`);
  }

  // Fallback: If live delivery didn't happen, attempt Ethereal test account preview link
  if (!delivered) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      const info = await testTransporter.sendMail({
        from: '"DigiNotice AI Campus" <noreply@diginotice.edu>',
        to: toEmail,
        subject: '🎓 Activate Your DigiNotice AI Account',
        html: htmlContent
      });

      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        etherealUrl = testUrl as string;
        console.log(`📨 Ethereal Test Inbox Email URL: ${etherealUrl}`);
      }
    } catch (etherealErr: any) {
      console.warn(`Note: Ethereal preview creation skipped (${etherealErr.message}).`);
    }
  }

  return {
    activationUrl,
    etherealUrl,
    delivered,
    isConfigured: configured,
    smtpError
  };
};


