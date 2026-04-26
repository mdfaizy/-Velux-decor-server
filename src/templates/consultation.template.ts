export type ConsultationMailData = {
  fullName: string;
  mobileNumber: string;
  emailAddress?: string;
  city?: string;
  preferredDate?: string;
};

export const consultationTemplate = (data: ConsultationMailData) => {
  const { fullName, mobileNumber, emailAddress, city, preferredDate } = data;

  return `
    <div style="background:#f4f6f8; padding:40px 0; font-family:Arial;">
      
      <div style="max-width:600px; margin:auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#C9A84C,#8B6914); padding:20px; text-align:center; color:#fff;">
          <h2 style="margin:0;">📅 New Consultation Booking</h2>
        </div>

        <!-- Body -->
        <div style="padding:25px;">
          
          <table style="width:100%; border-collapse:collapse; font-size:14px;">
            
            <tr>
              <td style="padding:12px; color:#555;">👤 Name</td>
              <td style="padding:12px; font-weight:600;">${fullName}</td>
            </tr>

            <tr style="background:#f9fafb;">
              <td style="padding:12px; color:#555;">📱 Mobile</td>
              <td style="padding:12px;">${mobileNumber}</td>
            </tr>

            <tr>
              <td style="padding:12px; color:#555;">📧 Email</td>
              <td style="padding:12px;">${emailAddress || "-"}</td>
            </tr>

            <tr style="background:#f9fafb;">
              <td style="padding:12px; color:#555;">🏙 City</td>
              <td style="padding:12px;">${city || "-"}</td>
            </tr>

            <tr>
              <td style="padding:12px; color:#555;">📆 Preferred Date</td>
              <td style="padding:12px;">${preferredDate || "-"}</td>
            </tr>

          </table>

          <hr style="margin:25px 0; border:none; border-top:1px solid #eee;" />

          <p style="text-align:center; font-size:12px; color:#888;">
            🚀 New booking from your website
          </p>

        </div>
      </div>
    </div>
  `;
};