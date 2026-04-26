export type ContactMailData = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
};

export const contactTemplate = (data: ContactMailData): string => {
  const { firstName, lastName, email, phone, service, message } = data;

  return `
    <div style="background:#f4f6f8; padding:40px 0; font-family:Arial, sans-serif;">
      
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#4CAF50,#2E7D32); padding:20px; text-align:center; color:#fff;">
          <h2 style="margin:0;">📩 New Contact Request</h2>
        </div>

        <!-- Body -->
        <div style="padding:25px;">
          
          <table style="width:100%; border-collapse:collapse; font-size:14px;">
            
            <tr>
              <td style="padding:12px; color:#555;">👤 Name</td>
              <td style="padding:12px; font-weight:600;">
                ${firstName} ${lastName || ""}
              </td>
            </tr>

            <tr style="background:#f9fafb;">
              <td style="padding:12px; color:#555;">📧 Email</td>
              <td style="padding:12px;">${email}</td>
            </tr>

            <tr>
              <td style="padding:12px; color:#555;">📱 Phone</td>
              <td style="padding:12px;">${phone || "-"}</td>
            </tr>

            <tr style="background:#f9fafb;">
              <td style="padding:12px; color:#555;">🛠 Service</td>
              <td style="padding:12px;">${service || "-"}</td>
            </tr>

            <tr>
              <td style="padding:12px; color:#555;">💬 Message</td>
              <td style="padding:12px;">${message}</td>
            </tr>

          </table>

          <hr style="margin:25px 0; border:none; border-top:1px solid #eee;" />

          <p style="font-size:12px; color:#888; text-align:center;">
            🚀 Sent from your website
          </p>

        </div>

      </div>

    </div>
  `;
};