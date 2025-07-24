import apiRequest from "./apiRequest";
  export const createCompanyReview = (formData: any) => apiRequest('createCompanyReview',formData)
  export const getAllPincodes = () => apiRequest("getAllPincodes");
  export const getAllCategories = (data: any) => apiRequest("getAllCategories", data);
  export const getPlans = (data: any) => apiRequest("getPlans",data);