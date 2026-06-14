import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faEdit,
  faSave,
  faTimes,
  faArrowLeft,
  faCalendarAlt,
  faHeart,
  faCog,
  faBell,
  faShieldAlt,
  faCamera,
  faTrash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useFavorites } from "../hooks/useFavorites";
import PropTypes from "prop-types";
import api, { authAPI } from "../services/api";
import { toast } from "../utils/toast";
import { SkeletonProfile } from "../components/Skeleton";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, isLoaded, refreshUser } = useAuth();
  const { favoritesCount } = useFavorites();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    bio: "",
  });

  // Populate profileData from user when loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        country: user.country || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    promotionalEmails: true,
    bookingReminders: true,
    currency: "USD",
    language: "English",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result;
          await authAPI.uploadAvatar(base64);
          toast.success('Profile photo updated successfully!');
          // Refresh user data to get new avatar
          if (refreshUser) {
            await refreshUser();
          }
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload profile photo.');
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read the image file.');
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process the image.');
      setUploadingAvatar(false);
    }
    
    // Reset input value to allow re-uploading same file
    e.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!user?.avatar) return;
    
    setUploadingAvatar(true);
    try {
      await authAPI.removeAvatar();
      toast.success('Profile photo removed.');
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Remove avatar error:', error);
      toast.error('Failed to remove profile photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleCancel = async () => {
    setIsEditing(false);
    // Reset to backend data
    if (user) {
      try {
        const response = await api.get(`/profile/${user.id}`);
        setProfileData(response.data);
      } catch (error) {
        toast.error("Failed to reset profile data");
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <SkeletonProfile />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-4 font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              {/* Profile Image */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                    {uploadingAvatar ? (
                      <FontAwesomeIcon icon={faSpinner} className="text-3xl text-white animate-spin" />
                    ) : user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUser} className="text-4xl text-white" />
                    )}
                  </div>
                  {/* Upload Overlay */}
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary hover:bg-accent text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                    title="Change profile photo"
                  >
                    <FontAwesomeIcon icon={faCamera} className="text-sm" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {/* Remove Photo Button */}
                {user?.avatar && !uploadingAvatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="mt-2 text-xs text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 mx-auto"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                    Remove photo
                  </button>
                )}
                <h3 className="font-bold text-xl text-gray-900 mt-3">
                  {user?.fullName || "User"}
                </h3>
                <p className="text-sm text-gray-600">Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 mb-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bookings</span>
                  <span className="font-semibold text-primary">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Favorites</span>
                  <span className="font-semibold text-red-500">{favoritesCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reviews</span>
                  <span className="font-semibold text-accent">8</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                <TabItem
                  icon={faUser}
                  label="Profile Info"
                  active={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                />
                <TabItem
                  icon={faCog}
                  label="Preferences"
                  active={activeTab === "preferences"}
                  onClick={() => setActiveTab("preferences")}
                />
                <TabItem
                  icon={faBell}
                  label="Notifications"
                  active={activeTab === "notifications"}
                  onClick={() => setActiveTab("notifications")}
                />
                <TabItem
                  icon={faShieldAlt}
                  label="Security"
                  active={activeTab === "security"}
                  onClick={() => setActiveTab("security")}
                />
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Profile Information
                    </h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                        >
                          <FontAwesomeIcon icon={faSave} />
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        icon={faUser}
                        label="First Name"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      <FormField
                        icon={faUser}
                        label="Last Name"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    {/* Contact Fields */}
                    <FormField
                      icon={faEnvelope}
                      label="Email Address"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={true}
                      hint="Email cannot be changed"
                    />

                    <FormField
                      icon={faPhone}
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />

                    {/* Address Fields */}
                    <FormField
                      icon={faMapMarkerAlt}
                      label="Address"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        icon={faMapMarkerAlt}
                        label="City"
                        name="city"
                        value={profileData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      <FormField
                        icon={faMapMarkerAlt}
                        label="Country"
                        name="country"
                        value={profileData.country}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows="4"
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent ${
                          !isEditing ? "bg-gray-50" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Preferences
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={preferences.currency}
                        onChange={(e) =>
                          setPreferences((prev) => ({ ...prev, currency: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="AED">AED - UAE Dirham</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) =>
                          setPreferences((prev) => ({ ...prev, language: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Arabic">Arabic</option>
                      </select>
                    </div>

                    <button className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium">
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Notification Settings
                  </h2>

                  <div className="space-y-4">
                    <NotificationToggle
                      label="Email Notifications"
                      description="Receive booking confirmations and updates via email"
                      checked={preferences.emailNotifications}
                      onChange={() => handlePreferenceChange("emailNotifications")}
                    />
                    <NotificationToggle
                      label="SMS Notifications"
                      description="Get text messages for important booking updates"
                      checked={preferences.smsNotifications}
                      onChange={() => handlePreferenceChange("smsNotifications")}
                    />
                    <NotificationToggle
                      label="Promotional Emails"
                      description="Receive special offers and deals"
                      checked={preferences.promotionalEmails}
                      onChange={() => handlePreferenceChange("promotionalEmails")}
                    />
                    <NotificationToggle
                      label="Booking Reminders"
                      description="Get reminders before your check-in date"
                      checked={preferences.bookingReminders}
                      onChange={() => handlePreferenceChange("bookingReminders")}
                    />
                  </div>

                  <button className="w-full mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium">
                    Save Notification Settings
                  </button>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Security Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
                        Your account is secured with JWT authentication
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Password</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Last changed 30 days ago
                        </p>
                        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium text-sm">
                          Change Password
                        </button>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Add an extra layer of security to your account
                        </p>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                          Enable 2FA
                        </button>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Active Sessions</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Manage devices where you're currently logged in
                        </p>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                          View Sessions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Item Component
const TabItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
        active
          ? "bg-primary text-white"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <FontAwesomeIcon icon={icon} />
      <span>{label}</span>
    </button>
  );
};

TabItem.propTypes = {
  icon: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

// Form Field Component
const FormField = ({ icon, label, name, type = "text", value, onChange, disabled, hint }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FontAwesomeIcon icon={icon} />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent ${
            disabled ? "bg-gray-50 cursor-not-allowed" : ""
          }`}
        />
      </div>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
};

FormField.propTypes = {
  icon: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  hint: PropTypes.string,
};

// Notification Toggle Component
const NotificationToggle = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
};

NotificationToggle.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default UserProfile;
