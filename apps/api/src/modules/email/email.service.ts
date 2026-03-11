import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: Transporter | null = null;

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT', 587),
        secure: this.config.get<number>('SMTP_PORT', 587) === 465,
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });
      console.log(`[Email] SMTP configured: ${host}`);
    } else {
      console.log('[Email] No SMTP configured — emails will be logged to console');
    }
  }

  private get fromAddress(): string {
    return this.config.get<string>('SMTP_FROM', 'noreply@omega-nova.com')!;
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (this.transporter) {
      await this.transporter.sendMail({
        from: `"Omega Nova" <${this.fromAddress}>`,
        to,
        subject,
        html,
      });
      console.log(`[Email] Sent to ${to}: ${subject}`);
    } else {
      console.log(`\n===== EMAIL (console mode) =====`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${html}`);
      console.log(`================================\n`);
    }
  }

  async sendOtp(to: string, code: string, name: string): Promise<void> {
    const subject = 'Omega Nova — Email Verification Code';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px; color: white; font-weight: bold;">&#9741;</span>
          </div>
          <h1 style="color: #f8fafc; font-size: 24px; margin: 16px 0 4px;">Omega Nova</h1>
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">Strategic Command Access</p>
        </div>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 8px;">Hello <strong style="color: #f1f5f9;">${name}</strong>,</p>
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px;">Use the following code to verify your email address:</p>
          <div style="background: #0f172a; border: 2px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 0 auto; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3b82f6; font-family: monospace;">${code}</span>
          </div>
          <p style="color: #64748b; font-size: 12px; margin: 24px 0 0;">This code expires in 10 minutes.</p>
        </div>
        <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
          If you did not request this, please ignore this email.
        </p>
      </div>
    `;
    await this.sendMail(to, subject, html);
  }

  async sendAccountApproved(to: string, name: string, frontendUrl: string): Promise<void> {
    const subject = 'Omega Nova — Account Approved';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px; color: white; font-weight: bold;">&#9741;</span>
          </div>
          <h1 style="color: #f8fafc; font-size: 24px; margin: 16px 0 4px;">Omega Nova</h1>
        </div>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; text-align: center;">
          <div style="width: 48px; height: 48px; background: #065f46; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 24px; color: #34d399;">&#10003;</span>
          </div>
          <h2 style="color: #f1f5f9; font-size: 20px; margin: 0 0 8px;">Account Approved</h2>
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px;">
            Hello <strong style="color: #f1f5f9;">${name}</strong>, your account has been approved by an administrator.
            You can now log in and complete the onboarding process.
          </p>
          <a href="${frontendUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Log In Now
          </a>
        </div>
      </div>
    `;
    await this.sendMail(to, subject, html);
  }

  async sendAccountRejected(to: string, name: string): Promise<void> {
    const subject = 'Omega Nova — Account Request Update';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px; color: white; font-weight: bold;">&#9741;</span>
          </div>
          <h1 style="color: #f8fafc; font-size: 24px; margin: 16px 0 4px;">Omega Nova</h1>
        </div>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 8px;">Hello <strong style="color: #f1f5f9;">${name}</strong>,</p>
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">
            Unfortunately, your account request has not been approved at this time.
            If you believe this is a mistake, please contact your organization's administrator.
          </p>
        </div>
      </div>
    `;
    await this.sendMail(to, subject, html);
  }
}
