import dotenv from 'dotenv';
import prisma from './lib/prisma.js';

dotenv.config();

// Sample hotel data — Hotels from all provinces of Zambia
// Note: location (GeoJSON) removed as it is not in the Prisma schema
const hotelsRaw = [
  // LUSAKA PROVINCE
  { name: "Lusaka Grand Hotel", address: "Cairo Road, City Centre", city: "Lusaka", contact: "+260211234567", roomType: "Deluxe Suite", pricePerNight: 299, rating: 4.8, amenities: ["Free WiFi", "Free Breakfast", "Pool Access", "Room Service"], images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", "https://images.unsplash.com/photo-1590490360182-c33d57733427", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"], isAvailable: true, isFeatured: true },
  { name: "Kafue Heights Lodge", address: "Kafue Road, Chilanga", city: "Kafue", contact: "+260211445566", roomType: "Double Bed", pricePerNight: 179, rating: 4.4, amenities: ["Free WiFi", "Free Breakfast", "Garden View"], images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", "https://images.unsplash.com/photo-1618773928121-c32242e63f39", "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304"], isAvailable: true, isFeatured: false },
  // SOUTHERN PROVINCE
  { name: "Victoria Falls Royal Lodge", address: "Mosi-oa-Tunya Road, Near The Falls", city: "Livingstone", contact: "+260213320567", roomType: "Presidential Suite", pricePerNight: 399, rating: 4.9, amenities: ["Free WiFi", "Pool Access", "Waterfall View", "Room Service"], images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1559599238-5e5a70e3e3b5"], isAvailable: true, isFeatured: true },
  { name: "Choma Executive Inn", address: "Great South Road, Town Centre", city: "Choma", contact: "+260213260789", roomType: "Single Bed", pricePerNight: 129, rating: 4.3, amenities: ["Free WiFi", "Free Breakfast", "Parking"], images: ["https://images.unsplash.com/photo-1609766768276-4fe1c0e05e59", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", "https://images.unsplash.com/photo-1445019980597-93fa8acb246c"], isAvailable: true, isFeatured: false },
  { name: "Mazabuka Suites", address: "Main Street, Central", city: "Mazabuka", contact: "+260213230456", roomType: "Double Bed", pricePerNight: 139, rating: 4.2, amenities: ["Free WiFi", "Room Service", "AC"], images: ["https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e", "https://images.unsplash.com/photo-1631049035410-0a1d7c028e58", "https://images.unsplash.com/photo-1578898889090-c50cfc516ec3", "https://images.unsplash.com/photo-1540518614846-7eded433c457"], isAvailable: true, isFeatured: false },
  // COPPERBELT PROVINCE
  { name: "Ndola Business Inn", address: "President Avenue, Copperbelt", city: "Ndola", contact: "+260212612345", roomType: "Double Bed", pricePerNight: 199, rating: 4.5, amenities: ["Free WiFi", "Free Breakfast", "Room Service"], images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", "https://images.unsplash.com/photo-1618773928121-c32242e63f39", "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304"], isAvailable: true, isFeatured: true },
  { name: "Kitwe Platinum Lodge", address: "Freedom Avenue, Mining District", city: "Kitwe", contact: "+260212220456", roomType: "Deluxe Suite", pricePerNight: 189, rating: 4.6, amenities: ["Free WiFi", "Garden View", "Free Breakfast", "Pool Access"], images: ["https://images.unsplash.com/photo-1609766768276-4fe1c0e05e59", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", "https://images.unsplash.com/photo-1445019980597-93fa8acb246c"], isAvailable: true, isFeatured: true },
  { name: "Chingola Copper Inn", address: "Kasompe Road, Central", city: "Chingola", contact: "+260212311234", roomType: "Single Bed", pricePerNight: 159, rating: 4.4, amenities: ["Free WiFi", "Free Breakfast", "Parking"], images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", "https://images.unsplash.com/photo-1590490360182-c33d57733427", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"], isAvailable: true, isFeatured: false },
  { name: "Mufulira Palace Hotel", address: "Independence Avenue", city: "Mufulira", contact: "+260212550789", roomType: "Double Bed", pricePerNight: 169, rating: 4.3, amenities: ["Free WiFi", "Room Service", "Restaurant"], images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1559599238-5e5a70e3e3b5"], isAvailable: true, isFeatured: false },
  { name: "Luanshya Comfort Lodge", address: "Fisenge Road", city: "Luanshya", contact: "+260212510456", roomType: "Single Bed", pricePerNight: 149, rating: 4.2, amenities: ["Free WiFi", "Free Breakfast"], images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", "https://images.unsplash.com/photo-1618773928121-c32242e63f39", "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304"], isAvailable: true, isFeatured: false },
  // EASTERN PROVINCE
  { name: "Chipata Gateway Hotel", address: "Great East Road, Eastern Province", city: "Chipata", contact: "+260216221234", roomType: "Deluxe Suite", pricePerNight: 249, rating: 4.7, amenities: ["Free WiFi", "Pool Access", "Room Service", "Free Breakfast"], images: ["https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e", "https://images.unsplash.com/photo-1631049035410-0a1d7c028e58", "https://images.unsplash.com/photo-1578898889090-c50cfc516ec3", "https://images.unsplash.com/photo-1540518614846-7eded433c457"], isAvailable: true, isFeatured: true },
  { name: "Katete Valley Inn", address: "Main Road, Town Centre", city: "Katete", contact: "+260216240567", roomType: "Double Bed", pricePerNight: 139, rating: 4.3, amenities: ["Free WiFi", "Free Breakfast", "Garden View"], images: ["https://images.unsplash.com/photo-1609766768276-4fe1c0e05e59", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", "https://images.unsplash.com/photo-1445019980597-93fa8acb246c"], isAvailable: true, isFeatured: false },
  { name: "Lundazi Rock View Hotel", address: "Castle Road", city: "Lundazi", contact: "+260216280345", roomType: "Single Bed", pricePerNight: 129, rating: 4.1, amenities: ["Free WiFi", "Scenic View", "Parking"], images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", "https://images.unsplash.com/photo-1590490360182-c33d57733427", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"], isAvailable: true, isFeatured: false },
  // NORTHERN PROVINCE
  { name: "Kasama Executive Lodge", address: "Freedom Avenue, Town Centre", city: "Kasama", contact: "+260214221567", roomType: "Family Suite", pricePerNight: 219, rating: 4.6, amenities: ["Free WiFi", "Free Breakfast", "Pool Access", "Room Service"], images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1559599238-5e5a70e3e3b5"], isAvailable: true, isFeatured: true },
  { name: "Mbala Heights Hotel", address: "Lake Road, Near Lake Tanganyika", city: "Mbala", contact: "+260214250678", roomType: "Double Bed", pricePerNight: 169, rating: 4.4, amenities: ["Free WiFi", "Lake View", "Restaurant"], images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", "https://images.unsplash.com/photo-1618773928121-c32242e63f39", "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304"], isAvailable: true, isFeatured: false },
  // LUAPULA PROVINCE
  { name: "Mansa Lakeside Resort", address: "Lake Bangweulu Road", city: "Mansa", contact: "+260214821234", roomType: "Deluxe Suite", pricePerNight: 239, rating: 4.7, amenities: ["Free WiFi", "Lake View", "Pool Access", "Free Breakfast"], images: ["https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e", "https://images.unsplash.com/photo-1631049035410-0a1d7c028e58", "https://images.unsplash.com/photo-1578898889090-c50cfc516ec3", "https://images.unsplash.com/photo-1540518614846-7eded433c457"], isAvailable: true, isFeatured: true },
  { name: "Nchelenge Fisherman's Inn", address: "Lake Road, Mweru Waterfront", city: "Nchelenge", contact: "+260214860456", roomType: "Single Bed", pricePerNight: 119, rating: 4.0, amenities: ["Free WiFi", "Lake View", "Restaurant"], images: ["https://images.unsplash.com/photo-1609766768276-4fe1c0e05e59", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", "https://images.unsplash.com/photo-1445019980597-93fa8acb246c"], isAvailable: true, isFeatured: false },
  // WESTERN PROVINCE
  { name: "Mongu Zambezi Lodge", address: "Lealui Road, Near Barotse Floodplain", city: "Mongu", contact: "+260217221789", roomType: "Family Suite", pricePerNight: 229, rating: 4.6, amenities: ["Free WiFi", "River View", "Pool Access", "Room Service"], images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", "https://images.unsplash.com/photo-1590490360182-c33d57733427", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"], isAvailable: true, isFeatured: true },
  { name: "Senanga River View Inn", address: "Main Street", city: "Senanga", contact: "+260217260345", roomType: "Double Bed", pricePerNight: 149, rating: 4.2, amenities: ["Free WiFi", "River View", "Restaurant"], images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1559599238-5e5a70e3e3b5"], isAvailable: true, isFeatured: false },
  // NORTH-WESTERN PROVINCE
  { name: "Solwezi Mining City Hotel", address: "Independence Avenue", city: "Solwezi", contact: "+260218821456", roomType: "Deluxe Suite", pricePerNight: 259, rating: 4.7, amenities: ["Free WiFi", "Free Breakfast", "Pool Access", "Gym"], images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", "https://images.unsplash.com/photo-1618773928121-c32242e63f39", "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304"], isAvailable: true, isFeatured: true },
  { name: "Mwinilunga Forest Lodge", address: "Zambezi Source Road", city: "Mwinilunga", contact: "+260218881234", roomType: "Double Bed", pricePerNight: 159, rating: 4.3, amenities: ["Free WiFi", "Nature View", "Free Breakfast"], images: ["https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e", "https://images.unsplash.com/photo-1631049035410-0a1d7c028e58", "https://images.unsplash.com/photo-1578898889090-c50cfc516ec3", "https://images.unsplash.com/photo-1540518614846-7eded433c457"], isAvailable: true, isFeatured: false },
  { name: "Zambezi Town Inn", address: "Main Road, Border Town", city: "Zambezi", contact: "+260218910567", roomType: "Single Bed", pricePerNight: 139, rating: 4.1, amenities: ["Free WiFi", "Parking", "Restaurant"], images: ["https://images.unsplash.com/photo-1609766768276-4fe1c0e05e59", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", "https://images.unsplash.com/photo-1445019980597-93fa8acb246c"], isAvailable: true, isFeatured: false },
  // CENTRAL PROVINCE
  { name: "Kabwe Executive Suites", address: "Independence Avenue, Town Centre", city: "Kabwe", contact: "+260215221890", roomType: "Family Suite", pricePerNight: 209, rating: 4.5, amenities: ["Free WiFi", "Free Breakfast", "Pool Access", "Room Service"], images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", "https://images.unsplash.com/photo-1590490360182-c33d57733427", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"], isAvailable: true, isFeatured: true },
  { name: "Mkushi Safari Lodge", address: "Great North Road", city: "Mkushi", contact: "+260215340678", roomType: "Double Bed", pricePerNight: 179, rating: 4.4, amenities: ["Free WiFi", "Wildlife View", "Restaurant"], images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1559599238-5e5a70e3e3b5"], isAvailable: true, isFeatured: false },
  { name: "Serenje Stopover Inn", address: "Tazara Highway", city: "Serenje", contact: "+260215380456", roomType: "Single Bed", pricePerNight: 129, rating: 4.2, amenities: ["Free WiFi", "Free Breakfast", "Parking"], images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", "https://images.unsplash.com/photo-1618773928121-c32242e63f39", "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304"], isAvailable: true, isFeatured: false },
  // MUCHINGA PROVINCE
  { name: "Chinsali Highland Hotel", address: "Great North Road", city: "Chinsali", contact: "+260214370234", roomType: "Double Bed", pricePerNight: 169, rating: 4.3, amenities: ["Free WiFi", "Mountain View", "Free Breakfast"], images: ["https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e", "https://images.unsplash.com/photo-1631049035410-0a1d7c028e58", "https://images.unsplash.com/photo-1578898889090-c50cfc516ec3", "https://images.unsplash.com/photo-1540518614846-7eded433c457"], isAvailable: true, isFeatured: false },
  { name: "Isoka Border Inn", address: "Tanzania Road", city: "Isoka", contact: "+260214390567", roomType: "Single Bed", pricePerNight: 139, rating: 4.1, amenities: ["Free WiFi", "Restaurant", "Parking"], images: ["https://images.unsplash.com/photo-1609766768276-4fe1c0e05e59", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", "https://images.unsplash.com/photo-1445019980597-93fa8acb246c"], isAvailable: true, isFeatured: false },
  { name: "Mpika Gateway Lodge", address: "Tazara Road, North Luangwa", city: "Mpika", contact: "+260215340789", roomType: "Double Bed", pricePerNight: 189, rating: 4.4, amenities: ["Free WiFi", "Wildlife View", "Pool Access"], images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", "https://images.unsplash.com/photo-1590490360182-c33d57733427", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"], isAvailable: true, isFeatured: false },
];

const offers = [
  { title: "Summer Escape Package", description: "Book 3 nights and get the 4th night absolutely free! Perfect for summer getaways.", priceOff: 25, expiryDate: "Dec 31", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d", isActive: true },
  { title: "Weekend Special", description: "Enjoy luxury weekends with complimentary breakfast and spa access.", priceOff: 30, expiryDate: "Jan 15", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945", isActive: true },
  { title: "Business Traveler Deal", description: "Extended stay discounts for professionals. Book 7+ nights and save big!", priceOff: 35, expiryDate: "Feb 28", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", isActive: true },
];

const testimonials = [
  { name: "Sarah Johnson", location: "United States", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", review: "Nonsa Travels made my African adventure unforgettable! The booking process was seamless, and the hotel recommendations were perfect. I'll definitely be using their service again for my next trip to Zambia.", rating: 5, isActive: true },
  { name: "David Mwansa", location: "Zambia", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", review: "As a local, I've used many booking platforms, but Nonsa Travels stands out with their excellent customer service and competitive prices. They truly understand what travelers need.", rating: 5, isActive: true },
  { name: "Emma Thompson", location: "United Kingdom", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", review: "Absolutely loved the Victoria Falls hotel recommendation! The staff were incredibly helpful and the views were breathtaking. Nonsa Travels went above and beyond to ensure our stay was perfect.", rating: 5, isActive: true },
];

const seedDatabase = async () => {
  try {
    await prisma.$connect();

    console.log('Clearing existing data...');
    await prisma.booking.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.review.deleteMany();
    await prisma.hotel.deleteMany();

    console.log('Seeding hotels...');
    await prisma.hotel.createMany({ data: hotelsRaw });
    const hotels = await prisma.hotel.findMany();
    console.log(`${hotels.length} hotels created`);

    console.log('Seeding offers...');
    await prisma.offer.createMany({ data: offers });
    console.log(`${offers.length} offers created`);

    console.log('Seeding testimonials...');
    await prisma.testimonial.createMany({ data: testimonials });
    console.log(`${testimonials.length} testimonials created`);

    console.log('Seeding sample bookings...');
    const sampleUserIds = ['user_sample1', 'user_sample2', 'user_sample3', 'user_sample4', 'user_sample5'];
    const sampleUserNames = ['John Smith', 'Emily Davis', 'Robert Wilson', 'Maria Garcia', 'Alexander Brown'];

    const sampleBookings = [];
    for (let i = 0; i < 150; i++) {
      const randomHotel = hotels[Math.floor(Math.random() * hotels.length)];
      const randomIndex = Math.floor(Math.random() * sampleUserIds.length);
      const daysAgo = Math.floor(Math.random() * 365);
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() - daysAgo);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 5) + 1);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

      sampleBookings.push({
        userId: sampleUserIds[randomIndex],
        userName: sampleUserNames[randomIndex],
        userEmail: `${sampleUserNames[randomIndex].toLowerCase().replace(' ', '.')}@example.com`,
        hotelId: randomHotel.id,
        checkInDate,
        checkOutDate,
        guests: Math.floor(Math.random() * 4) + 1,
        totalPrice: randomHotel.pricePerNight * nights,
        status: Math.random() > 0.1 ? 'completed' : 'confirmed',
        paymentStatus: 'completed',
        paymentMethod: ['card', 'mobile_money', 'cash'][Math.floor(Math.random() * 3)],
      });
    }

    await prisma.booking.createMany({ data: sampleBookings });
    console.log(`${sampleBookings.length} sample bookings created`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
