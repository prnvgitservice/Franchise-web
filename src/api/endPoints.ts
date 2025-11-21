import { addToCart } from "./apiMethods";

const endpoints: any = {
  franchiseRegister: {
    method: "post",
    url: () => `/api/franchiseAuth/register`,
  },
  franchiseLogin: {
    method: "post",
    url: () => `/api/franchiseAuth/login`,
  },

  getFranchaseProfile: {
    method: "get",
    url: (franchiseId: string) =>
      `/api/franchiseAuth/getFranchiseProfile/${franchiseId}`,
  },

  updateFranchaseProfile: {
    method: "put",
    url: () => `/api/franchiseAuth/updateFranchise`,
  },

  createCompanyReview: {
    method: "post",
    url: "/api/companyReview/createReview",
  },

  getAllCategories: {
    method: "get",
    url: () => {
      return `/api/categories/get`;
    },
  },

  getPlans: {
    method: "get",
    url: () => {
      return `/api/subscriptions/plans`;
    },
  },

  getAllPincodes: {
    method: "get",
    url: () => `/api/pincodes/allAreas`,
  },

  registerTechByFranchise: {
    method: "post",
    url: () => `/api/techAuth/registerByFranchise`,
  },
  addTechSubscriptionPlan: {
    method: "post",
    url: () => `/api/technicianSubscription/addTechSubscriptionPlan`,
  },
  getAllTechniciansByFranchise: {
    method: "get",
    url: (franchiseId: string) =>
      `/api/techAuth/getTechProfilesByFranchiseId/${franchiseId}`,
  },
  updateTechByFranchise: {
    method: "put",
    url: () => `/api/techAuth/updateTechByFranchaise`,
  },

  getFranchisePlans: {
    method: "get",
    url: () => `/api/franchiseSubscription/franchisePlans`,
  },

  getFranchiseSubscriptionPlan: {
    method: "get",
    url: (franchiseId: string) =>
      `/api/franchiseSubscriptionDetails/getFranchiseSubscriptionPlan/${franchiseId}`,
  },

  getFranchiseAccount: {
    method: "get",
    url: (franchiseId: string) =>
      `/api/franchiseAccounts/getFranchiseAccount/${franchiseId}`,
  },

  getFranchiseAccountValues: {
    method: "get",
    url: (franchiseId: string) =>
      `/api/franchiseAccounts/getFranchiseAccountValues/${franchiseId}`,
  },
};
export default endpoints;
