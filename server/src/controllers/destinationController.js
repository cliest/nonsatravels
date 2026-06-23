import prisma from '../lib/prisma.js';

export const getDestinations = async (req, res) => {
  try {
    const destinations = await prisma.destination.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllDestinations = async (req, res) => {
  try {
    const destinations = await prisma.destination.findMany({ orderBy: { sortOrder: 'asc' } });
    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createDestination = async (req, res) => {
  try {
    const dest = await prisma.destination.create({ data: req.body });
    res.status(201).json({ success: true, data: dest });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create destination', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateDestination = async (req, res) => {
  try {
    const dest = await prisma.destination.update({ where: { id: req.params.id }, data: req.body });
    res.status(200).json({ success: true, data: dest });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Destination not found' });
    res.status(400).json({ success: false, message: 'Failed to update destination' });
  }
};

export const deleteDestination = async (req, res) => {
  try {
    await prisma.destination.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Destination deleted' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Destination not found' });
    res.status(500).json({ success: false, message: 'Failed to delete destination' });
  }
};

export const seedDestinations = async (req, res) => {
  try {
    const existing = await prisma.destination.count();
    if (existing > 0) return res.status(200).json({ success: true, message: 'Destinations already seeded', count: existing });

    const provinces = [
      { name: "Lusaka Province", image: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&q=80", description: "Zambia's capital and economic hub, home to vibrant markets and modern amenities.", cities: ["Lusaka", "Kafue", "Chongwe", "Chilanga", "Chirundu"], attractions: [{ name: "Lusaka National Museum", type: "Culture", description: "Showcasing Zambia's rich history, art, and ethnography" }, { name: "Munda Wanga Environmental Park", type: "Wildlife", description: "Botanical gardens and wildlife sanctuary" }, { name: "Lusaka National Park", type: "Nature", description: "Urban national park with walking trails and birdlife" }], sortOrder: 0 },
      { name: "Southern Province", image: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800&q=80", description: "Home to the majestic Victoria Falls, one of the Seven Natural Wonders of the World.", cities: ["Livingstone", "Choma", "Mazabuka", "Monze", "Kalomo", "Siavonga"], attractions: [{ name: "Victoria Falls (Mosi-oa-Tunya)", type: "Wonder", description: "The world's largest curtain of falling water — UNESCO World Heritage Site" }, { name: "Mosi-oa-Tunya National Park", type: "Wildlife", description: "White rhino sanctuary and walking safaris" }, { name: "Lake Kariba", type: "Nature", description: "One of the world's largest man-made lakes" }, { name: "Zambezi River Activities", type: "Adventure", description: "Bungee jumping, white-water rafting, sunset cruises" }], sortOrder: 1 },
      { name: "Copperbelt Province", image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800&q=80", description: "The mining heartland of Zambia, offering a mix of industry and natural beauty.", cities: ["Ndola", "Kitwe", "Chingola", "Mufulira", "Luanshya", "Kalulushi"], attractions: [{ name: "Chimfunshi Wildlife Orphanage", type: "Wildlife", description: "World's largest chimpanzee sanctuary" }, { name: "Dag Hammarskjold Memorial", type: "History", description: "Memorial site for the UN Secretary-General's 1961 plane crash" }, { name: "Copperbelt Museum", type: "Culture", description: "Mining heritage and local art collections" }], sortOrder: 2 },
      { name: "Central Province", image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80", description: "Gateway to the country's national parks and wildlife reserves.", cities: ["Kabwe", "Kapiri Mposhi", "Mkushi", "Serenje", "Mumbwa"], attractions: [{ name: "Kundalila Falls", type: "Nature", description: "Stunning 67-metre waterfall with natural swimming pools" }, { name: "Kafue National Park (East Gate)", type: "Wildlife", description: "Zambia's largest national park" }, { name: "Mulungushi Dam", type: "Nature", description: "Beautiful reservoir for camping and fishing" }], sortOrder: 3 },
      { name: "Eastern Province", image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80", description: "Rich cultural heritage and home to the famous South Luangwa National Park.", cities: ["Chipata", "Katete", "Lundazi", "Petauke"], attractions: [{ name: "South Luangwa National Park", type: "Wildlife", description: "Africa's premier walking safari destination" }, { name: "North Luangwa National Park", type: "Wildlife", description: "Remote park with black rhinos" }, { name: "Nc'wala Ceremony", type: "Culture", description: "Annual Ngoni harvest festival" }], sortOrder: 4 },
      { name: "Northern Province", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", description: "Stunning waterfalls, ancient rock art, and pristine wilderness.", cities: ["Kasama", "Mbala", "Mpika", "Chinsali", "Nakonde"], attractions: [{ name: "Kalambo Falls", type: "Nature", description: "Africa's second-highest uninterrupted waterfall (221m)" }, { name: "Chishimba Falls", type: "Nature", description: "Triple waterfall system sacred to the Bemba" }, { name: "Lake Tanganyika", type: "Nature", description: "World's second-deepest lake" }], sortOrder: 5 },
      { name: "Luapula Province", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", description: "Beautiful lakeside province bordering Lake Mweru and the Congo.", cities: ["Mansa", "Nchelenge", "Samfya", "Kawambwa"], attractions: [{ name: "Lake Bangweulu Wetlands", type: "Wildlife", description: "Home to the rare shoebill stork and black lechwe" }, { name: "Ntumbachushi Falls", type: "Nature", description: "Multi-tiered waterfall in pristine forest" }], sortOrder: 6 },
      { name: "Western Province", image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80", description: "Home to the Barotse Floodplain and the famous Kuomboka ceremony.", cities: ["Mongu", "Senanga", "Kaoma", "Lukulu", "Kalabo"], attractions: [{ name: "Kuomboka Ceremony", type: "Culture", description: "Royal Lozi ceremony — one of Africa's last great royal traditions" }, { name: "Liuwa Plain National Park", type: "Wildlife", description: "One of Africa's last great wildebeest migrations" }], sortOrder: 7 },
      { name: "North-Western Province", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", description: "Mineral-rich province with vast forests and the source of the Zambezi River.", cities: ["Solwezi", "Mwinilunga", "Zambezi", "Kasempa"], attractions: [{ name: "Source of the Zambezi", type: "Nature", description: "Where Africa's fourth-longest river begins" }, { name: "West Lunga National Park", type: "Wildlife", description: "Dense tropical forests and birdlife" }], sortOrder: 8 },
      { name: "Muchinga Province", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", description: "Zambia's newest province, offering untouched wilderness and adventure.", cities: ["Chinsali", "Isoka", "Mpika", "Chama"], attractions: [{ name: "Kasanka National Park", type: "Wildlife", description: "World's largest mammal migration — 10 million fruit bats" }, { name: "Mutinondo Wilderness", type: "Nature", description: "Pristine granite hills and rare orchids" }, { name: "Shiwa Ng'andu Estate", type: "History", description: "English country manor built in the 1920s bush" }], sortOrder: 9 },
    ];

    await prisma.destination.createMany({ data: provinces });
    res.status(201).json({ success: true, message: `Seeded ${provinces.length} destinations` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to seed destinations', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
