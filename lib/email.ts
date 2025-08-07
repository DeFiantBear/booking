import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  startTime: string;
  duration: number;
  adults: number;
  children: number;
  totalPrice: number;
  paymentMethod: string;
  bookingType: string;
  partyPackage?: string;
  specialRequests?: string;
}

export async function sendBookingConfirmation(data: EmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: 'VR Arcade <contact@secondcitystudio.xyz>',
      to: [data.customerEmail],
      subject: `Booking Confirmation - ${data.bookingType} Session`,
      html: generateCustomerEmailHTML(data),
    });

    if (error) {
      console.error('Error sending customer confirmation:', error);
      return false;
    }

    console.log('Customer confirmation email sent:', result);
    return true;
  } catch (error) {
    console.error('Failed to send customer confirmation:', error);
    return false;
  }
}

export async function sendAdminNotification(data: EmailData) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'contact@secondcitystudio.xyz';
    
    const { data: result, error } = await resend.emails.send({
      from: 'VR Arcade <contact@secondcitystudio.xyz>',
      to: [adminEmail],
      subject: `New Booking - ${data.bookingType} Session`,
      html: generateAdminEmailHTML(data),
    });

    if (error) {
      console.error('Error sending admin notification:', error);
      return false;
    }

    console.log('Admin notification email sent:', result);
    return true;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return false;
  }
}

function generateCustomerEmailHTML(data: EmailData): string {
  const formattedDate = new Date(data.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = new Date(`2000-01-01T${data.startTime}`).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const endTime = new Date(`2000-01-01T${data.startTime}`);
  endTime.setHours(endTime.getHours() + data.duration);
  const formattedEndTime = endTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #0066ff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #0066ff; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .highlight { color: #0066ff; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎮 VR Arcade Booking Confirmation</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${data.customerName}!</h2>
          
          <p>Your booking has been confirmed! Here are your booking details:</p>
          
          <div class="booking-details">
            <h3>📅 Booking Information</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime} - ${formattedEndTime}</p>
            <p><strong>Duration:</strong> ${data.duration} hour${data.duration > 1 ? 's' : ''}</p>
            <p><strong>Session Type:</strong> ${data.bookingType}</p>
            ${data.partyPackage ? `<p><strong>Package:</strong> ${data.partyPackage}</p>` : ''}
            
            <h3>👥 Guest Information</h3>
            <p><strong>Adults:</strong> ${data.adults}</p>
            <p><strong>Children:</strong> ${data.children}</p>
            
            <h3>💰 Payment</h3>
            <p><strong>Total:</strong> £${data.totalPrice}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            
            ${data.specialRequests ? `
            <h3>📝 Special Requests</h3>
            <p>${data.specialRequests}</p>
            ` : ''}
          </div>
          
          <h3>📍 What to Expect</h3>
          <ul>
            <li>Please arrive 10 minutes before your scheduled time</li>
            <li>Bring comfortable clothing for VR gaming</li>
            <li>We'll provide all necessary equipment</li>
            <li>Water and refreshments available on site</li>
          </ul>
          
                     <h3>📞 Contact Information</h3>
           <p>If you need to make any changes or have questions:</p>
           <p><strong>Email:</strong> contact@secondcitystudio.xyz</p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing VR Arcade!</p>
          <p>We look forward to seeing you for an amazing VR experience!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminEmailHTML(data: EmailData): string {
  const formattedDate = new Date(data.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = new Date(`2000-01-01T${data.startTime}`).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Booking Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0066ff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #0066ff; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .highlight { color: #0066ff; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎮 New VR Arcade Booking</h1>
        </div>
        
        <div class="content">
          <h2>New booking received!</h2>
          
          <div class="booking-details">
            <h3>📋 Booking Details</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Duration:</strong> ${data.duration} hour${data.duration > 1 ? 's' : ''}</p>
            <p><strong>Session Type:</strong> ${data.bookingType}</p>
            ${data.partyPackage ? `<p><strong>Package:</strong> ${data.partyPackage}</p>` : ''}
            
            <h3>👤 Customer Information</h3>
            <p><strong>Name:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Phone:</strong> ${data.customerPhone}</p>
            
            <h3>👥 Guest Count</h3>
            <p><strong>Adults:</strong> ${data.adults}</p>
            <p><strong>Children:</strong> ${data.children}</p>
            
            <h3>💰 Payment</h3>
            <p><strong>Total:</strong> £${data.totalPrice}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            
            ${data.specialRequests ? `
            <h3>📝 Special Requests</h3>
            <p>${data.specialRequests}</p>
            ` : ''}
          </div>
          
          <p><strong>Action Required:</strong> Please prepare the VR equipment and ensure availability for this booking.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from your VR Arcade booking system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
} 