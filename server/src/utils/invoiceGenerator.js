import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');

export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `INV-${year}${month}${day}-${random}`;
};

const calculateNights = (checkIn, checkOut) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((new Date(checkOut) - new Date(checkIn)) / oneDay));
};

const fmt = (amount) => `$${Number(amount).toFixed(2)}`;

const fmtDate = (date) => new Date(date).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric',
});

export const generateInvoicePDF = async (booking, hotel) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const blue = '#2b3990';
      const orange = '#ffa500';
      const dark = '#1e293b';
      const gray = '#64748b';
      const lightBg = '#f8fafc';
      const border = '#e2e8f0';

      const invoiceNumber = booking.invoiceNumber || generateInvoiceNumber();
      const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
      const pricePerNight = booking.pricePerNight || (booking.totalPrice / nights);
      const isPaid = booking.status === 'confirmed' || booking.status === 'completed' || booking.paymentConfirmedAt;

      let y = 40;

      // ── Header with logo ──
      const hasLogo = fs.existsSync(LOGO_PATH);
      if (hasLogo) {
        doc.image(LOGO_PATH, 50, y, { width: 80, height: 80 });
      } else {
        doc.fontSize(24).fillColor(blue).font('Helvetica-Bold')
          .text('Nonsa Travels', 50, y + 20);
      }

      // Invoice details - right side
      doc.fontSize(28).fillColor(blue).font('Helvetica-Bold')
        .text('INVOICE', 400, y + 5, { align: 'right', width: 145 });
      doc.fontSize(9).fillColor(gray).font('Helvetica')
        .text(`Invoice #: ${invoiceNumber}`, 350, y + 40, { align: 'right', width: 195 })
        .text(`Date: ${fmtDate(booking.createdAt || new Date())}`, 350, y + 53, { align: 'right', width: 195 })
        .text(`Booking ID: ${String(booking._id || booking.id).slice(-8).toUpperCase()}`, 350, y + 66, { align: 'right', width: 195 });

      y += 90;

      // Orange accent line
      doc.rect(50, y, 495, 3).fill(orange);
      y += 15;

      // ── Status badge ──
      const statusBg = isPaid ? '#dcfce7' : '#fef9c3';
      const statusColor = isPaid ? '#166534' : '#854d0e';
      const statusText = isPaid ? 'PAID' : 'PENDING PAYMENT';
      doc.roundedRect(50, y, 100, 22, 11).fill(statusBg);
      doc.fontSize(9).fillColor(statusColor).font('Helvetica-Bold')
        .text(statusText, 50, y + 6, { width: 100, align: 'center' });
      y += 35;

      // ── Bill To & Hotel Details side by side ──
      doc.fontSize(9).fillColor(blue).font('Helvetica-Bold').text('BILL TO', 50, y);
      doc.fontSize(9).fillColor(blue).font('Helvetica-Bold').text('HOTEL DETAILS', 320, y);
      y += 16;

      doc.fontSize(11).fillColor(dark).font('Helvetica-Bold').text(booking.userName, 50, y);
      doc.fontSize(11).fillColor(dark).font('Helvetica-Bold').text(hotel.name, 320, y);
      y += 15;
      doc.fontSize(9).fillColor(gray).font('Helvetica')
        .text(booking.userEmail, 50, y)
        .text(hotel.address || '', 320, y);
      y += 13;
      doc.text(booking.userPhone || 'N/A', 50, y)
        .text(`${hotel.city || ''}, Zambia`, 320, y);
      if (hotel.contact) {
        y += 13;
        doc.text('', 50, y).text(`Tel: ${hotel.contact}`, 320, y);
      }

      y += 30;

      // ── Booking Details box ──
      doc.rect(50, y, 495, 25).fill(blue);
      doc.fontSize(11).fillColor('white').font('Helvetica-Bold')
        .text('BOOKING DETAILS', 60, y + 7);
      y += 30;

      const detailRows = [
        ['Check-in Date', fmtDate(booking.checkInDate)],
        ['Check-out Date', fmtDate(booking.checkOutDate)],
        ['Number of Nights', `${nights} night${nights !== 1 ? 's' : ''}`],
        ['Number of Guests/Rooms', String(booking.guests)],
        ['Room Type', booking.roomTypeName || booking.roomPreferences || 'Standard'],
      ];

      if (booking.paymentMethod) {
        detailRows.push(['Payment Method', booking.paymentMethod.toUpperCase().replace('_', ' ')]);
      }

      detailRows.forEach(([label, value], i) => {
        const rowBg = i % 2 === 0 ? lightBg : '#ffffff';
        doc.rect(50, y, 495, 22).fill(rowBg);
        doc.fontSize(9).fillColor(gray).font('Helvetica').text(label, 60, y + 6);
        doc.fontSize(9).fillColor(dark).font('Helvetica-Bold').text(value, 280, y + 6, { width: 255, align: 'right' });
        y += 22;
      });

      y += 15;

      // ── Pricing Table ──
      doc.rect(50, y, 495, 25).fill(blue);
      doc.fontSize(9).fillColor('white').font('Helvetica-Bold')
        .text('DESCRIPTION', 60, y + 8)
        .text('QTY', 320, y + 8)
        .text('RATE', 380, y + 8)
        .text('AMOUNT', 445, y + 8, { width: 90, align: 'right' });
      y += 30;

      // Room charges
      doc.rect(50, y, 495, 22).fill(lightBg);
      doc.fontSize(9).fillColor(dark).font('Helvetica')
        .text(`${hotel.name} - Room`, 60, y + 6)
        .text(String(nights), 320, y + 6)
        .text(fmt(pricePerNight), 380, y + 6)
        .text(fmt(pricePerNight * nights), 445, y + 6, { width: 90, align: 'right' });
      y += 22;

      // Additional services
      const services = Array.isArray(booking.additionalServices) ? booking.additionalServices : [];
      const serviceLabels = {
        airportTransfer: 'Airport Transfer',
        earlyCheckIn: 'Early Check-in',
        lateCheckOut: 'Late Check-out',
        extraBed: 'Extra Bed',
        breakfast: 'Daily Breakfast',
      };
      services.forEach((svc, i) => {
        const bg = (i + 1) % 2 === 0 ? lightBg : '#ffffff';
        doc.rect(50, y, 495, 22).fill(bg);
        doc.fontSize(9).fillColor(dark).font('Helvetica')
          .text(serviceLabels[svc.name] || svc.name, 60, y + 6)
          .text('1', 320, y + 6)
          .text(fmt(svc.cost), 380, y + 6)
          .text(fmt(svc.cost), 445, y + 6, { width: 90, align: 'right' });
        y += 22;
      });

      // Referral discount
      if (booking.referralDiscount && booking.referralDiscount.amount > 0) {
        doc.rect(50, y, 495, 22).fill('#ffffff');
        doc.fontSize(9).fillColor('#059669').font('Helvetica')
          .text(`Referral Discount (${booking.referralDiscount.code})`, 60, y + 6)
          .text('1', 320, y + 6)
          .text(`-${fmt(booking.referralDiscount.amount)}`, 380, y + 6)
          .text(`-${fmt(booking.referralDiscount.amount)}`, 445, y + 6, { width: 90, align: 'right' });
        y += 22;
      }

      // Promo discount
      if (booking.promoCode && booking.promoDiscount > 0) {
        doc.rect(50, y, 495, 22).fill(lightBg);
        doc.fontSize(9).fillColor('#059669').font('Helvetica')
          .text(`Promo Code (${booking.promoCode})`, 60, y + 6)
          .text('1', 320, y + 6)
          .text(`-${fmt(booking.promoDiscount)}`, 380, y + 6)
          .text(`-${fmt(booking.promoDiscount)}`, 445, y + 6, { width: 90, align: 'right' });
        y += 22;
      }

      y += 5;

      // Subtotal line
      doc.strokeColor(border).lineWidth(1).moveTo(320, y).lineTo(545, y).stroke();
      y += 10;

      doc.fontSize(9).fillColor(gray).font('Helvetica').text('Subtotal:', 320, y);
      doc.fillColor(dark).font('Helvetica-Bold').text(fmt(booking.totalPrice), 445, y, { width: 90, align: 'right' });
      y += 18;

      doc.fillColor(gray).font('Helvetica').text('Tax:', 320, y);
      doc.fillColor(dark).font('Helvetica-Bold').text('$0.00', 445, y, { width: 90, align: 'right' });
      y += 20;

      // Total box
      doc.rect(320, y, 225, 35).fill(blue);
      doc.fontSize(13).fillColor('white').font('Helvetica-Bold')
        .text('TOTAL DUE:', 330, y + 10)
        .text(fmt(booking.totalPrice), 445, y + 10, { width: 90, align: 'right' });
      y += 50;

      // ── Payment info ──
      if (isPaid) {
        doc.rect(50, y, 495, 30).fill('#dcfce7');
        doc.fontSize(10).fillColor('#166534').font('Helvetica-Bold')
          .text(`PAYMENT RECEIVED — ${fmtDate(booking.paymentConfirmedAt || booking.updatedAt)}`, 60, y + 9);
        y += 40;
      } else {
        doc.rect(50, y, 495, 30).fill('#fef9c3');
        doc.fontSize(10).fillColor('#854d0e').font('Helvetica-Bold')
          .text('PAYMENT PENDING — Please complete payment using the link sent to your email.', 60, y + 9);
        y += 40;
      }

      // ── Special Requests ──
      if (booking.specialRequests) {
        doc.fontSize(9).fillColor(blue).font('Helvetica-Bold').text('SPECIAL REQUESTS', 50, y);
        y += 14;
        doc.fontSize(9).fillColor(dark).font('Helvetica').text(booking.specialRequests, 50, y, { width: 495 });
        y += 25;
      }

      // ── Footer ──
      const footerY = 750;
      doc.strokeColor(orange).lineWidth(2).moveTo(50, footerY - 15).lineTo(545, footerY - 15).stroke();

      doc.fontSize(10).fillColor(blue).font('Helvetica-Bold')
        .text('Thank you for choosing Nonsa Travels!', 50, footerY, { align: 'center', width: 495 });
      doc.fontSize(8).fillColor(gray).font('Helvetica')
        .text('For support, contact us at support@nonsatravels.com or call +260 970 462 777', 50, footerY + 15, { align: 'center', width: 495 })
        .text('Kwacha Street, Chingola, Zambia  |  www.nonsatravels.com', 50, footerY + 28, { align: 'center', width: 495 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const generateInvoiceHTML = (booking, hotel) => {
  const invoiceNumber = booking.invoiceNumber || generateInvoiceNumber();
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const pricePerNight = booking.pricePerNight || (booking.totalPrice / nights);
  const isPaid = booking.status === 'confirmed' || booking.status === 'completed' || booking.paymentConfirmedAt;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${invoiceNumber}</title></head><body style="font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:20px;">
<div style="max-width:800px;margin:0 auto;background:white;">
  <div style="border-bottom:3px solid #ffa500;padding-bottom:20px;margin-bottom:20px;">
    <table width="100%"><tr>
      <td><h1 style="color:#2b3990;margin:0;">Nonsa Travels</h1><p style="color:#64748b;margin:5px 0;font-size:13px;">Premium Hotel Booking Service<br>Kwacha Street, Chingola, Zambia<br>+260 970 462 777 | info@nonsatravels.com</p></td>
      <td style="text-align:right;"><h2 style="color:#2b3990;margin:0;">INVOICE</h2><p style="font-size:13px;color:#64748b;">Invoice #: ${invoiceNumber}<br>Date: ${fmtDate(booking.createdAt || new Date())}<br>Booking ID: ${String(booking._id || booking.id).slice(-8).toUpperCase()}</p></td>
    </tr></table>
  </div>
  <div style="display:inline-block;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:bold;background:${isPaid ? '#dcfce7' : '#fef9c3'};color:${isPaid ? '#166534' : '#854d0e'};">${isPaid ? 'PAID' : 'PENDING PAYMENT'}</div>
  <table width="100%" style="margin:20px 0;"><tr>
    <td style="vertical-align:top;width:50%;"><strong style="color:#2b3990;font-size:12px;">BILL TO</strong><br><strong>${booking.userName}</strong><br><span style="color:#64748b;font-size:13px;">${booking.userEmail}<br>${booking.userPhone || 'N/A'}</span></td>
    <td style="vertical-align:top;width:50%;"><strong style="color:#2b3990;font-size:12px;">HOTEL DETAILS</strong><br><strong>${hotel.name}</strong><br><span style="color:#64748b;font-size:13px;">${hotel.address || ''}<br>${hotel.city || ''}, Zambia</span></td>
  </tr></table>
  <table width="100%" style="border-collapse:collapse;margin:20px 0;">
    <tr style="background:#2b3990;color:white;"><td style="padding:8px 12px;font-size:12px;" colspan="4"><strong>BOOKING DETAILS</strong></td></tr>
    <tr style="background:#f8fafc;"><td style="padding:6px 12px;color:#64748b;font-size:12px;">Check-in</td><td style="padding:6px 12px;text-align:right;font-weight:bold;font-size:12px;" colspan="3">${fmtDate(booking.checkInDate)}</td></tr>
    <tr><td style="padding:6px 12px;color:#64748b;font-size:12px;">Check-out</td><td style="padding:6px 12px;text-align:right;font-weight:bold;font-size:12px;" colspan="3">${fmtDate(booking.checkOutDate)}</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:6px 12px;color:#64748b;font-size:12px;">Nights</td><td style="padding:6px 12px;text-align:right;font-weight:bold;font-size:12px;" colspan="3">${nights}</td></tr>
    <tr><td style="padding:6px 12px;color:#64748b;font-size:12px;">Guests/Rooms</td><td style="padding:6px 12px;text-align:right;font-weight:bold;font-size:12px;" colspan="3">${booking.guests}</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:6px 12px;color:#64748b;font-size:12px;">Room Type</td><td style="padding:6px 12px;text-align:right;font-weight:bold;font-size:12px;" colspan="3">${booking.roomTypeName || booking.roomPreferences || 'Standard'}</td></tr>
  </table>
  <table width="100%" style="border-collapse:collapse;">
    <tr style="background:#2b3990;color:white;font-size:12px;"><th style="padding:8px 12px;text-align:left;">Description</th><th style="padding:8px;text-align:center;">Qty</th><th style="padding:8px;text-align:right;">Rate</th><th style="padding:8px 12px;text-align:right;">Amount</th></tr>
    <tr style="background:#f8fafc;font-size:12px;"><td style="padding:8px 12px;">${hotel.name} - Room</td><td style="padding:8px;text-align:center;">${nights}</td><td style="padding:8px;text-align:right;">${fmt(pricePerNight)}</td><td style="padding:8px 12px;text-align:right;">${fmt(pricePerNight * nights)}</td></tr>
    ${booking.promoCode && booking.promoDiscount > 0 ? `<tr style="font-size:12px;color:#059669;"><td style="padding:8px 12px;">Promo (${booking.promoCode})</td><td style="padding:8px;text-align:center;">1</td><td style="padding:8px;text-align:right;">-${fmt(booking.promoDiscount)}</td><td style="padding:8px 12px;text-align:right;">-${fmt(booking.promoDiscount)}</td></tr>` : ''}
  </table>
  <div style="text-align:right;margin-top:15px;">
    <p style="font-size:13px;color:#64748b;">Subtotal: <strong style="color:#1e293b;">${fmt(booking.totalPrice)}</strong></p>
    <div style="background:#2b3990;color:white;display:inline-block;padding:10px 30px;border-radius:8px;margin-top:5px;"><strong style="font-size:16px;">TOTAL: ${fmt(booking.totalPrice)}</strong></div>
  </div>
  <div style="margin-top:30px;padding-top:15px;border-top:2px solid #ffa500;text-align:center;">
    <p style="color:#2b3990;font-weight:bold;">Thank you for choosing Nonsa Travels!</p>
    <p style="color:#64748b;font-size:12px;">support@nonsatravels.com | +260 970 462 777 | www.nonsatravels.com</p>
  </div>
</div></body></html>`;
};
