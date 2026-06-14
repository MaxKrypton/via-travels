import { InviteEmailData } from "./types";

class EmailingOptions {
  forgotPassword(firstname: string, OTP: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Via Password Reset</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #ffffff; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="text-align: center; font-size: 36px; font-weight: bold; color: #8c7c36; margin-bottom: 50px;">Via</div>
    </div>
    <div style="text-align: left; padding: 0 20px;">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 25px;">Hi ${firstname},</div>
      <div style="font-size: 16px; color: #333333; margin-bottom: 30px;">
        You recently requested to reset your password for your Via account. Please use the temporary password below to log in:
      </div>
      <div style="background-color: #f7f7f7; padding: 30px; text-align: center; border-radius: 4px; margin: 30px 0;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #333333; margin-bottom: 15px; font-family: 'Courier New', monospace;">${OTP}</div>
        <div style="font-size: 14px; color: #666666;">This password will expire in 24 hours</div>
      </div>
      <div style="margin: 30px 0; color: #666666; font-size: 14px;">
        If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.
      </div>
      <div style="margin: 40px 0;">
        Best regards,<br>
        The Via Team
      </div>
    </div>
    <div style="text-align: center; padding: 30px 0; color: #666666; border-top: 1px solid #eeeeee; font-size: 14px;">
      <div style="margin-bottom: 15px;">Need help? Contact our <a href="mailto:support@viahotels.com" style="color: #8c7c36; text-decoration: none;">support team</a></div>
      <div style="margin: 15px 0;">
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Privacy Policy</a> •
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Terms of Service</a> •
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }

  temporaryHotelAdminLoginPassword(username: string, password: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Via Admin Access</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #ffffff; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="text-align: center; font-size: 36px; font-weight: bold; color: #8c7c36; margin-bottom: 50px;">Via</div>
    </div>
    <div style="text-align: left; padding: 0 20px;">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 25px;">Hello ${username},</div>
      <div style="font-size: 16px; color: #333333; margin-bottom: 30px;">
        Welcome to the Via Hotel Management Platform. Here is your temporary login password to access your hotel admin dashboard:
      </div>
      <div style="background-color: #f7f7f7; padding: 30px; text-align: center; border-radius: 4px; margin: 30px 0;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #333333; margin-bottom: 15px; font-family: 'Courier New', monospace;">${password}</div>
        <div style="font-size: 14px; color: #666666;">Please change your password after logging in. This password will expire in 48 hours.</div>
      </div>
      <div style="margin: 30px 0; color: #666666; font-size: 14px;">
        For security reasons, please log in and change your password as soon as possible. If you were not expecting this access or have any questions, kindly reach out to our support team immediately.
      </div>
      <div style="margin: 40px 0;">
        Sincerely,<br>
        The Via Team
      </div>
    </div>
    <div style="text-align: center; padding: 30px 0; color: #666666; border-top: 1px solid #eeeeee; font-size: 14px;">
      <div style="margin-bottom: 15px;">Need help? Contact our <a href="mailto:support@viahotels.com" style="color: #8c7c36; text-decoration: none;">support team</a></div>
      <div style="margin: 15px 0;">
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Privacy Policy</a> •
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Terms of Service</a> •
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }

  updatePassword(firstname: string, OTP: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Via Password Updated</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fff; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 36px; font-weight: bold; color: #8c7c36;">Via</div>
    </div>
    <div style="padding: 0 20px;">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 25px;">Hi ${firstname},</div>
      <div style="font-size: 16px; margin-bottom: 30px;">
        Your password has been successfully updated. You can now log in using the temporary password below:
      </div>
      <div style="background-color: #f7f7f7; padding: 30px; text-align: center; border-radius: 4px; margin: 30px 0;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #333; font-family: 'Courier New', monospace;">${OTP}</div>
        <div style="font-size: 14px; color: #666;">This password will expire in 24 hours</div>
      </div>
      <div style="margin: 30px 0; color: #666; font-size: 14px;">
        If you did not make this change, please reset your password immediately and contact our support team.
      </div>
      <div style="margin: 40px 0;">
        Best regards,<br />
        The Via Team
      </div>
    </div>
    <div style="text-align: center; padding: 30px 0; color: #666; border-top: 1px solid #eee; font-size: 14px;">
      <div style="margin-bottom: 15px;">Need help? Contact our <a href="mailto:support@viahotels.com" style="color: #8c7c36; text-decoration: none;">support team</a></div>
      <div style="margin: 15px 0;">
        <a href="#" style="color: #666; text-decoration: none; margin: 0 5px;">Privacy Policy</a> •
        <a href="#" style="color: #666; text-decoration: none; margin: 0 5px;">Terms of Service</a> •
        <a href="#" style="color: #666; text-decoration: none; margin: 0 5px;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }

  clientComplains(name: string, email: string, hotelName: string, subject: string, message: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Client Complaint Received</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); overflow: hidden;">

      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #8c7c36 0%, #a69147 100%); text-align: center; padding: 40px 20px;">
        <div style="display: inline-block; width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; position: relative; margin-bottom: 20px;">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 24px; height: 24px; background-color: white; border-radius: 3px; transform: translate(-50%, -50%) rotate(45deg);"></div>
        </div>
        <h1 style="color: white; font-size: 28px; font-weight: 600; margin: 0; letter-spacing: 1px;">Via </h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">Client Complaint Notification</p>
      </div>

      <!-- Content Section -->
      <div style="padding: 40px 30px;">
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 20px; color: #2c3e50;">Dear Administrator,</h2>

        <p style="font-size: 16px; margin-bottom: 30px; color: #555;">
          A new complaint has been submitted. Please review the details below and take appropriate action.
        </p>

        <!-- Complaint Details Card -->
        <div style="background-color: #f8f9fa; border-left: 4px solid #8c7c36; padding: 25px; border-radius: 6px; margin-bottom: 30px;">
          <h3 style="color: #8c7c36; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">Complaint Details</h3>

          <div style="margin-bottom: 15px;">
            <strong style="color: #2c3e50; display: inline-block; width: 140px;">Client Name:</strong>
            <span style="color: #555;">${name}</span>
          </div>

          <div style="margin-bottom: 15px;">
            <strong style="color: #2c3e50; display: inline-block; width: 140px;">Client Email:</strong>
            <span style="color: #555;"><a href="mailto:${email}" style="color: #8c7c36; text-decoration: none;">${email}</a></span>
          </div>

          <div style="margin-bottom: 15px;">
            <strong style="color: #2c3e50; display: inline-block; width: 140px;">Hotel Property:</strong>
            <span style="color: #555;">${hotelName}</span>
          </div>

          <div style="margin-bottom: 15px;">
            <strong style="color: #2c3e50; display: inline-block; width: 140px;">Subject:</strong>
            <span style="color: #555;">${subject}</span>
          </div>

          <div style="margin-top: 20px;">
            <strong style="color: #2c3e50;">Message:</strong>
            <div style="margin-top: 8px; padding: 15px; background-color: white; border-radius: 4px; border: 1px solid #e1e8ed; color: #555; white-space: pre-line;">${message}</div>
          </div>
        </div>

        <!-- Action Required -->
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
          <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⚠️ Action Required</h4>
          <p style="color: #856404; margin: 0; font-size: 14px;">
            Please review this complaint promptly and respond to the client within 24 hours. If additional information is needed, contact the client directly using the provided email address.
          </p>
        </div>

        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          This complaint was submitted on ${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}.
        </p>

        <div style="margin: 40px 0; color: #555;">
          <p style="margin: 0;">Best regards,</p>
          <p style="margin: 5px 0 0 0; font-weight: 600; color: #8c7c36;">The Via Travels Team</p>
        </div>
      </div>

      <!-- Footer Section -->
      <div style="background-color: #f8f9fa; text-align: center; padding: 30px 20px; border-top: 1px solid #e9ecef;">
        <p style="color: #666; font-size: 14px; margin: 0 0 15px 0;">
          Need assistance? Contact our <a href="mailto:support@viahotels.com" style="color: #8c7c36; text-decoration: none; font-weight: 500;">support team</a>
        </p>

        <div style="margin: 15px 0;">
          <a href="#" style="color: #666; text-decoration: none; margin: 0 10px; font-size: 13px;">Privacy Policy</a>
          <span style="color: #ccc;">•</span>
          <a href="#" style="color: #666; text-decoration: none; margin: 0 10px; font-size: 13px;">Terms of Service</a>
          <span style="color: #ccc;">•</span>
          <a href="#" style="color: #666; text-decoration: none; margin: 0 10px; font-size: 13px;">Contact Us</a>
        </div>

        <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
          © ${new Date().getFullYear()} Via Travels. All rights reserved.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
`;
  }

  customerInvitationTemplate(data: InviteEmailData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to Via Platform</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #ffffff; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="text-align: center; font-size: 36px; font-weight: bold; color: #8c7c36; margin-bottom: 50px;">Via</div>
    </div>
    <div style="text-align: left; padding: 0 20px;">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 25px;">Hello ${data.inviteeUsername},</div>
      <div style="font-size: 16px; color: #333333; margin-bottom: 20px;">
        You've been invited by ${data.inviterName} to join the Via Platform as a customer.
      </div>
      <div style="font-size: 16px; color: #333333; margin-bottom: 30px;">
        Here is your temporary login password to access your account:
      </div>
      <div style="background-color: #f7f7f7; padding: 30px; text-align: center; border-radius: 4px; margin: 30px 0;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #333333; margin-bottom: 15px; font-family: 'Courier New', monospace;">${data.password}</div>
        <div style="font-size: 14px; color: #666666;">Please change your password after logging in. This password will expire in 48 hours.</div>
      </div>
      <div style="margin: 30px 0; color: #666666; font-size: 14px;">
        As a customer, you'll have access to browse and book accommodations through our platform. For security reasons, please log in and change your password as soon as possible.
      </div>
      <div style="margin: 40px 0;">
        Welcome aboard!<br>
        The Via Team
      </div>
    </div>
    <div style="text-align: center; padding: 30px 0; color: #666666; border-top: 1px solid #eeeeee; font-size: 14px;">
      <div style="margin-bottom: 15px;">Need help? Contact our <a href="mailto:support@viahotels.com" style="color: #8c7c36; text-decoration: none;">support team</a></div>
      <div style="margin: 15px 0;">
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Privacy Policy</a> •
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Terms of Service</a> •
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }

  hotelManagerInvitationTemplate(data: InviteEmailData, hotelName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Hotel Manager Access - Via Platform</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #ffffff; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="text-align: center; font-size: 36px; font-weight: bold; color: #8c7c36; margin-bottom: 50px;">Via</div>
    </div>
    <div style="text-align: left; padding: 0 20px;">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 25px;">Hello ${data.inviteeUsername},</div>
      <div style="font-size: 16px; color: #333333; margin-bottom: 20px;">
        You've been invited by ${data.inviterName} to join the management team for <strong>${hotelName}</strong> on the Via Platform.
      </div>
      <div style="font-size: 16px; color: #333333; margin-bottom: 30px;">
        Here is your temporary login password to access your hotel management dashboard:
      </div>
      <div style="background-color: #f7f7f7; padding: 30px; text-align: center; border-radius: 4px; margin: 30px 0;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #333333; margin-bottom: 15px; font-family: 'Courier New', monospace;">${data.password}</div>
        <div style="font-size: 14px; color: #666666;">Please change your password after logging in. This password will expire in 48 hours.</div>
      </div>
      <div style="margin: 30px 0; color: #666666; font-size: 14px;">
        As a hotel manager, you'll have access to manage bookings, room availability, pricing, and other hotel operations for ${hotelName}. You can also invite other hotel managers to collaborate with you.
      </div>
      <div style="margin: 30px 0; color: #666666; font-size: 14px;">
        For security reasons, please log in and change your password as soon as possible. If you were not expecting this invitation or have any questions, please contact the person who invited you or our support team.
      </div>
      <div style="margin: 40px 0;">
        Welcome to the team!<br>
        The Via Team
      </div>
    </div>
    <div style="text-align: center; padding: 30px 0; color: #666666; border-top: 1px solid #eeeeee; font-size: 14px;">
      <div style="margin-bottom: 15px;">Need help? Contact our <a href="mailto:support@viahotels.com" style="color: #8c7c36; text-decoration: none;">support team</a></div>
      <div style="margin: 15px 0;">
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Privacy Policy</a> •
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Terms of Service</a> •
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }

  viaAdminInvitationTemplate(data: InviteEmailData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Via Admin Access</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #ffffff; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="text-align: center; font-size: 36px; font-weight: bold; color: #8c7c36; margin-bottom: 50px;">Via</div>
    </div>
    <div style="text-align: left; padding: 0 20px;">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 25px;">Hello ${data.inviteeUsername},</div>
      <div style="font-size: 16px; color: #333333; margin-bottom: 20px;">
        You've been invited by ${data.inviterName} to join the Via Platform with administrative privileges.
      </div>
      <div style="font-size: 16px; color: #333333; margin-bottom: 30px;">
        Here is your temporary login password to access your admin dashboard:
      </div>
      <div style="background-color: #f7f7f7; padding: 30px; text-align: center; border-radius: 4px; margin: 30px 0;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #333333; margin-bottom: 15px; font-family: 'Courier New', monospace;">${data.password}</div>
        <div style="font-size: 14px; color: #666666;">Please change your password after logging in. This password will expire in 48 hours.</div>
      </div>
      <div style="margin: 30px 0; color: #666666; font-size: 14px;">
        As a Via administrator, you have full access to manage the platform, including user management, hotel oversight, and system configuration. You can invite users at all levels: customers, hotel managers, and other administrators.
      </div>
      <div style="margin: 30px 0; color: #666666; font-size: 14px;">
        <strong>Important:</strong> This role comes with significant responsibilities. Please ensure you understand the platform policies and use your administrative privileges responsibly.
      </div>
      <div style="margin: 30px 0; color: #666666; font-size: 14px;">
        For security reasons, please log in and change your password as soon as possible. If you were not expecting this access or have any questions, kindly reach out to our support team immediately.
      </div>
      <div style="margin: 40px 0;">
        Welcome to the administrative team!<br>
        The Via Team
      </div>
    </div>
    <div style="text-align: center; padding: 30px 0; color: #666666; border-top: 1px solid #eeeeee; font-size: 14px;">
      <div style="margin-bottom: 15px;">Need help? Contact our <a href="mailto:support@viahotels.com" style="color: #8c7c36; text-decoration: none;">support team</a></div>
      <div style="margin: 15px 0;">
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Privacy Policy</a> •
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Terms of Service</a> •
        <a href="#" style="color: #666666; text-decoration: none; margin: 0 5px;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }

  softwareGlitchReport(
    name: string,
    email: string,
    userRole: string,
    issueDescription: string,
    severity: 'Low' | 'Medium' | 'High' | 'Critical'
  ) {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Software Glitch Report Received</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); overflow: hidden;">

        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); text-align: center; padding: 40px 20px;">
          <h1 style="color: white; font-size: 28px; font-weight: 600; margin: 0; letter-spacing: 1px;">Via Platform</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">Software Glitch Report</p>
        </div>

        <!-- Content Section -->
        <div style="padding: 40px 30px;">
          <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 20px; color: #2c3e50;">Dear Development Team,</h2>

          <p style="font-size: 16px; margin-bottom: 30px; color: #555;">
            A software glitch has been reported by a user. Please review the details below and prioritize based on severity level.
          </p>

          <!-- Severity Badge -->
          <div style="margin-bottom: 25px;">
            <span style="
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              ${severity === 'Critical' ? 'background-color: #dc3545; color: white;' :
        severity === 'High' ? 'background-color: #fd7e14; color: white;' :
          severity === 'Medium' ? 'background-color: #ffc107; color: #212529;' :
            'background-color: #28a745; color: white;'}
            ">
              ${severity} Priority
            </span>
          </div>

          <!-- Glitch Report Details Card -->
          <div style="background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 25px; border-radius: 6px; margin-bottom: 30px;">
            <h3 style="color: #dc3545; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">Glitch Report Details</h3>

            <div style="margin-bottom: 15px;">
              <strong style="color: #2c3e50; display: inline-block; width: 140px;">Reporter Name:</strong>
              <span style="color: #555;">${name}</span>
            </div>

            <div style="margin-bottom: 15px;">
              <strong style="color: #2c3e50; display: inline-block; width: 140px;">Email:</strong>
              <span style="color: #555;"><a href="mailto:${email}" style="color: #dc3545; text-decoration: none;">${email}</a></span>
            </div>

            <div style="margin-bottom: 15px;">
              <strong style="color: #2c3e50; display: inline-block; width: 140px;">User Role:</strong>
              <span style="color: #555;">${userRole}</span>
            </div>

            <div style="margin-top: 20px;">
              <strong style="color: #2c3e50;">Issue Description:</strong>
              <div style="margin-top: 8px; padding: 15px; background-color: white; border-radius: 4px; border: 1px solid #e1e8ed; color: #555; white-space: pre-line;">${issueDescription}</div>
            </div>
          </div>

          <!-- Action Required -->
          <div style="
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
            ${severity === 'Critical' ? 'background-color: #f8d7da; border: 1px solid #f5c6cb;' :
        severity === 'High' ? 'background-color: #fff3cd; border: 1px solid #ffeaa7;' :
          'background-color: #d1ecf1; border: 1px solid #bee5eb;'}
          ">
            <h4 style="
              margin: 0 0 10px 0;
              font-size: 16px;
              ${severity === 'Critical' ? 'color: #721c24;' :
        severity === 'High' ? 'color: #856404;' :
          'color: #0c5460;'}
            ">
              ${severity === 'Critical' ? '🚨 CRITICAL - Immediate Action Required' :
        severity === 'High' ? '⚠️ HIGH Priority - Action Required' :
          '📋 Review Required'}
            </h4>
            <p style="
              margin: 0;
              font-size: 14px;
              ${severity === 'Critical' ? 'color: #721c24;' :
        severity === 'High' ? 'color: #856404;' :
          'color: #0c5460;'}
            ">
              ${severity === 'Critical' ?
        'This critical issue requires immediate attention. Please investigate and resolve within 2 hours. Contact the user immediately if additional information is needed.' :
        severity === 'High' ?
          'This high-priority issue should be reviewed and addressed within 24 hours. Contact the user if clarification is needed.' :
          'Please review this issue and update the user on expected resolution timeline within 48 hours.'}
            </p>
          </div>

          <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
            This glitch report was submitted on ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}.
          </p>

          <div style="margin: 40px 0; color: #555;">
            <p style="margin: 0;">Thank you for maintaining our platform,</p>
            <p style="margin: 5px 0 0 0; font-weight: 600; color: #dc3545;">Via Platform Engineering Team</p>
          </div>
        </div>

        <!-- Footer Section -->
        <div style="background-color: #f8f9fa; text-align: center; padding: 30px 20px; border-top: 1px solid #e9ecef;">
          <p style="color: #666; font-size: 14px; margin: 0 0 15px 0;">
            Technical support: <a href="mailto:engineering@viahotels.com" style="color: #dc3545; text-decoration: none; font-weight: 500;">engineering@viahotels.com</a>
          </p>

          <div style="margin: 15px 0;">
            <a href="#" style="color: #666; text-decoration: none; margin: 0 10px; font-size: 13px;">Bug Tracking System</a>
            <span style="color: #ccc;">•</span>
            <a href="#" style="color: #666; text-decoration: none; margin: 0 10px; font-size: 13px;">Development Guidelines</a>
            <span style="color: #ccc;">•</span>
            <a href="#" style="color: #666; text-decoration: none; margin: 0 10px; font-size: 13px;">Status Page</a>
          </div>

          <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
            © ${new Date().getFullYear()} Via Platform Engineering. Internal Use Only.
          </p>
        </div>

      </div>
    </div>
  </body>
  </html>
  `;
  }
}


export const emailingOptions = new EmailingOptions();
