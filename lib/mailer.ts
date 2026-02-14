import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Default email signature
 * HTML-safe & email-client friendly
 */
function emailSignature() {
  return `
    <br><br>
    <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
    
    <!-- Name & Title -->
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;margin:8px 0;">
      <strong>Benaya Josua</strong><br>
      <span style="color:#666;">Software Engineer</span>
    </p>
    
    <!-- Contact Info Section -->
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#444;margin:12px 0;">
      <p style="margin:4px 0;"><strong>Informasi</strong></p>
      <p style="margin:3px 0;">
        pribadi/non formal: 
        <a href="mailto:denaya.josua@gmail.com" style="color:#1a73e8;text-decoration:none;">denaya.josua@gmail.com</a>
      </p>
      <p style="margin:3px 0;">
        akademik: 
        <a href="mailto:01082240013@student.uph.edu" style="color:#1a73e8;text-decoration:none;">01082240013@student.uph.edu</a>
      </p>
      <p style="margin:3px 0;">
        project/kerjasama: 
        <a href="mailto:contact@halobenaya.com" style="color:#1a73e8;text-decoration:none;">contact@halobenaya.com</a>
      </p>
    </div>
    
    <!-- Disclaimer -->
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666;margin:12px 0;padding:8px;background-color:#f5f5f5;border-left:3px solid #ddd;">
      <p style="margin:4px 0;"><strong>Pemberitahuan Kerahasiaan</strong></p>
      <p style="margin:4px 0;line-height:1.4;">
        Email ini, termasuk seluruh lampiran di dalamnya, ditujukan hanya untuk penerima yang dimaksud dan disampaikan sebagai bagian dari dokumentasi serta lampiran cadangan. Informasi yang terkandung di dalamnya bersifat terbatas dan hanya diperuntukkan bagi pihak berwenang. Apabila Anda bukan penerima yang dituju atau bukan pihak yang berwenang, Anda dihantarkan bahwa wajar sepenuhnya penggunaan, penilauan, penyebaran, pendistribusian, atau penggandaan atas email ini tanpa izin tidak diperkenalkan. Apabila email ini diterima secara menurut, mohon untuk menginformasikan kepada pengirim dan mengahapus email di dalam sistem Anda.
      </p>
    </div>
    
    <!-- Social Media -->
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;margin:12px 0;">
      <p style="margin:4px 0;"><strong>Media Sosial</strong></p>
      <p style="margin:4px 0;">
        <a href="https://open.spotify.com/user/zeqxqspvmhgqmlkafjcrcx3n6" style="color:#1DB954;text-decoration:none;font-weight:bold;">Spotify</a> | 
        <a href="https://www.instagram.com/benayajosuaa/" style="color:#E1306C;text-decoration:none;font-weight:bold;">Instagram</a> | 
        <a href="https://github.com/benayajosuaa" style="color:#333;text-decoration:none;font-weight:bold;">Github</a> | 
        <a href="https://linkedin.com/in/benaya-josua" style="color:#0077B5;text-decoration:none;font-weight:bold;">LinkedIn</a> | 
        <a href="https://halobenaya.com" style="color:#1a73e8;text-decoration:none;">web: halobenaya.com</a>
      </p>
    </div>
  `;
}

export async function sendEmail(to: string, subject: string, markdown: string) {
  const { marked } = await import("marked");
  const html = (await marked.parse(markdown)) + emailSignature();
  return transporter.sendMail({
    from: `"Ben" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
