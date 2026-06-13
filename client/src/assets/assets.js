import logo from "./logo.png";
import filterIcon from "./filter.png";
import noResultIcon from "./no-results.png";
import searchIcon from "./searchIcon.svg";
import userIcon from "./userIcon.svg";
import checkIn from "./checkIn.png";
import guests from "./guests.png";
import checkOut from "./checkOut.png";
import calenderIcon from "./calenderIcon.svg";
import destination from "./destination.png";
import locationIcon from "./locationIcon.svg";
import starIconFilled from "./starIconFilled.svg";
import arrowIcon from "./arrowIcon.svg";
import starIconOutlined from "./starIconOutlined.svg";
import instagramIcon from "./instagramIcon.svg";
import facebookIcon from "./facebookIcon.svg";
import twitterIcon from "./twitterIcon.svg";
import linkendinIcon from "./linkendinIcon.svg";
import freeWifiIcon from "./freeWifiIcon.svg";
import freeBreakfastIcon from "./freeBreakfastIcon.svg";
import roomServiceIcon from "./roomServiceIcon.svg";
import mountainIcon from "./mountainIcon.svg";
import poolIcon from "./poolIcon.svg";
import homeIcon from "./homeIcon.svg";
import closeIcon from "./closeIcon.svg";
import locationFilledIcon from "./locationFilledIcon.svg";
import heartIcon from "./heartIcon.svg";
import badgeIcon from "./badgeIcon.svg";
import menuIcon from "./menuIcon.svg";
import closeMenu from "./closeMenu.svg";
import guestsIcon from "./guestsIcon.svg";
import addIcon from "./addIcon.svg";
import dashboardIcon from "./dashboardIcon.svg";
import listIcon from "./listIcon.svg";
import uploadArea from "./uploadArea.svg";
import totalBookingIcon from "./totalBookingIcon.svg";
import totalRevenueIcon from "./totalRevenueIcon.svg";

export const assets = {
  logo,
  searchIcon,
  userIcon,
  calenderIcon,
  locationIcon,
  starIconFilled,
  arrowIcon,
  starIconOutlined,
  instagramIcon,
  facebookIcon,
  twitterIcon,
  linkendinIcon,
  freeWifiIcon,
  freeBreakfastIcon,
  roomServiceIcon,
  mountainIcon,
  poolIcon,
  closeIcon,
  homeIcon,
  locationFilledIcon,
  heartIcon,
  badgeIcon,
  menuIcon,
  closeMenu,
  guestsIcon,
  addIcon,
  dashboardIcon,
  listIcon,
  uploadArea,
  totalBookingIcon,
  totalRevenueIcon,
  checkIn,
  guests,
  checkOut,
  destination,
  filterIcon,
  noResultIcon,
};

// Zambian Cities - All provinces and major towns/cities in Zambia
export const cities = [
  // Lusaka Province
  "Lusaka", "Kafue", "Chongwe", "Chilanga", "Chirundu",
  // Copperbelt Province
  "Ndola", "Kitwe", "Chingola", "Mufulira", "Luanshya", "Kalulushi",
  "Chililabombwe", "Chambishi", "Mpongwe", "Lufwanyama", "Masaiti",
  // Southern Province
  "Livingstone", "Choma", "Mazabuka", "Monze", "Kalomo", "Kazungula",
  "Namwala", "Siavonga", "Sinazongwe", "Gwembe", "Pemba", "Zimba",
  // Central Province
  "Kabwe", "Kapiri Mposhi", "Mkushi", "Serenje", "Mumbwa", "Chibombo",
  "Itezhi-Tezhi", "Ngabwe", "Shibuyunji", "Luano", "Chitambo",
  // Eastern Province
  "Chipata", "Katete", "Lundazi", "Petauke", "Chadiza", "Nyimba",
  "Mambwe", "Sinda", "Vubwi", "Lumezi", "Kasenengwa",
  // Northern Province
  "Kasama", "Mbala", "Mpika", "Chinsali", "Nakonde", "Isoka",
  "Mungwi", "Luwingu", "Kaputa", "Nsama", "Lupososhi", "Kanchibiya",
  "Mporokoso", "Senga Hill",
  // Luapula Province
  "Mansa", "Nchelenge", "Samfya", "Kawambwa", "Mwense", "Chembe",
  "Chienge", "Milenge", "Chipili", "Lunga", "Mwansabombwe",
  // Western Province
  "Mongu", "Senanga", "Kaoma", "Lukulu", "Kalabo", "Limulunga",
  "Shangombo", "Sioma", "Nkeyema", "Luampa", "Mulobezi",
  // North-Western Province
  "Solwezi", "Mwinilunga", "Zambezi", "Kasempa", "Kabompo",
  "Chavuma", "Ikelenge", "Mushindamo", "Kalumbila",
  // Muchinga Province
  "Chinsali", "Isoka", "Mpika", "Nakonde", "Kanchibiya",
  "Lavushimanda", "Mafinga", "Chama", "Mpulungu",
];

// Facility Icons
export const facilityIcons = {
  "Free WiFi": assets.freeWifiIcon,
  "Free Breakfast": assets.freeBreakfastIcon,
  "Room Service": assets.roomServiceIcon,
  "Mountain View": assets.mountainIcon,
  "Pool Access": assets.poolIcon,
};

// Room common data for hotel details page
export const roomCommonData = [
  {
    icon: assets.homeIcon,
    title: "Clean & Safe Stay",
    description: "A well-maintained and hygienic space just for you.",
  },
  {
    icon: assets.badgeIcon,
    title: "Enhanced Cleaning",
    description: "This host follows Staybnb's strict cleaning standards.",
  },
  {
    icon: assets.locationFilledIcon,
    title: "Excellent Location",
    description: "90% of guests rated the location 5 stars.",
  },
  {
    icon: assets.heartIcon,
    title: "Smooth Check-In",
    description: "100% of guests gave check-in a 5-star rating.",
  },
];
