import React, { useState, useEffect, useRef } from "react";
import { User, MapPin, Phone, Edit, Save, X, Lock, Divide } from "lucide-react";
import {
  getFranchaseProfile,
  updateFranchaseProfile,
} from "../../api/apiMethods";
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
          franchiseId: response?.result?.franchiseId || "",
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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
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
                    <Edit className="h-4 w-4 text-blue-600" />
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
                <p className="text-blue-100 mb-2">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
// import React, { useState, useEffect } from 'react';
// import { User, MapPin, Phone, Edit, Save, X, Lock } from 'lucide-react';
// import { getFranchaseProfile, apiRequest, updateFranchaseProfile } from '../../api/apiMethods';

// const Profile = () => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [profileData, setProfileData] = useState({
//     username: '',
//     phoneNumber: '',
//     password: '',
//     buildingName: '',
//     areaName: '',
//     city: '',
//     state: '',
//     pincode: '',
//     franchiseId: '',
//     profileImage: ''
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [profileImageFile, setProfileImageFile] = useState(null);

//   const fetchProfile = async () => {
//     try {
//       const franchiseId = localStorage.getItem('userId');
//       if (!franchiseId) {
//         throw new Error('Franchise ID is missing');
//       }

//       const response = await getFranchaseProfile(franchiseId);
//       if (response && response.success) {
//         setProfileData({
//           username: response.result.username || '',
//           phoneNumber: response.result.phoneNumber || '',
//           password: '', // Password not typically returned in profile fetch
//           buildingName: response.result.buildingName || '',
//           areaName: response.result.areaName || '',
//           city: response.result.city || '',
//           state: response.result.state || '',
//           pincode: response.result.pincode || '',
//           franchiseId: response.result.franchiseId || '',
//           profileImage: response.result.profileImage || ''
//         });
//         setLoading(false);
//       } else {
//         throw new Error(response?.message || 'Failed to fetch profile');
//       }
//     } catch (err) {
//       setError(err.message || 'Error fetching profile data');
//       setLoading(false);
//       // Fallback to default data
//       setProfileData({
//         username: 'Lohitha',
//         phoneNumber: '9876543212',
//         password: '',
//         buildingName: '123 MG Road',
//         areaName: 'SANJEEVA REDDY NAGAR (S R Nagar)',
//         city: 'Hyderabad',
//         state: 'Telangana',
//         pincode: '500038',
//         franchiseId: 'PRNV-FTR066',
//         profileImage: ''
//       });
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const handleInputChange = (field, value) => {
//     setProfileData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setProfileImageFile(file);
//       setProfileData(prev => ({
//         ...prev,
//         profileImage: URL.createObjectURL(file) // Preview image
//       }));
//     }
//   };

//   const handleSave = async () => {
//     try {
//       const franchiseId = localStorage.getItem('userId');
//       if (!franchiseId) {
//         throw new Error('Franchise ID is missing');
//       }

//       const formData = new FormData();
//       formData.append('username', profileData.username);
//       formData.append('phoneNumber', profileData.phoneNumber);
//       formData.append('password', profileData.password);
//       formData.append('buildingName', profileData.buildingName);
//       formData.append('areaName', profileData.areaName);
//       formData.append('city', profileData.city);
//       formData.append('state', profileData.state);
//       formData.append('pincode', profileData.pincode);
//       if (profileImageFile) {
//         formData.append('profileImage', profileImageFile);
//       }

//       const response = await updateFranchaseProfile({ formData, franchiseId});
//       if (response.success) {
//         setIsEditing(false);
//         setProfileImageFile(null); // Clear file after successful upload
//         await fetchProfile(); // Refresh profile data
//       } else {
//         throw new Error(response.message || 'Failed to update profile');
//       }
//     } catch (err) {
//       setError(err.message || 'Error updating profile');
//     }
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setProfileImageFile(null);
//     fetchProfile(); // Reset to original data
//   };

//   if (loading) {
//     return <div className="text-center py-10">Loading profile...</div>;
//   }

//   if (error) {
//     return (
//       <div className="text-center py-10 text-red-600">
//         {error}
//         <p>Showing default profile data</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//             <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
//               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 md:mb-0">
//                 {profileData.profileImage ? (
//                   <img
//                     src={profileData.profileImage}
//                     alt="Profile"
//                     className="w-full h-full object-cover rounded-full"
//                   />
//                 ) : (
//                   <User className="h-12 w-12 text-gray-600" />
//                 )}
//               </div>
//               <div className="text-white">
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     value={profileData.username}
//                     onChange={(e) => handleInputChange('username', e.target.value)}
//                     className="text-2xl font-bold mb-2 bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70"
//                   />
//                 ) : (
//                   <h1 className="text-2xl font-bold mb-2">{profileData.username}</h1>
//                 )}
//                 <p className="text-blue-100 mb-2">Franchise ID: {profileData.franchiseId}</p>
//                 {isEditing && (
//                   <div className="mb-2">
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       className="text-blue-100"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div className="mt-4 md:mt-0">
//               {isEditing ? (
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={handleSave}
//                     className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
//                   >
//                     <Save className="h-4 w-4 mr-2" />
//                     Save
//                   </button>
//                   <button
//                     onClick={handleCancel}
//                     className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
//                   >
//                     <X className="h-4 w-4 mr-2" />
//                     Cancel
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center"
//                 >
//                   <Edit className="h-4 w-4 mr-2" />
//                   Edit Profile
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Contact and Address Information */}
//         <div className="p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact & Address</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex items-center space-x-3">
//               <Phone className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="tel"
//                   value={profileData.phoneNumber}
//                   onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Phone Number"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.phoneNumber}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <Lock className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="password"
//                   value={profileData.password}
//                   onChange={(e) => handleInputChange('password', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="New Password"
//                 />
//               ) : (
//                 <span className="text-gray-700">********</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <MapPin className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={profileData.buildingName}
//                   onChange={(e) => handleInputChange('buildingName', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Building Name"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.buildingName}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <MapPin className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={profileData.areaName}
//                   onChange={(e) => handleInputChange('areaName', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Area Name"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.areaName}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <MapPin className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={profileData.city}
//                   onChange={(e) => handleInputChange('city', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="City"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.city}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <MapPin className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={profileData.state}
//                   onChange={(e) => handleInputChange('state', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="State"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.state}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <MapPin className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={profileData.pincode}
//                   onChange={(e) => handleInputChange('pincode', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Pincode"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.pincode}</span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;
// import React, { useState, useEffect } from 'react';
// import { User, MapPin, Phone, Edit, Save, X } from 'lucide-react';
// import { getFranchaseProfile } from '../../api/apiMethods';

// const Profile = () => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [profileData, setProfileData] = useState({
//     username: '',
//     phoneNumber: '',
//     buildingName: '',
//     areaName: '',
//     city: '',
//     state: '',
//     pincode: '',
//     franchiseId:''

//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchProfile = async () => {
//     try {
//       const franchiseId = localStorage.getItem('userId');

//         const response = await getFranchaseProfile(franchiseId)
//         console.log(response,"==>response")
//         if(response){

//         setProfileData({
//           username: response?.result?.username || '',
//           phoneNumber: response?.result?.phoneNumber || '',
//           buildingName: response?.result?.buildingName || '',
//           areaName: response?.result?.areaName || '',
//           city: response?.result?.city || '',
//           state: response?.result?.state || '',
//           pincode: response?.result?.pincode || '',
//           franchiseId: response?.result?.franchiseId || ''
//         });
//         setLoading(false);
//       }
//       else{
//         setError('Franchise Id is missing');
//       }

//     } catch (err) {
//       setError(err?.message, 'Error fetching profile data');
//       console.log(err)
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const handleInputChange = (field, value) => {
//     setProfileData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleSave = () => {
//     setIsEditing(false);
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//   };

//   if (loading) {
//     return <div className="text-center py-10">Loading profile...</div>;
//   }

//   if (error) {
//     return (
//       <div className="text-center py-10 text-red-600">
//         {error}
//         <p>Showing default profile data</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//             <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
//               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 md:mb-0">
//                 <User className="h-12 w-12 text-gray-600" />
//               </div>
//               <div className="text-white">
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     value={profileData.username}
//                     onChange={(e) => handleInputChange('username', e.target.value)}
//                     className="text-2xl font-bold mb-2 bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70"
//                   />
//                 ) : (
//                   <h1 className="text-2xl font-bold mb-2">{profileData.username}</h1>
//                 )}
//                 <p className="text-blue-100 mb-2">Franchise ID: {profileData.franchiseId}</p>
//               </div>
//             </div>
//             <div className="mt-4 md:mt-0">
//               {isEditing ? (
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={handleSave}
//                     className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
//                   >
//                     <Save className="h-4 w-4 mr-2" />
//                     Save
//                   </button>
//                   <button
//                     onClick={handleCancel}
//                     className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
//                   >
//                     <X className="h-4 w-4 mr-2" />
//                     Cancel
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center"
//                 >
//                   <Edit className="h-4 w-4 mr-2" />
//                   Edit Profile
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Contact and Address Information */}
//         <div className="p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact & Address</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex items-center space-x-3">
//               <Phone className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="tel"
//                   value={profileData.phoneNumber}
//                   onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.phoneNumber}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <MapPin className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={profileData.buildingName}
//                   onChange={(e) => handleInputChange('buildingName', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Building Name"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.buildingName}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <MapPin className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={profileData.areaName}
//                   onChange={(e) => handleInputChange('areaName', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Area Name"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.areaName}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <MapPin className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={profileData.city}
//                   onChange={(e) => handleInputChange('city', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="City"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.city}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <MapPin className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={profileData.state}
//                   onChange={(e) => handleInputChange('state', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="State"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.state}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <MapPin className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={profileData.pincode}
//                   onChange={(e) => handleInputChange('pincode', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Pincode"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.pincode}</span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;
// import React, { useState, useEffect } from 'react';
// import { User, MapPin, Phone, Calendar, Edit, Save, X } from 'lucide-react';
// import { getFranchaseProfile } from '../../api/apiMethods';

// const Profile = () => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [profileData, setProfileData] = useState({
//     name: '',
//     phone: '',
//     location: '',
//     specialty: '',
//     bio: ''
//   });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const franchiseId = localStorage.getItem('user')?.id || '6881f8c1399806635d7a0b42';
//         if (!franchiseId) {
//           throw new Error('User ID not found in localStorage');
//         }

//         // Replace with your actual API endpoint
//         const response = await getFranchaseProfile(franchiseId);

//         const data = await response?.json();

//         if (!data?.success) {
//           throw new Error(data.message || 'Failed to fetch profile');
//         }

//         const { result } = data;
//         // Map API response to profileData structure
//         setProfileData({
//           name: result.username || 'Lohitha Technician',
//           phone: result.phoneNumber || '+91 98765 43210',
//           location: `${result.buildingName}, ${result.areaName}, ${result.city}, ${result.state} - ${result.pincode}`,
//           specialty: 'Professional HVAC & Plumbing Specialist', // Not provided in API, keeping default
//           bio: 'Experienced technician with 5+ years in HVAC and plumbing services. Committed to providing excellent customer service and quality workmanship.' // Not provided in API, keeping default
//         });
//         setLoading(false);
//       } catch (err) {
//         setError(err?.message || 'Error fetching profile data');
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   const handleInputChange = (field, value) => {
//     setProfileData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleSave = () => {
//     setIsEditing(false);
//     // Here you would typically save to backend
//     // Example:
//     // fetch('/api/franchise/update', {
//     //   method: 'PUT',
//     //   body: JSON.stringify(profileData),
//     //   headers: { 'Content-Type': 'application/json' }
//     // })
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     // Reset to original data if needed
//   };

//   if (loading) {
//     return <div className="text-center py-10">Loading profile...</div>;
//   }

//   if (error) {
//     return (
//       <div className="text-center py-10 text-red-600">
//         {error}
//         <p>Showing default profile data</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//             <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
//               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 md:mb-0">
//                 <User className="h-12 w-12 text-gray-600" />
//               </div>
//               <div className="text-white">
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     value={profileData.name}
//                     onChange={(e) => handleInputChange('name', e.target.value)}
//                     className="text-2xl font-bold mb-2 bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70"
//                   />
//                 ) : (
//                   <h1 className="text-2xl font-bold mb-2">{profileData?.name}</h1>
//                 )}
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     value={profileData.specialty}
//                     onChange={(e) => handleInputChange('specialty', e.target.value)}
//                     className="text-blue-100 mb-2 bg-white/20 border border-white/30 rounded-lg px-3 py-1 placeholder-white/70 w-full"
//                   />
//                 ) : (
//                   <p className="text-blue-100 mb-2">{profileData.specialty}</p>
//                 )}
//               </div>
//             </div>

//             <div className="mt-4 md:mt-0">
//               {isEditing ? (
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={handleSave}
//                     className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
//                   >
//                     <Save className="h-4 w-4 mr-2" />
//                     Save
//                   </button>
//                   <button
//                     onClick={handleCancel}
//                     className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
//                   >
//                     <X className="h-4 w-4 mr-2" />
//                     Cancel
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center"
//                 >
//                   <Edit className="h-4 w-4 mr-2" />
//                   Edit Profile
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Contact Information */}
//         <div className="p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex items-center space-x-3">
//               <Phone className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="tel"
//                   value={profileData.phone}
//                   onChange={(e) => handleInputChange('phone', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.phone}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <MapPin className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={profileData.location}
//                   onChange={(e) => handleInputChange('location', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.location}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <Calendar className="h-5 w-5 text-gray-400" />
//               <span className="text-gray-700">Joined March 2024</span>
//             </div>
//           </div>

//           {/* Bio Section */}
//           <div className="mt-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
//             {isEditing ? (
//               <textarea
//                 value={profileData.bio}
//                 onChange={(e) => handleInputChange('bio', e.target.value)}
//                 rows={4}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             ) : (
//               <p className="text-gray-700">{profileData.bio}</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;
// import React, { useState } from 'react';
// import { User, MapPin, Phone, Mail, Star, Calendar, Award, Edit, Save, X } from 'lucide-react';

// const Profile: React.FC = () => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [profileData, setProfileData] = useState({
//     name: 'Lohitha Technician',
//     email: 'lohitha.tech@proservices.com',
//     phone: '+91 98765 43210',
//     location: 'Hyderabad, Telangana',
//     specialty: 'Professional HVAC & Plumbing Specialist',
//     bio: 'Experienced technician with 5+ years in HVAC and plumbing services. Committed to providing excellent customer service and quality workmanship.'
//   });

//   const handleInputChange = (field: string, value: string) => {
//     setProfileData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleSave = () => {
//     setIsEditing(false);
//     // Here you would typically save to backend
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     // Reset to original data if needed
//   };

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//             <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
//               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 md:mb-0">
//                 <User className="h-12 w-12 text-gray-600" />
//               </div>
//               <div className="text-white">
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     value={profileData.name}
//                     onChange={(e) => handleInputChange('name', e.target.value)}
//                     className="text-2xl font-bold mb-2 bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70"
//                   />
//                 ) : (
//                   <h1 className="text-2xl font-bold mb-2">{profileData.name}</h1>
//                 )}
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     value={profileData.specialty}
//                     onChange={(e) => handleInputChange('specialty', e.target.value)}
//                     className="text-blue-100 mb-2 bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70 w-full"
//                   />
//                 ) : (
//                   <p className="text-blue-100 mb-2">{profileData.specialty}</p>
//                 )}
//               </div>
//             </div>

//             <div className="mt-4 md:mt-0">
//               {isEditing ? (
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={handleSave}
//                     className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
//                   >
//                     <Save className="h-4 w-4 mr-2" />
//                     Save
//                   </button>
//                   <button
//                     onClick={handleCancel}
//                     className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
//                   >
//                     <X className="h-4 w-4 mr-2" />
//                     Cancel
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center"
//                 >
//                   <Edit className="h-4 w-4 mr-2" />
//                   Edit Profile
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Contact Information */}
//         <div className="p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex items-center space-x-3">
//               <Phone className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="tel"
//                   value={profileData.phone}
//                   onChange={(e) => handleInputChange('phone', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.phone}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <MapPin className="h-5 w-5 text-gray-400" />
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={profileData.location}
//                   onChange={(e) => handleInputChange('location', e.target.value)}
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               ) : (
//                 <span className="text-gray-700">{profileData.location}</span>
//               )}
//             </div>
//             <div className="flex items-center space-x-3">
//               <Calendar className="h-5 w-5 text-gray-400" />
//               <span className="text-gray-700">Joined March 2024</span>
//             </div>
//           </div>

//           {/* Bio Section */}
//           <div className="mt-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
//             {isEditing ? (
//               <textarea
//                 value={profileData.bio}
//                 onChange={(e) => handleInputChange('bio', e.target.value)}
//                 rows={4}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             ) : (
//               <p className="text-gray-700">{profileData.bio}</p>
//             )}
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default Profile;
