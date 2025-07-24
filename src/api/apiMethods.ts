import apiRequest from "./apiRequest";

export const franchiseRegister = (data: any) => apiRequest("franchiseRegister", data);

export const franchiseLogin = (data: any) => apiRequest("franchiseLogin", data)


export const getFranchaseProfile = (franchiseId: string) => apiRequest("getFranchaseProfile", null, franchiseId);

export const updateFranchaseProfile = (franchaseId: string, data: any) => apiRequest("updateUserProfile", data, franchaseId);

export const getAllPincodes = () => apiRequest("getAllPincodes");

export const createCompanyReview = (formData: any) => apiRequest('createCompanyReview',formData)
