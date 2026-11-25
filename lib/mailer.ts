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

export async function sendOrderConfirmationEmail(data: {
  to: string;
  orderNumber: string;
  customerName: string;
  totalPrice: number;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderItems: {
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
}) {
  const itemsHtml = data.orderItems
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 12px 8px; vertical-align: middle;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" width="48" height="48" style="border-radius: 8px; object-fit: contain; background: #f9fafb; vertical-align: middle; margin-right: 12px; display: inline-block;" />` : ''}
          <span style="font-weight: 600; color: #15161b; font-size: 14px;">${item.name}</span>
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #6b7280; font-size: 14px;">×${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: #15161b; font-size: 14px;">₹${item.price * item.quantity}</td>
      </tr>
    `
    )
    .join("");

  const mailOptions = {
    from: `"Orake Orders" <${process.env.EMAIL_USER}>`,
    to: data.to,
    replyTo: process.env.EMAIL_USER,
    subject: `Order Confirmed: #${data.orderNumber} — Thank You for Choosing Orake! 🔥`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background: #15161b; padding: 36px 30px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 30px; margin: 0 0 6px; letter-spacing: 3px; font-weight: 800;">
            ORAKE
          </h1>
          <p style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">
            Prebiotic Soda For Gut Health
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 36px 30px;">
          <div style="display: inline-block; background: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">
            ✓ Order Confirmed
          </div>

          <h2 style="color: #15161b; font-size: 22px; margin: 0 0 8px; font-weight: 700;">
            Thank you, ${data.customerName}!
          </h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            We've received your order and we're getting it ready to be shipped. Here is your order confirmation.
          </p>

          <!-- Order Reference Box -->
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px 20px; margin-bottom: 28px;">
            <table style="width: 100%;">
              <tr>
                <td style="vertical-align: top;">
                  <p style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Order Number</p>
                  <p style="color: #c25b5e; font-size: 18px; font-weight: 800; font-family: monospace; margin: 0;">#${data.orderNumber}</p>
                </td>
                <td style="vertical-align: top; text-align: right;">
                  <p style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Payment Method</p>
                  <p style="color: #15161b; font-size: 13px; font-weight: 700; margin: 0;">${data.paymentMethod === "COD" ? "Cash on Delivery" : "Online (Razorpay)"}</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Items Table -->
          <h3 style="color: #15161b; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px; font-weight: 700;">
            Items in Your Order
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb; text-align: left;">
                <th style="padding: 8px; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                <th style="padding: 8px; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; text-align: center;">Qty</th>
                <th style="padding: 8px; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px 8px 4px; font-size: 15px; font-weight: 800; color: #15161b; text-transform: uppercase;">Total</td>
                <td style="padding: 16px 8px 4px; font-size: 18px; font-weight: 800; color: #c25b5e; text-align: right;">₹${data.totalPrice}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Shipping Address -->
          <div style="background: #f9fafb; border-radius: 14px; padding: 18px 20px; border: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; font-weight: 700;">Shipping To</p>
            <p style="color: #15161b; font-size: 14px; font-weight: 600; margin: 0 0 4px;">${data.shippingAddress.fullName}</p>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 4px;">
              ${data.shippingAddress.street}, ${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.postalCode}
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 0;">Phone: ${data.shippingAddress.phone}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px;">
            Questions about your order? Email us at <a href="mailto:raj@drinkorake.com" style="color: #c25b5e; text-decoration: none; font-weight: 600;">raj@drinkorake.com</a>
          </p>
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            © 2026 Orake. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending order confirmation email:", err);
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}
