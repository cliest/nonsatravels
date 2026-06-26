import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faHotel,
  faCalendarCheck,
  faUsers,
  faChevronRight,
  faSearch,
  faFilter,
  faEllipsisV,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faTimes,
  faPlus,
  faImage,
  faArrowLeft,
  faHome,
  faEdit,
  faTrash,
  faUser,
  faBlog,
  faEye,
  faStar,
  faFileInvoice,
  faEnvelope,
  faDownload,
  faTag,
  faToggleOn,
  faToggleOff,
  faPercent,
  faComments,
  faChartBar,
  faGlobe,
  faNewspaper,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { cities } from "../assets/assets";
import { ROOM_TYPES } from "../utils/constants";
import PropTypes from "prop-types";
import { hotelAPI, bookingAPI, offerAPI, testimonialAPI, authAPI, promoAPI, newsletterAPI, reviewAPI, destinationAPI, servicesAPI, settingsAPI } from "../services/api";
import { blogAPI } from "../services/blogAPI";
import { toast } from "../utils/toast";
import ImageUpload from "../components/ImageUpload";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import AdminChatDashboard from "../components/AdminChatDashboard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [showEditHotelModal, setShowEditHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const defaultRoomType = { name: "Double Bed", pricePerNight: "", roomCount: "1", maxGuests: "2", description: "" };
  const [newHotel, setNewHotel] = useState({
    hotelName: "",
    address: "",
    city: "",
    contact: "",
    roomType: "Double Bed",
    pricePerNight: "",
    totalRooms: "10",
    rating: "4.5",
    amenities: [],
    imageUrls: ["", "", "", ""],
    dynamicPricingEnabled: true,
    peakSeasonMultiplier: "1.5",
    lowOccupancyDiscount: "0.9",
    highDemandMultiplier: "1.3",
    roomTypes: [{ ...defaultRoomType }],
  });
  
  // Homepage Content Management
  const [offers, setOffers] = useState([]);
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [showEditOfferModal, setShowEditOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    priceOff: "",
    expiryDate: "",
    imageUrl: "",
    hotelId: "",
    promoCode: "",
    packageDetails: "",
  });

  // Testimonials Management
  const [testimonials, setTestimonials] = useState([]);
  const [showAddTestimonialModal, setShowAddTestimonialModal] = useState(false);
  const [showEditTestimonialModal, setShowEditTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    location: "",
    image: "",
    rating: "5",
    review: "",
    isActive: true,
  });

  // Users Management
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasMore: false,
  });
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState("");
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Blog Management
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogPagination, setBlogPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasMore: false,
  });
  const [blogSearch, setBlogSearch] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState("");
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);
  const [showEditBlogModal, setShowEditBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [newBlogPost, setNewBlogPost] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "Travel Tips",
    tags: "",
    status: "draft",
    isFeatured: false,
    metaTitle: "",
    metaDescription: "",
  });

  // Promo Code Management
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [newPromo, setNewPromo] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minBookingAmount: "0",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    usagePerUser: "1",
    isFirstBookingOnly: false,
    isActive: true,
  });

  // Newsletter Management
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [subscriberFilter, setSubscriberFilter] = useState("all");
  const [showSendNewsletterModal, setShowSendNewsletterModal] = useState(false);
  const [newsletterForm, setNewsletterForm] = useState({ subject: "", body: "" });
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

  // Reviews Moderation
  const [adminReviews, setAdminReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("pending");

  // Destinations Management
  const [destinations, setDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);
  const [editingDest, setEditingDest] = useState(null);
  const [destForm, setDestForm] = useState({ name: "", image: "", description: "", cities: "", attractions: "[]" });

  // Additional Services Management
  const [adminServices, setAdminServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ name: "", label: "", cost: "", sortOrder: "0" });

  // Settings
  const [siteSettings, setSiteSettings] = useState({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [newRoomType, setNewRoomType] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const [newCity, setNewCity] = useState("");

  const [roomTypeOptions, setRoomTypeOptions] = useState(ROOM_TYPES);
  const [cityOptions, setCityOptions] = useState(cities);

  // Analytics date range
  const [analyticsRange, setAnalyticsRange] = useState("year");

  // Available amenities
  const defaultAmenities = ["Free WiFi", "Free Breakfast", "Room Service", "Mountain View", "Pool Access"];
  const [availableAmenities, setAvailableAmenities] = useState(defaultAmenities);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
    settingsAPI.get('roomTypes').then(res => {
      if (res.data?.data?.value) setRoomTypeOptions(res.data.data.value);
    }).catch(() => {});
    settingsAPI.get('amenities').then(res => {
      if (res.data?.data?.value) setAvailableAmenities(res.data.data.value);
    }).catch(() => {});
    settingsAPI.get('cities').then(res => {
      if (res.data?.data?.value) setCityOptions(res.data.data.value);
    }).catch(() => {});
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log(" Fetching admin dashboard data...");
      
      const [hotelsRes, bookingsRes, offersRes, testimonialsRes] = await Promise.all([
        hotelAPI.getAll(),
        bookingAPI.getAll(),
        offerAPI.getAll(),
        testimonialAPI.getAllAdmin(),
      ]);
      
      console.log(" Admin Dashboard Data Received:");
      console.log("- Hotels:", hotelsRes.data.data?.length || 0);
      console.log("- Bookings:", bookingsRes.data.data?.length || 0);
      console.log("- Offers:", offersRes.data.data?.length || 0);
      console.log("- Testimonials:", testimonialsRes.data.data?.length || 0);
      console.log("Bookings data:", bookingsRes.data);
      
      setHotels(hotelsRes.data.data || []);
      setBookings(bookingsRes.data.data || []);
      setOffers(offersRes.data.data || []);
      setTestimonials(testimonialsRes.data.data || []);
      
      console.log(" State updated with data");
    } catch (error) {
      console.error(" Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for admin
  const fetchUsers = async (page = 1, search = "", role = "") => {
    try {
      setUsersLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (role) params.role = role;
      
      const response = await authAPI.getUsers(params);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setUsersPagination(response.data.data.pagination);
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  // Handle user role change
  const handleUserRoleChange = async (userId, newRole) => {
    try {
      const response = await authAPI.updateUserRole(userId, newRole);
      if (response.data.success) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers(usersPagination.currentPage, usersSearch, usersRoleFilter);
      }
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await authAPI.deleteUser(userId);
      if (response.data.success) {
        toast.success("User deleted successfully");
        fetchUsers(usersPagination.currentPage, usersSearch, usersRoleFilter);
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Handle users search
  const handleUsersSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, usersSearch, usersRoleFilter);
  };

  // Blog Management Functions
  const fetchBlogPosts = async (page = 1, search = "", status = "") => {
    try {
      setBlogLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      
      const response = await blogAPI.getAllAdmin(params);
      if (response.data.success) {
        setBlogPosts(response.data.data.posts);
        setBlogPagination(response.data.data.pagination);
      }
    } catch (error) {
      toast.error("Failed to load blog posts");
    } finally {
      setBlogLoading(false);
    }
  };

  const handleBlogSearch = (e) => {
    e.preventDefault();
    fetchBlogPosts(1, blogSearch, blogStatusFilter);
  };

  const handleAddBlogPost = async (e) => {
    e.preventDefault();
    try {
      const postData = {
        ...newBlogPost,
        tags: newBlogPost.tags.split(",").map(t => t.trim()).filter(t => t),
      };
      
      const response = await blogAPI.create(postData);
      if (response.data.success) {
        toast.success("Blog post created successfully!");
        setShowAddBlogModal(false);
        setNewBlogPost({
          title: "",
          excerpt: "",
          content: "",
          coverImage: "",
          category: "Travel Tips",
          tags: "",
          status: "draft",
          isFeatured: false,
          metaTitle: "",
          metaDescription: "",
        });
        fetchBlogPosts(blogPagination.currentPage, blogSearch, blogStatusFilter);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create blog post");
    }
  };

  const handleEditBlogPost = async (e) => {
    e.preventDefault();
    if (!editingBlog) return;
    
    try {
      const postData = {
        ...newBlogPost,
        tags: typeof newBlogPost.tags === 'string' 
          ? newBlogPost.tags.split(",").map(t => t.trim()).filter(t => t)
          : newBlogPost.tags,
      };
      
      const response = await blogAPI.update(editingBlog.id, postData);
      if (response.data.success) {
        toast.success("Blog post updated successfully!");
        setShowEditBlogModal(false);
        setEditingBlog(null);
        fetchBlogPosts(blogPagination.currentPage, blogSearch, blogStatusFilter);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update blog post");
    }
  };

  const handleDeleteBlogPost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    
    try {
      const response = await blogAPI.delete(postId);
      if (response.data.success) {
        toast.success("Blog post deleted successfully!");
        fetchBlogPosts(blogPagination.currentPage, blogSearch, blogStatusFilter);
      }
    } catch (error) {
      toast.error("Failed to delete blog post");
    }
  };

  const handleToggleFeatured = async (postId) => {
    try {
      const response = await blogAPI.toggleFeatured(postId);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchBlogPosts(blogPagination.currentPage, blogSearch, blogStatusFilter);
      }
    } catch (error) {
      toast.error("Failed to update featured status");
    }
  };

  const openEditBlogModal = (post) => {
    setEditingBlog(post);
    setNewBlogPost({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      category: post.category,
      tags: post.tags?.join(", ") || "",
      status: post.status,
      isFeatured: post.isFeatured,
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
    });
    setShowEditBlogModal(true);
  };

  const BLOG_CATEGORIES = [
    'Travel Tips',
    'Destinations',
    'Culture',
    'Food & Dining',
    'Adventure',
    'Accommodation',
    'News',
    'Guides',
  ];

  // Promo Code Handlers
  const fetchPromoCodes = async () => {
    setPromoLoading(true);
    try {
      const res = await promoAPI.getAll();
      if (res.data.success) setPromoCodes(res.data.data);
    } catch {
      toast.error("Failed to load promo codes");
    } finally {
      setPromoLoading(false);
    }
  };

  const resetPromoForm = () => {
    setNewPromo({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minBookingAmount: "0",
      maxDiscount: "",
      validFrom: "",
      validUntil: "",
      usageLimit: "",
      usagePerUser: "1",
      isFirstBookingOnly: false,
      isActive: true,
    });
    setEditingPromo(null);
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code: newPromo.code.toUpperCase(),
      description: newPromo.description,
      discountType: newPromo.discountType,
      discountValue: parseFloat(newPromo.discountValue),
      minBookingAmount: parseFloat(newPromo.minBookingAmount) || 0,
      maxDiscount: newPromo.maxDiscount ? parseFloat(newPromo.maxDiscount) : null,
      validFrom: new Date(newPromo.validFrom).toISOString(),
      validUntil: new Date(newPromo.validUntil).toISOString(),
      usageLimit: newPromo.usageLimit ? parseInt(newPromo.usageLimit) : null,
      usagePerUser: parseInt(newPromo.usagePerUser) || 1,
      isFirstBookingOnly: newPromo.isFirstBookingOnly,
      isActive: newPromo.isActive,
    };
    try {
      if (editingPromo) {
        await promoAPI.update(editingPromo.id, payload);
        toast.success("Promo code updated!");
      } else {
        await promoAPI.create(payload);
        toast.success("Promo code created!");
      }
      setShowPromoModal(false);
      resetPromoForm();
      fetchPromoCodes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save promo code");
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm("Delete this promo code?")) return;
    try {
      await promoAPI.delete(id);
      toast.success("Promo code deleted");
      fetchPromoCodes();
    } catch {
      toast.error("Failed to delete promo code");
    }
  };

  const handleTogglePromo = async (id) => {
    try {
      const res = await promoAPI.toggle(id);
      toast.success(res.data.message);
      fetchPromoCodes();
    } catch {
      toast.error("Failed to toggle promo code");
    }
  };

  const openEditPromo = (promo) => {
    setEditingPromo(promo);
    setNewPromo({
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: String(promo.discountValue),
      minBookingAmount: String(promo.minBookingAmount),
      maxDiscount: promo.maxDiscount != null ? String(promo.maxDiscount) : "",
      validFrom: promo.validFrom.slice(0, 10),
      validUntil: promo.validUntil.slice(0, 10),
      usageLimit: promo.usageLimit != null ? String(promo.usageLimit) : "",
      usagePerUser: String(promo.usagePerUser),
      isFirstBookingOnly: promo.isFirstBookingOnly,
      isActive: promo.isActive,
    });
    setShowPromoModal(true);
  };

  // Newsletter Handlers
  const fetchSubscribers = async (filter = subscriberFilter) => {
    setSubscribersLoading(true);
    try {
      const active = filter === "active" ? true : filter === "inactive" ? false : undefined;
      const res = await newsletterAPI.getSubscribers(active);
      if (res.data.success) setSubscribers(res.data.data);
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setSubscribersLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id) => {
    if (!window.confirm("Remove this subscriber permanently?")) return;
    try {
      await newsletterAPI.deleteSubscriber(id);
      toast.success("Subscriber removed");
      fetchSubscribers();
    } catch {
      toast.error("Failed to remove subscriber");
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    const bodyText = newsletterForm.body?.replace(/<[^>]+>/g, '').trim();
    if (!newsletterForm.subject || !bodyText) {
      toast.error("Subject and body are required");
      return;
    }
    setSendingNewsletter(true);
    try {
      const activeCount = subscribers.filter(s => s.isActive).length;
      if (!window.confirm(`Send this newsletter to ${activeCount} active subscriber${activeCount !== 1 ? 's' : ''}?`)) {
        setSendingNewsletter(false);
        return;
      }
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; } a { color: #2b3990; } ul, ol { padding-left: 20px; } p { margin: 0 0 14px 0; color: #475569; font-size: 15px; line-height: 1.7; }</style></head><body style="font-family: Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px;"><div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);"><div style="background: linear-gradient(135deg, #2b3990 0%, #1e2a6e 100%); padding: 40px 30px; text-align: center;"><h1 style="margin: 0; color: white; font-size: 24px;">${newsletterForm.subject}</h1></div><div style="padding: 32px 30px; color: #475569; font-size: 15px; line-height: 1.7;">${newsletterForm.body}</div><div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;"><p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} Nonsa Travels. All rights reserved.</p><p style="margin: 0; font-size: 12px; color: #94a3b8;">Kwacha Street, Chingola, Zambia | +260 970 462 777</p></div></div></body></html>`;
      const res = await newsletterAPI.sendNewsletter({ subject: newsletterForm.subject, html, text: bodyText });
      if (res.data.success) {
        toast.success(res.data.message);
        setShowSendNewsletterModal(false);
        setNewsletterForm({ subject: "", body: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send newsletter");
    } finally {
      setSendingNewsletter(false);
    }
  };

  // Reviews Moderation Handlers
  const fetchAdminReviews = async (filter = reviewFilter) => {
    setReviewsLoading(true);
    try {
      const res = await reviewAPI.getAll({ status: filter === 'all' ? undefined : filter });
      if (res.data.success) setAdminReviews(res.data.data);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleApproveReview = async (id) => {
    try {
      await reviewAPI.approve(id);
      toast.success("Review approved");
      fetchAdminReviews();
    } catch {
      toast.error("Failed to approve review");
    }
  };

  const handleRejectReview = async (id) => {
    if (!window.confirm("Reject and delete this review?")) return;
    try {
      await reviewAPI.reject(id);
      toast.success("Review rejected");
      fetchAdminReviews();
    } catch {
      toast.error("Failed to reject review");
    }
  };

  // Calculate dashboard stats
  // Only count revenue from confirmed and completed bookings
  const confirmedStatuses = ['confirmed', 'completed', 'payment_confirmed'];
  const stats = {
    totalBookings: bookings.length,
    totalRevenue: bookings
      .filter((b) => confirmedStatuses.includes(b.status))
      .reduce((sum, b) => sum + b.totalPrice, 0),
    totalHotels: hotels.length,
    activeGuests: bookings.filter(
      (b) => b.status === "confirmed"
    ).length,
    pendingBookings: bookings.filter(
      (b) => b.status === "pending_payment" || b.status === "payment_confirmed"
    ).length,
    completedBookings: bookings.filter(
      (b) => b.status === "completed"
    ).length,
    cancelledBookings: bookings.filter(
      (b) => b.status === "cancelled"
    ).length,
  };

  // Destinations Handlers
  const fetchDestinations = async () => {
    setDestinationsLoading(true);
    try {
      const res = await destinationAPI.getAllAdmin();
      if (res.data.success) setDestinations(res.data.data);
    } catch { toast.error("Failed to load destinations"); }
    finally { setDestinationsLoading(false); }
  };

  const handleDestSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: destForm.name,
      image: destForm.image || null,
      description: destForm.description || null,
      cities: destForm.cities.split(",").map(c => c.trim()).filter(Boolean),
      attractions: (() => { try { return JSON.parse(destForm.attractions); } catch { return []; } })(),
      isActive: true,
    };
    try {
      if (editingDest) {
        await destinationAPI.update(editingDest.id, payload);
        toast.success("Destination updated");
      } else {
        await destinationAPI.create(payload);
        toast.success("Destination created");
      }
      setShowDestModal(false);
      setEditingDest(null);
      fetchDestinations();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save destination"); }
  };

  const handleDeleteDest = async (id) => {
    if (!window.confirm("Delete this destination?")) return;
    try { await destinationAPI.delete(id); toast.success("Deleted"); fetchDestinations(); }
    catch { toast.error("Failed to delete"); }
  };

  const handleSeedDestinations = async () => {
    try {
      const res = await destinationAPI.seed();
      toast.success(res.data.message);
      fetchDestinations();
    } catch { toast.error("Failed to seed destinations"); }
  };

  const openEditDest = (d) => {
    setEditingDest(d);
    setDestForm({
      name: d.name,
      image: d.image || "",
      description: d.description || "",
      cities: (d.cities || []).join(", "),
      attractions: JSON.stringify(d.attractions || [], null, 2),
    });
    setShowDestModal(true);
  };

  // Settings Handlers
  const fetchSettings = async () => {
    setSettingsLoading(true);
    try { const res = await settingsAPI.getAll(); if (res.data.success) setSiteSettings(res.data.data); }
    catch { toast.error("Failed to load settings"); }
    finally { setSettingsLoading(false); }
  };

  const saveRoomTypes = async (roomTypes) => {
    try {
      await settingsAPI.save('roomTypes', roomTypes);
      setSiteSettings(prev => ({ ...prev, roomTypes }));
      setRoomTypeOptions(roomTypes);
      toast.success("Room types saved");
    } catch { toast.error("Failed to save"); }
  };

  const saveAmenities = async (amenities) => {
    try {
      await settingsAPI.save('amenities', amenities);
      setSiteSettings(prev => ({ ...prev, amenities }));
      setAvailableAmenities(amenities);
      toast.success("Amenities saved");
    } catch { toast.error("Failed to save"); }
  };

  const saveCities = async (citiesList) => {
    try {
      await settingsAPI.save('cities', citiesList);
      setSiteSettings(prev => ({ ...prev, cities: citiesList }));
      setCityOptions(citiesList);
      toast.success("Cities saved");
    } catch { toast.error("Failed to save"); }
  };

  const saveSetting = async (key, value) => {
    try {
      await settingsAPI.save(key, value);
      setSiteSettings(prev => ({ ...prev, [key]: value }));
      toast.success("Setting saved");
    } catch { toast.error("Failed to save"); }
  };

  // Additional Services Handlers
  const fetchAdminServices = async () => {
    setServicesLoading(true);
    try { const res = await servicesAPI.getAllAdmin(); if (res.data.success) setAdminServices(res.data.data); }
    catch { toast.error("Failed to load services"); }
    finally { setServicesLoading(false); }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: serviceForm.name, label: serviceForm.label, cost: parseFloat(serviceForm.cost), sortOrder: parseInt(serviceForm.sortOrder) || 0, isActive: true };
    try {
      if (editingService) { await servicesAPI.update(editingService.id, payload); toast.success("Service updated"); }
      else { await servicesAPI.create(payload); toast.success("Service created"); }
      setShowServiceModal(false); setEditingService(null); fetchAdminServices();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save service"); }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try { await servicesAPI.delete(id); toast.success("Deleted"); fetchAdminServices(); }
    catch { toast.error("Failed to delete"); }
  };

  const handleSeedServices = async () => {
    try { const res = await servicesAPI.seed(); toast.success(res.data.message); fetchAdminServices(); }
    catch { toast.error("Failed to seed services"); }
  };

  const filterBookingsByRange = (list) => {
    if (analyticsRange === 'all') return list;
    const now = new Date();
    let cutoff;
    if (analyticsRange === 'month') cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (analyticsRange === 'quarter') cutoff = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    else cutoff = new Date(now.getFullYear(), 0, 1);
    return list.filter(b => new Date(b.createdAt) >= cutoff);
  };

  const generateBookingTrendsData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    return monthNames.map((month, index) => {
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.getMonth() === index && bookingDate.getFullYear() === currentYear;
      });
      
      return {
        month,
        bookings: monthBookings.length,
        revenue: monthBookings.reduce((sum, b) => sum + b.totalPrice, 0),
      };
    });
  };

  // Generate revenue by room type from actual bookings
  const generateRevenueData = () => {
    const roomTypes = {};
    const filtered = filterBookingsByRange(bookings);

    filtered.forEach(booking => {
      const roomType = booking.roomTypeName || booking.hotelId?.roomType || 'Standard';
      if (!roomTypes[roomType]) {
        roomTypes[roomType] = { revenue: 0, bookings: 0 };
      }
      roomTypes[roomType].revenue += booking.totalPrice;
      roomTypes[roomType].bookings += 1;
    });

    return Object.entries(roomTypes).map(([category, data]) => ({
      category,
      revenue: Math.round(data.revenue),
      bookings: data.bookings,
    }));
  };

  // Generate guest demographics from actual bookings
  const generateGuestDemographicsData = () => {
    const totalBookings = bookings.length;
    if (totalBookings === 0) {
      return [
        { name: "No Data", value: 100, color: "#6b7280" },
      ];
    }
    
    // Calculate based on booking patterns (you can customize this logic)
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending_payment' || b.status === 'payment_confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    return [
      { name: "Confirmed", value: Math.round((confirmedBookings / totalBookings) * 100), color: "#10b981" },
      { name: "Completed", value: Math.round((completedBookings / totalBookings) * 100), color: "#2b3990" },
      { name: "Pending", value: Math.round((pendingBookings / totalBookings) * 100), color: "#ffa500" },
      { name: "Cancelled", value: Math.round((cancelledBookings / totalBookings) * 100), color: "#ef4444" },
    ].filter(item => item.value > 0);
  };

  const bookingTrendsData = generateBookingTrendsData();
  const revenueData = generateRevenueData();
  const guestDemographicsData = generateGuestDemographicsData();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHotel((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image URL changes
  const handleImageChange = (index, value) => {
    const newImageUrls = [...newHotel.imageUrls];
    newImageUrls[index] = value;
    setNewHotel((prev) => ({ ...prev, imageUrls: newImageUrls }));
  };

  // Handle hotel images from ImageUpload component
  const handleHotelImagesSelect = (images) => {
    setNewHotel((prev) => ({ ...prev, imageUrls: images }));
  };

  // Handle amenity selection
  const handleAmenityToggle = (amenity) => {
    setNewHotel((prev) => {
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities };
    });
  };

  // Handle offer form changes
  const handleOfferInputChange = (e) => {
    const { name, value } = e.target;
    setNewOffer((prev) => ({ ...prev, [name]: value }));
  };

  // Handle offer image from ImageUpload component
  const handleOfferImageSelect = (images) => {
    if (images && images.length > 0) {
      setNewOffer((prev) => ({ ...prev, imageUrl: images[0] }));
    }
  };

  // Handle add offer submission
  const handleAddOffer = async (e) => {
    e.preventDefault();

    if (!newOffer.title || !newOffer.description || !newOffer.priceOff || !newOffer.expiryDate || !newOffer.imageUrl) {
      toast.warning("Please fill in all required fields");
      return;
    }

    try {
      const offerData = {
        title: newOffer.title,
        description: newOffer.description,
        priceOff: parseInt(newOffer.priceOff),
        expiryDate: newOffer.expiryDate,
        image: newOffer.imageUrl,
        hotelId: newOffer.hotelId || null,
        promoCode: newOffer.promoCode || null,
        packageDetails: newOffer.packageDetails || null,
        isActive: true,
      };

      const response = await offerAPI.create(offerData);
      setOffers((prev) => [response.data.data, ...prev]);
      setNewOffer({ title: "", description: "", priceOff: "", expiryDate: "", imageUrl: "", hotelId: "", promoCode: "", packageDetails: "" });
      setShowAddOfferModal(false);
      toast.success("Offer added successfully!");
    } catch (error) {
      // Error toast handled by API interceptor
    }
  };

  // Open edit offer modal
  const openEditOfferModal = (offer) => {
    setEditingOffer(offer);
    setNewOffer({
      title: offer.title,
      description: offer.description,
      priceOff: offer.priceOff.toString(),
      expiryDate: offer.expiryDate.split('T')[0],
      imageUrl: offer.image,
      hotelId: offer.hotelId || "",
      promoCode: offer.promoCode || "",
      packageDetails: offer.packageDetails || "",
    });
    setShowEditOfferModal(true);
  };

  // Handle edit offer
  const handleEditOffer = async (e) => {
    e.preventDefault();

    if (!newOffer.title || !newOffer.description || !newOffer.priceOff || !newOffer.expiryDate || !newOffer.imageUrl) {
      toast.warning("Please fill in all required fields");
      return;
    }

    try {
      const offerData = {
        title: newOffer.title,
        description: newOffer.description,
        priceOff: parseInt(newOffer.priceOff),
        expiryDate: newOffer.expiryDate,
        image: newOffer.imageUrl,
        hotelId: newOffer.hotelId || null,
        promoCode: newOffer.promoCode || null,
        packageDetails: newOffer.packageDetails || null,
        isActive: true,
      };

      const response = await offerAPI.update(editingOffer.id, offerData);
      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === editingOffer.id ? response.data.data : offer
        )
      );
      setNewOffer({ title: "", description: "", priceOff: "", expiryDate: "", imageUrl: "", hotelId: "", promoCode: "", packageDetails: "" });
      setShowEditOfferModal(false);
      setEditingOffer(null);
      toast.success("Offer updated successfully!");
    } catch (error) {
      // Error toast handled by API interceptor
    }
  };

  // Delete offer
  const handleDeleteOffer = async (offerId) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      try {
        await offerAPI.delete(offerId);
        setOffers((prev) => prev.filter((offer) => offer.id !== offerId));
        toast.success("Offer deleted successfully!");
      } catch (error) {
        // Error toast handled by API interceptor
      }
    }
  };

  // Testimonials handlers
  const handleTestimonialInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTestimonial((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Handle testimonial image from ImageUpload component
  const handleTestimonialImageSelect = (images) => {
    if (images && images.length > 0) {
      setNewTestimonial((prev) => ({ ...prev, image: images[0] }));
    }
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();

    if (!newTestimonial.name || !newTestimonial.location || !newTestimonial.image || !newTestimonial.review) {
      toast.warning("Please fill in all required fields");
      return;
    }

    try {
      const testimonialData = {
        name: newTestimonial.name,
        location: newTestimonial.location,
        image: newTestimonial.image,
        rating: parseInt(newTestimonial.rating),
        review: newTestimonial.review,
        isActive: newTestimonial.isActive,
      };

      const response = await testimonialAPI.create(testimonialData);
      setTestimonials((prev) => [response.data.data, ...prev]);
      setNewTestimonial({
        name: "",
        location: "",
        image: "",
        rating: "5",
        review: "",
        isActive: true,
      });
      setShowAddTestimonialModal(false);
      toast.success("Testimonial added successfully!");
    } catch (error) {
      toast.error("Failed to add testimonial");
    }
  };

  const handleEditTestimonialSubmit = async (e) => {
    e.preventDefault();

    if (!newTestimonial.name || !newTestimonial.location || !newTestimonial.image || !newTestimonial.review) {
      toast.warning("Please fill in all required fields");
      return;
    }

    try {
      const testimonialData = {
        name: newTestimonial.name,
        location: newTestimonial.location,
        image: newTestimonial.image,
        rating: parseInt(newTestimonial.rating),
        review: newTestimonial.review,
        isActive: newTestimonial.isActive,
      };

      const response = await testimonialAPI.update(editingTestimonial.id, testimonialData);
      setTestimonials((prev) =>
        prev.map((t) => (t.id === editingTestimonial.id ? response.data.data : t))
      );
      setNewTestimonial({
        name: "",
        location: "",
        image: "",
        rating: "5",
        review: "",
        isActive: true,
      });
      setEditingTestimonial(null);
      setShowEditTestimonialModal(false);
      toast.success("Testimonial updated successfully!");
    } catch (error) {
      toast.error("Failed to update testimonial");
    }
  };

  const handleEditTestimonial = (testimonial) => {
    setEditingTestimonial(testimonial);
    setNewTestimonial({
      name: testimonial.name,
      location: testimonial.location,
      image: testimonial.image,
      rating: testimonial.rating.toString(),
      review: testimonial.review,
      isActive: testimonial.isActive,
    });
    setShowEditTestimonialModal(true);
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      try {
        await testimonialAPI.delete(testimonialId);
        setTestimonials((prev) => prev.filter((t) => t.id !== testimonialId));
        toast.success("Testimonial deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete testimonial");
      }
    }
  };

  const toggleTestimonialStatus = async (testimonialId) => {
    try {
      const response = await testimonialAPI.toggleStatus(testimonialId);
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === testimonialId ? { ...t, isActive: response.data.data.isActive } : t
        )
      );
      toast.success("Testimonial status updated successfully!");
    } catch (error) {
      toast.error("Failed to update testimonial status");
    }
  };

  // Toggle hotel featured status
  const toggleFeaturedHotel = async (hotelId) => {
    try {
      const response = await hotelAPI.toggleFeatured(hotelId);
      setHotels((prev) =>
        prev.map((hotel) =>
          hotel.id === hotelId
            ? { ...hotel, isFeatured: response.data.data.isFeatured }
            : hotel
        )
      );
      toast.success("Featured status updated successfully!");
    } catch (error) {
      // Error toast handled by API interceptor
    }
  };

  // Delete hotel
  const handleDeleteHotel = async (hotelId) => {
    if (confirm("Are you sure you want to delete this hotel? This action cannot be undone.")) {
      try {
        await hotelAPI.delete(hotelId);
        setHotels((prev) => prev.filter((hotel) => hotel.id !== hotelId));
        toast.success("Hotel deleted successfully!");
      } catch (error) {
        // Error toast handled by API interceptor
      }
    }
  };

  // Open edit modal
  const handleEditHotel = (hotel) => {
    setEditingHotel(hotel);
    const dp = (() => { try { return typeof hotel.dynamicPricing === 'string' ? JSON.parse(hotel.dynamicPricing) : (hotel.dynamicPricing || {}); } catch { return {}; } })();
    setNewHotel({
      hotelName: hotel.name || "",
      address: hotel.address || "",
      city: hotel.city || "",
      contact: hotel.contact || "",
      roomType: hotel.roomType || "Double Bed",
      pricePerNight: String(hotel.pricePerNight || 0),
      totalRooms: String(hotel.totalRooms || 10),
      rating: String(hotel.rating || 4.5),
      amenities: hotel.amenities || [],
      imageUrls: [
        hotel.images?.[0] || "",
        hotel.images?.[1] || "",
        hotel.images?.[2] || "",
        hotel.images?.[3] || "",
      ],
      dynamicPricingEnabled: dp.enabled !== false,
      peakSeasonMultiplier: String(dp.peakSeasonMultiplier || 1.5),
      lowOccupancyDiscount: String(dp.lowOccupancyDiscount || 0.9),
      highDemandMultiplier: String(dp.highDemandMultiplier || 1.3),
      cancellationPolicy: hotel.cancellationPolicy || 'free_24h',
      roomTypes: hotel.roomTypes?.length > 0
        ? hotel.roomTypes.map(rt => ({
            name: rt.name || "Double Bed",
            pricePerNight: String(rt.pricePerNight || 0),
            roomCount: String(rt.roomCount || 1),
            maxGuests: String(rt.maxGuests || 2),
            description: rt.description || "",
          }))
        : [{ name: hotel.roomType, pricePerNight: hotel.pricePerNight.toString(), roomCount: (hotel.totalRooms || 10).toString(), maxGuests: "2", description: "" }],
    });
    setShowEditHotelModal(true);
  };

  // Handle update hotel
  const handleUpdateHotel = async (e) => {
    e.preventDefault();

    const validRoomTypes = (newHotel.roomTypes || []).filter(rt => rt.name && rt.pricePerNight);
    if (!newHotel.hotelName || !newHotel.address || !newHotel.city) {
      toast.warning("Please fill in all required fields");
      return;
    }
    if (validRoomTypes.length === 0) {
      toast.warning("Please add at least one room type with a price");
      return;
    }

    if (newHotel.amenities.length === 0) {
      toast.warning("Please select at least one amenity");
      return;
    }

    const validImages = newHotel.imageUrls.filter((url) => url.trim() !== "");
    if (validImages.length === 0) {
      toast.warning("Please provide at least one image URL");
      return;
    }

    try {
      const roomTypesPayload = validRoomTypes.map(rt => ({
        name: rt.name,
        description: rt.description || null,
        pricePerNight: parseFloat(rt.pricePerNight),
        roomCount: parseInt(rt.roomCount) || 1,
        maxGuests: parseInt(rt.maxGuests) || 2,
      }));
      const minPrice = Math.min(...roomTypesPayload.map(rt => rt.pricePerNight));
      const totalRooms = roomTypesPayload.reduce((s, rt) => s + rt.roomCount, 0);

      const updatedData = {
        name: newHotel.hotelName,
        address: newHotel.address,
        city: newHotel.city,
        contact: newHotel.contact,
        roomType: roomTypesPayload[0].name,
        pricePerNight: minPrice,
        basePricePerNight: minPrice,
        totalRooms,
        rating: parseFloat(newHotel.rating),
        amenities: newHotel.amenities,
        images: validImages,
        dynamicPricing: {
          enabled: newHotel.dynamicPricingEnabled,
          peakSeasonMultiplier: parseFloat(newHotel.peakSeasonMultiplier),
          lowOccupancyDiscount: parseFloat(newHotel.lowOccupancyDiscount),
          highDemandMultiplier: parseFloat(newHotel.highDemandMultiplier),
        },
        roomTypes: roomTypesPayload,
        cancellationPolicy: newHotel.cancellationPolicy || 'free_24h',
      };

      const response = await hotelAPI.update(editingHotel.id, updatedData);
      setHotels((prev) =>
        prev.map((hotel) =>
          hotel.id === editingHotel.id ? response.data.data : hotel
        )
      );

      setNewHotel({
        hotelName: "",
        address: "",
        city: "",
        contact: "",
        roomType: "Double Bed",
        pricePerNight: "",
        rating: "4.5",
        amenities: [],
        imageUrls: ["", "", "", ""],
        roomTypes: [{ ...defaultRoomType }],
      });

      setShowEditHotelModal(false);
      setEditingHotel(null);
      toast.success("Hotel updated successfully!");
    } catch (error) {
      // Error toast handled by API interceptor
    }
  };

  // Handle booking status update
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await bookingAPI.updateStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? response.data.data : booking
        )
      );
      toast.success(`Booking status updated to ${newStatus}!`);
    } catch (error) {
      // Error toast handled by API interceptor
    }
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        const response = await bookingAPI.cancel(bookingId);
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId ? response.data.data : booking
          )
        );
        toast.success("Booking cancelled successfully!");
      } catch (error) {
        // Error toast handled by API interceptor
      }
    }
  };

  // Delete booking completely
  const handleDeleteBooking = async (bookingId) => {
    if (confirm("Are you sure you want to permanently delete this booking? This action cannot be undone.")) {
      try {
        await bookingAPI.deletePermanently(bookingId);
        setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
        toast.success("Booking deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete booking");
      }
    }
  };

  // Reset all data (dangerous operation)
  const handleResetAllData = async () => {
    const confirmText = prompt(
      " WARNING: This will delete ALL bookings from the database.\n\nThis action CANNOT be undone!\n\nType 'RESET' to confirm:"
    );
    
    if (confirmText === "RESET") {
      try {
        // Delete all bookings permanently
        const deletePromises = bookings.map(booking => bookingAPI.deletePermanently(booking.id));
        await Promise.all(deletePromises);
        
        setBookings([]);
        toast.success("All bookings have been deleted!");
      } catch (error) {
        toast.error("Failed to reset all data");
      }
    } else if (confirmText !== null) {
      toast.error("Reset cancelled - incorrect confirmation text");
    }
  };

  // Download invoice for a booking
  const handleDownloadInvoice = async (bookingId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/${bookingId}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate invoice');
      }

      // Get filename from headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `Invoice-${bookingId}.pdf`;
      if (contentDisposition) {
        const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Invoice download error:', error);
      toast.error(error.message || 'Failed to download invoice');
    }
  };

  // Send invoice via email
  const handleSendInvoice = async (bookingId) => {
    if (confirm('Send invoice to customer via email?')) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/${bookingId}/send-invoice`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to send invoice');
        }

        toast.success(`Invoice sent to ${data.email}`);
      } catch (error) {
        console.error('Send invoice error:', error);
        toast.error(error.message || 'Failed to send invoice');
      }
    }
  };

  // Handle form submission
  const handleAddHotel = async (e) => {
    e.preventDefault();

    const validRoomTypes = (newHotel.roomTypes || []).filter(rt => rt.name && rt.pricePerNight);
    // Validate form
    if (!newHotel.hotelName || !newHotel.address || !newHotel.city) {
      toast.warning("Please fill in all required fields");
      return;
    }
    if (validRoomTypes.length === 0) {
      toast.warning("Please add at least one room type with a price");
      return;
    }

    if (newHotel.amenities.length === 0) {
      toast.warning("Please select at least one amenity");
      return;
    }

    // Filter out empty image URLs and validate at least one image
    const validImages = newHotel.imageUrls.filter((url) => url.trim() !== "");
    if (validImages.length === 0) {
      toast.warning("Please provide at least one image URL");
      return;
    }

    try {
      const roomTypesPayload = validRoomTypes.map(rt => ({
        name: rt.name,
        description: rt.description || null,
        pricePerNight: parseFloat(rt.pricePerNight),
        roomCount: parseInt(rt.roomCount) || 1,
        maxGuests: parseInt(rt.maxGuests) || 2,
      }));
      const minPrice = Math.min(...roomTypesPayload.map(rt => rt.pricePerNight));
      const totalRooms = roomTypesPayload.reduce((s, rt) => s + rt.roomCount, 0);

      const hotelData = {
        name: newHotel.hotelName,
        address: newHotel.address,
        city: newHotel.city,
        contact: newHotel.contact,
        roomType: roomTypesPayload[0].name,
        pricePerNight: minPrice,
        basePricePerNight: minPrice,
        totalRooms,
        rating: parseFloat(newHotel.rating),
        amenities: newHotel.amenities,
        images: validImages,
        isAvailable: true,
        dynamicPricing: {
          enabled: newHotel.dynamicPricingEnabled,
          peakSeasonMultiplier: parseFloat(newHotel.peakSeasonMultiplier),
          lowOccupancyDiscount: parseFloat(newHotel.lowOccupancyDiscount),
          highDemandMultiplier: parseFloat(newHotel.highDemandMultiplier),
        },
        roomTypes: roomTypesPayload,
        cancellationPolicy: newHotel.cancellationPolicy || 'free_24h',
      };

      const response = await hotelAPI.create(hotelData);
      setHotels((prev) => [response.data.data, ...prev]);

      // Reset form
      setNewHotel({
        hotelName: "",
        address: "",
        city: "",
        contact: "",
        roomType: "Double Bed",
        pricePerNight: "",
        totalRooms: "10",
        rating: "4.5",
        amenities: [],
        imageUrls: ["", "", "", ""],
        dynamicPricingEnabled: true,
        peakSeasonMultiplier: "1.5",
        lowOccupancyDiscount: "0.9",
        highDemandMultiplier: "1.3",
        roomTypes: [{ ...defaultRoomType }],
      });

      // Close modal
      setShowAddHotelModal(false);

      // Show success message
      toast.success("Hotel added successfully!");
    } catch (error) {
      // Error toast handled by API interceptor
    }
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter((booking) => {
    const hotelName = booking.hotelId?.name || "";
    const userName = booking.userName || "";
    const matchesSearch =
      hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0f172a] text-white z-50 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Brand */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faHotel} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm leading-tight truncate">Nonsa Travels</div>
              <div className="text-[10px] text-white/40 leading-tight">Admin Panel</div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white transition-colors ml-2 flex-shrink-0">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <div className="px-3 space-y-0.5">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 pt-2 pb-1">Main</p>
            <SidebarNavItem icon={faHome} label="Overview" active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }} />
            <SidebarNavItem icon={faCalendarCheck} label="Bookings" active={activeTab === "bookings"} onClick={() => { setActiveTab("bookings"); setSidebarOpen(false); }} />
            <SidebarNavItem icon={faHotel} label="Hotels" active={activeTab === "hotels"} onClick={() => { setActiveTab("hotels"); setSidebarOpen(false); }} />
            <SidebarNavItem icon={faChartBar} label="Analytics" active={activeTab === "analytics"} onClick={() => { setActiveTab("analytics"); setSidebarOpen(false); }} />

            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 pt-4 pb-1">Content</p>
            <SidebarNavItem icon={faGlobe} label="Homepage" active={activeTab === "homepage"} onClick={() => { setActiveTab("homepage"); setSidebarOpen(false); }} />
            <SidebarNavItem icon={faGlobe} label="Destinations" active={activeTab === "destinations"} onClick={() => { setActiveTab("destinations"); fetchDestinations(); setSidebarOpen(false); }} />
            <SidebarNavItem icon={faStar} label="Testimonials" active={activeTab === "testimonials"} onClick={() => { setActiveTab("testimonials"); setSidebarOpen(false); }} />
            <SidebarNavItem icon={faBlog} label="Blog" active={activeTab === "blog"} onClick={() => { setActiveTab("blog"); if (blogPosts.length === 0) fetchBlogPosts(); setSidebarOpen(false); }} />
            <SidebarNavItem icon={faTag} label="Promo Codes" active={activeTab === "promos"} onClick={() => { setActiveTab("promos"); if (promoCodes.length === 0) fetchPromoCodes(); setSidebarOpen(false); }} />
            <SidebarNavItem icon={faNewspaper} label="Newsletter" active={activeTab === "newsletter"} onClick={() => { setActiveTab("newsletter"); if (subscribers.length === 0) fetchSubscribers(); setSidebarOpen(false); }} />
            <SidebarNavItem icon={faTag} label="Services" active={activeTab === "services"} onClick={() => { setActiveTab("services"); fetchAdminServices(); setSidebarOpen(false); }} />

            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 pt-4 pb-1">Community</p>
            <SidebarNavItem icon={faStar} label="Reviews" active={activeTab === "reviews"} onClick={() => { setActiveTab("reviews"); fetchAdminReviews(); setSidebarOpen(false); }} />
            <SidebarNavItem icon={faComments} label="Chat Support" active={activeTab === "chat"} onClick={() => { setActiveTab("chat"); setSidebarOpen(false); }} />
            <SidebarNavItem icon={faUsers} label="Users" active={activeTab === "users"} onClick={() => { setActiveTab("users"); if (users.length === 0) fetchUsers(); setSidebarOpen(false); }} />

            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 pt-4 pb-1">System</p>
            <SidebarNavItem icon={faEllipsisV} label="Settings" active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); fetchSettings(); setSidebarOpen(false); }} />
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <Link to="/" className="flex items-center gap-2.5 text-white/50 hover:text-white text-sm transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main area ── */}
      <div className="flex-1 lg:ml-64 min-w-0 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3.5 flex items-center gap-3 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors -ml-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">
              {activeTab === "overview" ? "Dashboard Overview" :
               activeTab === "bookings" ? "Bookings" :
               activeTab === "hotels" ? "Hotels" :
               activeTab === "analytics" ? "Analytics" :
               activeTab === "homepage" ? "Homepage Content" :
               activeTab === "testimonials" ? "Testimonials" :
               activeTab === "chat" ? "Chat Support" :
               activeTab === "users" ? "Users" :
               activeTab === "blog" ? "Blog Posts" :
               activeTab === "newsletter" ? "Newsletter" :
               activeTab === "settings" ? "Settings" :
               activeTab === "services" ? "Additional Services" :
               activeTab === "destinations" ? "Destinations" :
               activeTab === "reviews" ? "Reviews" :
               "Promo Codes"}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full flex-shrink-0">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-white text-[10px]" />
            </div>
            <span className="hidden sm:inline font-medium">Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">

          {/* Stats cards — Overview only */}
          {activeTab === "overview" && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatCard icon={faCalendarCheck} title="Total Bookings" value={stats.totalBookings} color="blue" />
                <StatCard icon={faDollarSign} title="Total Revenue" value={`$${stats.totalRevenue}`} color="green" />
                <StatCard icon={faHotel} title="Total Hotels" value={stats.totalHotels} color="purple" />
                <StatCard icon={faUsers} title="Active Guests" value={stats.activeGuests} color="orange" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickStat label="Pending Bookings" value={stats.pendingBookings} icon={faClock} color="yellow" />
                <QuickStat label="Completed Bookings" value={stats.completedBookings} icon={faCheckCircle} color="green" />
                <QuickStat label="Cancelled Bookings" value={stats.cancelledBookings} icon={faTimesCircle} color="red" />
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
              {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Recent Activity
                  </h2>
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <ActivityItem key={booking.id} booking={booking} />
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-primary rounded-xl p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">
                      Total Revenue
                    </h3>
                    <p className="text-4xl font-bold mb-2">
                      ${stats.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm opacity-90">From {stats.totalBookings} bookings</p>
                  </div>
                  <div className="bg-accent rounded-xl p-6 text-gray-900">
                    <h3 className="text-lg font-semibold mb-2">
                      Confirmed Bookings
                    </h3>
                    <p className="text-4xl font-bold mb-2">{stats.activeGuests}</p>
                    <p className="text-sm opacity-90">Active guest reservations</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
                  {bookings.length > 0 && (
                    <button
                      onClick={handleResetAllData}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Reset All Bookings
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search by hotel or guest name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>

                  {/* Filter */}
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faFilter}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none bg-white cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="pending_payment">Pending Payment</option>
                      <option value="payment_confirmed">Payment Confirmed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Bookings - Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="pb-3 text-sm font-semibold text-gray-600">
                          Booking ID
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-600">
                          Guest
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-600">
                          Hotel
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-600">
                          Check-in
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-600">
                          Total
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-600">
                          Status
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => (
                        <BookingRow 
                          key={booking.id} 
                          booking={booking}
                          onUpdateStatus={handleUpdateBookingStatus}
                          onCancel={handleCancelBooking}
                          onDelete={handleDeleteBooking}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bookings - Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {filteredBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onUpdateStatus={handleUpdateBookingStatus}
                      onCancel={handleCancelBooking}
                      onDelete={handleDeleteBooking}
                      onDownloadInvoice={handleDownloadInvoice}
                      onSendInvoice={handleSendInvoice}
                    />
                  ))}
                </div>

                {filteredBookings.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No bookings found</p>
                  </div>
                )}
              </div>
            )}

            {/* Hotels Tab */}
            {activeTab === "hotels" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    All Hotels
                  </h2>
                  <button
                    onClick={() => setShowAddHotelModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add New Hotel
                  </button>
                </div>

                {hotels.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FontAwesomeIcon icon={faHotel} className="text-6xl text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-4">No hotels yet</p>
                    <button
                      onClick={() => setShowAddHotelModal(true)}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                    >
                      Add Your First Hotel
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.map((hotel) => (
                      <HotelCard 
                        key={hotel.id} 
                        hotel={hotel}
                        onEdit={handleEditHotel}
                        onDelete={handleDeleteHotel}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Homepage Content Management Tab */}
            {activeTab === "homepage" && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Homepage Content Management
                </h2>

                {/* Featured Hotels Section */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Featured Hotels
                    </h3>
                    <p className="text-sm text-gray-600">
                      Mark hotels as featured to show them on the homepage
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.slice(0, 6).map((hotel) => (
                      <div
                        key={hotel.id}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="relative h-40">
                          <img
                            src={hotel.images?.[0] || hotel.image || ''}
                            alt={hotel.name || hotel.hotel?.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <button
                              onClick={() => toggleFeaturedHotel(hotel.id)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                hotel.isFeatured
                                  ? "bg-accent text-white"
                                  : "bg-white text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {hotel.isFeatured
                                ? <><FontAwesomeIcon icon={faStar} className="mr-1" />Featured</>
                                : "Set Featured"}
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-gray-900 mb-1">
                            {hotel.name || hotel.hotel?.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {hotel.city || hotel.hotel?.city}
                          </p>
                          <p className="text-primary font-semibold">
                            ${hotel.pricePerNight}/night
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                     The first 3 featured hotels will be displayed on the homepage
                  </p>
                </div>

                {/* Exclusive Offers Section */}
                <div className="pt-8 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Exclusive Offers
                    </h3>
                    <button
                      onClick={() => setShowAddOfferModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Add New Offer
                    </button>
                  </div>

                  {offers.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-4">No exclusive offers yet</p>
                      <button
                        onClick={() => setShowAddOfferModal(true)}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                      >
                        Create Your First Offer
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div
                            className="relative h-48"
                            style={{
                              backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${offer.image})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <div className="absolute top-3 left-3">
                              <span className="px-3 py-1 bg-white text-gray-900 font-bold rounded-full text-sm">
                                {offer.priceOff}% OFF
                              </span>
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2">
                              <button
                                onClick={() => openEditOfferModal(offer)}
                                className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
                                title="Edit offer"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDeleteOffer(offer.id)}
                                className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                                title="Delete offer"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-gray-900 mb-2">
                              {offer.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {offer.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              Expires: {new Date(offer.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
                  <select value={analyticsRange} onChange={(e) => setAnalyticsRange(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    <option value="month">This Month</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">This Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Booking Trends Chart */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Booking Trends (Last 12 Months)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={bookingTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="bookings" 
                          stroke="#2b3990" 
                          strokeWidth={3}
                          dot={{ fill: '#2b3990', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Bookings"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Revenue Analysis Chart */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Revenue by Room Type
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="category" 
                          stroke="#6b7280"
                          style={{ fontSize: '11px' }}
                          angle={-15}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value) => `$${value}`}
                        />
                        <Legend />
                        <Bar 
                          dataKey="revenue" 
                          fill="#ffa500" 
                          name="Revenue ($)"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top Performing Hotels */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Top Performing Hotels
                    </h3>
                    <div className="space-y-3">
                      {hotels.slice(0, 5).map((hotel, index) => (
                        <div
                          key={hotel.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-orange-600' : 'bg-primary'
                            }`}>
                              {index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '3' : index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {hotel.name || hotel.hotel?.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {hotel.city || hotel.hotel?.city} •  {hotel.rating}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">
                              ${hotel.pricePerNight}
                            </p>
                            <p className="text-xs text-gray-600">per night</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {hotels.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No hotels available
                      </div>
                    )}
                  </div>

                  {/* Guest Demographics Chart */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Guest Demographics
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={guestDemographicsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {guestDemographicsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value) => `${value}%`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {guestDemographicsData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-700">
                            {item.name}: {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Stats Row */}
                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-blue-50 rounded-xl p-6 text-gray-900">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">Average Revenue</h4>
                      <FontAwesomeIcon icon={faDollarSign} className="text-2xl text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold mb-1">
                      ${(bookingTrendsData.reduce((sum, item) => sum + item.revenue, 0) / bookingTrendsData.length).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">per month</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 text-gray-900">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">Occupancy Rate</h4>
                      <FontAwesomeIcon icon={faHotel} className="text-2xl text-green-600" />
                    </div>
                    <p className="text-3xl font-bold mb-1">
                      {hotels.length > 0 ? Math.round((bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length / Math.max(1, hotels.reduce((s, h) => s + (h.totalRooms || 10), 0))) * 100) : 0}%
                    </p>
                    <p className="text-sm text-gray-600">confirmed/completed vs total rooms</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6 text-gray-900">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">Guest Satisfaction</h4>
                      <FontAwesomeIcon icon={faUsers} className="text-2xl text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold mb-1">
                      {hotels.length > 0 ? (hotels.reduce((s, h) => s + h.rating, 0) / hotels.length).toFixed(1) : '0'}/5.0
                    </p>
                    <p className="text-sm text-gray-600">average hotel rating</p>
                  </div>
                </div>
              </div>
            )}

            {/* Testimonials Tab */}
            {activeTab === "testimonials" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Testimonials Management
                  </h2>
                  <button
                    onClick={() => setShowAddTestimonialModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add New Testimonial
                  </button>
                </div>

                {testimonials.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No testimonials yet</p>
                    <button
                      onClick={() => setShowAddTestimonialModal(true)}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                    >
                      Create Your First Testimonial
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className={`bg-white border-2 rounded-xl overflow-hidden hover:shadow-lg transition-shadow ${
                          testimonial.isActive ? "border-green-200" : "border-gray-200"
                        }`}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={testimonial.image}
                                alt={testimonial.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {testimonial.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {testimonial.location}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditTestimonial(testimonial)}
                                className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
                                title="Edit testimonial"
                              >
                                <FontAwesomeIcon icon={faEdit} className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleDeleteTestimonial(testimonial.id)}
                                className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                                title="Delete testimonial"
                              >
                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                              </button>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${
                                    i < testimonial.rating ? "text-yellow-400" : "text-gray-300"
                                  }`}
                                >
                                  
                                </span>
                              ))}
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            &quot;{testimonial.review}&quot;
                          </p>

                          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                testimonial.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {testimonial.isActive ? "Active" : "Inactive"}
                            </span>
                            <button
                              onClick={() => toggleTestimonialStatus(testimonial.id)}
                              className="text-sm text-primary hover:text-accent font-medium"
                            >
                              Toggle Status
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chat Support Tab */}
            {activeTab === "chat" && (
              <div>
                <AdminChatDashboard />
              </div>
            )}

            {/* Users Management Tab */}
            {activeTab === "users" && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Users Management
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <form onSubmit={handleUsersSearch} className="flex gap-2">
                      <div className="relative">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={usersSearch}
                          onChange={(e) => setUsersSearch(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent w-full sm:w-64"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                      >
                        Search
                      </button>
                    </form>
                    <select
                      value={usersRoleFilter}
                      onChange={(e) => {
                        setUsersRoleFilter(e.target.value);
                        fetchUsers(1, usersSearch, e.target.value);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    >
                      <option value="">All Roles</option>
                      <option value="user">Users</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                </div>

                {/* Users Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-white">
                    <p className="text-sm opacity-90">Total Users</p>
                    <p className="text-2xl font-bold">{usersPagination.totalUsers}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-white">
                    <p className="text-sm opacity-90">Regular Users</p>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.role === 'user').length}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-white">
                    <p className="text-sm opacity-90">Admins</p>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.role === 'admin').length}
                    </p>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-500">No users found</p>
                  </div>
                ) : (
                  <>
                    {/* Users Table */}
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Verified</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                                    {u.avatar ? (
                                      <img src={u.avatar} alt={u.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                      <FontAwesomeIcon icon={faUser} className="text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{u.fullName || `${u.firstName} ${u.lastName}`}</p>
                                    <p className="text-xs text-gray-500">{u.phone || 'No phone'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm text-gray-600">{u.email}</span>
                              </td>
                              <td className="px-4 py-4">
                                <select
                                  value={u.role}
                                  onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    u.role === 'admin' 
                                      ? 'bg-purple-100 text-purple-700' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm text-gray-600">
                                  {new Date(u.createdAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                {u.isVerified ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                                    <FontAwesomeIcon icon={faClock} />
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setShowUserDetailsModal(true);
                                    }}
                                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                    title="View Details"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete User"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {usersPagination.totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-6">
                        <button
                          onClick={() => fetchUsers(usersPagination.currentPage - 1, usersSearch, usersRoleFilter)}
                          disabled={usersPagination.currentPage === 1}
                          className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {usersPagination.currentPage} of {usersPagination.totalPages}
                        </span>
                        <button
                          onClick={() => fetchUsers(usersPagination.currentPage + 1, usersSearch, usersRoleFilter)}
                          disabled={!usersPagination.hasMore}
                          className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Blog Management Tab */}
            {activeTab === "blog" && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Blog Management
                  </h2>
                  <button
                    onClick={() => setShowAddBlogModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    New Post
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <form onSubmit={handleBlogSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={blogSearch}
                        onChange={(e) => setBlogSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                    >
                      Search
                    </button>
                  </form>
                  <select
                    value={blogStatusFilter}
                    onChange={(e) => {
                      setBlogStatusFilter(e.target.value);
                      fetchBlogPosts(1, blogSearch, e.target.value);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Blog Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-white">
                    <p className="text-sm opacity-90">Total Posts</p>
                    <p className="text-2xl font-bold">{blogPagination.totalPosts}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-white">
                    <p className="text-sm opacity-90">Published</p>
                    <p className="text-2xl font-bold">
                      {blogPosts.filter(p => p.status === 'published').length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 text-white">
                    <p className="text-sm opacity-90">Drafts</p>
                    <p className="text-2xl font-bold">
                      {blogPosts.filter(p => p.status === 'draft').length}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-white">
                    <p className="text-sm opacity-90">Featured</p>
                    <p className="text-2xl font-bold">
                      {blogPosts.filter(p => p.isFeatured).length}
                    </p>
                  </div>
                </div>

                {blogLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : blogPosts.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <FontAwesomeIcon icon={faBlog} className="text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-500">No blog posts found</p>
                    <button
                      onClick={() => setShowAddBlogModal(true)}
                      className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                    >
                      Create Your First Post
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Blog Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {blogPosts.map((post) => (
                        <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                          <div className="relative h-40">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 flex gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                post.status === 'published' 
                                  ? 'bg-green-100 text-green-700'
                                  : post.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {post.status}
                              </span>
                              {post.isFeatured && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="p-4">
                            <span className="text-xs text-primary font-medium">{post.category}</span>
                            <h3 className="font-bold text-gray-900 mt-1 line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.excerpt}</p>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faEye} />
                                  {post.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faClock} />
                                  {post.readTime}m
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleFeatured(post.id)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    post.isFeatured 
                                      ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                                      : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                                  }`}
                                  title={post.isFeatured ? "Remove from featured" : "Add to featured"}
                                >
                                  <FontAwesomeIcon icon={faStar} />
                                </button>
                                <button
                                  onClick={() => openEditBlogModal(post)}
                                  className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  onClick={() => handleDeleteBlogPost(post.id)}
                                  className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {blogPagination.totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-6">
                        <button
                          onClick={() => fetchBlogPosts(blogPagination.currentPage - 1, blogSearch, blogStatusFilter)}
                          disabled={blogPagination.currentPage === 1}
                          className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {blogPagination.currentPage} of {blogPagination.totalPages}
                        </span>
                        <button
                          onClick={() => fetchBlogPosts(blogPagination.currentPage + 1, blogSearch, blogStatusFilter)}
                          disabled={!blogPagination.hasMore}
                          className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

                {settingsLoading ? (
                  <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                ) : (
                  <>
                    {/* Room Types */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Room Types</h3>
                      <p className="text-sm text-gray-500 mb-4">Manage the room types available when creating hotels.</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(siteSettings.roomTypes || ROOM_TYPES).map((type, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {type}
                            <button
                              onClick={() => {
                                const updated = (siteSettings.roomTypes || ROOM_TYPES).filter((_, idx) => idx !== i);
                                saveRoomTypes(updated);
                              }}
                              className="text-red-400 hover:text-red-600 ml-1"
                            >×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newRoomType}
                          onChange={(e) => setNewRoomType(e.target.value)}
                          placeholder="New room type name..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newRoomType.trim()) {
                              e.preventDefault();
                              const current = siteSettings.roomTypes || ROOM_TYPES;
                              if (!current.includes(newRoomType.trim())) {
                                saveRoomTypes([...current, newRoomType.trim()]);
                                setNewRoomType("");
                              }
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (!newRoomType.trim()) return;
                            const current = siteSettings.roomTypes || ROOM_TYPES;
                            if (!current.includes(newRoomType.trim())) {
                              saveRoomTypes([...current, newRoomType.trim()]);
                              setNewRoomType("");
                            }
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-accent transition-colors"
                        >Add</button>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Amenities</h3>
                      <p className="text-sm text-gray-500 mb-4">Manage the amenities available when creating hotels.</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(siteSettings.amenities || availableAmenities).map((amenity, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                            {amenity}
                            <button onClick={() => { const updated = (siteSettings.amenities || availableAmenities).filter((_, idx) => idx !== i); saveAmenities(updated); }} className="text-red-400 hover:text-red-600 ml-1">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} placeholder="New amenity name..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          onKeyDown={(e) => { if (e.key === 'Enter' && newAmenity.trim()) { e.preventDefault(); const current = siteSettings.amenities || availableAmenities; if (!current.includes(newAmenity.trim())) { saveAmenities([...current, newAmenity.trim()]); setNewAmenity(""); } } }} />
                        <button onClick={() => { if (!newAmenity.trim()) return; const current = siteSettings.amenities || availableAmenities; if (!current.includes(newAmenity.trim())) { saveAmenities([...current, newAmenity.trim()]); setNewAmenity(""); } }}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-accent transition-colors">Add</button>
                      </div>
                    </div>

                    {/* Cities */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Cities</h3>
                      <p className="text-sm text-gray-500 mb-4">Manage the cities available in the hotel form dropdown.</p>
                      <div className="flex flex-wrap gap-2 mb-4 max-h-48 overflow-y-auto">
                        {(siteSettings.cities || cityOptions).map((city, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
                            {city}
                            <button onClick={() => { const updated = (siteSettings.cities || cityOptions).filter((_, idx) => idx !== i); saveCities(updated); }} className="text-red-400 hover:text-red-600 ml-1">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="New city name..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          onKeyDown={(e) => { if (e.key === 'Enter' && newCity.trim()) { e.preventDefault(); const current = siteSettings.cities || cityOptions; if (!current.includes(newCity.trim())) { saveCities([...current, newCity.trim()].sort()); setNewCity(""); } } }} />
                        <button onClick={() => { if (!newCity.trim()) return; const current = siteSettings.cities || cityOptions; if (!current.includes(newCity.trim())) { saveCities([...current, newCity.trim()].sort()); setNewCity(""); } }}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-accent transition-colors">Add</button>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Company Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                          <input type="text" value={siteSettings.companyInfo?.name || 'Nonsa Travels'}
                            onChange={(e) => saveSetting('companyInfo', { ...siteSettings.companyInfo, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input type="text" value={siteSettings.companyInfo?.phone || '+260 970 462 777'}
                            onChange={(e) => saveSetting('companyInfo', { ...siteSettings.companyInfo, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input type="email" value={siteSettings.companyInfo?.email || 'info@nonsatravels.com'}
                            onChange={(e) => saveSetting('companyInfo', { ...siteSettings.companyInfo, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <input type="text" value={siteSettings.companyInfo?.address || 'Kwacha Street, Chingola, Zambia'}
                            onChange={(e) => saveSetting('companyInfo', { ...siteSettings.companyInfo, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Check-in/out Times */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Default Times</h3>
                      <div className="grid grid-cols-2 gap-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
                          <input type="time" value={siteSettings.checkInTime || '14:00'}
                            onChange={(e) => saveSetting('checkInTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
                          <input type="time" value={siteSettings.checkOutTime || '11:00'}
                            onChange={(e) => saveSetting('checkOutTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Additional Services Tab */}
            {activeTab === "services" && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Additional Services</h2>
                  <div className="flex gap-2">
                    {adminServices.length === 0 && (
                      <button onClick={handleSeedServices} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                        Seed Defaults
                      </button>
                    )}
                    <button onClick={() => { setEditingService(null); setServiceForm({ name: "", label: "", cost: "", sortOrder: "0" }); setShowServiceModal(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors">
                      <FontAwesomeIcon icon={faPlus} /> Add Service
                    </button>
                  </div>
                </div>

                {servicesLoading ? (
                  <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                ) : adminServices.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <FontAwesomeIcon icon={faTag} className="text-5xl mb-3 text-gray-200" />
                    <p className="font-medium">No services yet</p>
                    <p className="text-sm mt-1">Click "Seed Defaults" to add Airport Transfer, Breakfast, etc.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminServices.map(svc => (
                      <div key={svc.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{svc.label}</h3>
                          <p className="text-sm text-gray-500">Key: {svc.name} · {svc.name === 'airportTransfer' ? `$${svc.cost}/km (distance-based)` : `$${svc.cost}`} · Order: {svc.sortOrder}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingService(svc); setServiceForm({ name: svc.name, label: svc.label, cost: String(svc.cost), sortOrder: String(svc.sortOrder) }); setShowServiceModal(true); }}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><FontAwesomeIcon icon={faEdit} /></button>
                          <button onClick={() => handleDeleteService(svc.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded"><FontAwesomeIcon icon={faTrash} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showServiceModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                      <div className="px-6 py-4 border-b flex items-center justify-between">
                        <h2 className="text-lg font-bold">{editingService ? "Edit Service" : "Add Service"}</h2>
                        <button onClick={() => setShowServiceModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"><FontAwesomeIcon icon={faTimes} /></button>
                      </div>
                      <form onSubmit={handleServiceSubmit} className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Key (unique, no spaces) *</label>
                          <input required type="text" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value.replace(/\s/g, '') })}
                            placeholder="e.g. airportTransfer" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
                          <input required type="text" value={serviceForm.label} onChange={(e) => setServiceForm({ ...serviceForm, label: e.target.value })}
                            placeholder="e.g. Airport Transfer" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                        {serviceForm.name === 'airportTransfer' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 mb-3">
                            Set the <strong>rate per kilometer</strong>. Total cost is calculated as: distance (km) × rate.
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{serviceForm.name === 'airportTransfer' ? 'Rate per km (USD) *' : 'Price (USD) *'}</label>
                            <input required type="number" min="0" step="0.01" value={serviceForm.cost} onChange={(e) => setServiceForm({ ...serviceForm, cost: e.target.value })}
                              placeholder={serviceForm.name === 'airportTransfer' ? '1.2' : '50'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                            <input type="number" value={serviceForm.sortOrder} onChange={(e) => setServiceForm({ ...serviceForm, sortOrder: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setShowServiceModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                          <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors">{editingService ? "Update" : "Create"}</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Destinations Tab */}
            {activeTab === "destinations" && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Destinations</h2>
                  <div className="flex gap-2">
                    {destinations.length === 0 && (
                      <button onClick={handleSeedDestinations} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                        Seed Default Provinces
                      </button>
                    )}
                    <button onClick={() => { setEditingDest(null); setDestForm({ name: "", image: "", description: "", cities: "", attractions: "[]" }); setShowDestModal(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors">
                      <FontAwesomeIcon icon={faPlus} /> Add Province
                    </button>
                  </div>
                </div>

                {destinationsLoading ? (
                  <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                ) : destinations.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <FontAwesomeIcon icon={faGlobe} className="text-5xl mb-3 text-gray-200" />
                    <p className="font-medium">No destinations yet</p>
                    <p className="text-sm mt-1">Click "Seed Default Provinces" to populate with Zambian provinces.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {destinations.map((d) => (
                      <div key={d.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                        {d.image && <img src={d.image} alt={d.name} className="w-full sm:w-32 h-24 object-cover rounded-lg flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-gray-900">{d.name}</h3>
                              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{d.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(d.cities || []).map(c => (
                                  <span key={c} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                                ))}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{(d.attractions || []).length} attractions</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => openEditDest(d)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors">
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button onClick={() => handleDeleteDest(d.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors">
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Destination Modal */}
                {showDestModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                        <h2 className="text-xl font-bold text-gray-900">{editingDest ? "Edit Destination" : "Add Destination"}</h2>
                        <button onClick={() => setShowDestModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                      <form onSubmit={handleDestSubmit} className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Province Name *</label>
                          <input required type="text" value={destForm.name} onChange={(e) => setDestForm({ ...destForm, name: e.target.value })}
                            placeholder="e.g. Southern Province" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                          <input type="url" value={destForm.image} onChange={(e) => setDestForm({ ...destForm, image: e.target.value })}
                            placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea rows={2} value={destForm.description} onChange={(e) => setDestForm({ ...destForm, description: e.target.value })}
                            placeholder="Brief description of the province..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cities (comma-separated)</label>
                          <input type="text" value={destForm.cities} onChange={(e) => setDestForm({ ...destForm, cities: e.target.value })}
                            placeholder="Livingstone, Choma, Mazabuka" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Attractions (JSON array)</label>
                          <p className="text-xs text-gray-500 mb-1">Format: [{"{"}"name":"...", "type":"Nature|Wildlife|Culture|History|Adventure|Wonder", "description":"..."{"}"}, ...]</p>
                          <textarea rows={6} value={destForm.attractions} onChange={(e) => setDestForm({ ...destForm, attractions: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-xs" />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setShowDestModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                          <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors">{editingDest ? "Update" : "Create"}</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Moderation Tab */}
            {activeTab === "reviews" && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reviews Moderation</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{adminReviews.filter(r => !r.isApproved).length} pending approval</p>
                  </div>
                  <select
                    value={reviewFilter}
                    onChange={(e) => { setReviewFilter(e.target.value); fetchAdminReviews(e.target.value); }}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="all">All</option>
                  </select>
                </div>

                {reviewsLoading ? (
                  <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                ) : adminReviews.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <FontAwesomeIcon icon={faStar} className="text-5xl mb-3 text-gray-200" />
                    <p className="font-medium">No {reviewFilter} reviews</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminReviews.map((review) => (
                      <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-gray-900 text-sm">{review.userName}</span>
                              <span className="text-xs text-gray-400">·</span>
                              <span className="text-xs text-gray-500">{review.hotel?.name || 'Unknown hotel'}</span>
                              <span className="text-xs text-gray-400">·</span>
                              <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <FontAwesomeIcon key={i} icon={faStar} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">{review.rating}/5</span>
                            </div>
                            <p className="text-sm text-gray-700">{review.comment}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {review.isApproved ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Approved</span>
                            ) : (
                              <>
                                <button onClick={() => handleApproveReview(review.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                                  Approve
                                </button>
                                <button onClick={() => handleRejectReview(review.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Newsletter Tab */}
            {activeTab === "newsletter" && (
              <div>
                {/* Stats + actions header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Newsletter</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {subscribers.filter(s => s.isActive).length} active &nbsp;·&nbsp; {subscribers.length} total
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={subscriberFilter}
                      onChange={(e) => { setSubscriberFilter(e.target.value); fetchSubscribers(e.target.value); }}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Unsubscribed</option>
                    </select>
                    <button
                      onClick={() => setShowSendNewsletterModal(true)}
                      disabled={subscribers.filter(s => s.isActive).length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Send Newsletter
                    </button>
                  </div>
                </div>

                {subscribersLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <FontAwesomeIcon icon={faNewspaper} className="text-5xl mb-3 text-gray-200" />
                    <p className="font-medium">No subscribers yet</p>
                    <p className="text-sm mt-1">Subscribers will appear here once people sign up from the website.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                          <th className="pb-3 font-medium">Email</th>
                          <th className="pb-3 font-medium">Subscribed</th>
                          <th className="pb-3 font-medium">Source</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {subscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50">
                            <td className="py-3 pr-4 font-medium text-gray-900">{sub.email}</td>
                            <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                              {new Date(sub.subscribedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="py-3 pr-4 text-gray-500 capitalize">{sub.source || '—'}</td>
                            <td className="py-3 pr-4">
                              {sub.isActive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">Unsubscribed</span>
                              )}
                            </td>
                            <td className="py-3">
                              <button
                                onClick={() => handleDeleteSubscriber(sub.id)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Remove subscriber"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Promo Codes Tab */}
            {activeTab === "promos" && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Promo Codes</h2>
                  <button
                    onClick={() => { resetPromoForm(); setShowPromoModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    New Promo Code
                  </button>
                </div>

                {promoLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : promoCodes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FontAwesomeIcon icon={faTag} className="text-4xl mb-3 text-gray-300" />
                    <p>No promo codes yet. Create your first one!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                          <th className="pb-3 font-medium">Code</th>
                          <th className="pb-3 font-medium">Discount</th>
                          <th className="pb-3 font-medium">Valid Period</th>
                          <th className="pb-3 font-medium">Usage</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {promoCodes.map((promo) => (
                          <tr key={promo.id} className="hover:bg-gray-50">
                            <td className="py-4 pr-4">
                              <div className="font-bold text-gray-900 font-mono">{promo.code}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{promo.description}</div>
                              {promo.isFirstBookingOnly && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded mt-1 inline-block">First booking only</span>
                              )}
                            </td>
                            <td className="py-4 pr-4">
                              <div className="font-semibold text-green-700">
                                {promo.discountType === 'percentage'
                                  ? `${promo.discountValue}%`
                                  : `$${promo.discountValue}`}
                              </div>
                              {promo.maxDiscount != null && (
                                <div className="text-xs text-gray-500">max ${promo.maxDiscount}</div>
                              )}
                              {promo.minBookingAmount > 0 && (
                                <div className="text-xs text-gray-500">min ${promo.minBookingAmount}</div>
                              )}
                            </td>
                            <td className="py-4 pr-4">
                              <div className="text-xs text-gray-700">
                                {new Date(promo.validFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                              <div className="text-xs text-gray-500">to</div>
                              <div className="text-xs text-gray-700">
                                {new Date(promo.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="text-sm">
                                {promo.usageCount}{promo.usageLimit != null ? `/${promo.usageLimit}` : ''} used
                              </div>
                              <div className="text-xs text-gray-500">{promo.usagePerUser}/user</div>
                            </td>
                            <td className="py-4 pr-4">
                              <button
                                onClick={() => handleTogglePromo(promo.id)}
                                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                                  promo.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-500'
                                }`}
                              >
                                <FontAwesomeIcon icon={promo.isActive ? faToggleOn : faToggleOff} className="text-lg" />
                                {promo.isActive ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditPromo(promo)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  onClick={() => handleDeletePromo(promo.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </main>
      </div>

    {/* ── Modals (fixed, position-independent) ── */}

        {/* Send Newsletter Modal */}
        {showSendNewsletterModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faPaperPlane} className="text-primary" />
                  Send Newsletter
                </h2>
                <button onClick={() => setShowSendNewsletterModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <form onSubmit={handleSendNewsletter} className="p-6 space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  Will be sent to <strong>{subscribers.filter(s => s.isActive).length}</strong> active subscriber{subscribers.filter(s => s.isActive).length !== 1 ? 's' : ''}.
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    required
                    type="text"
                    value={newsletterForm.subject}
                    onChange={(e) => setNewsletterForm({ ...newsletterForm, subject: e.target.value })}
                    placeholder="e.g. Exclusive Deals This Week!"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body *</label>
                  <p className="text-xs text-gray-500 mb-2">Use the toolbar to format text, add images, links, and more.</p>
                  <ReactQuill
                    theme="snow"
                    value={newsletterForm.body}
                    onChange={(value) => setNewsletterForm({ ...newsletterForm, body: value })}
                    modules={quillModules}
                    placeholder="Write your newsletter content here..."
                    className="bg-white rounded-lg [&_.ql-container]:min-h-[250px] [&_.ql-container]:text-sm [&_.ql-editor]:min-h-[250px]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowSendNewsletterModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingNewsletter}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-60"
                  >
                    {sendingNewsletter ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Sending...</>
                    ) : (
                      <><FontAwesomeIcon icon={faPaperPlane} /> Send Now</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Hotel Modal */}
        {showAddHotelModal && (
          <AddHotelModal
            newHotel={newHotel}
            setNewHotel={setNewHotel}
            handleInputChange={handleInputChange}
            handleImageChange={handleImageChange}
            handleHotelImagesSelect={handleHotelImagesSelect}
            handleAmenityToggle={handleAmenityToggle}
            handleAddHotel={handleAddHotel}
            setShowAddHotelModal={setShowAddHotelModal}
            availableAmenities={availableAmenities}
            roomTypeOptions={roomTypeOptions}
            cityOptions={cityOptions}
            onDynamicPricingToggle={(checked) => setNewHotel(prev => ({ ...prev, dynamicPricingEnabled: checked }))}
          />
        )}

        {/* Edit Hotel Modal */}
        {showEditHotelModal && (
          <AddHotelModal
            newHotel={newHotel}
            setNewHotel={setNewHotel}
            handleInputChange={handleInputChange}
            handleImageChange={handleImageChange}
            handleHotelImagesSelect={handleHotelImagesSelect}
            handleAmenityToggle={handleAmenityToggle}
            handleAddHotel={handleUpdateHotel}
            setShowAddHotelModal={setShowEditHotelModal}
            availableAmenities={availableAmenities}
            roomTypeOptions={roomTypeOptions}
            cityOptions={cityOptions}
            isEditing={true}
            onDynamicPricingToggle={(checked) => setNewHotel(prev => ({ ...prev, dynamicPricingEnabled: checked }))}
          />
        )}

        {/* Add Offer Modal */}
        {showAddOfferModal && (
          <AddOfferModal
            newOffer={newOffer}
            handleOfferInputChange={handleOfferInputChange}
            handleOfferImageSelect={handleOfferImageSelect}
            handleAddOffer={handleAddOffer}
            setShowAddOfferModal={setShowAddOfferModal}
            hotels={hotels}
            promoCodes={promoCodes}
          />
        )}

        {/* Edit Offer Modal */}
        {showEditOfferModal && (
          <AddOfferModal
            newOffer={newOffer}
            handleOfferInputChange={handleOfferInputChange}
            handleOfferImageSelect={handleOfferImageSelect}
            handleAddOffer={handleEditOffer}
            setShowAddOfferModal={setShowEditOfferModal}
            hotels={hotels}
            promoCodes={promoCodes}
            isEditing={true}
          />
        )}

        {/* Add Testimonial Modal */}
        {showAddTestimonialModal && (
          <AddTestimonialModal
            newTestimonial={newTestimonial}
            handleTestimonialInputChange={handleTestimonialInputChange}
            handleTestimonialImageSelect={handleTestimonialImageSelect}
            handleAddTestimonial={handleAddTestimonial}
            setShowAddTestimonialModal={setShowAddTestimonialModal}
            isEditing={false}
          />
        )}

        {/* Edit Testimonial Modal */}
        {showEditTestimonialModal && (
          <AddTestimonialModal
            newTestimonial={newTestimonial}
            handleTestimonialInputChange={handleTestimonialInputChange}
            handleTestimonialImageSelect={handleTestimonialImageSelect}
            handleAddTestimonial={handleEditTestimonialSubmit}
            setShowAddTestimonialModal={setShowEditTestimonialModal}
            isEditing={true}
          />
        )}

        {/* User Details Modal */}
        {showUserDetailsModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => {
                    setShowUserDetailsModal(false);
                    setSelectedUser(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* User Avatar & Name */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center overflow-hidden mb-4">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <FontAwesomeIcon icon={faUser} className="text-4xl text-white" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.fullName || `${selectedUser.firstName} ${selectedUser.lastName}`}</h3>
                  <span className={`mt-2 text-xs font-medium px-3 py-1 rounded-full ${
                    selectedUser.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedUser.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                </div>

                {/* User Info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm font-medium text-gray-900">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="text-sm font-medium text-gray-900">{selectedUser.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Verified</span>
                    <span className={`text-sm font-medium ${selectedUser.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedUser.isVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Joined</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Loyalty Points</span>
                    <span className="text-sm font-medium text-primary">{selectedUser.loyaltyPoints || 0} pts</span>
                  </div>
                  {selectedUser.googleId && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Login Method</span>
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowUserDetailsModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteUser(selectedUser.id);
                      setShowUserDetailsModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Blog Post Modal */}
        {showAddBlogModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900">Create New Blog Post</h2>
                <button
                  onClick={() => setShowAddBlogModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <form onSubmit={handleAddBlogPost} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={newBlogPost.title}
                    onChange={(e) => setNewBlogPost({ ...newBlogPost, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter post title"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt *</label>
                  <textarea
                    required
                    rows={2}
                    value={newBlogPost.excerpt}
                    onChange={(e) => setNewBlogPost({ ...newBlogPost, excerpt: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Brief summary of the post (max 500 characters)"
                    maxLength={500}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content * (supports HTML)</label>
                  <textarea
                    required
                    rows={10}
                    value={newBlogPost.content}
                    onChange={(e) => setNewBlogPost({ ...newBlogPost, content: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-mono text-sm"
                    placeholder="Write your blog content here. HTML tags are supported."
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL *</label>
                  <input
                    type="url"
                    required
                    value={newBlogPost.coverImage}
                    onChange={(e) => setNewBlogPost({ ...newBlogPost, coverImage: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                  {newBlogPost.coverImage && (
                    <img src={newBlogPost.coverImage} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
                  )}
                </div>

                {/* Category and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      required
                      value={newBlogPost.category}
                      onChange={(e) => setNewBlogPost({ ...newBlogPost, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {BLOG_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      required
                      value={newBlogPost.status}
                      onChange={(e) => setNewBlogPost({ ...newBlogPost, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newBlogPost.tags}
                    onChange={(e) => setNewBlogPost({ ...newBlogPost, tags: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="zambia, travel, adventure"
                  />
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newBlogPost.isFeatured}
                      onChange={(e) => setNewBlogPost({ ...newBlogPost, isFeatured: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">Featured Post</span>
                </div>

                {/* SEO Fields */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">SEO Settings (Optional)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                      <input
                        type="text"
                        value={newBlogPost.metaTitle}
                        onChange={(e) => setNewBlogPost({ ...newBlogPost, metaTitle: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="SEO title (max 70 characters)"
                        maxLength={70}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                      <textarea
                        rows={2}
                        value={newBlogPost.metaDescription}
                        onChange={(e) => setNewBlogPost({ ...newBlogPost, metaDescription: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        placeholder="SEO description (max 160 characters)"
                        maxLength={160}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddBlogModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-accent font-medium transition-colors"
                  >
                    Create Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Blog Post Modal */}
        {showEditBlogModal && editingBlog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900">Edit Blog Post</h2>
                <button
                  onClick={() => {
                    setShowEditBlogModal(false);
                    setEditingBlog(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <form onSubmit={handleEditBlogPost} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={newBlogPost.title}
                    onChange={(e) => setNewBlogPost({ ...newBlogPost, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter post title"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt *</label>
                  <textarea
                    required
                    rows={2}
                    value={newBlogPost.excerpt}
                    onChange={(e) => setNewBlogPost({ ...newBlogPost, excerpt: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Brief summary of the post (max 500 characters)"
                    maxLength={500}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content * (supports HTML)</label>
                  <textarea
                    required
                    rows={10}
                    value={newBlogPost.content}
                    onChange={(e) => setNewBlogPost({ ...newBlogPost, content: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-mono text-sm"
                    placeholder="Write your blog content here. HTML tags are supported."
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL *</label>
                  <input
                    type="url"
                    required
                    value={newBlogPost.coverImage}
                    onChange={(e) => setNewBlogPost({ ...newBlogPost, coverImage: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                  {newBlogPost.coverImage && (
                    <img src={newBlogPost.coverImage} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
                  )}
                </div>

                {/* Category and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      required
                      value={newBlogPost.category}
                      onChange={(e) => setNewBlogPost({ ...newBlogPost, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {BLOG_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      required
                      value={newBlogPost.status}
                      onChange={(e) => setNewBlogPost({ ...newBlogPost, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newBlogPost.tags}
                    onChange={(e) => setNewBlogPost({ ...newBlogPost, tags: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="zambia, travel, adventure"
                  />
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newBlogPost.isFeatured}
                      onChange={(e) => setNewBlogPost({ ...newBlogPost, isFeatured: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">Featured Post</span>
                </div>

                {/* SEO Fields */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">SEO Settings (Optional)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                      <input
                        type="text"
                        value={newBlogPost.metaTitle}
                        onChange={(e) => setNewBlogPost({ ...newBlogPost, metaTitle: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="SEO title (max 70 characters)"
                        maxLength={70}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                      <textarea
                        rows={2}
                        value={newBlogPost.metaDescription}
                        onChange={(e) => setNewBlogPost({ ...newBlogPost, metaDescription: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        placeholder="SEO description (max 160 characters)"
                        maxLength={160}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditBlogModal(false);
                      setEditingBlog(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-accent font-medium transition-colors"
                  >
                    Update Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Promo Code Create / Edit Modal */}
        {showPromoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTag} className="text-primary" />
                  {editingPromo ? "Edit Promo Code" : "New Promo Code"}
                </h2>
                <button
                  onClick={() => { setShowPromoModal(false); resetPromoForm(); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handlePromoSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                    <input
                      required
                      type="text"
                      value={newPromo.code}
                      onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. SUMMER20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                    <select
                      required
                      value={newPromo.discountType}
                      onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input
                    required
                    type="text"
                    value={newPromo.description}
                    onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                    placeholder="e.g. 20% off summer bookings"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value * {newPromo.discountType === 'percentage' ? '(%)' : '($)'}
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      max={newPromo.discountType === 'percentage' ? 100 : undefined}
                      step="0.01"
                      value={newPromo.discountValue}
                      onChange={(e) => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                      placeholder="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Booking ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newPromo.minBookingAmount}
                      onChange={(e) => setNewPromo({ ...newPromo, minBookingAmount: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newPromo.maxDiscount}
                      onChange={(e) => setNewPromo({ ...newPromo, maxDiscount: e.target.value })}
                      placeholder="Leave blank for no cap"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid From *</label>
                    <input
                      required
                      type="date"
                      value={newPromo.validFrom}
                      onChange={(e) => setNewPromo({ ...newPromo, validFrom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until *</label>
                    <input
                      required
                      type="date"
                      value={newPromo.validUntil}
                      onChange={(e) => setNewPromo({ ...newPromo, validUntil: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={newPromo.usageLimit}
                      onChange={(e) => setNewPromo({ ...newPromo, usageLimit: e.target.value })}
                      placeholder="Leave blank for unlimited"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uses Per User</label>
                    <input
                      type="number"
                      min="1"
                      value={newPromo.usagePerUser}
                      onChange={(e) => setNewPromo({ ...newPromo, usagePerUser: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPromo.isFirstBookingOnly}
                      onChange={(e) => setNewPromo({ ...newPromo, isFirstBookingOnly: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm text-gray-700">First booking only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPromo.isActive}
                      onChange={(e) => setNewPromo({ ...newPromo, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowPromoModal(false); resetPromoForm(); }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-accent font-medium transition-colors"
                  >
                    {editingPromo ? "Update Promo Code" : "Create Promo Code"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

// Add Hotel Modal Component
const AddHotelModal = ({
  newHotel,
  setNewHotel,
  handleInputChange,
  handleImageChange,
  handleHotelImagesSelect,
  handleAmenityToggle,
  handleAddHotel,
  setShowAddHotelModal,
  availableAmenities,
  roomTypeOptions,
  cityOptions,
  isEditing = false,
  onDynamicPricingToggle,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Hotel" : "Add New Hotel"}
          </h2>
          <button
            onClick={() => setShowAddHotelModal(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleAddHotel} className="p-6 space-y-6">
          {/* Hotel Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hotelName"
                  value={newHotel.hotelName}
                  onChange={handleInputChange}
                  placeholder="e.g., Grand Plaza Hotel"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={newHotel.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="">Select City</option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={newHotel.address}
                  onChange={handleInputChange}
                  placeholder="e.g., 123 Main Street, Downtown"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={newHotel.contact}
                  onChange={handleInputChange}
                  placeholder="e.g., +1234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

            </div>
          </div>

          {/* Room Types */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Room Types <span className="text-red-500">*</span></h3>
              <button
                type="button"
                onClick={() => setNewHotel(prev => ({ ...prev, roomTypes: [...(prev.roomTypes || []), { name: "Single Bed", pricePerNight: "", roomCount: "1", maxGuests: "2", description: "" }] }))}
                className="text-sm text-primary hover:text-accent font-medium"
              >
                + Add Room Type
              </button>
            </div>
            <div className="space-y-3">
              {(newHotel.roomTypes || []).map((rt, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                  {(newHotel.roomTypes || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => setNewHotel(prev => ({ ...prev, roomTypes: prev.roomTypes.filter((_, i) => i !== idx) }))}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-red-400 hover:bg-red-100 hover:text-red-600 text-xs"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
                      <select
                        value={rt.name}
                        onChange={(e) => { const arr = [...newHotel.roomTypes]; arr[idx] = { ...arr[idx], name: e.target.value }; setNewHotel(prev => ({ ...prev, roomTypes: arr })); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      >
                        {roomTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Price/Night *</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <input
                          type="number"
                          value={rt.pricePerNight}
                          onChange={(e) => { const arr = [...newHotel.roomTypes]; arr[idx] = { ...arr[idx], pricePerNight: e.target.value }; setNewHotel(prev => ({ ...prev, roomTypes: arr })); }}
                          placeholder="99"
                          min="0"
                          required
                          className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Rooms</label>
                      <input
                        type="number"
                        value={rt.roomCount}
                        onChange={(e) => { const arr = [...newHotel.roomTypes]; arr[idx] = { ...arr[idx], roomCount: e.target.value }; setNewHotel(prev => ({ ...prev, roomTypes: arr })); }}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Max Guests</label>
                      <input
                        type="number"
                        value={rt.maxGuests}
                        onChange={(e) => { const arr = [...newHotel.roomTypes]; arr[idx] = { ...arr[idx], maxGuests: e.target.value }; setNewHotel(prev => ({ ...prev, roomTypes: arr })); }}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continued */}
          <div>
            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <select
                  name="rating"
                  value={newHotel.rating}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="4.0">4.0 </option>
                  <option value="4.2">4.2 </option>
                  <option value="4.5">4.5 </option>
                  <option value="4.7">4.7 </option>
                  <option value="4.8">4.8 </option>
                  <option value="5.0">5.0 </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Policy
                </label>
                <select
                  name="cancellationPolicy"
                  value={newHotel.cancellationPolicy || "free_24h"}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="free_24h">Free cancellation (24h before)</option>
                  <option value="free_48h">Free cancellation (48h before)</option>
                  <option value="free_7d">Free cancellation (7 days before)</option>
                  <option value="partial">Partial refund available</option>
                  <option value="non_refundable">Non-refundable</option>
                </select>
              </div>
            </div>

            {/* Dynamic Pricing Settings */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dynamic Pricing Settings
              </h3>
              
              <div className="mb-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Enable Dynamic Pricing
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically adjust prices based on demand, occupancy, and seasonality
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newHotel.dynamicPricingEnabled}
                      onChange={(e) => onDynamicPricingToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              {newHotel.dynamicPricingEnabled && (
                <div className="grid md:grid-cols-3 gap-6 pl-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peak Season Multiplier
                    </label>
                    <input
                      type="number"
                      name="peakSeasonMultiplier"
                      value={newHotel.peakSeasonMultiplier}
                      onChange={handleInputChange}
                      step="0.1"
                      min="1.0"
                      max="3.0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      1.5 = 50% increase
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      High Demand Multiplier
                    </label>
                    <input
                      type="number"
                      name="highDemandMultiplier"
                      value={newHotel.highDemandMultiplier}
                      onChange={handleInputChange}
                      step="0.1"
                      min="1.0"
                      max="2.0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      When &gt;80% booked
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Occupancy Discount
                    </label>
                    <input
                      type="number"
                      name="lowOccupancyDiscount"
                      value={newHotel.lowOccupancyDiscount}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0.5"
                      max="1.0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      0.9 = 10% discount
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Amenities <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableAmenities.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={newHotel.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-5 h-5 text-accent focus:ring-accent/20 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
            {newHotel.amenities.length === 0 && (
              <p className="text-sm text-red-500 mt-2">Please select at least one amenity</p>
            )}
          </div>

          {/* Hotel Images */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hotel Images <span className="text-red-500">*</span>
            </h3>
            <ImageUpload
              onImageSelect={handleHotelImagesSelect}
              currentImages={newHotel.imageUrls.filter(url => url)}
              label="Upload Hotel Images (at least 1 required, up to 4 images)"
              multiple={true}
            />
            <p className="text-xs text-gray-500 mt-2">
               Upload high-quality images (max 2MB each). Recommended size: 1200x800px
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAddHotelModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium"
            >
              {isEditing ? "Update Hotel" : "Add Hotel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddHotelModal.propTypes = {
  newHotel: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleImageChange: PropTypes.func.isRequired,
  handleHotelImagesSelect: PropTypes.func.isRequired,
  handleAmenityToggle: PropTypes.func.isRequired,
  handleAddHotel: PropTypes.func.isRequired,
  setShowAddHotelModal: PropTypes.func.isRequired,
  availableAmenities: PropTypes.array.isRequired,
  isEditing: PropTypes.bool,
};

// Stat Card Component
const StatCard = ({ icon, title, value, color, trend }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center`}>
          <FontAwesomeIcon icon={icon} className="text-xl" />
        </div>
        {trend && (
          <span className="text-sm font-medium text-green-600">{trend}</span>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string.isRequired,
  trend: PropTypes.string,
};

// Quick Stat Component
const QuickStat = ({ label, value, icon, color }) => {
  const colors = {
    yellow: "text-yellow-600",
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4 border border-gray-200">
      <FontAwesomeIcon icon={icon} className={`text-2xl ${colors[color]}`} />
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

QuickStat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.object.isRequired,
  color: PropTypes.string.isRequired,
};

// Tab Button Component (kept for reference, no longer used in main nav)
const TabButton = ({ active, onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-gray-600 hover:text-gray-900"
      }`}
    >
      {label}
    </button>
  );
};

TabButton.propTypes = {
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

// Sidebar Navigation Item
const SidebarNavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-primary text-white shadow-sm"
        : "text-white/60 hover:text-white hover:bg-white/10"
    }`}
  >
    <FontAwesomeIcon icon={icon} className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-white/50"}`} />
    <span className="truncate">{label}</span>
  </button>
);

SidebarNavItem.propTypes = {
  icon: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

// Activity Item Component
const ActivityItem = ({ booking }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faCalendarCheck} className="text-primary" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            New booking at {booking.hotelId?.name || booking.hotel?.name || 'Unknown Hotel'}
          </p>
          <p className="text-sm text-gray-600">
            {booking.userName} • {formatDate(booking.checkInDate)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900">${booking.totalPrice}</p>
        <StatusBadge status={booking.status} />
      </div>
    </div>
  );
};

ActivityItem.propTypes = {
  booking: PropTypes.object.isRequired,
};

// Booking Row Component
// Booking Row Component
const BookingRow = ({ booking, onUpdateStatus, onCancel, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-4 text-sm text-gray-600">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="font-mono hover:text-primary transition-colors"
          >
            #{booking.id.slice(-6)}
          </button>
        </td>
        <td className="py-4">
          <div>
            <p className="font-medium text-gray-900">{booking.userName}</p>
            <p className="text-sm text-gray-600">{booking.userEmail}</p>
            {booking.userPhone && (
              <p className="text-xs text-gray-500">{booking.userPhone}</p>
            )}
          </div>
        </td>
        <td className="py-4 text-sm text-gray-900">{booking.hotelId?.name || booking.hotel?.name || 'Unknown Hotel'}</td>
        <td className="py-4 text-sm text-gray-600">
          {formatDate(booking.checkInDate)}
        </td>
        <td className="py-4 font-semibold text-gray-900">
          ${booking.totalPrice}
        </td>
        <td className="py-4">
          <StatusBadge status={booking.status} />
        </td>
        <td className="py-4">
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="text-gray-600 hover:text-primary transition-colors p-2"
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            
            {/* Dropdown Menu */}
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {/* Confirm Payment Received - for pending_payment status */}
                {booking.status === "pending_payment" && (
                  <>
                    <button
                      onClick={() => {
                        onUpdateStatus(booking.id, "payment_confirmed");
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-green-50 text-green-600 text-sm font-medium flex items-center gap-2 border-b border-gray-100"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                       Confirm Payment Received
                    </button>
                    <button
                      onClick={() => {
                        onCancel(booking.id);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                      Reject / Cancel
                    </button>
                  </>
                )}
                
                {booking.status === "payment_confirmed" && (
                  <>
                    <button
                      onClick={() => {
                        onUpdateStatus(booking.id, "confirmed");
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-green-50 text-green-600 text-sm font-medium flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => {
                        onCancel(booking.id);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                      Cancel Booking
                    </button>
                  </>
                )}
                
                {booking.status === "confirmed" && (
                  <>
                    <button
                      onClick={() => {
                        onUpdateStatus(booking.id, "completed");
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 text-sm font-medium flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => {
                        onCancel(booking.id);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                      Cancel Booking
                    </button>
                  </>
                )}
                
                {(booking.status === "completed" || booking.status === "cancelled") && (
                  <button
                    onClick={() => {
                      onDelete(booking.id);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Delete Booking
                  </button>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>
      
      {/* Expanded Details Row */}
      {showDetails && (
        <tr className="bg-gray-50 border-b border-gray-200">
          <td colSpan="7" className="py-4 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Booking Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Full ID:</span> <span className="font-mono text-xs">{booking.id}</span></p>
                  <p><span className="text-gray-600">Check-out:</span> {formatDate(booking.checkOutDate)}</p>
                  <p><span className="text-gray-600">Nights:</span> {calculateNights()} night(s)</p>
                  <p><span className="text-gray-600">Guests:</span> {booking.guests} guest(s)</p>
                  <p><span className="text-gray-600">Booked on:</span> {formatDate(booking.createdAt)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Payment Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Payment Status:</span> <span className="capitalize">{booking.paymentStatus || 'N/A'}</span></p>
                  <p><span className="text-gray-600">Payment Method:</span> <span className="capitalize">{booking.paymentMethod || 'N/A'}</span></p>
                  {booking.paymentId && (
                    <p><span className="text-gray-600">Payment ID:</span> <span className="font-mono text-xs">{booking.paymentId}</span></p>
                  )}
                  <p><span className="text-gray-600">Total Amount:</span> <span className="font-semibold text-primary">${booking.totalPrice}</span></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
                <div className="space-y-1 text-sm">
                  {booking.specialRequests && (
                    <div>
                      <p className="text-gray-600 font-medium">Special Requests:</p>
                      <p className="text-gray-800 bg-white p-2 rounded mt-1">{booking.specialRequests}</p>
                    </div>
                  )}
                  {booking.roomPreferences && (
                    <div className="mt-2">
                      <p className="text-gray-600 font-medium">Room Preferences:</p>
                      <p className="text-gray-800 bg-white p-2 rounded mt-1">{booking.roomPreferences}</p>
                    </div>
                  )}
                  {!booking.specialRequests && !booking.roomPreferences && (
                    <p className="text-gray-500 italic">No additional requests</p>
                  )}
                </div>
              </div>
            </div>

          </td>
        </tr>
      )}
    </>
  );
};

BookingRow.propTypes = {
  booking: PropTypes.object.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// Mobile Booking Card Component
const BookingCard = ({ booking, onUpdateStatus, onCancel, onDelete, onDownloadInvoice, onSendInvoice }) => {
  const [showActions, setShowActions] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-mono text-xs text-gray-500">#{booking.id.slice(-6)}</p>
            <h3 className="font-semibold text-gray-900">{booking.userName}</h3>
            <p className="text-sm text-gray-600">{booking.userEmail}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 mt-3">
          <p className="font-medium text-gray-900 text-sm mb-1">
            {booking.hotelId?.name || booking.hotel?.name || 'Unknown Hotel'}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faCalendarCheck} className="text-primary" />
              {formatDate(booking.checkInDate)}
            </span>
            <span>{calculateNights()} night(s)</span>
            <span>{booking.guests} guest(s)</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-primary">${booking.totalPrice}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Payment Method</p>
            <p className="text-sm font-medium capitalize">{booking.paymentMethod || 'N/A'}</p>
          </div>
        </div>

        {/* Expandable Details */}
        {expanded && (
          <div className="border-t border-gray-100 pt-4 mt-4 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-500 text-xs">Check-out</p>
                <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Payment Status</p>
                <p className="font-medium capitalize">{booking.paymentStatus || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Booked On</p>
                <p className="font-medium">{formatDate(booking.createdAt)}</p>
              </div>
              {booking.userPhone && (
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p className="font-medium">{booking.userPhone}</p>
                </div>
              )}
            </div>
            
            {booking.specialRequests && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-yellow-700 font-medium mb-1">Special Requests</p>
                <p className="text-sm text-yellow-900">{booking.specialRequests}</p>
              </div>
            )}
            
          </div>
        )}

        {/* Toggle Details Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center text-sm text-primary font-medium py-2 mt-2"
        >
          {expanded ? 'Show Less' : 'Show More Details'}
        </button>
      </div>

      {/* Card Actions */}
      <div className="border-t border-gray-100 p-4 bg-gray-50">
        <div className="relative">
          <button 
            onClick={() => setShowActions(!showActions)}
            className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 active:bg-gray-100"
          >
            <FontAwesomeIcon icon={faEllipsisV} />
            Actions
          </button>
          
          {/* Actions Dropdown */}
          {showActions && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20">
              {/* Confirm Payment Received - for pending_payment status */}
              {booking.status === "pending_payment" && (
                <>
                  <button
                    onClick={() => {
                      onUpdateStatus(booking.id, "payment_confirmed");
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 text-green-600 text-sm font-medium flex items-center gap-3 border-b border-gray-100"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="w-4" />
                     Confirm Payment Received
                  </button>
                  <button
                    onClick={() => {
                      onCancel(booking.id);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 text-sm font-medium flex items-center gap-3"
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="w-4" />
                    Reject / Cancel
                  </button>
                </>
              )}
              
              {booking.status === "payment_confirmed" && (
                <>
                  <button
                    onClick={() => {
                      onUpdateStatus(booking.id, "confirmed");
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 text-green-600 text-sm font-medium flex items-center gap-3 border-b border-gray-100"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="w-4" />
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => {
                      onCancel(booking.id);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 text-sm font-medium flex items-center gap-3"
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="w-4" />
                    Cancel Booking
                  </button>
                </>
              )}
              
              {booking.status === "confirmed" && (
                <>
                  <button
                    onClick={() => {
                      onDownloadInvoice(booking.id);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-600 text-sm font-medium flex items-center gap-3 border-b border-gray-100"
                  >
                    <FontAwesomeIcon icon={faDownload} className="w-4" />
                    Download Invoice
                  </button>
                  <button
                    onClick={() => {
                      onSendInvoice(booking.id);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-purple-50 text-purple-600 text-sm font-medium flex items-center gap-3 border-b border-gray-100"
                  >
                    <FontAwesomeIcon icon={faEnvelope} className="w-4" />
                    Send Invoice via Email
                  </button>
                  <button
                    onClick={() => {
                      onUpdateStatus(booking.id, "completed");
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 text-green-600 text-sm font-medium flex items-center gap-3 border-b border-gray-100"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="w-4" />
                    Mark as Completed
                  </button>
                  <button
                    onClick={() => {
                      onCancel(booking.id);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 text-sm font-medium flex items-center gap-3"
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="w-4" />
                    Cancel Booking
                  </button>
                </>
              )}
              
              {(booking.status === "completed" || booking.status === "cancelled") && (
                <>
                  {booking.status === "completed" && (
                    <>
                      <button
                        onClick={() => {
                          onDownloadInvoice(booking.id);
                          setShowActions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-600 text-sm font-medium flex items-center gap-3 border-b border-gray-100"
                      >
                        <FontAwesomeIcon icon={faDownload} className="w-4" />
                        Download Invoice
                      </button>
                      <button
                        onClick={() => {
                          onSendInvoice(booking.id);
                          setShowActions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-purple-50 text-purple-600 text-sm font-medium flex items-center gap-3 border-b border-gray-100"
                      >
                        <FontAwesomeIcon icon={faEnvelope} className="w-4" />
                        Send Invoice via Email
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      onDelete(booking.id);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 text-sm font-medium flex items-center gap-3"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4" />
                    Delete Booking
                  </button>
                </>
              )}
              
              {/* Close button */}
              <button
                onClick={() => setShowActions(false)}
                className="w-full text-left px-4 py-3 bg-gray-50 text-gray-600 text-sm font-medium flex items-center gap-3 justify-center"
              >
                <FontAwesomeIcon icon={faTimes} className="w-4" />
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

BookingCard.propTypes = {
  booking: PropTypes.object.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending_payment: "bg-yellow-100 text-yellow-800",
    payment_confirmed: "bg-orange-100 text-orange-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    pending_payment: "Pending Payment",
    payment_confirmed: "Payment Confirmed",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
        statusStyles[status] || statusStyles.pending_payment
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

// Hotel Card Component
// Hotel Card Component
const HotelCard = ({ hotel, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-40">
        <img
          src={hotel.images?.[0] || hotel.image || ''}
          alt={hotel.name || hotel.hotel?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold">
          ${hotel.pricePerNight}/night
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1">
          {hotel.name || hotel.hotel?.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{hotel.city || hotel.hotel?.city}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">{hotel.roomType}</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500"></span>
            <span className="text-sm font-semibold">{hotel.rating}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onEdit(hotel)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium text-sm"
          >
            <FontAwesomeIcon icon={faEdit} />
            Edit
          </button>
          <button
            onClick={() => onDelete(hotel.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

HotelCard.propTypes = {
  hotel: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// Add Offer Modal Component
const AddOfferModal = ({
  newOffer,
  handleOfferInputChange,
  handleOfferImageSelect,
  handleAddOffer,
  setShowAddOfferModal,
  hotels = [],
  promoCodes = [],
  isEditing = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">{isEditing ? "Edit Offer" : "Add New Offer"}</h2>
          <button
            onClick={() => setShowAddOfferModal(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleAddOffer} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Offer Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={newOffer.title}
              onChange={handleOfferInputChange}
              placeholder="e.g., Summer Escape Package"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={newOffer.description}
              onChange={handleOfferInputChange}
              placeholder="Describe the offer details..."
              required
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="priceOff"
                  value={newOffer.priceOff}
                  onChange={handleOfferInputChange}
                  placeholder="25"
                  min="1"
                  max="100"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiryDate"
                value={newOffer.expiryDate}
                onChange={handleOfferInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <p className="text-xs text-gray-500 mt-1">
                 Select a future date for the offer to be active
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Offer Image <span className="text-red-500">*</span>
            </label>
            <ImageUpload
              onImageSelect={handleOfferImageSelect}
              currentImages={newOffer.imageUrl ? [newOffer.imageUrl] : []}
              label="Upload Offer Image (Recommended: 1200x800px)"
              multiple={false}
            />
            <p className="text-xs text-gray-500 mt-2">
               Use high-quality promotional images (max 2MB)
            </p>
          </div>

          {/* Hotel & Promo Code */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hotel (optional)</label>
              <select name="hotelId" value={newOffer.hotelId} onChange={handleOfferInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent">
                <option value="">All Hotels</option>
                {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Link to a specific hotel or leave blank for all</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code (optional)</label>
              <select name="promoCode" value={newOffer.promoCode} onChange={handleOfferInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent">
                <option value="">No promo code</option>
                {promoCodes.map(p => <option key={p.id} value={p.code}>{p.code} — {p.discountType === 'percentage' ? `${p.discountValue}%` : `$${p.discountValue}`} off</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Customers can use this code when booking</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Details (optional)</label>
            <textarea name="packageDetails" value={newOffer.packageDetails} onChange={handleOfferInputChange}
              placeholder="e.g., Includes: 2 nights stay, airport transfer, breakfast, spa treatment..."
              rows="2" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent" />
          </div>

          {/* Preview */}
          {newOffer.imageUrl && (
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
              <div
                className="relative h-48 rounded-lg overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${newOffer.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-white text-gray-900 font-bold rounded-full text-sm">
                    {newOffer.priceOff || "0"}% OFF
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-lg font-bold mb-1">
                    {newOffer.title || "Offer Title"}
                  </h3>
                  <p className="text-sm text-gray-200">
                    {newOffer.description || "Offer description"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAddOfferModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={isEditing ? faEdit : faPlus} />
              {isEditing ? "Update Offer" : "Add Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddOfferModal.propTypes = {
  newOffer: PropTypes.object.isRequired,
  handleOfferInputChange: PropTypes.func.isRequired,
  handleOfferImageSelect: PropTypes.func.isRequired,
  handleAddOffer: PropTypes.func.isRequired,
  setShowAddOfferModal: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

// Add Testimonial Modal Component
const AddTestimonialModal = ({
  newTestimonial,
  handleTestimonialInputChange,
  handleTestimonialImageSelect,
  handleAddTestimonial,
  setShowAddTestimonialModal,
  isEditing = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Testimonial" : "Add New Testimonial"}
          </h2>
          <button
            onClick={() => setShowAddTestimonialModal(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleAddTestimonial} className="p-6 space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={newTestimonial.name}
              onChange={handleTestimonialInputChange}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={newTestimonial.location}
              onChange={handleTestimonialInputChange}
              placeholder="New York, USA"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Profile Image <span className="text-red-500">*</span>
            </label>
            <ImageUpload
              onImageSelect={handleTestimonialImageSelect}
              currentImages={newTestimonial.image ? [newTestimonial.image] : []}
              label="Upload Profile Picture"
              multiple={false}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <select
              name="rating"
              value={newTestimonial.rating}
              onChange={handleTestimonialInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              <option value="5">5 Stars - Excellent</option>
              <option value="4">4 Stars - Very Good</option>
              <option value="3">3 Stars - Good</option>
              <option value="2">2 Stars - Fair</option>
              <option value="1">1 Star - Poor</option>
            </select>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Review <span className="text-red-500">*</span>
            </label>
            <textarea
              name="review"
              value={newTestimonial.review}
              onChange={handleTestimonialInputChange}
              placeholder="Share your experience..."
              required
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {newTestimonial.review.length} characters
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={newTestimonial.isActive}
              onChange={handleTestimonialInputChange}
              className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-accent/20"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Show this testimonial on the website
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAddTestimonialModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium"
            >
              {isEditing ? "Update Testimonial" : "Add Testimonial"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddTestimonialModal.propTypes = {
  newTestimonial: PropTypes.object.isRequired,
  handleTestimonialInputChange: PropTypes.func.isRequired,
  handleTestimonialImageSelect: PropTypes.func.isRequired,
  handleAddTestimonial: PropTypes.func.isRequired,
  setShowAddTestimonialModal: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

export default AdminDashboard;
