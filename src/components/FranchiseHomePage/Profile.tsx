import React, { useState, useEffect, useRef } from "react";
import { User, MapPin, Phone, Edit, Save, X, Lock } from "lucide-react";
import { getFranchaseProfile, updateFranchaseProfile } from "../../api/apiMethods";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    id: "",
    username: "",
    phoneNumber: "",
    password: "",
    buildingName: "",
    areaName: "",
    city: "",
    state: "",
    pincode: "",
    franchiseId: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const franchiseId = localStorage.getItem("userId");
      if (!franchiseId) {
        throw new Error("Franchise ID is missing");
      }

      const response = await getFranchaseProfile(franchiseId);
      if (response && response.success) {
        setProfileData({
          id: response.result.id || "",
          username: response.result.username || "",
          phoneNumber: response.result.phoneNumber || "",
          password: "", // Password not typically returned in profile fetch
          buildingName: response.result.buildingName || "",
          areaName: response.result.areaName || "",
          city: response.result.city || "",
          state: response.result.state || "",
          pincode: response.result.pincode || "",
          franchiseId: response?.result?.franchaseId || "",
          profileImage: response.result.profileImage || "",
        });
        setLoading(false);
      } else {
        throw new Error(response?.message || "Failed to fetch profile");
      }
    } catch (err) {
      setError(err.message || "Error fetching profile data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileData((prev) => ({
        ...prev,
        profileImage: URL.createObjectURL(file), // Preview image
      }));
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleSave = async () => {
    try {
      const franchiseId = localStorage.getItem("userId");

      if (!franchiseId) {
        throw new Error("Franchise ID is missing");
      }

      const formData = new FormData();
      formData.append("username", profileData.username);
      formData.append("phoneNumber", profileData.phoneNumber);
      formData.append("password", profileData.password);
      formData.append("buildingName", profileData.buildingName);
      formData.append("areaName", profileData.areaName);
      formData.append("city", profileData.city);
      formData.append("state", profileData.state);
      formData.append("pincode", profileData.pincode);
      formData.append("franchiseId", profileData?.id);
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      const response = await updateFranchaseProfile(formData);
      if (response?.success) {
        setIsEditing(false);
        setProfileImageFile(null); // Clear file after successful upload
        await fetchProfile(); // Refresh profile data
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err) {
      setError(err.message || "Error updating profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImageFile(null);
    fetchProfile(); // Reset to original data
  };

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        {error}
        <p>Showing default profile data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header with indigo to teal gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-teal-500 px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
              <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 md:mb-0">
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full cursor-pointer"
                    onClick={handleImageClick}
                  />
                ) : (
                  <User
                    className="h-12 w-12 text-gray-600 cursor-pointer"
                    onClick={handleImageClick}
                  />
                )}
                {isEditing && (
                  <div
                    className="absolute bottom-0 right-0 bg-white/80 p-1 rounded-full cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <Edit className="h-4 w-4 text-indigo-600" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
              <div className="text-white">
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className="text-2xl font-bold mb-2 bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70"
                  />
                ) : (
                  <h1 className="text-2xl font-bold mb-2">
                    {profileData.username}
                  </h1>
                )}
                <p className="text-indigo-100 mb-2">
                  Franchise ID: {profileData.franchiseId}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contact and Address Information */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Contact & Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  readOnly
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 cursor-not-allowed"
                  placeholder="Phone Number"
                />
              ) : (
                <span className="text-gray-700">{profileData.phoneNumber}</span>
              )}
            </div>

            {isEditing && (
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-gray-400" />
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={profileData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="New Password"
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.buildingName}
                  onChange={(e) =>
                    handleInputChange("buildingName", e.target.value)
                  }
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Building Name"
                />
              ) : (
                <span className="text-gray-700">
                  {profileData.buildingName}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.areaName}
                  onChange={(e) =>
                    handleInputChange("areaName", e.target.value)
                  }
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Area Name"
                />
              ) : (
                <span className="text-gray-700">{profileData.areaName}</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="City"
                />
              ) : (
                <span className="text-gray-700">{profileData.city}</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="State"
                />
              ) : (
                <span className="text-gray-700">{profileData.state}</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Pincode"
                />
              ) : (
                <span className="text-gray-700">{profileData.pincode}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;