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

  
  getAllPincodes: {
    method: "get",
    url: () => `/api/pincodes/allAreas`
  },

  createCompanyReview: {
    method: "post",
    url:"/api/companyReview/createReview"
  },
};

export default endpoints;
