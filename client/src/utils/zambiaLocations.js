export const ZAMBIA_AIRPORTS = [
  { name: "Kenneth Kaunda International Airport", code: "LUN", city: "Lusaka", lat: -15.3308, lng: 28.4526 },
  { name: "Harry Mwanga Nkumbula International Airport", code: "LVI", city: "Livingstone", lat: -17.8218, lng: 25.8227 },
  { name: "Simon Mwansa Kapwepwe International Airport", code: "NLA", city: "Ndola", lat: -12.9981, lng: 28.6649 },
  { name: "Mfuwe Airport", code: "MFU", city: "Mfuwe", lat: -13.2589, lng: 31.9366 },
  { name: "Solwezi Airport", code: "SLI", city: "Solwezi", lat: -12.1737, lng: 25.8270 },
  { name: "Kasama Airport", code: "KAA", city: "Kasama", lat: -10.2167, lng: 31.1333 },
  { name: "Mansa Airport", code: "MNS", city: "Mansa", lat: -11.1372, lng: 28.8726 },
  { name: "Mongu Airport", code: "MNR", city: "Mongu", lat: -15.2545, lng: 23.1623 },
];

export const CITY_COORDINATES = {
  "Lusaka": { lat: -15.3875, lng: 28.3228 },
  "Kafue": { lat: -15.7694, lng: 28.1814 },
  "Chongwe": { lat: -15.3286, lng: 28.6772 },
  "Chilanga": { lat: -15.5469, lng: 28.2639 },
  "Chirundu": { lat: -15.7392, lng: 28.8478 },
  "Livingstone": { lat: -17.8419, lng: 25.8544 },
  "Choma": { lat: -16.5414, lng: 26.9872 },
  "Mazabuka": { lat: -15.8561, lng: 27.7486 },
  "Monze": { lat: -16.2839, lng: 27.4797 },
  "Kalomo": { lat: -17.0364, lng: 26.4917 },
  "Siavonga": { lat: -16.5381, lng: 28.7183 },
  "Ndola": { lat: -12.9586, lng: 28.6366 },
  "Kitwe": { lat: -12.8024, lng: 28.2132 },
  "Chingola": { lat: -12.5297, lng: 27.8533 },
  "Mufulira": { lat: -12.5419, lng: 28.2297 },
  "Luanshya": { lat: -13.1367, lng: 28.4166 },
  "Kalulushi": { lat: -12.8406, lng: 28.0947 },
  "Kabwe": { lat: -14.4383, lng: 28.4519 },
  "Kapiri Mposhi": { lat: -14.9706, lng: 28.6786 },
  "Mkushi": { lat: -13.6200, lng: 29.3900 },
  "Serenje": { lat: -13.2325, lng: 30.2283 },
  "Mumbwa": { lat: -14.9828, lng: 27.0614 },
  "Chipata": { lat: -13.6333, lng: 32.6500 },
  "Katete": { lat: -14.1167, lng: 31.9667 },
  "Lundazi": { lat: -12.2928, lng: 33.1786 },
  "Petauke": { lat: -14.2411, lng: 31.3172 },
  "Kasama": { lat: -10.2128, lng: 31.1811 },
  "Mbala": { lat: -8.8403, lng: 31.3658 },
  "Mpika": { lat: -11.8306, lng: 31.4581 },
  "Chinsali": { lat: -10.5500, lng: 32.0833 },
  "Nakonde": { lat: -9.3417, lng: 32.7472 },
  "Mansa": { lat: -11.1997, lng: 28.8942 },
  "Nchelenge": { lat: -9.3456, lng: 28.7339 },
  "Samfya": { lat: -11.3500, lng: 29.5500 },
  "Kawambwa": { lat: -9.7917, lng: 29.0778 },
  "Mongu": { lat: -15.2486, lng: 23.1272 },
  "Senanga": { lat: -16.1167, lng: 23.2667 },
  "Kaoma": { lat: -14.7833, lng: 24.8000 },
  "Lukulu": { lat: -14.3667, lng: 23.2333 },
  "Kalabo": { lat: -14.9833, lng: 22.6833 },
  "Solwezi": { lat: -12.1689, lng: 25.8600 },
  "Mwinilunga": { lat: -11.7356, lng: 25.2697 },
  "Zambezi": { lat: -13.5428, lng: 23.1042 },
  "Kasempa": { lat: -13.4583, lng: 25.8500 },
  "Isoka": { lat: -10.1167, lng: 32.6333 },
  "Chama": { lat: -11.2167, lng: 33.1500 },
};

export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.3);
};

export const RATE_PER_KM = 1.2;
