import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faNewspaper } from "@fortawesome/free-solid-svg-icons";
import { blogAPI } from "../services/blogAPI";
import BlogCard from "./BlogCard";
import Title from "./Title";

const FeaturedBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Try to get featured posts first
        let response = await blogAPI.getFeatured(3);
        if (response.data.success && response.data.data.length > 0) {
          setPosts(response.data.data);
        } else {
          // If no featured posts, get latest posts
          response = await blogAPI.getAll({ limit: 3 });
          if (response.data.success && response.data.data.posts.length > 0) {
            setPosts(response.data.data.posts);
          }
        }
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Don't render if no posts
  if (!loading && posts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-10">
          <Title
            title="From Our Blog"
            subtitle="Travel tips, destination guides, and inspiring stories"
            align="left"
          />
          <Link
            to="/blog"
            className="flex items-center gap-2 text-primary hover:text-secondary font-medium transition-colors group whitespace-nowrap"
          >
            View All Articles
            <FontAwesomeIcon 
              icon={faArrowRight} 
              className="text-sm group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 stagger-children">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} featured />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default FeaturedBlog;
