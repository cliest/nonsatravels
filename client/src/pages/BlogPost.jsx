import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faEye,
  faUser,
  faCalendar,
  faChevronRight,
  faArrowLeft,
  faShare,
  faBookmark,
  faSpinner,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faWhatsapp,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { blogAPI } from "../services/blogAPI";
import BlogCard from "../components/BlogCard";
import { toast } from "../utils/toast";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getBySlug(slug);
      if (response.data.success) {
        setPost(response.data.data.post);
        setRelatedPosts(response.data.data.relatedPosts);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      if (error.response?.status === 404) {
        navigate('/blog', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post.title;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
      setShowShareMenu(false);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-primary animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
        <Link to="/blog" className="text-primary hover:underline">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[350px] max-h-[550px] pt-16">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link
            to="/blog"
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full text-gray-900 hover:bg-white transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Blog</span>
          </Link>
        </div>
        
        {/* Post Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-white/90 text-sm">
                <FontAwesomeIcon icon={faClock} className="text-xs" />
                {post.readTime} min read
              </span>
              <span className="flex items-center gap-1 text-white/90 text-sm">
                <FontAwesomeIcon icon={faEye} className="text-xs" />
                {post.views} views
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {post.author?.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={`${post.author.firstName} ${post.author.lastName}`}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                    <FontAwesomeIcon icon={faUser} className="text-white" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">
                    {post.author?.firstName} {post.author?.lastName}
                  </p>
                  <p className="text-sm text-white/80 flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                    {formatDate(post.publishedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <FontAwesomeIcon icon={faChevronRight} className="text-xs text-gray-400" />
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <FontAwesomeIcon icon={faChevronRight} className="text-xs text-gray-400" />
            <span className="text-gray-900 truncate">{post.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        {/* Share & Save Buttons */}
        <div className="flex items-center justify-between mb-6 md:mb-8 pb-5 md:pb-6 border-b">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faShare} />
                <span>Share</span>
              </button>
              
              {showShareMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border p-2 z-10 min-w-[200px]">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-left"
                  >
                    <FontAwesomeIcon icon={faFacebook} className="text-blue-600" />
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-left"
                  >
                    <FontAwesomeIcon icon={faTwitter} className="text-sky-500" />
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-left"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-green-500" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-left"
                  >
                    <FontAwesomeIcon icon={faLinkedin} className="text-blue-700" />
                    LinkedIn
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={copyLink}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-left"
                  >
                    <FontAwesomeIcon icon={faBookmark} className="text-gray-600" />
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <FontAwesomeIcon icon={faTag} className="text-gray-400" />
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?tag=${tag}`}
                  className="px-2 py-1 bg-gray-100 hover:bg-primary hover:text-white text-gray-600 text-sm rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Post Content */}
        <article className="prose prose-lg max-w-none mb-12">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="blog-content"
          />
        </article>

        {/* Author Box */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-12">
          <div className="flex items-start gap-4">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={`${post.author.firstName} ${post.author.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faUser} className="text-2xl text-white" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                {post.author?.firstName} {post.author?.lastName}
              </h3>
              <p className="text-gray-600 text-sm">
                Travel writer and content creator at Nonsa Travels. Passionate about exploring Zambia's hidden gems and sharing authentic travel experiences.
              </p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} featured />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Styles for blog content */}
      <style>{`
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          color: #111827;
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        .blog-content h2 { font-size: 1.75rem; }
        .blog-content h3 { font-size: 1.5rem; }
        .blog-content p {
          margin-bottom: 1.5rem;
          line-height: 1.8;
          color: #374151;
        }
        .blog-content img {
          border-radius: 0.75rem;
          margin: 2rem 0;
          width: 100%;
        }
        .blog-content a {
          color: #2b3990;
          text-decoration: underline;
        }
        .blog-content ul,
        .blog-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          color: #374151;
        }
        .blog-content blockquote {
          border-left: 4px solid #2b3990;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #4b5563;
        }
        .blog-content pre {
          background: #1f2937;
          color: #e5e7eb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .blog-content code {
          background: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }
      `}</style>
    </div>
  );
};

export default BlogPost;
