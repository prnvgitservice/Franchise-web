import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllCategories,
  getAllPincodes,
  getPlans,
  registerTechByFranchise,
} from "../../api/apiMethods";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { createPortal } from "react-dom";

interface PincodeSubArea {
  _id: string;
  name: string;
}

interface PincodeArea {
  _id: string;
  name: string;
  subAreas: PincodeSubArea[];
}

interface PincodeData {
  _id: string;
  code: string;
  city: string;
  state: string;
  areas: PincodeArea[];
}

interface Category {
  _id: string;
  category_name: string;
  status: number;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  originalPrice: number;
  discount: string;
  discountPercentage: number;
  price: number;
  gstPercentage: number;
  gst: number;
  finalPrice: number;
  validity: number | null;
  leads: number | null;
  features: { name: string; included: boolean }[];
  fullFeatures: { text: string }[];
  isPopular: boolean;
  isActive: boolean;
}

interface FormData {
  name: string;
  mobile: string;
  password: string;
  buildingName: string;
  areaName: string;
  subAreaName: string;
  city: string;
  state: string;
  pincode: string;
  category: string;
  subscriptionId: string;
  profileImage: File | null;
  aadharFront: File | null;
  aadharBack: File | null;
  panCard: File | null;
  voterCard: File | null;
  authorizedPhone1: string;
  auth1Photo: File | null;
  authorizedPhone2: string;
  auth2Photo: File | null;
}

interface FormErrors {
  name?: string;
  mobile?: string;
  password?: string;
  buildingName?: string;
  areaName?: string;
  subAreaName?: string;
  city?: string;
  state?: string;
  pincode?: string;
  category?: string;
  subscriptionId?: string;
  profileImage?: string;
  aadharFront?: string;
  aadharBack?: string;
  panCard?: string;
  voterCard?: string;
  authorizedPhone1?: string;
  auth1Photo?: string;
  authorizedPhone2?: string;
  auth2Photo?: string;
  general?: string;
  terms?: string;
}

interface RegistrationResponse {
  success: boolean;
  message: string;
  result: Technician;
}

interface Technician {
  id: string;
  franchiseId: string | null;
  username: string;
  phoneNumber: string;
  role: string;
  category: string;
  buildingName: string;
  areaName: string;
  subAreaName: string;
  city: string;
  state: string;
  pincode: string;
  description: string;
  service: string;
  profileImage: string;
  plan: string;
  categoryServices: CategoryService[];
  aadharFront: string;
  aadharBack: string;
  panCard: string;
  voterCard: string | null;
  authorizedPersons: AuthorizedPerson[];
  result: SubscriptionResult;
  status: string;
  franchiseAccount: any | null;
}

interface CategoryService {
  categoryServiceId: string;
  status: boolean;
  _id: string;
}

interface AuthorizedPerson {
  phone: string;
  photo: string;
  _id: string;
}

interface SubscriptionResult {
  subscriptionId: string;
  subscriptionName: string;
  startDate: string;
  endDate: string;
  leads: number | null;
  ordersCount: number;
  endUpPrice: number | null;
  earnAmount: number;
}

const NAME_REGEX = /^[A-Za-z ]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const PASS_REGEX = /^[A-Za-z0-9@_#]{6,10}$/;

const isCtrlCombo = (e: React.KeyboardEvent<HTMLInputElement>) =>
  e.ctrlKey || e.metaKey || e.altKey;

const allowNameKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (isCtrlCombo(e)) return;
  const k = e.key;
  const allowed =
    /^[A-Za-z ]$/.test(k) ||
    [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ].includes(k);
  if (!allowed) e.preventDefault();
};

const allowDigitKey = (
  e: React.KeyboardEvent<HTMLInputElement>,
  maxLen = 10
) => {
  if (isCtrlCombo(e)) return;
  const k = e.key;
  const target = e.target as HTMLInputElement;
  const isNav = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Tab",
    "Home",
    "End",
  ].includes(k);
  if (isNav) return;
  if (!/^[0-9]$/.test(k)) {
    e.preventDefault();
    return;
  }
  const selection = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
  if (target.value.length - selection >= maxLen) e.preventDefault();
};

const allowPasswordKey = (
  e: React.KeyboardEvent<HTMLInputElement>,
  maxLen = 10
) => {
  if (isCtrlCombo(e)) return;
  const k = e.key;
  const target = e.target as HTMLInputElement;
  const isNav = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Tab",
    "Home",
    "End",
  ].includes(k);
  if (isNav) return;
  if (!/^[A-Za-z0-9@_#]$/.test(k)) {
    e.preventDefault();
    return;
  }
  const selection = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
  if (target.value.length - selection >= maxLen) e.preventDefault();
};

const sanitizeName = (v: string) => v.replace(/[^A-Za-z ]+/g, "");
const sanitizePhone = (v: string) => v.replace(/[^0-9]+/g, "").slice(0, 10);
const sanitizePassword = (v: string) =>
  v.replace(/[^A-Za-z0-9@_#]+/g, "").slice(0, 10);

const initialFormState: FormData = {
  name: "",
  mobile: "",
  password: "",
  buildingName: "",
  areaName: "",
  subAreaName: "",
  city: "",
  state: "",
  pincode: "",
  category: "",
  subscriptionId: "",
  profileImage: null,
  aadharFront: null,
  aadharBack: null,
  panCard: null,
  voterCard: null,
  authorizedPhone1: "",
  auth1Photo: null,
  authorizedPhone2: "",
  auth2Photo: null,
};

const fieldOrderTech: (keyof FormErrors)[] = [
  "name",
  "mobile",
  "password",
  "buildingName",
  "pincode",
  "areaName",
  "subAreaName",
  "city",
  "state",
  "category",
  "subscriptionId",
  "profileImage",
  "aadharFront",
  "aadharBack",
  "panCard",
  "authorizedPhone1",
  "auth1Photo",
  "authorizedPhone2",
  "auth2Photo",
  "terms",
  "general",
];

const steps = [
  "Personal Information",
  "Address Details",
  "Service & Subscription",
  "Documents",
];

const fieldLabels = {
  profileImage: "Profile image",
  aadharFront: "Aadhar front",
  aadharBack: "Aadhar back",
  panCard: "Pan card",
  voterCard: "Voter card",
  auth1Photo: "Authorized person 1 photo",
  auth2Photo: "Authorized person 2 photo",
} as const;

const AddTechnicianSteps: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);

  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState<boolean>(false);
  const [catError, setCatError] = useState<string | null>(null);

  const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
  const [selectedPincode, setSelectedPincode] = useState<string>("");

  const [areaOptions, setAreaOptions] = useState<PincodeArea[]>([]);
  const [subAreaOptions, setSubAreaOptions] = useState<PincodeSubArea[]>([]);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [planLoading, setPlanLoading] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  const navigate = useNavigate();

  // Cleanup previews
  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // Load categories & plans
  useEffect(() => {
    setCatLoading(true);
    getAllCategories(null)
      .then((res: any) => {
        if (Array.isArray(res?.data)) setApiCategories(res.data);
        else {
          setApiCategories([]);
          setCatError("Failed to load categories");
        }
      })
      .catch((error) => {
        console.error("Error loading categories:", error);
        setApiCategories([]);
        setCatError(
          "Failed to load categories. Please check your connection and try refreshing."
        );
      })
      .finally(() => setCatLoading(false));

    setPlanLoading(true);
    getPlans({})
      .then((res: any) => {
        if (Array.isArray(res?.data)) {
          const freePlan = res.data.find(
            (plan: SubscriptionPlan) => plan.name === "Free Plan"
          );
          if (freePlan) {
            setSubscriptionPlans([freePlan]);
            setFormData((prev) => ({ ...prev, subscriptionId: freePlan._id }));
          } else {
            setSubscriptionPlans([]);
            setPlanError("Free Plan not available");
          }
        } else {
          setSubscriptionPlans([]);
          setPlanError("Failed to load subscription plans");
        }
      })
      .catch((error) => {
        console.error("Error loading plans:", error);
        setSubscriptionPlans([]);
        setPlanError(
          "Failed to load subscription plans. Please check your connection and try refreshing."
        );
      })
      .finally(() => setPlanLoading(false));
  }, []);

  // Load pincodes
  useEffect(() => {
    getAllPincodes()
      .then((res: any) => {
        if (Array.isArray(res?.data)) setPincodeData(res.data);
      })
      .catch((error) => {
        console.error("Error loading pincodes:", error);
      });
  }, []);

  // When pincode changes
  useEffect(() => {
    if (selectedPincode) {
      const found = pincodeData.find((p) => p.code === selectedPincode);
      if (found && found.areas) setAreaOptions(found.areas);
      else setAreaOptions([]);
      setSubAreaOptions([]);
      setFormData((prev) => ({ ...prev, areaName: "", subAreaName: "" }));
      if (found) {
        setFormData((prev) => ({
          ...prev,
          city: found.city || "",
          state: found.state || "",
        }));
      }
    }
  }, [selectedPincode, pincodeData]);

  // When areaName changes
  useEffect(() => {
    if (formData.areaName) {
      const selectedArea = areaOptions.find(
        (a) => a.name === formData.areaName
      );
      if (selectedArea && selectedArea.subAreas)
        setSubAreaOptions(selectedArea.subAreas);
      else setSubAreaOptions([]);
      setFormData((prev) => ({ ...prev, subAreaName: "" }));
    }
  }, [formData.areaName, areaOptions]);

  const MAX_FILE_SIZE_MB = 3;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const validateFile = useCallback(
    (file: File, fieldName: string): string | null => {
      const allowedExtensions = ["jpg", "jpeg", "png", "svg"];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!allowedExtensions.includes(ext || "")) {
        return `${fieldName} must be JPG, JPEG, PNG, or SVG only`;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return `${fieldName} must not exceed ${MAX_FILE_SIZE_MB} MB`;
      }
      return null;
    },
    []
  );

  const handleFileChange = useCallback(
    (name: keyof FormData, file: File | null) => {
      const oldUrl = previews[name as string];
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
      }

      if (!file) {
        setPreviews((prev) => {
          const newPrev = { ...prev };
          delete newPrev[name as string];
          return newPrev;
        });
        setFormData((prev) => ({ ...prev, [name]: null }));
        setErrors((prev) => {
          const newErr = { ...prev };
          delete newErr[name];
          return newErr;
        });
        return;
      }

      const label = fieldLabels[name as keyof typeof fieldLabels] || name;
      const error = validateFile(file, label as string);
      if (error) {
        setFormData((prev) => ({ ...prev, [name]: null }));
        setPreviews((prev) => {
          const newPrev = { ...prev };
          delete newPrev[name as string];
          return newPrev;
        });
        setErrors((prev) => ({ ...prev, [name]: error }));
        return;
      }

      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });

      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [name as string]: url }));
      setFormData((prev) => ({ ...prev, [name]: file }));
    },
    [previews, validateFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name } = e.target;
      let value: string = (e.target as HTMLInputElement).value;
      if (name === "name") value = sanitizeName(value);
      if (
        name === "mobile" ||
        name === "authorizedPhone1" ||
        name === "authorizedPhone2"
      )
        value = sanitizePhone(value);
      if (name === "password") value = sanitizePassword(value);
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "pincode") setSelectedPincode(value);
    },
    []
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const input = e.target as HTMLInputElement;
      const name = input.name as keyof FormData;
      const pasted = e.clipboardData.getData("text");
      let clean = pasted;
      if (name === "name") clean = sanitizeName(pasted);
      if (
        name === "mobile" ||
        name === "authorizedPhone1" ||
        name === "authorizedPhone2"
      )
        clean = sanitizePhone(pasted);
      if (name === "password") clean = sanitizePassword(pasted);
      e.preventDefault();
      setFormData((prev) => ({ ...prev, [name]: clean }));
    },
    []
  );

  const validateCurrentStep = useCallback((): FormErrors => {
    const f = formData;
    const e: FormErrors = {};
    switch (currentStep) {
      case 1:
        if (!f.name.trim() || !NAME_REGEX.test(f.name.trim()))
          e.name = "Only alphabets allowed";
        if (!PHONE_REGEX.test(f.mobile)) e.mobile = "Enter 10-digit number";
        if (!PASS_REGEX.test(f.password))
          e.password = "6–10 chars: A–Z, 0–9, @ _ #";
        break;
      case 2:
        if (!f.buildingName.trim())
          e.buildingName = "Building name is required";
        if (!f.pincode) e.pincode = "Pincode is required";
        if (!f.areaName) e.areaName = "Area is required";
        if (!f.city) e.city = "City is required";
        if (!f.state) e.state = "State is required";
        break;
      case 3:
        if (!f.category) e.category = "Service category is required";
        if (!f.subscriptionId)
          e.subscriptionId = "Subscription plan is required";
        break;
      case 4:
        if (!f.profileImage)
          e.profileImage = `${fieldLabels.profileImage} is required`;
        if (!f.aadharFront)
          e.aadharFront = `${fieldLabels.aadharFront} image is required`;
        if (!f.aadharBack)
          e.aadharBack = `${fieldLabels.aadharBack} image is required`;
        if (!f.panCard && !f.voterCard) e.panCard = "Provide Pan or Voter card";
        if (!PHONE_REGEX.test(f.authorizedPhone1))
          e.authorizedPhone1 = "Enter 10-digit number";
        if (!f.auth1Photo)
          e.auth1Photo = `${fieldLabels.auth1Photo} is required`;
        if (!PHONE_REGEX.test(f.authorizedPhone2))
          e.authorizedPhone2 = "Enter 10-digit number";
        if (!f.auth2Photo)
          e.auth2Photo = `${fieldLabels.auth2Photo} is required`;
        if (!agreedToTerms)
          e.terms = "You must agree to the Terms & Conditions";
        break;
    }
    return e;
  }, [formData, currentStep, agreedToTerms]);

  const validateForm = useCallback((): FormErrors => {
    const f = formData;
    const e: FormErrors = {};
    if (!f.name.trim() || !NAME_REGEX.test(f.name.trim()))
      e.name = "Only alphabets allowed";
    if (!PHONE_REGEX.test(f.mobile)) e.mobile = "Enter 10-digit number";
    if (!PASS_REGEX.test(f.password))
      e.password = "6–10 chars: A–Z, 0–9, @ _ #";
    if (!f.buildingName.trim()) e.buildingName = "Building name is required";
    if (!f.pincode) e.pincode = "Pincode is required";
    if (!f.areaName) e.areaName = "Area is required";
    if (!f.city) e.city = "City is required";
    if (!f.state) e.state = "State is required";
    if (!f.category) e.category = "Service category is required";
    if (!f.subscriptionId) e.subscriptionId = "Subscription plan is required";
    if (!f.profileImage)
      e.profileImage = `${fieldLabels.profileImage} is required`;
    if (!f.aadharFront)
      e.aadharFront = `${fieldLabels.aadharFront} image is required`;
    if (!f.aadharBack)
      e.aadharBack = `${fieldLabels.aadharBack} image is required`;
    if (!f.panCard && !f.voterCard) e.panCard = "Provide Pan or Voter card";
    if (!PHONE_REGEX.test(f.authorizedPhone1))
      e.authorizedPhone1 = "Enter 10-digit number";
    if (!f.auth1Photo) e.auth1Photo = `${fieldLabels.auth1Photo} is required`;
    if (!PHONE_REGEX.test(f.authorizedPhone2))
      e.authorizedPhone2 = "Enter 10-digit number";
    if (!f.auth2Photo) e.auth2Photo = `${fieldLabels.auth2Photo} is required`;
    if (!agreedToTerms) e.terms = "You must agree to the Terms & Conditions";
    return e;
  }, [formData, agreedToTerms]);

  const scrollToFirstError = useCallback((err: FormErrors) => {
    const firstKey = fieldOrderTech.find((k) => err[k]);
    if (!firstKey) return;
    const el = document.getElementById(firstKey);
    if (el && el.scrollIntoView)
      el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const nextStep = useCallback(() => {
    const stepErrors = validateCurrentStep();
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep((prev) => prev + 1);
    } else {
      scrollToFirstError(stepErrors);
    }
  }, [validateCurrentStep, scrollToFirstError]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formErrors = validateForm();
      setErrors(formErrors);
      if (Object.keys(formErrors).length > 0) {
        scrollToFirstError(formErrors);
        return;
      }

      // 🔴 NEW: Get franchiseId from localStorage and send in payload
      const franchiseId = localStorage.getItem("userId");
      if (!franchiseId) {
        setErrors((prev) => ({
          ...prev,
          general: "Franchise ID not found. Please log in again.",
        }));
        scrollToFirstError({ general: "Franchise ID not found" });
        return;
      }

      setLoading(true);
      setErrors((prev) => ({ ...prev, general: "" }));

      try {
        const fd = new FormData();
        fd.append("username", formData.name.trim());
        fd.append("phoneNumber", formData.mobile);
        fd.append("password", formData.password);
        fd.append("buildingName", formData.buildingName.trim());
        fd.append("areaName", formData.areaName);
        fd.append("subAreaName", formData.subAreaName || "-");
        fd.append("city", formData.city);
        fd.append("state", formData.state);
        fd.append("pincode", formData.pincode);
        fd.append("category", formData.category);
        fd.append("subscriptionId", formData.subscriptionId);

        // 👇 IMPORTANT: append franchiseId in payload
        fd.append("franchiseId", franchiseId);

        if (formData.profileImage)
          fd.append("profileImage", formData.profileImage);
        if (formData.aadharFront)
          fd.append("aadharFront", formData.aadharFront);
        if (formData.aadharBack) fd.append("aadharBack", formData.aadharBack);
        if (formData.panCard) fd.append("panCard", formData.panCard);
        if (formData.voterCard) fd.append("voterCard", formData.voterCard);

        fd.append("authorizedPersons[0][phone]", formData.authorizedPhone1);
        if (formData.auth1Photo) fd.append("auth1Photo", formData.auth1Photo);
        fd.append("authorizedPersons[1][phone]", formData.authorizedPhone2);
        if (formData.auth2Photo) fd.append("auth2Photo", formData.auth2Photo);

        const response = (await registerTechByFranchise(fd)) as RegistrationResponse;

        if (response?.success) {
          alert(
            "Technician registered successfully. Once the account is verified, they will receive access to log in."
          );
          navigate("/login/technician");
        } else {
          throw new Error(response?.message || "Registration failed");
        }
      } catch (err: any) {
        console.error("Registration error:", err);
        const errorMessage =
          err?.response?.data?.error?.[0] ||
          err?.message ||
          "Registration failed. Please check your inputs and try again.";
        setErrors((prev) => ({
          ...prev,
          general: errorMessage,
        }));
        scrollToFirstError({ general: "Registration failed" });
      } finally {
        setLoading(false);
      }
    },
    [formData, navigate, validateForm, scrollToFirstError]
  );

  const nameInputProps = {
    pattern: "[A-Za-z ]+",
    maxLength: 60,
    onKeyDown: allowNameKey,
    onPaste: handlePaste,
    placeholder: "Enter name",
  };
  const phoneInputProps = {
    inputMode: "numeric" as const,
    pattern: "[0-9]{10}",
    maxLength: 10,
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
      allowDigitKey(e, 10),
    onPaste: handlePaste,
    placeholder: "Enter 10-digit number",
  };
  const passwordInputProps = {
    pattern: "[A-Za-z0-9@_#]{6,10}",
    minLength: 6,
    maxLength: 10,
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
      allowPasswordKey(e, 10),
    onPaste: handlePaste,
    placeholder: "6–10 (A–Z, 0–9, @ _ #)",
  };

  const TermsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    if (!showTermsModal) return null;
    return createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80%",
            overflow: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              border: "none",
              background: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            ×
          </button>
          <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
            Terms & Conditions
          </h2>
          <TermsConditions />
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const renderFileInput = (
    name: keyof FormData,
    label: string,
    required = true
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(name, e.target.files?.[0] || null)}
        className="mt-1 w-full border border-gray-300 rounded-md p-2"
      />
      {previews[name as string] && (
        <img
          src={previews[name as string]}
          alt={label}
          className="mt-2 w-32 h-32 object-cover rounded border"
        />
      )}
      {formData[name] && !previews[name as string] && (
        <p className="text-sm text-gray-600 mt-1">
          Selected: {(formData[name] as any)?.name}
        </p>
      )}
      {errors[name] && (
        <div className="text-red-500 text-xs mt-1" id={`${name}-error`}>
          {errors[name]}
        </div>
      )}
    </div>
  );

  return (
    <>
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center capitalize">
            Add Technician By Franchise
          </h2>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-4 text-center">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errors.general && (
              <div
                id="general"
                className="text-red-600 text-sm text-center bg-red-50 p-2 rounded"
              >
                {errors.general}
              </div>
            )}

            {/* STEP 1 */}
            {currentStep === 1 && (
              <>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    {...nameInputProps}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  />
                  {errors.name && (
                    <div className="text-red-500 text-xs mt-1" id="name-error">
                      {errors.name}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    {...phoneInputProps}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  />
                  {errors.mobile && (
                    <div
                      className="text-red-500 text-xs mt-1"
                      id="mobile-error"
                    >
                      {errors.mobile}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      {...passwordInputProps}
                      className="mt-1 w-full border border-gray-300 rounded-md p-2 pr-10"
                    />
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {errors.password && (
                    <div
                      className="text-red-500 text-xs mt-1"
                      id="password-error"
                    >
                      {errors.password}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <>
                <div>
                  <label
                    htmlFor="buildingName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    House/Building Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="buildingName"
                    name="buildingName"
                    type="text"
                    value={formData.buildingName}
                    onChange={handleChange}
                    placeholder="Enter building name"
                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  />
                  {errors.buildingName && (
                    <div
                      className="text-red-500 text-xs mt-1"
                      id="buildingName-error"
                    >
                      {errors.buildingName}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="pincode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select pincode</option>
                    {pincodeData
                      .sort((a: any, b: any) => Number(a.code) - Number(b.code))
                      .map((p) => (
                        <option key={p._id} value={p.code}>
                          {p.code}
                        </option>
                      ))}
                  </select>
                  {errors.pincode && (
                    <div
                      className="text-red-500 text-xs mt-1"
                      id="pincode-error"
                    >
                      {errors.pincode}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="areaName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="areaName"
                    name="areaName"
                    value={formData.areaName}
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select area</option>
                    {areaOptions.map((a) => (
                      <option key={a._id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  {errors.areaName && (
                    <div
                      className="text-red-500 text-xs mt-1"
                      id="areaName-error"
                    >
                      {errors.areaName}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="subAreaName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sub Area
                  </label>
                  <select
                    id="subAreaName"
                    name="subAreaName"
                    value={formData.subAreaName}
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select sub area</option>
                    {subAreaOptions
                      .sort((a, b) =>
                        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                      )
                      .map((a) => (
                        <option key={a._id} value={a.name}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                  {errors.subAreaName && (
                    <div
                      className="text-red-500 text-xs mt-1"
                      id="subAreaName-error"
                    >
                      {errors.subAreaName}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    readOnly
                    placeholder="Auto-filled"
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                  />
                  {errors.city && (
                    <div className="text-red-500 text-xs mt-1" id="city-error">
                      {errors.city}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    readOnly
                    placeholder="Auto-filled"
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                  />
                  {errors.state && (
                    <div className="text-red-500 text-xs mt-1" id="state-error">
                      {errors.state}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <>
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Service Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={catLoading}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="" disabled>
                      {catLoading
                        ? "Loading categories..."
                        : "Select a category"}
                    </option>
                    {apiCategories
                      .sort((a, b) =>
                        a.category_name
                          .toLowerCase()
                          .localeCompare(b.category_name.toLowerCase())
                      )
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.category_name}
                        </option>
                      ))}
                  </select>
                  {catError && (
                    <div className="text-red-500 text-xs mt-1">{catError}</div>
                  )}
                  {errors.category && (
                    <div
                      className="text-red-500 text-xs mt-1"
                      id="category-error"
                    >
                      {errors.category}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="subscriptionId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Subscription Plan <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subscriptionId"
                    name="subscriptionId"
                    value={formData.subscriptionId}
                    onChange={handleChange}
                    disabled={planLoading || subscriptionPlans.length === 0}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="" disabled>
                      {planLoading
                        ? "Loading plans..."
                        : subscriptionPlans.length === 0
                        ? "No plans available"
                        : "Select a plan"}
                    </option>
                    {subscriptionPlans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                  {planError && (
                    <div className="text-red-500 text-xs mt-1">{planError}</div>
                  )}
                  {errors.subscriptionId && (
                    <div
                      className="text-red-500 text-xs mt-1"
                      id="subscriptionId-error"
                    >
                      {errors.subscriptionId}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <>
                {renderFileInput(
                  "profileImage",
                  fieldLabels.profileImage,
                  true
                )}
                {renderFileInput("aadharFront", fieldLabels.aadharFront, true)}
                {renderFileInput("aadharBack", fieldLabels.aadharBack, true)}
                {renderFileInput("panCard", fieldLabels.panCard, false)}
                {renderFileInput("voterCard", fieldLabels.voterCard, false)}

                <div>
                  <label
                    htmlFor="authorizedPhone1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Authorized Person 1 Phone{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="authorizedPhone1"
                    name="authorizedPhone1"
                    type="tel"
                    value={formData.authorizedPhone1}
                    onChange={handleChange}
                    {...phoneInputProps}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                    placeholder="Enter 10-digit number"
                  />
                  {errors.authorizedPhone1 && (
                    <div
                      className="text-red-500 text-xs mt-1"
                      id="authorizedPhone1-error"
                    >
                      {errors.authorizedPhone1}
                    </div>
                  )}
                </div>

                {renderFileInput("auth1Photo", fieldLabels.auth1Photo, true)}

                <div>
                  <label
                    htmlFor="authorizedPhone2"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Authorized Person 2 Phone{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="authorizedPhone2"
                    name="authorizedPhone2"
                    type="tel"
                    value={formData.authorizedPhone2}
                    onChange={handleChange}
                    {...phoneInputProps}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2"
                    placeholder="Enter 10-digit number"
                  />
                  {errors.authorizedPhone2 && (
                    <div
                      className="text-red-500 text-xs mt-1"
                      id="authorizedPhone2-error"
                    >
                      {errors.authorizedPhone2}
                    </div>
                  )}
                </div>

                {renderFileInput("auth2Photo", fieldLabels.auth2Photo, true)}

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Terms & Conditions
                      </button>
                      <span className="text-red-600">*</span>
                    </span>
                  </label>
                  {errors.terms && (
                    <div className="text-red-500 text-xs mt-1" id="terms-error">
                      {errors.terms}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="pt-4 flex space-x-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="flex-1 bg-gray-500 text-white font-semibold py-2 px-1 rounded-md hover:bg-gray-600 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
              )}
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Registering..." : "Register Technician"}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <TermsModal onClose={() => setShowTermsModal(false)} />
    </>
  );
};

export default AddTechnicianSteps;

// import React, { useState, useCallback, useEffect } from 'react';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { getAllCategories, getAllPincodes, getPlans } from '../../api/apiMethods';
// import { useNavigate } from 'react-router-dom';

// interface TechnicianData {
//   username: string;
//   franchiseId: string;
//   category: string;
//   phoneNumber: string;
//   password: string;
//   buildingName: string;
//   areaName: string;
//   city: string;
//   state: string;
//   pincode: string;
//   subscriptionId: string;
// }

// interface PincodeData {
//   _id: string;
//   code: string;
//   city: string;
//   state: string;
//   areas: { _id: string; name: string }[];
// }

// interface SubscriptionPlan {
//   _id: string;
//   name: string;
//   price: number;
//   finalPrice: number;
//   gst: number;
// }

// const initialFormState: TechnicianData = {
//   username: '',
//   franchiseId: '',
//   category: '',
//   phoneNumber: '',
//   password: '',
//   buildingName: '',
//   areaName: '',
//   city: '',
//   state: '',
//   pincode: '',
//   subscriptionId: '',
// };

// const AddTechnician: React.FC = () => {
//   const [formData, setFormData] = useState<TechnicianData>(initialFormState);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [apiCategories, setApiCategories] = useState<{ _id: string; category_name: string; status: number }[]>([]);
//   const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
//   const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
//   const [selectedPincode, setSelectedPincode] = useState<string>('');
//   const [areaOptions, setAreaOptions] = useState<{ _id: string; name: string }[]>([]);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     getAllPincodes()
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setPincodeData(res.data);
//         }
//       })
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//     getAllCategories(null)
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setApiCategories(res.data);
//         } else {
//           setApiCategories([]);
//           setError('Failed to load categories');
//         }
//       })
//       .catch(() => {
//         setApiCategories([]);
//         setError('Failed to load categories');
//       });
//   }, []);

//   useEffect(() => {
//     getPlans()
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setSubscriptionPlans(res.data);
//         } else {
//           setSubscriptionPlans([]);
//           setError('Failed to load subscription plans');
//         }
//       })
//       .catch(() => {
//         setSubscriptionPlans([]);
//         setError('Failed to load subscription plans');
//       });
//   }, []);

//   useEffect(() => {
//     if (selectedPincode) {
//       const found = pincodeData.find((p) => p.code === selectedPincode);
//       if (found && found.areas) {
//         setAreaOptions(found.areas);
//         setFormData((prev) => ({
//           ...prev,
//           city: found.city,
//           state: found.state,
//         }));
//       } else {
//         setAreaOptions([]);
//         setFormData((prev) => ({
//           ...prev,
//           city: '',
//           state: '',
//           areaName: '',
//         }));
//       }
//     } else {
//       setAreaOptions([]);
//       setFormData((prev) => ({
//         ...prev,
//         city: '',
//         state: '',
//         areaName: '',
//       }));
//     }
//   }, [selectedPincode, pincodeData]);

//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//       const { name, value } = e.target;
//       setFormData((prev) => ({ ...prev, [name]: value }));
//       if (name === 'pincode') {
//         setSelectedPincode(value);
//       }
//     },
//     []
//   );

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();
//       setError(null);
//       setLoading(true);

//       try {
//         const franchiseId = localStorage.getItem('userId');
//         if (!franchiseId) {
//           setError('Franchise ID not found. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         if (!formData.username) {
//           setError('Technician name is required');
//           setLoading(false);
//           return;
//         }

//         if (!formData.pincode || formData.pincode.length !== 6) {
//           setError('Pincode must be exactly 6 digits');
//           setLoading(false);
//           return;
//         }

//         if (!/^\d{10}$/.test(formData.phoneNumber)) {
//           setError('Phone number must be exactly 10 digits');
//           setLoading(false);
//           return;
//         }

//         if (!formData.subscriptionId) {
//           setError('Please select a subscription plan');
//           setLoading(false);
//           return;
//         }

//         const selectedPlan = subscriptionPlans.find((plan) => plan._id === formData.subscriptionId);
//         if (!selectedPlan) {
//           setError('Selected subscription plan is invalid');
//           setLoading(false);
//           return;
//         }

//         console.log('Form Data:', formData);

//         navigate('/buyPlan', {
//           state: {
//             plan: selectedPlan,
//             technicianData: { ...formData, franchiseId },
//           },
//         });
//       } catch (err: any) {
//         setError(err?.data?.error?.[0] || err?.message || 'Failed to proceed. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     },
//     [formData, subscriptionPlans, navigate]
//   );

//   return (
//     <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br rounded-xl shadow-2xl">
//       <h2 className="text-3xl font-extrabold text-indigo-900 mb-8 text-center">Add New Technician</h2>
//       {error && (
//         <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg mb-6 animate-pulse">{error}</div>
//       )}
//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {[
//             { id: 'username', label: 'Technician Name', required: true, type: 'text', placeholder: 'Enter technician name' },
//             { id: 'category', label: 'Category', required: true, type: 'select' },
//             { id: 'phoneNumber', label: 'Phone Number', required: true, type: 'tel', pattern: '[0-9]{10}', placeholder: 'Enter 10-digit phone number' },
//             { id: 'password', label: 'Password', required: true, type: 'password', minLength: 6, maxLength: 10, placeholder: '6-10 characters' },
//             { id: 'buildingName', label: 'Building Name', required: true, type: 'text', placeholder: 'Enter building name' },
//             { id: 'pincode', label: 'Pincode', required: true, type: 'select' },
//             { id: 'areaName', label: 'Area', required: true, type: 'select' },
//             { id: 'city', label: 'City', required: true, type: 'select' },
//             { id: 'state', label: 'State', required: true, type: 'select' },
//             { id: 'subscriptionId', label: 'Subscription Plan', required: true, type: 'select' },
//           ].map(({ id, label, type, pattern, minLength, maxLength, placeholder }) => (
//             <div key={id} className="relative group">
//               <label htmlFor={id} className="block text-sm font-medium text-indigo-700 mb-1">
//                 {label} <span className="text-red-500">*</span>
//               </label>
//               {id === 'username' ? (
//                 <input
//                   id={id}
//                   name={id}
//                   type={type}
//                   placeholder={placeholder}
//                   required
//                   value={formData.username}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//                 />
//               ) : id === 'category' ? (
//                 <select
//                   id="category"
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   required
//                   className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//                 >
//                   <option value="" disabled>Select a category</option>
//                   {apiCategories
//                     .filter((category) => category?.status === 1)
//                     .sort((a, b) => a.category_name.toLowerCase().localeCompare(b.category_name.toLowerCase()))
//                     .map((item) => (
//                       <option key={item._id} value={item._id}>
//                         {item.category_name}
//                       </option>
//                     ))}
//                 </select>
//               ) : id === 'password' ? (
//                 <div className="relative">
//                   <input
//                     id={id}
//                     name={id}
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder={placeholder}
//                     required
//                     value={formData[id as keyof TechnicianData]}
//                     onChange={handleChange}
//                     minLength={minLength}
//                     maxLength={maxLength}
//                     className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white pr-10"
//                   />
//                   <span
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-indigo-500 hover:text-amber-500 transition"
//                     onClick={() => setShowPassword((prev) => !prev)}
//                   >
//                     {showPassword ? <FaEyeSlash /> : <FaEye />}
//                   </span>
//                 </div>
//               ) : id === 'pincode' ? (
//                 <select
//                   id="pincode"
//                   name="pincode"
//                   value={formData.pincode}
//                   onChange={handleChange}
//                   required
//                   className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//                 >
//                   <option value="" disabled>Select Pincode</option>
//                   {pincodeData
//                   .sort((a, b) => Number(a.code) - Number(b.code))
//                   .map((p) => (
//                     <option key={p._id} value={p.code}>
//                       {p.code}
//                     </option>
//                   ))}
//                 </select>
//               ) : id === 'areaName' ? (
//                 <select
//                   id="areaName"
//                   name="areaName"
//                   value={formData.areaName}
//                   onChange={handleChange}
//                   required
//                   disabled={!selectedPincode}
//                   className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//                 >
//                   <option value="" disabled>Select Area</option>
//                   {areaOptions.map((a) => (
//                     <option key={a._id} value={a.name}>
//                       {a.name}
//                     </option>
//                   ))}
//                 </select>
//               ) : id === 'city' ? (
//                 <select
//                   id="city"
//                   name="city"
//                   value={formData.city}
//                   onChange={handleChange}
//                   required
//                   disabled={!selectedPincode}
//                   className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//                 >
//                   <option value="" disabled>Select City</option>
//                   {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                     <option value={pincodeData.find((p) => p.code === selectedPincode)?.city}>
//                       {pincodeData.find((p) => p.code === selectedPincode)?.city}
//                     </option>
//                   )}
// me
//                 </select>
//               ) : id === 'state' ? (
//                 <select
//                   id="state"
//                   name="state"
//                   value={formData.state}
//                   onChange={handleChange}
//                   required
//                   disabled={!selectedPincode}
//                   className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//                 >
//                   <option value="" disabled>Select State</option>
//                   {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                     <option value={pincodeData.find((p) => p.code === selectedPincode)?.state}>
//                       {pincodeData.find((p) => p.code === selectedPincode)?.state}
//                     </option>
//                   )}
//                 </select>
//               ) : id === 'subscriptionId' ? (
//                 <select
//                   id="subscriptionId"
//                   name="subscriptionId"
//                   value={formData.subscriptionId}
//                   onChange={handleChange}
//                   required
//                   className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//                 >
//                   <option value="" disabled>Select Subscription Plan</option>
//                   {subscriptionPlans
//                     .filter((plan) => ['Free Plan'].includes(plan.name))
//                     .map((plan) => (
//                       <option key={plan._id} value={plan._id}>
//                         {plan.name} - ₹{plan.finalPrice} ({plan.price} + {plan.gst} GST)
//                       </option>
//                     ))}
//                 </select>
//               ) : (
//                 <input
//                   id={id}
//                   name={id}
//                   type={type}
//                   placeholder={placeholder}
//                   required
//                   value={formData[id as keyof TechnicianData]}
//                   onChange={handleChange}
//                   pattern={pattern}
//                   className="mt-1 block w-full px-4 py-3 border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//         <button
//           type="submit"
//           disabled={loading}
//           className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105"
//         >
//           {loading ? (
//             <div className="flex items-center justify-center">
//               <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
//               </svg>
//               Processing...
//             </div>
//           ) : (
//             'Proceed to Payment'
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddTechnician;
// import React, { useState, useCallback, useEffect } from 'react';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { getAllCategories, getAllPincodes, getPlans } from '../../api/apiMethods';
// import { useNavigate } from 'react-router-dom';

// interface TechnicianData {
//   username: string;
//   franchiseId: string;
//   category: string;
//   phoneNumber: string;
//   password: string;
//   buildingName: string;
//   areaName: string;
//   city: string;
//   state: string;
//   pincode: string;
//   subscriptionId: string;
// }

// interface PincodeData {
//   _id: string;
//   code: string;
//   city: string;
//   state: string;
//   areas: { _id: string; name: string }[];
// }

// interface SubscriptionPlan {
//   _id: string;
//   name: string;
//   price: number;
//   finalPrice: number;
//   gst: number;
// }

// const initialFormState: TechnicianData = {
//   username: '',
//   franchiseId: '',
//   category: '',
//   phoneNumber: '',
//   password: '',
//   buildingName: '',
//   areaName: '',
//   city: '',
//   state: '',
//   pincode: '',
//   subscriptionId: '',
// };

// const AddTechnician: React.FC = () => {
//   const [formData, setFormData] = useState<TechnicianData>(initialFormState);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [apiCategories, setApiCategories] = useState<{ _id: string; category_name: string; status: number }[]>([]);
//   const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
//   const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
//   const [selectedPincode, setSelectedPincode] = useState<string>('');
//   const [areaOptions, setAreaOptions] = useState<{ _id: string; name: string }[]>([]);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     getAllPincodes()
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setPincodeData(res.data);
//         }
//       })
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//     getAllCategories(null)
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setApiCategories(res.data);
//         } else {
//           setApiCategories([]);
//           setError('Failed to load categories');
//         }
//       })
//       .catch(() => {
//         setApiCategories([]);
//         setError('Failed to load categories');
//       });
//   }, []);

//   useEffect(() => {
//     getPlans()
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setSubscriptionPlans(res.data);
//         } else {
//           setSubscriptionPlans([]);
//           setError('Failed to load subscription plans');
//         }
//       })
//       .catch(() => {
//         setSubscriptionPlans([]);
//         setError('Failed to load subscription plans');
//       });
//   }, []);

//   useEffect(() => {
//     if (selectedPincode) {
//       const found = pincodeData.find((p) => p.code === selectedPincode);
//       if (found && found.areas) {
//         setAreaOptions(found.areas);
//         setFormData((prev) => ({
//           ...prev,
//           city: found.city,
//           state: found.state,
//         }));
//       } else {
//         setAreaOptions([]);
//         setFormData((prev) => ({
//           ...prev,
//           city: '',
//           state: '',
//           areaName: '',
//         }));
//       }
//     } else {
//       setAreaOptions([]);
//       setFormData((prev) => ({
//         ...prev,
//         city: '',
//         state: '',
//         areaName: '',
//       }));
//     }
//   }, [selectedPincode, pincodeData]);

//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//       const { name, value } = e.target;
//       setFormData((prev) => ({ ...prev, [name]: value }));
//       if (name === 'pincode') {
//         setSelectedPincode(value);
//       }
//     },
//     []
//   );

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();
//       setError(null);
//       setLoading(true);

//       try {
//         const franchiseId = localStorage.getItem('userId');
//         if (!franchiseId) {
//           setError('Franchise ID not found. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         if (!formData.pincode || formData.pincode.length !== 6) {
//           setError('Pincode must be exactly 6 digits');
//           setLoading(false);
//           return;
//         }

//         if (!/^\d{10}$/.test(formData.phoneNumber)) {
//           setError('Phone number must be exactly 10 digits');
//           setLoading(false);
//           return;
//         }

//         if (!formData.subscriptionId) {
//           setError('Please select a subscription plan');
//           setLoading(false);
//           return;
//         }

//         const selectedPlan = subscriptionPlans.find((plan) => plan._id === formData.subscriptionId);
//         if (!selectedPlan) {
//           setError('Selected subscription plan is invalid');
//           setLoading(false);
//           return;
//         }

//         console.log('Form Data:', formData);

//         // Navigate to /buyPlan with plan and technician data
//         navigate('/buyPlan', {
//           state: {
//             plan: selectedPlan,
//             technicianData: { ...formData, franchiseId },
//           },
//         });
//       } catch (err: any) {
//         setError(err?.data?.error?.[0] || err?.message || 'Failed to proceed. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     },
//     [formData, subscriptionPlans, navigate]
//   );

//   return (
//     <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br rounded-xl shadow-2xl">
//       <h2 className="text-3xl font-extrabold text-indigo-900 mb-8 text-center">Add New Technician</h2>
//       {error && (
//         <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg mb-6 animate-pulse">{error}</div>
//       )}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {[
//           { id: 'technicianName', label: 'Technician Name', required: true, type: 'text', placeholder: 'Enter technician name' },
//           { id: 'category', label: 'Category', required: true, type: 'select' },
//           { id: 'phoneNumber', label: 'Phone Number', required: true, type: 'tel', pattern: '[0-9]{10}', placeholder: 'Enter 10-digit phone number' },
//           { id: 'password', label: 'Password', required: true, type: 'password', minLength: 6, maxLength: 10, placeholder: '6-10 characters' },
//           { id: 'buildingName', label: 'Building Name', required: true, type: 'text', placeholder: 'Enter building name' },
//           { id: 'pincode', label: 'Pincode', required: true, type: 'select' },
//           { id: 'areaName', label: 'Area', required: true, type: 'select' },
//           { id: 'city', label: 'City', required: true, type: 'select' },
//           { id: 'state', label: 'State', required: true, type: 'select' },
//           { id: 'subscriptionId', label: 'Subscription Plan', required: true, type: 'select' },
//         ].map(({ id, label, type, pattern, minLength, maxLength, placeholder }) => (
//           <div key={id} className="relative group">
//             <label htmlFor={id} className="block text-sm font-medium text-indigo-700 mb-1" >
//               {label} <span className="text-red-500">*</span>
//             </label>
//             {id === 'username' ? (
//               <input
//                 id={id}
//                 name={id}
//                 type={type}
//                 placeholder={placeholder}
//                 required
//                 value={formData[id as keyof TechnicianData]}
//                 onChange={handleChange}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               />
//             ) : id === 'category' ? (
//               <select
//                 id="category"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select a category</option>
//                 {apiCategories
//                   .filter((category) => category?.status === 1)
//                   .map((item) => (
//                     <option key={item._id} value={item._id}>
//                       {item.category_name}
//                     </option>
//                   ))}
//               </select>
//             ) : id === 'password' ? (
//               <div className="relative">
//                 <input
//                   id={id}
//                   name={id}
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder={placeholder}
//                   required
//                   value={formData[id as keyof TechnicianData]}
//                   onChange={handleChange}
//                   minLength={minLength}
//                   maxLength={maxLength}
//                   className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white pr-10"
//                 />
//                 <span
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-indigo-500 hover:text-amber-500 transition"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </span>
//               </div>
//             ) : id === 'pincode' ? (
//               <select
//                 id="pincode"
//                 name="pincode"
//                 value={formData.pincode}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select Pincode</option>
//                 {pincodeData.map((p) => (
//                   <option key={p._id} value={p.code}>
//                     {p.code}
//                   </option>
//                 ))}
//               </select>
//             ) : id === 'areaName' ? (
//               <select
//                 id="areaName"
//                 name="areaName"
//                 value={formData.areaName}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select Area</option>
//                 {areaOptions.map((a) => (
//                   <option key={a._id} value={a.name}>
//                     {a.name}
//                   </option>
//                 ))}
//               </select>
//             ) : id === 'city' ? (
//               <select
//                 id="city"
//                 name="city"
//                 value={formData.city}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select City</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.city}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.city}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'state' ? (
//               <select
//                 id="state"
//                 name="state"
//                 value={formData.state}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select State</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.state}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.state}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'subscriptionId' ? (
//               <select
//                 id="subscriptionId"
//                 name="subscriptionId"
//                 value={formData.subscriptionId}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select Subscription Plan</option>
//                 {subscriptionPlans
//                   .filter((plan) => plan.name !== 'Free Plan')
//                   .map((plan) => (
//                     <option key={plan._id} value={plan._id}>
//                       {plan.name} - ₹{plan.finalPrice} ({plan.price} + {plan.gst} GST)
//                     </option>
//                   ))}
//               </select>
//             ) : (
//               <input
//                 id={id}
//                 name={id}
//                 type={type}
//                 placeholder={placeholder}
//                 required
//                 value={formData[id as keyof TechnicianData]}
//                 onChange={handleChange}
//                 pattern={pattern}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               />
//             )}
//           </div>
//         ))}
//       </div>
//       <button
//         type="submit"
//         onClick={handleSubmit}
//         disabled={loading}
//         className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105"
//       >
//         {loading ? (
//           <div className="flex items-center justify-center">
//             <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="e2c7a15-0674-40e6-a58b-9147c820d290" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
//             </svg>
//             Processing...
//           </div>
//         ) : (
//           'Proceed to Payment'
//         )}
//       </button>
//     </div>
//   );
// };

// export default AddTechnician;
// import React, { useState, useCallback, useEffect } from 'react';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { getAllCategories, getAllPincodes, registerTechByFranchise, getPlans } from '../../api/apiMethods';
// import { useNavigate } from 'react-router-dom';

// // Interfaces for type safety
// interface TechnicianData {
//   username: string;
//   franchiseId: string;
//   category: string;
//   phoneNumber: string;
//   password: string;
//   buildingName: string;
//   areaName: string;
//   city: string;
//   state: string;
//   pincode: string;
//   subscriptionId: string;
// }

// interface ApiCategory {
//   _id: string;
//   category_name: string;
//   status: number;
// }

// interface PincodeData {
//   _id: string;
//   code: string;
//   city: string;
//   state: string;
//   areas: { _id: string; name: string }[];
// }

// interface SubscriptionPlan {
//   _id: string;
//   name: string;
//   price: number;
//   finalPrice: number;
//   gst: number;
// }

// const initialFormState: TechnicianData = {
//   username: '',
//   franchiseId: '',
//   category: '',
//   phoneNumber: '',
//   password: '',
//   buildingName: '',
//   areaName: '',
//   city: '',
//   state: '',
//   pincode: '',
//   subscriptionId: '',
// };

// const AddTechnician: React.FC = () => {
//   const [formData, setFormData] = useState<TechnicianData>(initialFormState);
//   const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TechnicianData, string>>>({});
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
//   const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
//   const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
//   const [selectedPincode, setSelectedPincode] = useState<string>('');
//   const [areaOptions, setAreaOptions] = useState<{ _id: string; name: string }[]>([]);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   // Consolidated API calls
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [categoriesRes, pincodesRes, plansRes] = await Promise.all([
//           getAllCategories(null),
//           getAllPincodes(),
//           getPlans(),
//         ]);
//         setApiCategories(Array.isArray(categoriesRes?.data) ? categoriesRes.data : []);
//         setPincodeData(Array.isArray(pincodesRes?.data) ? pincodesRes.data : []);
//         setSubscriptionPlans(Array.isArray(plansRes?.data) ? plansRes.data : []);
//       } catch (err) {
//         console.error('Failed to load data:', err);
//         setError('Failed to load data');
//       }
//     };
//     fetchData();
//   }, []);

//   // Update city, state, and areas based on selected pincode
//   useEffect(() => {
//     if (selectedPincode) {
//       const found = pincodeData.find((p) => p.code === selectedPincode);
//       if (found && found.areas) {
//         setAreaOptions(found.areas);
//         setFormData((prev) => ({
//           ...prev,
//           city: found.city,
//           state: found.state,
//         }));
//       } else {
//         setAreaOptions([]);
//         setFormData((prev) => ({
//           ...prev,
//           city: '',
//           state: '',
//           areaName: '',
//         }));
//       }
//     } else {
//       setAreaOptions([]);
//       setFormData((prev) => ({
//         ...prev,
//         city: '',
//         state: '',
//         areaName: '',
//       }));
//     }
//   }, [selectedPincode, pincodeData]);

//   // Real-time field validation
//   const validateField = (name: keyof TechnicianData, value: string) => {
//     if (name === 'username' && !/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
//       return 'Username must be 3-20 characters and contain only letters, numbers, or underscores';
//     }
//     if (name === 'phoneNumber' && !/^\d{10}$/.test(value)) {
//       return 'Phone number must be exactly 10 digits';
//     }
//     if (name === 'pincode' && value.length !== 6) {
//       return 'Pincode must be exactly 6 digits';
//     }
//     return '';
//   };

//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//       const { name, value } = e.target;
//       setFormData((prev) => ({ ...prev, [name]: value }));
//       setFieldErrors((prev) => ({ ...prev, [name]: validateField(name as keyof TechnicianData, value) }));
//       if (name === 'pincode') {
//         setSelectedPincode(value);
//       }
//     },
//     []
//   );

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();
//       setError(null);
//       setLoading(true);

//       try {
//         const franchiseId = localStorage.getItem('userId');
//         if (!franchiseId) {
//           setError('Franchise ID not found. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         // Validate all fields
//         const errors = Object.keys(formData).reduce((acc, key) => {
//           const error = validateField(key as keyof TechnicianData, formData[key as keyof TechnicianData]);
//           if (error) acc[key as keyof TechnicianData] = error;
//           return acc;
//         }, {} as Partial<Record<keyof TechnicianData, string>>);

//         if (!formData.subscriptionId) {
//           errors.subscriptionId = 'Please select a subscription plan';
//         }

//         if (Object.keys(errors).length > 0) {
//           setFieldErrors(errors);
//           setError('Please fix the errors in the form');
//           setLoading(false);
//           return;
//         }

//         const payload = {
//           username: formData.username,
//           franchiseId,
//           category: formData.category,
//           phoneNumber: formData.phoneNumber,
//           password: formData.password,
//           buildingName: formData.buildingName,
//           areaName: formData.areaName,
//           city: formData.city,
//           state: formData.state,
//           pincode: formData.pincode,
//           subscriptionId: formData.subscriptionId,
//         };

//         const response = await registerTechByFranchise(payload);

//         if (response?.success) {
//           setFormData(initialFormState);
//           setFieldErrors({});
//           alert('Technician added successfully!');
//           navigate('/technicians'); // Redirect to a technician list page
//         } else {
//           throw new Error('Failed to add technician');
//         }
//       } catch (err: any) {
//         setError(err?.data?.error?.[0] || err?.message || 'Failed to add technician. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     },
//     [formData, navigate]
//   );

//   return (
//     <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br from-teal-50 to-indigo-50 rounded-xl shadow-2xl">
//       <h2 className="text-3xl font-extrabold text-indigo-900 mb-8 text-center">Add New Technician</h2>
//       {error && (
//         <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg mb-6 animate-pulse">{error}</div>
//       )}
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {[
//           { id: 'username', label: 'Username', type: 'text', placeholder: 'Enter username' },
//           { id: 'category', label: 'Category', type: 'select' },
//           { id: 'phoneNumber', label: 'Phone Number', type: 'tel', placeholder: 'Enter 10-digit phone number' },
//           { id: 'password', label: 'Password', type: 'password', placeholder: '6-10 characters' },
//           { id: 'buildingName', label: 'Building Name', type: 'text', placeholder: 'Enter building name' },
//           { id: 'pincode', label: 'Pincode', type: 'select' },
//           { id: 'areaName', label: 'Area', type: 'select' },
//           { id: 'city', label: 'City', type: 'select' },
//           { id: 'state', label: 'State', type: 'select' },
//           { id: 'subscriptionId', label: 'Subscription Plan', type: 'select' },
//         ].map(({ id, label, type, placeholder }) => (
//           <div key={id} className="relative group">
//             <label htmlFor={id} className="block text-sm font-medium text-indigo-700 mb-1">
//               {label} <span className="text-amber-500">*</span>
//             </label>
//             {id === 'category' ? (
//               <select
//                 id="category"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select a category</option>
//                 {apiCategories.length === 0 ? (
//                   <option disabled>No categories available</option>
//                 ) : (
//                   apiCategories
//                     .filter((category) => category?.status === 1)
//                     .map((item) => (
//                       <option key={item._id} value={item._id}>
//                         {item.category_name}
//                       </option>
//                     ))
//                 )}
//               </select>
//             ) : id === 'password' ? (
//               <div className="relative">
//                 <input
//                   id={id}
//                   name={id}
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder={placeholder}
//                   required
//                   value={formData[id as keyof TechnicianData]}
//                   onChange={handleChange}
//                   minLength={6}
//                   maxLength={10}
//                   aria-label={label}
//                   className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white pr-10"
//                 />
//                 <span
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-indigo-500 hover:text-amber-500 transition"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                   aria-label={showPassword ? 'Hide password' : 'Show password'}
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </span>
//               </div>
//             ) : id === 'pincode' ? (
//               <select
//                 id="pincode"
//                 name="pincode"
//                 value={formData.pincode}
//                 onChange={handleChange}
//                 required
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select Pincode</option>
//                 {pincodeData.length === 0 ? (
//                   <option disabled>No pincodes available</option>
//                 ) : (
//                   pincodeData.map((p) => (
//                     <option key={p._id} value={p.code}>
//                       {p.code}
//                     </option>
//                   ))
//                 )}
//               </select>
//             ) : id === 'areaName' ? (
//               <select
//                 id="areaName"
//                 name="areaName"
//                 value={formData.areaName}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select Area</option>
//                 {areaOptions.length === 0 ? (
//                   <option disabled>No areas available</option>
//                 ) : (
//                   areaOptions.map((a) => (
//                     <option key={a._id} value={a.name}>
//                       {a.name}
//                     </option>
//                   ))
//                 )}
//               </select>
//             ) : id === 'city' ? (
//               <select
//                 id="city"
//                 name="city"
//                 value={formData.city}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select City</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.city}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.city}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'state' ? (
//               <select
//                 id="state"
//                 name="state"
//                 value={formData.state}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select State</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.state}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.state}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'subscriptionId' ? (
//               <select
//                 id="subscriptionId"
//                 name="subscriptionId"
//                 value={formData.subscriptionId}
//                 onChange={handleChange}
//                 required
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select Subscription Plan</option>
//                 {subscriptionPlans.length === 0 ? (
//                   <option disabled>No plans available</option>
//                 ) : (
//                   subscriptionPlans
//                     .filter((plan) => plan.name !== 'Free Plan')
//                     .map((plan) => (
//                       <option key={plan._id} value={plan._id}>
//                         {plan.name} - ₹{plan.finalPrice} ({plan.price} + {plan.gst})
//                       </option>
//                     ))
//                 )}
//               </select>
//             ) : (
//               <input
//                 id={id}
//                 name={id}
//                 type={type}
//                 placeholder={placeholder}
//                 required
//                 value={formData[id as keyof TechnicianData]}
//                 onChange={handleChange}
//                 aria-label={label}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               />
//             )}
//             {fieldErrors[id as keyof TechnicianData] && (
//               <p className="text-red-600 text-sm mt-1">{fieldErrors[id as keyof TechnicianData]}</p>
//             )}
//           </div>
//         ))}
//         <button
//           type="submit"
//           disabled={loading}
//           className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105"
//         >
//           {loading ? (
//             <div className="flex items-center justify-center">
//               <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
//               </svg>
//               Adding Technician...
//             </div>
//           ) : (
//             'Add Technician'
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddTechnician;
// import React, { useState, useCallback, useEffect } from 'react';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { getAllCategories, getAllPincodes, registerTechByFranchise, getPlans } from '../../api/apiMethods';
// import { useNavigate } from 'react-router-dom';

// interface TechnicianData {
//   username: string;
//   franchiseId: string;
//   category: string;
//   phoneNumber: string;
//   password: string;
//   buildingName: string;
//   areaName: string;
//   city: string;
//   state: string;
//   pincode: string;
//   subscriptionId: string;
// }

// interface PincodeData {
//   _id: string;
//   code: string;
//   city: string;
//   state: string;
//   areas: { _id: string; name: string }[];
// }

// interface SubscriptionPlan {
//   _id: string;
//   name: string;
//   price: number;
//   finalPrice: number;
//   gst: number
// }

// const initialFormState: TechnicianData = {
//   username: '',
//   franchiseId: '',
//   category: '',
//   phoneNumber: '',
//   password: '',
//   buildingName: '',
//   areaName: '',
//   city: '',
//   state: '',
//   pincode: '',
//   subscriptionId: '',
// };

// const AddTechnician: React.FC = () => {
//   const [formData, setFormData] = useState<TechnicianData>(initialFormState);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [apiCategories, setApiCategories] = useState<{ _id: string; category_name: string; status: number }[]>([]);
//   const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
//   const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
//   const [selectedPincode, setSelectedPincode] = useState<string>('');
//   const [areaOptions, setAreaOptions] = useState<{ _id: string; name: string }[]>([]);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate()

//   useEffect(() => {
//     getAllPincodes()
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setPincodeData(res.data);
//         }
//       })
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//     getAllCategories(null)
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setApiCategories(res.data);
//         } else {
//           setApiCategories([]);
//           setError('Failed to load categories');
//         }
//       })
//       .catch(() => {
//         setApiCategories([]);
//         setError('Failed to load categories');
//       });
//   }, []);

//   useEffect(() => {
//     getPlans()
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//             console.log(res)
//           setSubscriptionPlans(res.data);
//         } else {
//           setSubscriptionPlans([]);
//           setError('Failed to load subscription plans');
//         }
//       })
//       .catch(() => {
//         setSubscriptionPlans([]);
//         setError('Failed to load subscription plans');
//       });
//   }, []);

//   useEffect(() => {
//     if (selectedPincode) {
//       const found = pincodeData.find((p) => p.code === selectedPincode);
//       if (found && found.areas) {
//         setAreaOptions(found.areas);
//         setFormData((prev) => ({
//           ...prev,
//           city: found.city,
//           state: found.state,
//         }));
//       } else {
//         setAreaOptions([]);
//         setFormData((prev) => ({
//           ...prev,
//           city: '',
//           state: '',
//           areaName: '',
//         }));
//       }
//     } else {
//       setAreaOptions([]);
//       setFormData((prev) => ({
//         ...prev,
//         city: '',
//         state: '',
//         areaName: '',
//       }));
//     }
//   }, [selectedPincode, pincodeData]);

//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//       const { name, value } = e.target;
//       setFormData((prev) => ({ ...prev, [name]: value }));
//       if (name === 'pincode') {
//         setSelectedPincode(value);
//       }
//     },
//     []
//   );

//   const handleSubmit = useCallback(

//     async (e: React.FormEvent) => {
//         navigate('/buyPlans', { state: { plan } } )
//       e.preventDefault();
//       setError(null);
//       setLoading(true);

//       try {
//         const franchiseId = localStorage.getItem('userId');
//         if (!franchiseId) {
//           setError('Franchise ID not found. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         if (!formData.pincode || formData.pincode.length !== 6) {
//           setError('Pincode must be exactly 6 digits');
//           setLoading(false);
//           return;
//         }

//         if (!/^\d{10}$/.test(formData.phoneNumber)) {
//           setError('Phone number must be exactly 10 digits');
//           setLoading(false);
//           return;
//         }

//         if (!formData.subscriptionId) {
//           setError('Please select a subscription plan');
//           setLoading(false);
//           return;
//         }

//         const payload = {
//           username: formData.username,
//           franchiseId,
//           category: formData.category,
//           phoneNumber: formData.phoneNumber,
//           password: formData.password,
//           buildingName: formData.buildingName,
//           areaName: formData.areaName,
//           city: formData.city,
//           state: formData.state,
//           pincode: formData.pincode,
//           subscriptionId: formData.subscriptionId,
//         };

//         const response = await registerTechByFranchise(payload);

//         if (response?.success) {
//           setFormData(initialFormState);
//           alert('Technician added successfully!');
//         } else {
//           throw new Error('Failed to add technician');
//         }
//       } catch (err: any) {
//         setError(err?.data?.error?.[0] || err?.message || 'Failed to add technician. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     },
//     [formData]
//   );

//   return (
//     <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br from-teal-50 to-indigo-50 rounded-xl shadow-2xl">
//       <h2 className="text-3xl font-extrabold text-indigo-900 mb-8 text-center">Add New Technician</h2>
//       {error && (
//         <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg mb-6 animate-pulse">{error}</div>
//       )}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {[
//           { id: 'username', label: 'Username', type: 'text', placeholder: 'Enter username' },
//           { id: 'category', label: 'Category', type: 'select' },
//           { id: 'phoneNumber', label: 'Phone Number', type: 'tel', pattern: '[0-9]{10}', placeholder: 'Enter 10-digit phone number' },
//           { id: 'password', label: 'Password', type: 'password', minLength: 6, maxLength: 10, placeholder: '6-10 characters' },
//           { id: 'buildingName', label: 'Building Name', type: 'text', placeholder: 'Enter building name' },
//           { id: 'pincode', label: 'Pincode', type: 'select' },
//           { id: 'areaName', label: 'Area', type: 'select' },
//           { id: 'city', label: 'City', type: 'select' },
//           { id: 'state', label: 'State', type: 'select' },
//           { id: 'subscriptionId', label: 'Subscription Plan', type: 'select' },
//         ].map(({ id, label, type, pattern, minLength, maxLength, placeholder }) => (
//           <div key={id} className="relative group">
//             <label htmlFor={id} className="block text-sm font-medium text-indigo-700 mb-1">
//               {label} <span className="text-amber-500">*</span>
//             </label>
//             {id === 'category' ? (
//               <select
//                 id="category"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select a category</option>
//                 {apiCategories
//                   .filter((category) => category?.status === 1)
//                   .map((item) => (
//                     <option key={item._id} value={item._id}>
//                       {item.category_name}
//                     </option>
//                   ))}
//               </select>
//             ) : id === 'password' ? (
//               <div className="relative">
//                 <input
//                   id={id}
//                   name={id}
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder={placeholder}
//                   required
//                   value={formData[id as keyof TechnicianData]}
//                   onChange={handleChange}
//                   minLength={minLength}
//                   maxLength={maxLength}
//                   className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white pr-10"
//                 />
//                 <span
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-indigo-500 hover:text-amber-500 transition"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </span>
//               </div>
//             ) : id === 'pincode' ? (
//               <select
//                 id="pincode"
//                 name="pincode"
//                 value={formData.pincode}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select Pincode</option>
//                 {pincodeData.map((p) => (
//                   <option key={p._id} value={p.code}>
//                     {p.code}
//                   </option>
//                 ))}
//               </select>
//             ) : id === 'areaName' ? (
//               <select
//                 id="areaName"
//                 name="areaName"
//                 value={formData.areaName}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select Area</option>
//                 {areaOptions.map((a) => (
//                   <option key={a._id} value={a.name}>
//                     {a.name}
//                   </option>
//                 ))}
//               </select>
//             ) : id === 'city' ? (
//               <select
//                 id="city"
//                 name="city"
//                 value={formData.city}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select City</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.city}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.city}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'state' ? (
//               <select
//                 id="state"
//                 name="state"
//                 value={formData.state}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white disabled:bg-gray-100"
//               >
//                 <option value="" disabled>Select State</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.state}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.state}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'subscriptionId' ? (
//               <select
//                 id="subscriptionId"
//                 name="subscriptionId"
//                 value={formData.subscriptionId}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               >
//                 <option value="" disabled>Select Subscription Plan</option>
//                 {subscriptionPlans
//                 .filter(plan => plan.name !== "Free Plan")
//                 .map((plan) => (
//                   <option key={plan._id} value={plan._id}>
//                     {plan.name} - ₹{plan.finalPrice} ({plan.price} + {plan.gst})
//                   </option>
//                 ))}
//               </select>
//             ) : (
//               <input
//                 id={id}
//                 name={id}
//                 type={type}
//                 placeholder={placeholder}
//                 required
//                 value={formData[id as keyof TechnicianData]}
//                 onChange={handleChange}
//                 pattern={pattern}
//                 className="mt-1 block w-full px-4 py-3 border border-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
//               />
//             )}
//           </div>
//         ))}
//       </div>
//       <button
//         type="submit"
//         onClick={handleSubmit}
//         disabled={loading}
//         className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 transform hover:scale-105"
//       >
//         {loading ? (
//           <div className="flex items-center justify-center">
//             <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
//             </svg>
//             Adding Technician...
//           </div>
//         ) : (
//           'Add Technician'
//         )}
//       </button>
//     </div>
//   );
// };

// export default AddTechnician;
// import React, { useState, useCallback, useEffect } from 'react';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { getAllCategories, getAllPincodes, registerTechByFranchise} from '../../api/apiMethods'; // Assuming addTechnician API method

// interface TechnicianData {
//   username: string;
//   franchiseId: string;
//   category: string;
//   phoneNumber: string;
//   password: string;
//   buildingName: string;
//   areaName: string;
//   city: string;
//   state: string;
//   pincode: string;
// }

// interface PincodeData {
//   _id: string;
//   code: string;
//   city: string;
//   state: string;
//   areas: { _id: string; name: string }[];
// }

// const initialFormState: TechnicianData = {
//   username: '',
//   franchiseId: '',
//   category: '',
//   phoneNumber: '',
//   password: '',
//   buildingName: '',
//   areaName: '',
//   city: '',
//   state: '',
//   pincode: '',
// };

// const AddTechnician: React.FC = () => {
//   const [formData, setFormData] = useState<TechnicianData>(initialFormState);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [apiCategories, setApiCategories] = useState<{ _id: string; category_name: string; status :number }[]>([]);
//   const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
//   const [selectedPincode, setSelectedPincode] = useState<string>('');
//   const [areaOptions, setAreaOptions] = useState<{ _id: string; name: string }[]>([]);
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     getAllPincodes()
//       .then((res: any) => {
//         if (Array.isArray(res?.data)) {
//           setPincodeData(res.data);
//         }
//       })
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//     if (selectedPincode) {
//       const found = pincodeData.find((p) => p.code === selectedPincode);
//       if (found && found.areas) {
//         setAreaOptions(found.areas);
//         setFormData((prev) => ({
//           ...prev,
//           city: found.city,
//           state: found.state,
//         }));
//       } else {
//         setAreaOptions([]);
//         setFormData((prev) => ({
//           ...prev,
//           city: '',
//           state: '',
//           areaName: '',
//         }));
//       }
//     } else {
//       setAreaOptions([]);
//       setFormData((prev) => ({
//         ...prev,
//         city: '',
//         state: '',
//         areaName: '',
//       }));
//     }
//   }, [selectedPincode, pincodeData]);

//   useEffect(()=>{
//     getAllCategories(null)
//         .then((res: any) => {
//           if (Array.isArray(res?.data)) {
//             setApiCategories(res.data);
//           } else {
//             setApiCategories([]);
//             setCatError('Failed to load categories');
//           }
//         })
//         .catch(() => {
//           setApiCategories([]);
//           setCatError('Failed to load categories');
//         })
//   },[])

//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//       const { name, value } = e.target;
//       setFormData((prev) => ({ ...prev, [name]: value }));
//       if (name === 'pincode') {
//         setSelectedPincode(value);
//       }
//     },
//     []
//   );

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();
//       setError(null);
//       setLoading(true);

//       try {
//         const franchiseId = localStorage.getItem('userId')
//         if (!formData.pincode || formData.pincode.length !== 6) {
//           setError('Pincode must be exactly 6 digits');
//           setLoading(false);
//           return;
//         }

//         if (!/^\d{10}$/.test(formData.phoneNumber)) {
//           setError('Phone number must be exactly 10 digits');
//           setLoading(false);
//           return;
//         }

//         const payload = {
//           username: formData.username,
//           franchiseId: franchiseId,
//           category: formData.category,
//           phoneNumber: formData.phoneNumber,
//           password: formData.password,
//           buildingName: formData.buildingName,
//           areaName: formData.areaName,
//           city: formData.city,
//           state: formData.state,
//           pincode: formData.pincode,
//         };

//         const response = await registerTechByFranchise(payload);

//         if (response?.success) {
//           setFormData(initialFormState); // Reset form on success
//           alert('Technician added successfully!');
//         } else {
//           throw new Error('Failed to add technician');
//         }
//       } catch (err: any) {
//         setError(err?.data?.error?.[0] || err?.message || 'Failed to add technician. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     },
//     [formData]
//   );

//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-xl">
//       <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Technician</h2>
//       {error && (
//         <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded mb-4">{error}</div>
//       )}
//       <div className="space-y-4">
//         {[
//           { id: 'username', label: 'Username', type: 'text' },
//           { id: 'category', label: 'Category', type: 'text' },
//           { id: 'phoneNumber', label: 'Phone Number', type: 'tel', pattern: '[0-9]{10}' },
//           { id: 'password', label: 'Password', type: 'password', minLength: 6, maxLength: 10 },
//           { id: 'buildingName', label: 'Building Name', type: 'text' },
//           { id: 'pincode', label: 'Pincode', type: 'select' },
//           { id: 'areaName', label: 'Area', type: 'select' },
//           { id: 'city', label: 'City', type: 'select' },
//           { id: 'state', label: 'State', type: 'select' },
//         ].map(({ id, label, type, pattern, minLength, maxLength }) => (
//           <div key={id}>
//             <label htmlFor={id} className="block text-sm font-medium text-gray-700">
//               {label} <span className="text-red-600">*</span>
//             </label>
//             {id === 'category' ? (
//                 <div>
//               <label htmlFor="category" className="block text-sm font-medium text-gray-700">
//               </label>
//               <select
//                 id="category"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 w-full border border-gray-300 rounded-md p-2"
//               >
//                 <option value="" disabled>
//                    Select a category
//                 </option>

//                  {apiCategories
//                       .filter((category) => category?.status === 1)
//                       .map((item) => (
//                         <option key={item._id} value={item._id}>
//                           {item.category_name}
//                         </option>
//                       ))}
//               </select>
//             </div>
//             ) :id === 'password' ? (
//               <div className="relative">
//                 <input
//                   id={id}
//                   name={id}
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="Password (6-10 characters)"
//                   required
//                   value={formData[id as keyof TechnicianData]}
//                   onChange={handleChange}
//                   minLength={minLength}
//                   maxLength={maxLength}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//                 <span
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </span>
//               </div>
//             ) : id === 'pincode' ? (
//               <select
//                 id="pincode"
//                 name="pincode"
//                 value={formData.pincode}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               >
//                 <option value="">Select Pincode</option>
//                 {pincodeData.map((p) => (
//                   <option key={p._id} value={p.code}>
//                     {p.code}
//                   </option>
//                 ))}
//               </select>
//             ) : id === 'areaName' ? (
//               <select
//                 id="areaName"
//                 name="areaName"
//                 value={formData.areaName}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
//               >
//                 <option value="">Select Area</option>
//                 {areaOptions.map((a) => (
//                   <option key={a._id} value={a.name}>
//                     {a.name}
//                   </option>
//                 ))}
//               </select>
//             ) : id === 'city' ? (
//               <select
//                 id="city"
//                 name="city"
//                 value={formData.city}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
//               >
//                 <option value="">Select City</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.city}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.city}
//                   </option>
//                 )}
//               </select>
//             ) : id === 'state' ? (
//               <select
//                 id="state"
//                 name="state"
//                 value={formData.state}
//                 onChange={handleChange}
//                 required
//                 disabled={!selectedPincode}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
//               >
//                 <option value="">Select State</option>
//                 {selectedPincode && pincodeData.find((p) => p.code === selectedPincode) && (
//                   <option value={pincodeData.find((p) => p.code === selectedPincode)?.state}>
//                     {pincodeData.find((p) => p.code === selectedPincode)?.state}
//                   </option>
//                 )}
//               </select>
//             ) : (
//               <input
//                 id={id}
//                 name={id}
//                 type={type}
//                 placeholder={label}
//                 required
//                 value={formData[id as keyof TechnicianData]}
//                 onChange={handleChange}
//                 pattern={pattern}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             )}
//           </div>
//         ))}
//         <button
//           type="submit"
//           onClick={handleSubmit}
//           disabled={loading}
//           className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
//         >
//           {loading ? 'Adding Technician...' : 'Add Technician'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AddTechnician;
