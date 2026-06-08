import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtpout.secureserver.net",
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: process.env.EMAIL_PORT !== "587", // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // do not fail on invalid certs and allow legacy ciphers
    rejectUnauthorized: false,
    ciphers: "SSLv3",
  },
});

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  purpose: string = "Verification"
) {
  const mailOptions = {
    from: `"Orake" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Orake ${purpose} Code — OTP Inside 🔥`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #15161b; border-radius: 20px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 2px;">
            ORAKE
          </h1>
          <p style="color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 3px; margin: 0;">
            The Soda Your Gut Was Waiting For
          </p>
        </div>
        <div style="background: #ffffff; padding: 40px 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">Hey there,</p>
          <h2 style="color: #15161b; font-size: 20px; margin: 0 0 24px; text-transform: uppercase; letter-spacing: 1px;">
            Your ${purpose} Code
          </h2>
          <div style="background: #f4f4f5; border-radius: 16px; padding: 24px; margin: 0 0 24px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #c25b5e;">
              ${otp}
            </span>
          </div>
          <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px;">
            This code expires in <strong style="color: #15161b;">10 minutes</strong>.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            If you didn't request this, just ignore this email.
          </p>
        </div>
        <div style="padding: 20px 30px; text-align: center;">
          <p style="color: #4b5563; font-size: 11px; margin: 0;">
            © 2026 Orake. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending OTP email:", err);
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const mailOptions = {
    from: `"Orake Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL, // Send to the admin
    replyTo: data.email,
    subject: `New Contact Form Submission: ${data.subject || 'General Inquiry'}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f5; padding: 30px; border-radius: 12px;">
        <h2 style="color: #15161b; text-transform: uppercase; border-bottom: 2px solid #c25b5e; padding-bottom: 10px; margin-bottom: 20px;">
          New Message from Orake Contact Form
        </h2>
        <div style="background: #ffffff; padding: 20px; border-radius: 8px;">
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
          <p><strong>Subject:</strong> ${data.subject || 'General'}</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; color: #4b5563;">${data.message}</p>
        </div>
      </div>
    `,
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending contact email:", err);
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}

export async function sendPartnerEmail(data: {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  partnershipType: string;
  city: string;
  volume: string;
  details?: string;
}) {
  const mailOptions = {
    from: `"Orake Partnership Program" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL, // Send to admin
    replyTo: data.email,
    subject: `New Partnership Request: ${data.companyName} (${data.partnershipType})`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f5; padding: 30px; border-radius: 12px;">
        <h2 style="color: #15161b; text-transform: uppercase; border-bottom: 2px solid #de3e4f; padding-bottom: 10px; margin-bottom: 20px;">
          New Orake Partner Request
        </h2>
        <div style="background: #ffffff; padding: 20px; border-radius: 8px;">
          <p><strong>Full Name:</strong> ${data.name}</p>
          <p><strong>Company/Store Name:</strong> ${data.companyName}</p>
          <p><strong>Work Email:</strong> ${data.email}</p>
          <p><strong>Phone Number:</strong> ${data.phone}</p>
          <p><strong>Partnership Type:</strong> ${data.partnershipType}</p>
          <p><strong>City/Region:</strong> ${data.city}</p>
          <p><strong>Estimated Monthly Volume:</strong> ${data.volume}</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p><strong>Additional Details:</strong></p>
          <p style="white-space: pre-wrap; color: #4b5563;">${data.details || 'No additional details provided.'}</p>
        </div>
      </div>
    `,
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending partner email:", err);
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}

export async function sendWaitlistEmail(data: {
  name: string;
  email: string;
  phone?: string;
  cartItems: any[];
  total: number;
}) {
  const mailOptions = {
    from: `"Orake Waitlist" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    replyTo: data.email,
    subject: `New Early Customer Waitlist: ${data.name}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f5; padding: 30px; border-radius: 12px;">
        <h2 style="color: #15161b; text-transform: uppercase; border-bottom: 2px solid #de3e4f; padding-bottom: 10px; margin-bottom: 20px;">
          Early Access Customer Checkout
        </h2>
        <div style="background: #ffffff; padding: 20px; border-radius: 8px;">
          <p><strong>Customer Name:</strong> ${data.name}</p>
          <p><strong>Customer Email:</strong> ${data.email}</p>
          <p><strong>Customer Phone:</strong> ${data.phone || 'N/A'}</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p><strong>Cart Items:</strong></p>
          <ul>
            ${data.cartItems.map((item: any) => `<li>${item.quantity || item.qty || 1}x ${item.name} (₹${item.price})</li>`).join('')}
          </ul>
          <p><strong>Total Value:</strong> ₹${data.total}</p>
        </div>
      </div>
    `,
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending waitlist email:", err);
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}
