import apiRequest from "./apiRequest";

export const franchiseRegister = (data: any) =>
  apiRequest("franchiseRegister", data);

export const franchiseLogin = (data: any) => apiRequest("franchiseLogin", data);

export const getFranchaseProfile = (franchiseId: string) =>apiRequest("getFranchaseProfile", null, franchiseId);

export const updateFranchaseProfile = (formData: any) =>apiRequest("updateFranchaseProfile", formData);

export const createCompanyReview = (formData: any) =>apiRequest("createCompanyReview", formData);

export const getAllPincodes = () => apiRequest("getAllPincodes");

export const getAllCategories = (data: any) =>apiRequest("getAllCategories", data);

export const getPlans = (data: any) => apiRequest("getPlans", data);

export const registerTechByFranchise = (data: any) => apiRequest('registerTechByFranchise', data)

export const addTechSubscriptionPlan = (data: any) => apiRequest("addTechSubscriptionPlan", data);
export const getAllTechniciansByFranchise = (franchiseId: string) =>
  apiRequest("getAllTechniciansByFranchise", null, franchiseId);

