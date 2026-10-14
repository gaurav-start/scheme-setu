export const otpEmail = (otpCode) => {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <title>Your Scheme Setu One-Time Password</title>
        </head>
        <body
            style="
                margin:0;
                padding:40px 20px;
                background:#f8fafc;
                color:#0f172a;
                font-family:Arial, Helvetica, sans-serif;
            "
        >
            <div
                style="
                    max-width:540px;
                    margin:auto;
                    background:#ffffff;
                    border:1px solid #e2e8f0;
                    border-radius:12px;
                    padding:32px;
                    box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);
                "
            >
                <div style="text-align:center; margin-bottom:24px;">
                    <h2 style="margin:0; color:#0284c7; font-size:24px; font-weight:700;">Scheme Setu</h2>
                    <p style="margin:4px 0 0 0; color:#64748b; font-size:14px;">One-Time Verification Code</p>
                </div>

                <p style="font-size:16px; line-height:1.5; color:#334155;">Hello,</p>
                <p style="font-size:16px; line-height:1.5; color:#334155;">
                    Use the following 6-digit One-Time Password (OTP) to log into your Scheme Setu account. This code is valid for 10 minutes.
                </p>

                <div style="text-align:center; margin:32px 0;">
                    <span
                        style="
                            display:inline-block;
                            font-size:36px;
                            font-weight:800;
                            letter-spacing:8px;
                            color:#0284c7;
                            background:#f0f9ff;
                            border:1px solid #bae6fd;
                            padding:12px 28px;
                            border-radius:8px;
                        "
                    >
                        ${otpCode}
                    </span>
                </div>

                <p style="font-size:14px; color:#64748b; line-height:1.5;">
                    If you did not request this OTP, please ignore this email. Do not share this code with anyone.
                </p>

                <div style="border-top:1px solid #e2e8f0; margin-top:24px; padding-top:16px; text-align:center; font-size:12px; color:#94a3b8;">
                    &copy; ${new Date().getFullYear()} Scheme Setu. All rights reserved.
                </div>
            </div>
        </body>
        </html>
    `;
};
