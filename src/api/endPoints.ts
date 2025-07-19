import { addToCart } from "./apiMethods";

const endpoints: any = {
  
   login: {
    method: "post",
    url: () => {
      return `/api/auth/login`;
    },
  },
  getAllCategories: {
    method: "get",
    url: () => {
      return `/api/categories/get`;
    },
  },
  getAvgReviews: {
    method: "get",
    url: (id: string) => {
      return `/api/reviews/${id}/stats`;
    },
  },
  

  register: {
    method: "post",
    url: () => `/api/auth/register`
  },


  getUserProfile: {
    method: "get",
    url: (userId: string) => `/api/userAuth/profile/${userId}`
  },

  updateUserProfile: {
    method: "put",
    url: (userId: string) => `/api/auth/profile/${userId}`
  },

  userRegister: {
    method: "post",
    url: () => `/api/userAuth/register`
  },
  technicianRegister: {
    method: "post",
    url: () => `/api/techAuth/register`
  },
  
  userLogin: {
    method: "post",
    url: () => `/api/userAuth/login`
  },
  technicianLogin: {
    method: "post",
    url: () => `/api/techAuth/login`
  },
  userGetProfile: {
    method: "get",
    url: (userId: string) => `/api/userAuth/profile/${userId}`
  },
  userEditProfile: {
    method: "put",
    url: () => `/api/userAuth/editProfile`
  },
  technicianGetProfileDetails: {
    method: "get",
    url: (userId: string) => `/api/techAuth/getTechProfile/${userId}`
  },
  technicianEditProfile: {
    method: "put",
    url: () => `/api/techAuth/editProfile`
  },
  getPlans: {
    method: "get",
    url: () => {
      return `/api/subscriptions/plans`;
    }
  },
  getTechImagesByTechId: { //images
    method: "get",
    url: (id: string) => `/api/techImages/getTechImagesByTechId/${id}`
  },
  getServicesByTechId: { // services - get
    method: "get",
    url: (id: string) => `/api/services/getServicesByTechId/${id}`
  },
  updateTechnicianControl: { // 
    method: "put",
    url: () => `/api/techAuth/updateTechnicianControl`
  },
  updateServiceControl: {
    method: "put",
    url: () => `/api/services/updateServiceControl`
  },
  createServiceControl: {
    method: "post",
    url: () => `/api/services/createServiceControl`
  },
  deleteServiceById: {
    method: "delete",
    url: (id: string) => `/api/services/deleteServiceById/${id}`
  },
  createTechImagesControl: {
    method: "post",
    url: () => `/api/techImages/createTechImagesControl`
  },
  getAllPincodes: {
    method: "get",
    url: () => `/api/pincodes/allAreas`
  },

  getAllTechnicianDetails: {
    method: "get",
    url: (id: string) => {
      return `/api/techDetails/getTechAllDetails/${id}`;
    },
  },
    addToCart: {
    method: "post",
    url: () => `/api/cart/addToCart`
  },
   getCartItems: {
    method: "get",
    url: (id: string) => {
      return `/api/cart/getCart/${id}`;
    },
  },
     removeFromCart: {
    method: "put",
    url: () => `/api/cart/removeFromCartService`
  },
     createBookService: {
    method: "post",
    url: () => `/api/bookingServices/createBookService`
  },
  getOrdersByUserId: {
    method: "get",
    url: (id: string) => {
      return `/api/bookingServices/getBookServiceByUserId/${id}`;
    },
  },
  getOrdersByTechnicianId: {
    method: "get",
    url: (id: string) => {
      return `/api/bookingServices/getBookServiceByTechnicianId/${id}`;
    },
  },
  bookingCancleByUser: {
    method: "put",
    url: () => `/api/bookingServices/BookingCancleByUser`
  },
  updateBookingStatus: {
    method: "put",
    url: () => `/api/bookingServices/BookingStatusByTechnician`
  },
  getTechnicianReviews: {
    method: "get",
    url: (id: string) => {
      return `/api/techReview/getTechReviewsById/${id}`;
    },
  },

  getCompanyReviews: {
    method: "get",
    url : '/api/companyReview/getCompanyReviews'
  },

  createGuestBooking: {
    method: "post",
    url:"/api/guestBooking/addGuestBooking"
  },

   createGetInTouch: {
    method: "post",
    url:"/api/getInTouch/addGetInTouch"
  },

  createFranchaseEnquiry: {
    method: "post",
    url:"/api/franchaseEnquiry/addFranchaseEnquiry"
  },

  createCompanyReview: {
    method: "post",
    url:"/api/companyReview/createReview"
  },

  getAllTechByAddress: {
    method: "post",
    url:'/api/techDetails/getAllTechByAddress'
  },

  getTechByCategorie:{
    method:"get",
    url: (id: string) => {
      return `http://localhost:5000/api/techDetails/getAllTechniciansByCateId/${id}`;
    },
  }
}

export default endpoints;
