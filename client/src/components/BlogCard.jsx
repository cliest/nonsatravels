import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faUser, faEye, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

const BlogCard = ({ post, featured = false }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (featured) {
    return (
      <Link 
        to={`/blog/${post.slug}`}
        className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        <div className="relative h-52 md:h-56 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
              {post.category}
            </span>
          </div>
          {post.isFeatured && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-secondary text-white text-xs font-medium rounded-full">
                Featured
              </span>
            </div>
          )}
        </div>
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faClock} className="text-xs" />
              {post.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faEye} className="text-xs" />
              {post.views} views
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {post.author?.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={`${post.author.firstName} ${post.author.lastName}`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {post.author?.firstName} {post.author?.lastName}
                </p>
                <p className="text-xs text-gray-500">{formatDate(post.publishedAt)}</p>
              </div>
            </div>
            <span className="text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Read More
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/blog/${post.slug}`}
      className="group flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative w-full sm:w-52 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 sm:hidden">
          <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
            {post.category}
          </span>
        </div>
      </div>
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="hidden sm:block mb-2">
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {post.category}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faClock} className="text-xs" />
              {post.readTime} min
            </span>
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faEye} className="text-xs" />
              {post.views}
            </span>
          </div>
          <span className="text-xs">{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
};

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    excerpt: PropTypes.string.isRequired,
    coverImage: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    readTime: PropTypes.number,
    views: PropTypes.number,
    isFeatured: PropTypes.bool,
    publishedAt: PropTypes.string,
    author: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      avatar: PropTypes.string,
    }),
  }).isRequired,
  featured: PropTypes.bool,
};

export default BlogCard;
