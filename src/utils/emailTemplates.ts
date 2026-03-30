export const resetPasswordTemplate = (resetUrl: string, userName: string): string => {
  return `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đặt lại mật khẩu</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="500" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header gradient bar -->
            <tr>
              <td style="height: 6px; background: linear-gradient(to right, #f59e0b, #f97316, #f43f5e);"></td>
            </tr>

            <!-- Logo / Brand -->
            <tr>
              <td style="padding: 32px 40px 0; text-align: center;">
                <div style="display: inline-block; background-color: #fffbeb; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; text-align: center;">
                  <span style="font-size: 28px;">🔑</span>
                </div>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="padding: 20px 40px 0; text-align: center;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #1e293b;">
                  Đặt lại mật khẩu
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 16px 40px 0; text-align: center;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                  Xin chào <strong style="color: #1e293b;">${userName}</strong>,
                </p>
                <p style="margin: 12px 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                  Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                  Nhấn vào nút bên dưới để tạo mật khẩu mới:
                </p>
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td style="padding: 28px 40px; text-align: center;">
                <a href="${resetUrl}" target="_blank"
                   style="display: inline-block; background: linear-gradient(to right, #f59e0b, #f97316);
                          color: #ffffff; font-size: 14px; font-weight: 600;
                          text-decoration: none; padding: 12px 32px; border-radius: 10px;
                          box-shadow: 0 4px 12px rgba(249,115,22,0.35);">
                  Đặt lại mật khẩu
                </a>
              </td>
            </tr>

            <!-- Expire note -->
            <tr>
              <td style="padding: 0 40px; text-align: center;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                  Liên kết này sẽ hết hạn sau <strong>15 phút</strong>.
                  Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                </p>
              </td>
            </tr>

            <!-- Fallback URL -->
            <tr>
              <td style="padding: 24px 40px 0; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                  Hoặc sao chép đường dẫn sau vào trình duyệt:
                </p>
                <p style="margin: 6px 0 0; font-size: 12px; word-break: break-all;">
                  <a href="${resetUrl}" style="color: #f97316; text-decoration: underline;">${resetUrl}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 32px 40px; text-align: center; border-top: 1px solid #f1f5f9; margin-top: 24px;">
                <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                  © ${new Date().getFullYear()} CCVMTPTPM Restaurant. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
