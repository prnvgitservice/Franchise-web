import axios from "axios";
import qs from "qs";
import endpoints from "./endPoints";
import { baseUrl} from "./baseURL";

const apiRequest = (
  endpointKey: string,
  data: any = null,
  pathParams: string | null = null,
  queryParams: any = null
) => {
  return new Promise((res, rej) => {
    const endpoint = endpoints[endpointKey];
    let url =
      typeof endpoint.url === "function"
        ? endpoint.url(pathParams)
        : endpoint.url;

    if (queryParams) {
      const queryString = qs.stringify(queryParams, { addQueryPrefix: true });
      url += queryString;
    }

    const useLocal =
      endpointKey === "getUserProfile" || endpointKey === "updateUserProfile" || endpointKey === "login" || endpointKey === "register" || endpointKey === "getAllCategories" || endpointKey === "technicianRegister" || endpointKey === "userRegister" || endpointKey === "technicianLogin" || endpointKey === "userLogin" || endpointKey === "userGetProfile" || endpointKey === "userEditProfile" || endpointKey === "technicianGetProfileDetails" || endpointKey === "technicianEditProfile" || endpointKey === "getTechImagesByTechId" || endpointKey === "getServicesByTechId" || endpointKey === "updateTechnicianControl" || endpointKey === "updateServiceControl" || endpointKey === "createServiceControl" || endpointKey === "deleteServiceById";
    let apiBase = useLocal && baseUrl ;

    const my = "deleteServiceById"
    if(endpointKey===my || "createServiceControl" || "createTechImagesControl")
      apiBase = "http://localhost:5000"

    const jwt_token = localStorage.getItem("jwt_token");
    const headers: any = {};
    if (jwt_token) headers["Authorization"] = `Bearer ${jwt_token}`;
    if (data && !(data instanceof FormData)) headers["Content-Type"] = "application/json";

    console.log("apiBase:", apiBase, "endpointKey:", endpointKey, "url:", url);

    axios({
      method: endpoint.method,
      url: `${apiBase}${url}`,
      data: data,
      headers: headers,
    })
      .then((response) => {
        res(response?.data);
      })
      .catch((error) => {
        if (error.response?.status === 401 && jwt_token !== "demo-token") {
          localStorage.removeItem("jwt_token");
          localStorage.clear();
        }
        if (axios.isAxiosError(error)) {
          rej({
            status: error.response?.status,
            data: error.response?.data,
            message: error.response?.data?.message || error.message,
          });
        } else {
          rej({
            message: error.message || "Something went wrong",
          });
        }
      });
  });
};

export default apiRequest;
