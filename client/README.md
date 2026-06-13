# NonsaTravels - Hotel Booking Platform

A modern, responsive hotel booking platform built with React, Vite, and TailwindCSS. This application allows users to browse hotels, filter by various criteria, and make reservations with an intuitive interface.

## 🚀 Features

- **Hotel Search & Filtering**: Search hotels by destination, dates, and guest count
- **Advanced Filters**: Filter by room type, price range, and sort by various criteria
- **Responsive Design**: Fully responsive UI that works on all devices
- **User Authentication**: Integrated with Clerk for secure authentication
- **Flutterwave Payments**: Secure payment gateway supporting cards and mobile money
- **Featured Destinations**: Curated selection of premium hotels
- **Exclusive Offers**: Special deals and promotional packages
- **Testimonials**: Customer reviews and ratings
- **Admin Dashboard**: Special admin interface for hotel management (role-based)

## 🛠️ Tech Stack

- **React** (v19.1.1) - UI library
- **Vite** (v7.1.6) - Build tool and dev server
- **React Router** (v7.9.1) - Client-side routing
- **TailwindCSS** (v4.1.13) - Utility-first CSS framework
- **Clerk** - Authentication and user management
- **FontAwesome** - Icon library
- **ESLint** - Code linting and quality

## 📋 Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nonsatravels/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `client` directory and add your API keys:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_API_URL=http://localhost:5000/api
   VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
   ```

   See [FLUTTERWAVE_SETUP.md](../FLUTTERWAVE_SETUP.md) for detailed payment setup instructions.

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the production bundle
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## 📁 Project Structure

```
client/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, icons, and asset configurations
│   │   └── assets.js   # Asset imports and dummy data
│   ├── components/     # Reusable React components
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── HotelCard.jsx
│   │   ├── FeaturedDestination.jsx
│   │   ├── ExclusiveOffers.jsx
│   │   ├── Testimonial.jsx
│   │   ├── Newsletter.jsx
│   │   ├── Footer.jsx
│   │   ├── StarRating.jsx
│   │   └── Title.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   └── AllHotels.jsx
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles and Tailwind imports
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── eslint.config.js    # ESLint configuration
```

## 🎨 Theme & Styling

The application uses a custom color scheme defined in TailwindCSS:

- **Primary**: `#2b3990` - Deep blue used for main branding
- **Secondary**: `#ffa500` - Orange for secondary elements
- **Accent**: `#ffffff` - White for highlights

Custom CSS utilities are defined in `src/index.css` for text clamping and other common patterns.

## 🔐 Authentication

The app uses **Clerk** for authentication:
- Sign in/Sign up functionality
- User profile management via `UserButton`
- Role-based access control (admin dashboard access)
- Protected routes for authenticated users

To set up Clerk:
1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable key to `.env`
4. Configure user metadata for admin role assignment

## 🗺️ Routes

- `/` - Home page with hero, featured hotels, offers, and testimonials
- `/hotels` - Browse all available hotels with filters
- `/admin` - Admin dashboard (requires admin role)
- `/my-bookings` - User's booking history (requires authentication)
- `/about` - About page

## 📱 Responsive Breakpoints

The application is optimized for:
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

## 🚧 Current Status & Future Enhancements

### Current Features
- ✅ Browse hotels with advanced filtering
- ✅ User authentication with Clerk
- ✅ Responsive design
- ✅ Hotel search by destination, dates, guests

### Planned Features
- 🔄 Backend API integration
- 🔄 Real booking system with payment integration
- 🔄 User booking management
- 🔄 Admin panel for hotel CRUD operations
- 🔄 Reviews and ratings system
- 🔄 Email notifications
- 🔄 Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@nonsatravels.com or join our community Discord channel.
