import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generate a unique invoice number
 * Format: INV-YYYYMMDD-XXXXX
 */
export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  
  return `INV-${year}${month}${day}-${random}`;
};

/**
 * Calculate the number of nights between two dates
 */
const calculateNights = (checkIn, checkOut) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((new Date(checkOut) - new Date(checkIn)) / oneDay));
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
  return `$${amount.toFixed(2)}`;
};

/**
 * Format date
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Generate PDF invoice for a booking
 * @param {Object} booking - The booking object
 * @param {Object} hotel - The hotel object
 * @returns {Promise<Buffer>} - PDF buffer
 */
export const generateInvoicePDF = async (booking, hotel) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      // Collect PDF chunks
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Define colors
      const primaryColor = '#2563eb';
      const darkGray = '#374151';
      const lightGray = '#6b7280';
      const borderColor = '#e5e7eb';

      // Invoice number
      const invoiceNumber = booking.invoiceNumber || generateInvoiceNumber();
      const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

      let currentY = 50;

      // Add logo (if available) and company header
      try {
        // Try to load logo from public directory
        const logoPath = path.join(process.cwd(), 'client', 'public', 'logo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, currentY, { width: 60, height: 60 });
          // Company info next to logo
          doc.fontSize(20)
            .fillColor(primaryColor)
            .text('Nonsa Travels', 120, currentY + 5);
          doc.fontSize(10)
            .fillColor(lightGray)
            .text('Premium Hotel Booking Service', 120, currentY + 30)
            .text('bookings@nonsatravels.com', 120, currentY + 45);
          currentY += 80;
        } else {
          // Fallback: Text-only header
          doc.fontSize(28)
            .fillColor(primaryColor)
            .text('INVOICE', 50, currentY);
          currentY += 50;
          doc.fontSize(10)
            .fillColor(lightGray)
            .text('Nonsa Travels', 50, currentY)
            .text('Premium Hotel Booking Service', 50, currentY + 15)
            .text('Email: bookings@nonsatravels.com', 50, currentY + 30)
            .text('Phone: +260 970 462 777', 50, currentY + 45);
          currentY += 75;
        }
      } catch (err) {
        // Logo loading failed, use text-only header
        console.warn('Logo not found, using text-only invoice header');
        doc.fontSize(28)
          .fillColor(primaryColor)
          .text('INVOICE', 50, currentY);
        currentY += 50;
        doc.fontSize(10)
          .fillColor(lightGray)
          .text('Nonsa Travels', 50, currentY)
          .text('Premium Hotel Booking Service', 50, currentY + 15)
          .text('Email: bookings@nonsatravels.com', 50, currentY + 30)
          .text('Phone: +260 970 462 777', 50, currentY + 45);
        currentY += 75;
      }

      // Invoice details - right aligned (adjust position based on whether logo was added)
      doc.fontSize(10)
        .fillColor(darkGray)
        .text(`Invoice #: ${invoiceNumber}`, 350, 50, { align: 'right' })
        .fillColor(lightGray)
        .text(`Date: ${formatDate(booking.paymentConfirmedAt || booking.updatedAt)}`, 350, 65, { align: 'right' })
        .text(`Booking ID: ${booking._id.slice(-8).toUpperCase()}`, 350, 80, { align: 'right' });

      // Horizontal line
      doc.strokeColor(borderColor)
        .lineWidth(1)
        .moveTo(50, currentY)
        .lineTo(545, currentY)
        .stroke();

      currentY += 20;

      // Bill To section
      doc.fontSize(12)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text('BILL TO:', 50, currentY);

      doc.fontSize(10)
        .font('Helvetica')
        .fillColor(darkGray)
        .text(booking.userName, 50, currentY + 20)
        .fillColor(lightGray)
        .text(booking.userEmail, 50, currentY + 35)
        .text(booking.userPhone || 'N/A', 50, currentY + 50);

      // Hotel Details section
      doc.fontSize(12)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text('HOTEL DETAILS:', 320, currentY);

      doc.fontSize(10)
        .font('Helvetica')
        .fillColor(darkGray)
        .text(hotel.name, 320, currentY + 20)
        .fillColor(lightGray)
        .text(hotel.location, 320, currentY + 35)
        .text(`${hotel.city}, ${hotel.country}`, 320, currentY + 50);

      currentY += 90;

      // Booking Details section
      doc.fontSize(14)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('Booking Details', 50, currentY);

      currentY += 30;
      const startY = currentY;
      const lineHeight = 20;

      // Details table
      const details = [
        { label: 'Check-in Date:', value: formatDate(booking.checkInDate) },
        { label: 'Check-out Date:', value: formatDate(booking.checkOutDate) },
        { label: 'Number of Nights:', value: `${nights} ${nights === 1 ? 'night' : 'nights'}` },
        { label: 'Number of Guests:', value: booking.guests.toString() },
        { label: 'Room Type:', value: booking.roomPreferences || 'Standard' },
      ];

      doc.fontSize(10).font('Helvetica');
      details.forEach((detail, index) => {
        const y = startY + (index * lineHeight);
        doc.fillColor(lightGray).text(detail.label, 50, y);
        doc.fillColor(darkGray).text(detail.value, 200, y);
      });

      // Payment breakdown section
      doc.fontSize(14)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('Payment Breakdown', 50, startY + (details.length * lineHeight) + 30);

      const breakdownY = startY + (details.length * lineHeight) + 60;

      // Table header
      doc.rect(50, breakdownY, 495, 30)
        .fillAndStroke('#f3f4f6', borderColor);

      doc.fontSize(10)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text('Description', 60, breakdownY + 10)
        .text('Qty', 350, breakdownY + 10)
        .text('Rate', 420, breakdownY + 10)
        .text('Amount', 480, breakdownY + 10, { align: 'right', width: 55 });

      // Line items
      let itemY = breakdownY + 40;

      // Room charges
      const pricePerNight = booking.pricePerNight || (booking.totalPrice / nights);
      doc.font('Helvetica')
        .fillColor(darkGray)
        .text(`${hotel.name} - Room Booking`, 60, itemY)
        .text(nights.toString(), 350, itemY)
        .text(formatCurrency(pricePerNight), 420, itemY)
        .text(formatCurrency(pricePerNight * nights), 480, itemY, { align: 'right', width: 55 });

      itemY += 25;

      // Discount if applicable
      if (booking.referralDiscount && booking.referralDiscount.amount > 0) {
        doc.fillColor('#059669')
          .text(`Discount (${booking.referralDiscount.code})`, 60, itemY)
          .text('1', 350, itemY)
          .text(`-${formatCurrency(booking.referralDiscount.amount)}`, 420, itemY)
          .text(`-${formatCurrency(booking.referralDiscount.amount)}`, 480, itemY, { align: 'right', width: 55 });
        itemY += 25;
      }

      // Subtotal, tax, and total
      const subtotal = booking.totalPrice;
      const taxRate = 0; // Adjust if you have tax
      const tax = subtotal * taxRate;
      const total = booking.totalPrice;

      // Horizontal line before totals
      doc.strokeColor(borderColor)
        .lineWidth(1)
        .moveTo(350, itemY + 10)
        .lineTo(545, itemY + 10)
        .stroke();

      itemY += 25;

      // Subtotal
      doc.fillColor(lightGray)
        .text('Subtotal:', 350, itemY);
      doc.fillColor(darkGray)
        .text(formatCurrency(subtotal), 480, itemY, { align: 'right', width: 55 });

      if (tax > 0) {
        itemY += 20;
        doc.fillColor(lightGray)
          .text(`Tax (${taxRate * 100}%):`, 350, itemY);
        doc.fillColor(darkGray)
          .text(formatCurrency(tax), 480, itemY, { align: 'right', width: 55 });
      }

      // Total
      itemY += 25;
      doc.rect(350, itemY - 5, 195, 30)
        .fillAndStroke(primaryColor, primaryColor);

      doc.fontSize(12)
        .fillColor('white')
        .font('Helvetica-Bold')
        .text('TOTAL:', 360, itemY + 3);
      doc.text(formatCurrency(total), 480, itemY + 3, { align: 'right', width: 55 });

      // Payment information
      itemY += 50;
      doc.fontSize(12)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('Payment Information', 50, itemY);

      itemY += 25;
      doc.fontSize(10)
        .fillColor(lightGray)
        .font('Helvetica')
        .text('Payment Method:', 50, itemY);
      doc.fillColor(darkGray)
        .text(booking.paymentMethod?.toUpperCase() || 'N/A', 200, itemY);

      itemY += 20;
      doc.fillColor(lightGray)
        .text('Payment Status:', 50, itemY);
      
      // Determine payment status
      let paymentStatus = 'PENDING';
      let statusColor = '#f59e0b';
      
      if (booking.status === 'confirmed' && booking.paymentConfirmedAt) {
        paymentStatus = 'PAID';
        statusColor = '#059669';
      } else if (booking.paymentMethod === 'bank_transfer') {
        paymentStatus = 'PENDING - Awaiting Bank Transfer';
      } else if (booking.paymentMethod === 'cash') {
        paymentStatus = 'PENDING - Pay at Hotel';
      } else if (booking.status === 'pending') {
        paymentStatus = 'PENDING VERIFICATION';
      }
      
      doc.fillColor(statusColor)
        .font('Helvetica-Bold')
        .text(paymentStatus, 200, itemY);

      itemY += 20;
      doc.fillColor(lightGray)
        .font('Helvetica')
        .text('Payment Date:', 50, itemY);
      doc.fillColor(darkGray)
        .text(formatDate(booking.paymentConfirmedAt || booking.updatedAt), 200, itemY);

      // Special requests if any
      if (booking.specialRequests) {
        itemY += 35;
        doc.fontSize(12)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text('Special Requests', 50, itemY);

        itemY += 25;
        doc.fontSize(10)
          .fillColor(darkGray)
          .font('Helvetica')
          .text(booking.specialRequests, 50, itemY, { width: 495 });
      }

      // Footer
      const footerY = 750;
      doc.fontSize(9)
        .fillColor(lightGray)
        .font('Helvetica')
        .text('Thank you for choosing Nonsa Travels!', 50, footerY, { align: 'center', width: 495 })
        .text('For support, contact us at support@nonsatravels.com', 50, footerY + 15, { align: 'center', width: 495 });

      doc.strokeColor(borderColor)
        .lineWidth(1)
        .moveTo(50, footerY - 10)
        .lineTo(545, footerY - 10)
        .stroke();

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate HTML invoice for email
 * @param {Object} booking - The booking object
 * @param {Object} hotel - The hotel object  
 * @returns {String} - HTML string
 */
export const generateInvoiceHTML = (booking, hotel) => {
  const invoiceNumber = booking.invoiceNumber || generateInvoiceNumber();
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const pricePerNight = booking.pricePerNight || (booking.totalPrice / nights);
  const subtotal = booking.totalPrice;
  const total = booking.totalPrice;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 20px; }
    .invoice-container { max-width: 800px; margin: 0 auto; background: white; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #2563eb; margin: 0 0 10px 0; font-size: 32px; }
    .company-info { color: #6b7280; font-size: 14px; }
    .invoice-details { text-align: right; }
    .invoice-details strong { color: #374151; }
    .section { margin: 30px 0; }
    .section-title { color: #2563eb; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .info-box h3 { color: #374151; font-size: 14px; margin: 0 0 10px 0; }
    .info-box p { margin: 5px 0; font-size: 14px; }
    .details-table { width: 100%; margin: 15px 0; }
    .details-table td { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .details-table td:first-child { color: #6b7280; width: 200px; }
    .breakdown-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .breakdown-table th { background: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #e5e7eb; }
    .breakdown-table td { padding: 12px; border: 1px solid #e5e7eb; }
    .breakdown-table .text-right { text-align: right; }
    .totals { margin: 20px 0; }
    .totals-row { display: flex; justify-content: flex-end; padding: 8px 0; }
    .totals-row label { width: 150px; color: #6b7280; }
    .totals-row value { width: 100px; text-align: right; }
    .total-row { background: #2563eb; color: white; padding: 15px; margin-top: 10px; font-size: 18px; font-weight: bold; }
    .total-row label { display: inline-block; width: 150px; }
    .paid-badge { background: #d1fae5; color: #047857; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
    .pending-badge { background: #fef3c7; color: #92400e; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 13px; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div style="display: flex; justify-content: space-between;">
        <div>
          <h1>INVOICE</h1>
          <div class="company-info">
            <strong>Nonsa Travels</strong><br>
            Premium Hotel Booking Service<br>
            Email: bookings@nonsatravels.com<br>
            Phone: +1 (555) 123-4567
          </div>
        </div>
        <div class="invoice-details">
          <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
          <p><strong>Date:</strong> ${formatDate(booking.paymentConfirmedAt || booking.updatedAt)}</p>
          <p><strong>Booking ID:</strong> ${booking._id.slice(-8).toUpperCase()}</p>
        </div>
      </div>
    </div>

    <!-- Bill To and Hotel Info -->
    <div class="info-grid">
      <div class="info-box">
        <h3>BILL TO:</h3>
        <p><strong>${booking.userName}</strong></p>
        <p>${booking.userEmail}</p>
        <p>${booking.userPhone || 'N/A'}</p>
      </div>
      <div class="info-box">
        <h3>HOTEL DETAILS:</h3>
        <p><strong>${hotel.name}</strong></p>
        <p>${hotel.location}</p>
        <p>${hotel.city}, ${hotel.country}</p>
      </div>
    </div>

    <!-- Booking Details -->
    <div class="section">
      <div class="section-title">Booking Details</div>
      <table class="details-table">
        <tr>
          <td>Check-in Date:</td>
          <td><strong>${formatDate(booking.checkInDate)}</strong></td>
        </tr>
        <tr>
          <td>Check-out Date:</td>
          <td><strong>${formatDate(booking.checkOutDate)}</strong></td>
        </tr>
        <tr>
          <td>Number of Nights:</td>
          <td><strong>${nights} ${nights === 1 ? 'night' : 'nights'}</strong></td>
        </tr>
        <tr>
          <td>Number of Guests:</td>
          <td><strong>${booking.guests}</strong></td>
        </tr>
        <tr>
          <td>Room Type:</td>
          <td><strong>${booking.roomPreferences || 'Standard'}</strong></td>
        </tr>
      </table>
    </div>

    <!-- Payment Breakdown -->
    <div class="section">
      <div class="section-title">Payment Breakdown</div>
      <table class="breakdown-table">
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Rate</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${hotel.name} - Room Booking</td>
            <td class="text-right">${nights}</td>
            <td class="text-right">${formatCurrency(pricePerNight)}</td>
            <td class="text-right">${formatCurrency(pricePerNight * nights)}</td>
          </tr>
          ${booking.referralDiscount && booking.referralDiscount.amount > 0 ? `
          <tr>
            <td style="color: #059669;">Discount (${booking.referralDiscount.code})</td>
            <td class="text-right">1</td>
            <td class="text-right" style="color: #059669;">-${formatCurrency(booking.referralDiscount.amount)}</td>
            <td class="text-right" style="color: #059669;">-${formatCurrency(booking.referralDiscount.amount)}</td>
          </tr>
          ` : ''}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <label>Subtotal:</label>
          <value>${formatCurrency(subtotal)}</value>
        </div>
        <div class="total-row">
          <label>TOTAL:</label>
          <span style="float: right;">${formatCurrency(total)}</span>
        </div>
      </div>
    </div>

    <!-- Payment Information -->
    <div class="section">
      <div class="section-title">Payment Information</div>
      <table class="details-table">
        <tr>
          <td>Payment Method:</td>
          <td><strong>${booking.paymentMethod?.toUpperCase() || 'N/A'}</strong></td>
        </tr>
        <tr>
          <td>Payment Status:</td>
          <td><span class="${booking.status === 'confirmed' && booking.paymentConfirmedAt ? 'paid-badge' : 'pending-badge'}">
            ${booking.status === 'confirmed' && booking.paymentConfirmedAt ? 'PAID' : 
              booking.paymentMethod === 'bank_transfer' ? 'PENDING - Awaiting Bank Transfer' : 
              booking.paymentMethod === 'cash' ? 'PENDING - Pay at Hotel' : 'PENDING VERIFICATION'}
          </span></td>
        </tr>
        <tr>
          <td>Payment Date:</td>
          <td><strong>${formatDate(booking.paymentConfirmedAt || booking.updatedAt)}</strong></td>
        </tr>
      </table>
    </div>

    ${booking.specialRequests ? `
    <!-- Special Requests -->
    <div class="section">
      <div class="section-title">Special Requests</div>
      <p>${booking.specialRequests}</p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p><strong>Thank you for choosing Nonsa Travels!</strong></p>
      <p>For support, contact us at support@nonsatravels.com</p>
    </div>
  </div>
</body>
</html>
  `;
};
