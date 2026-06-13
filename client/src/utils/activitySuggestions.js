// Common activity suggestions for different destinations

export const ACTIVITY_CATEGORIES = [
  'sightseeing',
  'adventure',
  'dining',
  'shopping',
  'culture',
  'entertainment',
  'other',
];

export const SUGGESTED_ACTIVITIES = {
  lusaka: [
    {
      name: 'Visit Lusaka National Museum',
      category: 'culture',
      duration: '2-3 hours',
      description: 'Explore Zambian history and culture',
    },
    {
      name: 'Sunday Crafts Market',
      category: 'shopping',
      duration: '2-4 hours',
      description: 'Browse local crafts and artworks',
    },
    {
      name: 'Kalimba Reptile Park',
      category: 'sightseeing',
      duration: '2 hours',
      description: 'Meet crocodiles, snakes, and other reptiles',
    },
    {
      name: 'Dinner at O\'Hagan\'s',
      category: 'dining',
      duration: '1-2 hours',
      description: 'Popular restaurant with local and international cuisine',
    },
  ],
  'livingstone': [
    {
      name: 'Victoria Falls Tour',
      category: 'sightseeing',
      duration: '3-4 hours',
      description: 'Marvel at one of the Seven Natural Wonders of the World',
    },
    {
      name: 'White Water Rafting',
      category: 'adventure',
      duration: 'Full day',
      description: 'Thrilling rapids on the Zambezi River',
    },
    {
      name: 'Sunset Zambezi Cruise',
      category: 'sightseeing',
      duration: '2-3 hours',
      description: 'Scenic river cruise with wildlife viewing',
    },
    {
      name: 'Bungee Jumping',
      category: 'adventure',
      duration: '1-2 hours',
      description: 'Jump from Victoria Falls Bridge',
    },
    {
      name: 'Livingstone Museum',
      category: 'culture',
      duration: '2 hours',
      description: 'Learn about local history and David Livingstone',
    },
  ],
  'kafue': [
    {
      name: 'Kafue National Park Safari',
      category: 'adventure',
      duration: 'Full day',
      description: 'Wildlife safari in one of Africa\'s largest parks',
    },
    {
      name: 'Boat Safari on Kafue River',
      category: 'sightseeing',
      duration: '3-4 hours',
      description: 'Spot hippos, crocodiles, and birds',
    },
    {
      name: 'Bush Walk',
      category: 'adventure',
      duration: '2-3 hours',
      description: 'Guided walking safari',
    },
    {
      name: 'Fishing on Kafue River',
      category: 'adventure',
      duration: '4-6 hours',
      description: 'Try catching tiger fish and bream',
    },
  ],
  'ndola': [
    {
      name: 'Dag Hammarskjold Memorial',
      category: 'culture',
      duration: '1-2 hours',
      description: 'Historical memorial site',
    },
    {
      name: 'Ndola Slave Tree',
      category: 'culture',
      duration: '1 hour',
      description: 'Historical landmark',
    },
    {
      name: 'Copperbelt Museum',
      category: 'culture',
      duration: '2 hours',
      description: 'Learn about copper mining history',
    },
    {
      name: 'Shopping at Jacaranda Mall',
      category: 'shopping',
      duration: '2-3 hours',
      description: 'Modern shopping center',
    },
  ],
  'kitwe': [
    {
      name: 'Chimfunshi Wildlife Orphanage',
      category: 'sightseeing',
      duration: '3-4 hours',
      description: 'Visit chimpanzee sanctuary',
    },
    {
      name: 'Mindolo Dam',
      category: 'sightseeing',
      duration: '2 hours',
      description: 'Scenic reservoir for picnics',
    },
    {
      name: 'Nkana Golf Club',
      category: 'entertainment',
      duration: '4-5 hours',
      description: 'Play golf at historic club',
    },
  ],
  'solwezi': [
    {
      name: 'Kifubwa Rock Paintings',
      category: 'culture',
      duration: '3-4 hours',
      description: 'Ancient rock art site',
    },
    {
      name: 'Mutanda Falls',
      category: 'sightseeing',
      duration: '2-3 hours',
      description: 'Beautiful waterfall',
    },
  ],
  'kasama': [
    {
      name: 'Chishimba Falls',
      category: 'sightseeing',
      duration: '3-4 hours',
      description: 'Stunning three-tiered waterfall',
    },
    {
      name: 'Bangweulu Swamps',
      category: 'adventure',
      duration: 'Full day',
      description: 'Spot rare shoebill storks',
    },
  ],
  'chipata': [
    {
      name: 'South Luangwa National Park',
      category: 'adventure',
      duration: 'Full day',
      description: 'World-class wildlife safari',
    },
    {
      name: 'Walking Safari',
      category: 'adventure',
      duration: '3-4 hours',
      description: 'Get close to wildlife on foot',
    },
  ],
  'default': [
    {
      name: 'City Walking Tour',
      category: 'sightseeing',
      duration: '2-3 hours',
      description: 'Explore local landmarks and culture',
    },
    {
      name: 'Local Restaurant Experience',
      category: 'dining',
      duration: '1-2 hours',
      description: 'Try authentic local cuisine',
    },
    {
      name: 'Market Visit',
      category: 'shopping',
      duration: '2-3 hours',
      description: 'Browse local markets and crafts',
    },
    {
      name: 'Cultural Performance',
      category: 'entertainment',
      duration: '2 hours',
      description: 'Traditional music and dance',
    },
  ],
};

// Get suggested activities for a city
export const getSuggestedActivities = (city) => {
  if (!city) return SUGGESTED_ACTIVITIES.default;
  
  const cityKey = city.toLowerCase();
  return SUGGESTED_ACTIVITIES[cityKey] || SUGGESTED_ACTIVITIES.default;
};

// Get activities by category
export const getActivitiesByCategory = (city, category) => {
  const activities = getSuggestedActivities(city);
  return activities.filter(activity => activity.category === category);
};

// Get random activity suggestion
export const getRandomActivity = (city) => {
  const activities = getSuggestedActivities(city);
  return activities[Math.floor(Math.random() * activities.length)];
};
