# Invoice Generation System - Implementation Guide

## Overview

The invoice generation system automatically creates professional PDF invoices when bookings are confirmed by the admin. Invoices can also be manually downloaded or emailed to customers.

---

## ✅ What Was Implemented

### **Backend Changes**

#### 1. **Invoice Generator Utility** (`server/src/utils/invoiceGenerator.js`)
- ✅ `generateInvoiceNumber()` - Creates unique invoice numbers (Format: INV-YYYYMMDD-XXXXX)
- ✅ `generateInvoicePDF()` - Creates professional PDF invoices using PDFKit
- ✅ `generateInvoiceHTML()` - Creates HTML version for email previews

**Features:**
- Professional layout with company branding
- Complete booking details (dates, guests, hotel info)
- Itemized payment breakdown
- Discount support (referral codes)
- Special requests display
- Payment status and method
- Formatted currency and dates

#### 2. **Booking Model Updates** (`server/src/models/Booking.js`)
Added new fields:
```javascript
invoiceNumber: String      // Unique invoice identifier
invoiceGeneratedAt: Date   // When invoice was created
```

#### 3. **Booking Controller Updates** (`server/src/controllers/bookingController.js`)
- ✅ **Automatic Invoice Generation**: When admin changes booking status to "confirmed", invoice is automatically generated and attached to confirmation email
- ✅ **Manual Download**: `GET /api/bookings/:id/invoice` - Download invoice PDF
- ✅ **Email Invoice**: `POST /api/bookings/:id/send-invoice` - Send invoice via email

#### 4. **Email Service Update** (`server/src/utils/emailService.js`)
- ✅ Added attachment support to `sendEmail()` function
- Now supports PDF attachments for invoices

#### 5. **Routes** (`server/src/routes/bookingRoutes.js`)
New endpoints:
```javascript
GET    /api/bookings/:id/invoice        // Download invoice PDF (User or Admin)
POST   /api/bookings/:id/send-invoice   // Send invoice via email (Admin only)
```

---

### **Frontend Changes**

#### 1. **Admin Dashboard Updates** (`client/src/pages/AdminDashboard.jsx`)

**New Invoice Functions:**
- ✅ `handleDownloadInvoice()` - Downloads invoice PDF to admin's computer  
- ✅ `handleSendInvoice()` - Sends invoice to customer via email

**Updated BookingCard Component:**
Added invoice action buttons for confirmed and completed bookings:
- 📥 **Download Invoice** - Downloads PDF invoice
- 📧 **Send Invoice via Email** - Emails invoice to customer

**New Icons Added:**
- `faFileInvoice` - Invoice icon
- `faEnvelope` - Email icon
- `faDownload` - Download icon

---

## 🚀 How It Works

### **Automatic Invoice Generation Flow:**

1. **Customer makes booking** → Status: `pending_payment`
2. **Admin confirms payment** → Status: `payment_confirmed`
3. **Admin confirms booking** → Status: `confirmed`
   - ✅ Invoice number automatically generated
   - ✅ PDF invoice created
   - ✅ Invoice attached to confirmation email
   - ✅ Customer receives email with invoice PDF attachment

### **Manual Invoice Operations:**

#### **Download Invoice (Admin/User)**
```
Admin Dashboard → Booking → Actions → "Download Invoice"
```
- Opens/downloads PDF invoice
- Works for confirmed and completed bookings
- Users can also download their own invoices from their bookings page

#### **Send Invoice via Email (Admin Only)**
```
Admin Dashboard → Booking → Actions → "Send Invoice via Email"
```
- Sends invoice to customer's email
- Includes PDF attachment
- Confirmation message shows recipient email

---

## 📋 Invoice Contents

Each invoice includes:

### Header Section:
- Company name and contact info (Nonsa Travels)
- Invoice number (e.g., INV-20260208-12345)
- Invoice date
- Booking ID

### Customer & Hotel Info:
- **Bill To:** Customer name, email, phone
- **Hotel Details:** Hotel name, location, city/country

### Booking Details:
- Check-in date
- Check-out date
- Number of nights
- Number of guests
- Room type/preferences

### Payment Breakdown:
- Itemized charges (price per night × number of nights)
- Discounts (if any referral code applied)
- Subtotal
- Tax (if applicable)
- **Total Amount**

### Payment Information:
- Payment method
- Payment status (PAID)
- Payment date

### Special Requests:
- Any special requests from customer

---

## 🔧 Configuration

### Required Environment Variables

**Server** (`/server/.env`):
```env
# Email service must be configured for invoice delivery
RESEND_API_KEY=your_resend_api_key

# Company details (used in invoices)
EMAIL_FROM=Nonsa Travels <bookings@nonsatravels.com>
REPLY_TO_EMAIL=support@nonsatravels.com
```

### Required Packages

Already installed:
- `pdfkit` - PDF generation
- `axios` - HTTP requests (for OAuth)

---

## 📱 Admin Interface

### Invoice Actions Available:

**For CONFIRMED Bookings:**
- 📥 Download Invoice
- 📧 Send Invoice via Email
- ✅ Mark as Completed
- ❌ Cancel Booking

**For COMPLETED Bookings:**
- 📥 Download Invoice
- 📧 Send Invoice via Email
- 🗑️ Delete Booking

---

## 🔐 Security & Authorization

### Download Invoice (`GET /api/bookings/:id/invoice`)
- ✅ User must be logged in
- ✅ User must own the booking OR be admin
- ✅ Booking must be confirmed, payment_confirmed, or completed

### Send Invoice (`POST /api/bookings/:id/send-invoice`)
- ✅ Admin access only
- ✅ Booking must be confirmed or completed

---

## 🧪 Testing the Invoice System

### Test Automatic Generation:

1. **Create a test booking**
2. **Admin Dashboard** → Find the booking
3. **Actions** → "Confirm Payment Received"
4. **Actions** → "Confirm Booking"
5. ✅ Check customer email - should receive confirmation with invoice PDF attached

### Test Manual Download:

1. **Admin Dashboard** → Find a confirmed booking
2. **Actions** → "Download Invoice"
3. ✅ PDF should download automatically

### Test Email Invoice:

1. **Admin Dashboard** → Find a confirmed booking
2. **Actions** → "Send Invoice via Email"
3. ✅ Confirmation toast shows email address
4. ✅ Check customer email inbox

---

## 📄 Invoice Number Format

```
INV-[YYYYMMDD]-[XXXXX]

Example: INV-20260208-45123
```

- **YYYY**: Year
- **MM**: Month
- **DD**: Day
- **XXXXX**: 5-digit random number (ensures uniqueness)

---

## 🎨 Invoice Design

The PDF invoice features:
- ✅ Professional business layout
- ✅ Company branding and colors
- ✅ Clean typography
- ✅ Clear section divisions
- ✅ Responsive tables
- ✅ Color-coded status indicators
- ✅ Footer with support information

---

## 🐛 Troubleshooting

### Invoice Not Generating:
- **Check:** Booking status must be "confirmed"
- **Check:** Hotel data must be populated (`populate('hotelId')`)
- **Check:** PDFKit package installed: `npm list pdfkit`

### PDF Download Issues:
- **Check:** Browser popup blocker settings
- **Check:** Authorization token is valid
- **Check:** Booking belongs to user or user is admin

### Email Not Sending:
- **Check:** `RESEND_API_KEY` is configured in server `.env`
- **Check:** Email service is not disabled (`SKIP_EMAILS !== 'true'`)
- **Check:** Check server logs for email errors

---

## 📊 Database Changes

Run the server to automatically apply schema changes:
```bash
cd server
npm run dev
```

The Booking model will now include:
- `invoiceNumber` (String, unique, sparse)
- `invoiceGeneratedAt` (Date)

Existing bookings: These fields will be `null` until an invoice is generated.

---

## 🚀 Usage Summary

### For Customers:
1. Make a booking
2. Complete payment
3. Receive booking confirmation email **with invoice PDF attached**
4. Can also download invoice from "My Bookings" page

### For Admins:
1. Confirm bookings → Invoice automatically generated and emailed
2. Can manually download invoices anytime
3. Can resend invoices to customers
4. Invoice status shown in booking details

---

## ✨ Benefits

- ✅ **Professional** - Well-designed, branded invoices
- ✅ **Automatic** - No manual work required
- ✅ **Convenient** - Download or email on demand
- ✅ **Secure** - Proper authorization checks
- ✅ **Reliable** - Unique invoice numbers
- ✅ **Compliant** - Proper invoice format for record-keeping

---

## 📞 Support

If you encounter any issues with the invoice system:
- Check server logs for errors
- Verify all environment variables are set
- Ensure PDFKit is installed
- Test with a confirmed booking first

---

**Invoice System Status: ✅ Fully Operational**

The system is ready to generate, download, and email professional invoices for all confirmed bookings!
