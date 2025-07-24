import { addToCart } from "./apiMethods";

const endpoints: any = {

      createCompanyReview: {
    method: "post",
    url:"/api/companyReview/createReview"
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
    }
  },
  
}

export default endpoints;
