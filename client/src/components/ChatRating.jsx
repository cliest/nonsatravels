import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import api from '../services/api';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

const ChatRating = ({ chatId, guestId, onRated }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(`/chat/${chatId}/rate`, {
        score: rating,
        feedback: feedback.trim(),
        ...(guestId && { guestId }),
      });

      toast.success('Thank you for your feedback!');
      setHasRated(true);

      // Send transcript automatically after rating
      try {
        await api.post(`/chat/${chatId}/transcript`, guestId ? { guestId } : {});
        toast.success('Chat transcript sent to your email');
      } catch (error) {
        // Silent fail - transcript is optional
      }

      if (onRated) onRated();
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasRated) {
    return (
      <div className="bg-primary/10 p-6 rounded-2xl text-center">
        <div className="text-4xl mb-3 text-green-500"><FontAwesomeIcon icon={faCircleCheck} /></div>
        <h3 className="font-semibold text-lg mb-2">Thank you for your feedback!</h3>
        <p className="text-sm text-gray-600">
          We&apos;ve sent a transcript of your conversation to your email.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="font-semibold text-lg mb-4 text-center">How was your experience?</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="text-3xl transition-transform hover:scale-110"
            >
              <FontAwesomeIcon
                icon={(hover || rating) >= star ? faStar : faStarRegular}
                className={(hover || rating) >= star ? 'text-accent' : 'text-gray-300'}
              />
            </button>
          ))}
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us more about your experience (optional)"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
          rows="3"
        />

        <button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className="w-full mt-4 bg-primary disabled:bg-gray-400 disabled:opacity-60 text-white py-3 rounded-xl transition-all hover:shadow-lg disabled:cursor-not-allowed font-semibold"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
};

ChatRating.propTypes = {
  chatId: PropTypes.string.isRequired,
  guestId: PropTypes.string,
  onRated: PropTypes.func,
};

export default ChatRating;
