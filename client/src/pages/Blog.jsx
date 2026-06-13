import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faNewspaper,
  faChevronRight,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { blogAPI } from "../services/blogAPI";
import BlogCard from "../components/BlogCard";
import Title from "../components/Title";

const CATEGORIES = [
  'Travel Tips',
  'Destinations',
  'Culture',
  'Food & Dining',
  'Adventure',
  'Accommodation',
  'News',
  'Guides',
];

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
  });
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    fetchPosts();
    fetchFeaturedPosts();
    fetchCategories();
    fetchTags();
  }, [searchParams]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page: searchParams.get('page') || 1,
        limit: 9,
      };
      
      if (searchParams.get('category')) {
        params.category = searchParams.get('category');
      }
      if (searchParams.get('tag')) {
        params.tag = searchParams.get('tag');
      }
      if (searchParams.get('search')) {
        params.search = searchParams.get('search');
      }

      const response = await blogAPI.getAll(params);
      if (response.data.success) {
        setPosts(response.data.data.posts);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPosts = async () => {
    try {
      const response = await blogAPI.getFeatured(3);
      if (response.data.success) {
        setFeaturedPosts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch featured posts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await blogAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await blogAPI.getTags();
      if (response.data.success) {
        setPopularTags(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.delete('page');
    setSearchParams(params);
    setSelectedCategory(category);
  };

  const handleTagClick = (tag) => {
    const params = new URLSearchParams(searchParams);
    params.set('tag', tag);
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary text-white pt-24 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Travel Blog
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Discover travel tips, destination guides, and inspiring stories about Zambia and beyond
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl">
                <div className="relative flex items-center">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-5 text-primary text-lg"
                  />
                  <input
                    type="text"
                    placeholder="Search articles, destinations, tips..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-14 pr-32 py-4 rounded-xl border-2 border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 text-base placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-semibold text-sm"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <FontAwesomeIcon icon={faChevronRight} className="text-xs text-gray-400" />
            <span className="text-primary font-medium">Blog</span>
            {selectedCategory && (
              <>
                <FontAwesomeIcon icon={faChevronRight} className="text-xs text-gray-400" />
                <span className="text-gray-900">{selectedCategory}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && !searchParams.toString() && (
          <section className="mb-10 md:mb-14">
            <Title
              title="Featured Stories"
              subtitle="Our top picks for you"
              align="left"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {featuredPosts.map((post) => (
                <BlogCard key={post.id} post={post} featured />
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-28 space-y-5">
              {/* Categories */}
              <div className="bg-white rounded-xl p-5 shadow-md">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faFilter} className="text-primary" />
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((category) => {
                    const categoryData = categories.find(c => c.name === category);
                    return (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${
                          selectedCategory === category
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span>{category}</span>
                        {categoryData && (
                          <span className={`text-xs ${selectedCategory === category ? 'text-white/80' : 'text-gray-400'}`}>
                            ({categoryData.count})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Popular Tags */}
              {popularTags.length > 0 && (
                <div className="bg-white rounded-xl p-5 shadow-md">
                  <h3 className="font-bold text-gray-900 mb-4">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => handleTagClick(tag.name)}
                        className="px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 text-sm rounded-full transition-colors"
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="bg-primary rounded-xl p-5 text-white">
                <h3 className="font-bold mb-2">Subscribe to Our Newsletter</h3>
                <p className="text-sm text-white/80 mb-4">
                  Get the latest travel tips and deals delivered to your inbox
                </p>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 rounded-lg text-gray-900 mb-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <button className="w-full py-2 bg-secondary hover:bg-secondary/90 rounded-lg font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 order-1 lg:order-2">
            {/* Active Filters */}
            {(searchParams.get('search') || searchParams.get('category') || searchParams.get('tag')) && (
              <div className="flex items-center flex-wrap gap-2 mb-6">
                <span className="text-sm text-gray-500">Active filters:</span>
                {searchParams.get('search') && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    Search: "{searchParams.get('search')}"
                  </span>
                )}
                {searchParams.get('category') && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {searchParams.get('category')}
                  </span>
                )}
                {searchParams.get('tag') && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    #{searchParams.get('tag')}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-primary animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl">
                <FontAwesomeIcon icon={faNewspaper} className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-500 mb-4">
                  {searchParams.toString()
                    ? "Try adjusting your filters or search terms"
                    : "Check back soon for new content!"}
                </p>
                {searchParams.toString() && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-gray-600">
                    Showing {posts.length} of {pagination.totalPosts} articles
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const current = pagination.currentPage;
                        return page === 1 || page === pagination.totalPages || 
                               (page >= current - 1 && page <= current + 1);
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg ${
                              pagination.currentPage === page
                                ? 'bg-primary text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasMore}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Blog;
