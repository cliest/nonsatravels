import dotenv from 'dotenv';
import prisma from './src/lib/prisma.js';

dotenv.config();

const cannedResponses = [
  { title: 'Welcome Greeting', message: 'Hello! Welcome to Nonsa Travels. How can I assist you with your booking today?', category: 'greeting', shortcut: '/hello', isActive: true, createdBy: 'system' },
  { title: 'Checking Booking', message: 'Let me check that booking for you. Please give me a moment...', category: 'booking', shortcut: '/check', isActive: true, createdBy: 'system' },
  { title: 'Availability Check', message: "I'll check the availability for those dates right away. One moment please.", category: 'booking', shortcut: '/avail', isActive: true, createdBy: 'system' },
  { title: 'Payment Inquiry', message: "For payment inquiries, we accept all major credit cards and Flutterwave payments. Is there a specific payment method you'd like to use?", category: 'payment', shortcut: '/payment', isActive: true, createdBy: 'system' },
  { title: 'Cancellation Policy', message: 'Our cancellation policy allows free cancellation up to 48 hours before check-in. Would you like me to send you the full policy details?', category: 'policy', shortcut: '/cancel', isActive: true, createdBy: 'system' },
  { title: 'Need More Info', message: 'To better assist you, could you please provide me with your booking reference number or email address?', category: 'faq', shortcut: '/info', isActive: true, createdBy: 'system' },
  { title: 'Contact Details', message: "You can reach us at support@nonsatravels.com or call us at +234 XXX XXX XXXX. We're available 24/7 to help!", category: 'faq', shortcut: '/contact', isActive: true, createdBy: 'system' },
  { title: 'Anything Else', message: 'Is there anything else I can help you with today?', category: 'closing', shortcut: '/else', isActive: true, createdBy: 'system' },
  { title: 'Thank You', message: 'Thank you for choosing Nonsa Travels! Have a wonderful day and a great stay!', category: 'closing', shortcut: '/thanks', isActive: true, createdBy: 'system' },
  { title: 'Transfer to Team', message: 'I understand your concern. Let me transfer you to our specialized team who can better assist you with this matter.', category: 'other', shortcut: '/transfer', isActive: true, createdBy: 'system' },
  { title: 'Technical Issue', message: "I apologize for the technical issue you're experiencing. Our IT team has been notified and is working to resolve it. Can I help you with anything else in the meantime?", category: 'other', shortcut: '/tech', isActive: true, createdBy: 'system' },
  { title: 'Special Request', message: "We'd be happy to accommodate your special request. Let me note that down and ensure it's arranged for your stay.", category: 'booking', shortcut: '/special', isActive: true, createdBy: 'system' },
];

async function seedCannedResponses() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL');

    await prisma.cannedResponse.deleteMany();
    console.log('Cleared existing canned responses');

    await prisma.cannedResponse.createMany({ data: cannedResponses });
    console.log(`Inserted ${cannedResponses.length} canned responses`);
    console.log('Canned responses seeded successfully!');
  } catch (error) {
    console.error('Error seeding canned responses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCannedResponses();
