import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { faLink, faCheck } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import { toast } from "../utils/toast";

const ShareButtons = ({ url, title, description, hashtags = [] }) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedHashtags = hashtags.join(",");

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = (platform) => {
    const width = 600;
    const height = 400;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    window.open(
      shareLinks[platform],
      "_blank",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Facebook */}
      <button
        onClick={() => handleShare("facebook")}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-110"
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <FontAwesomeIcon icon={faFacebook} className="text-lg" />
      </button>

      {/* Twitter */}
      <button
        onClick={() => handleShare("twitter")}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-all hover:scale-110"
        aria-label="Share on Twitter"
        title="Share on Twitter"
      >
        <FontAwesomeIcon icon={faTwitter} className="text-lg" />
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => handleShare("whatsapp")}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-all hover:scale-110"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
      >
        <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110 ${
          copied
            ? "bg-green-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        aria-label="Copy link"
        title="Copy link"
      >
        <FontAwesomeIcon icon={copied ? faCheck : faLink} className="text-lg" />
      </button>
    </div>
  );
};

ShareButtons.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  hashtags: PropTypes.arrayOf(PropTypes.string),
};

export default ShareButtons;
