import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';

// WhatsApp Business number for Nonsa Travels
const WHATSAPP_NUMBER = '260970462777'; // Zambia format without +

const WhatsAppButton = ({ 
  message, 
  variant = 'floating', // 'floating', 'inline', 'full'
  className = '',
  children 
}) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  const handleClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'floating') {
    return (
      <button
        onClick={handleClick}
        className={`fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group ${className}`}
        aria-label="Chat on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <FontAwesomeIcon icon={faWhatsapp} className="text-2xl" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Chat with us
        </span>
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg ${className}`}
      >
        <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
        {children || 'Book via WhatsApp'}
      </button>
    );
  }

  // inline variant
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md ${className}`}
    >
      <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
      {children || 'WhatsApp'}
    </button>
  );
};

WhatsAppButton.propTypes = {
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['floating', 'inline', 'full']),
  className: PropTypes.string,
  children: PropTypes.node,
};

// Helper function to generate booking inquiry message
export const generateBookingMessage = (hotel, checkIn, checkOut, guests) => {
  const checkInStr = checkIn ? new Date(checkIn).toLocaleDateString() : 'Not selected';
  const checkOutStr = checkOut ? new Date(checkOut).toLocaleDateString() : 'Not selected';
  
  return `Hi Nonsa Travels! 

I'm interested in booking:

 *Hotel:* ${hotel?.name || 'Hotel'}
 *Location:* ${hotel?.city || 'Location'}
 *Check-in:* ${checkInStr}
 *Check-out:* ${checkOutStr}
 *Rooms:* ${guests || 1}

Please help me with availability and pricing. Thank you!`;
};

// Helper function to generate confirmation inquiry message
export const generateConfirmationMessage = (booking) => {
  return `Hi Nonsa Travels! 

I have a question about my booking:

 *Booking ID:* ${booking?.id || 'N/A'}
 *Hotel:* ${booking?.hotelId?.name || booking?.hotelName || 'Hotel'}
 *Check-in:* ${booking?.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'}
 *Check-out:* ${booking?.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A'}

Please assist me. Thank you!`;
};

export default WhatsAppButton;
