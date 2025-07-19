import React, { useState } from 'react';
import { User, MapPin, Phone, Mail, Star, Calendar, Award, Edit, Save, X } from 'lucide-react';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Lohitha Technician',
    email: 'lohitha.tech@proservices.com',
    phone: '+91 98765 43210',
    location: 'Hyderabad, Telangana',
    specialty: 'Professional HVAC & Plumbing Specialist',
    bio: 'Experienced technician with 5+ years in HVAC and plumbing services. Committed to providing excellent customer service and quality workmanship.'
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 md:mb-0">
                <User className="h-12 w-12 text-gray-600" />
              </div>
              <div className="text-white">
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-2xl font-bold mb-2 bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70"
                  />
                ) : (
                  <h1 className="text-2xl font-bold mb-2">{profileData.name}</h1>
                )}
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                    className="text-blue-100 mb-2 bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70 w-full"
                  />
                ) : (
                  <p className="text-blue-100 mb-2">{profileData.specialty}</p>
                )}
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

        {/* Contact Information */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="text-gray-700">{profileData.phone}</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="text-gray-700">{profileData.location}</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">Joined March 2024</span>
            </div>
          </div>
          
          {/* Bio Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-700">{profileData.bio}</p>
            )}
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Profile;