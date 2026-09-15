import { useEffect, useRef, useState } from "react";
import { companiesPageStyles as s } from "../assets/dummyStyles";
import axios from "axios";
import { CheckCircle, XCircle, X, Upload, Link2, Loader2, Trash2 } from "lucide-react";

// Components must start with a capital letter in React
const Companies = () => {
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // to fetch companies from server side.
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/company/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCompanies(res.data.companies);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!toast || toast.confirm) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // for image
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        try {
          if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
          // Fixed ESLint unused variable error
          console.error("Failed to reset input value:", err);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview("");
    }
  };

  // to validate the form data field
  const validateForm = () => {
    const newErrors = {};
    if (!logoFile) newErrors.logo = "Logo is required";
    if (!website.trim()) {
      newErrors.website = "Website URL is required";
    } else if (!/^https?:\/\/.+\..+/.test(website)) {
      newErrors.website = "Enter a valid URL (e.g., https://example.com)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // to submit the data to server
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("logo", logoFile);
      formData.append("website", website.trim());

      const res = await axios.post(
        "http://localhost:5000/api/company", 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCompanies((prev) => [res.data.company, ...prev]);
      setToast({ type: "success", message: "Company added successfully!" });
      // reset the form
      setLogoFile(null);
      setLogoPreview("");
      setWebsite("");
      setErrors({});
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to add company",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // to delete a company
  const requestDeleteCompany = (companyId) => {
    setPendingDeleteId(companyId);
    setToast({
      type: "confirm",
      confirm: true,
      message: "Are you sure you want to delete this company?",
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/company/${pendingDeleteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setCompanies((prev) => prev.filter((c) => c.id !== pendingDeleteId));
      setPendingDeleteId(null);
      setToast({
        type: "success",
        message: "Company deleted successfully!",
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Delete Failed",
      });
    }
  };

  // to cancel delete
  const handleCancelDelete = () => {
    setPendingDeleteId(null);
    setToast(null);
  };

  return (
    <div className={s.pageContainer}>
      {toast && (
        <div className={s.toastWrapper}>
          <div
            className={`${s.toastBase} ${
              toast.type === "success"
                ? s.toastSuccess
                : toast.type === "error"
                  ? s.toastError
                  : s.toastConfirm
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={20} className={s.toastIconSuccess} />
            ) : toast.type === "error" ? (
              <XCircle size={20} className={s.toastIconError} />
            ) : (
              <XCircle size={20} className={s.toastIconConfirm} />
            )}

            <div className={s.toastContent}>
              <span className={s.toastMessage}>{toast.message}</span>

              {toast.confirm && (
                <div className={s.toastActionRow}>
                  <button
                    onClick={handleConfirmDelete}
                    className={s.toastConfirmBtn}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className={s.toastCancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {!toast.confirm && (
              <button
                onClick={() => setToast(null)}
                className={s.toastCloseBtn}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className={s.contentWrapper}>
        {/* Header has been removed to match your screenshot reference */}
        
        <div className={s.formCard}>
          <form onSubmit={handleSubmit} className={s.form}>
            {/* logo upload */}
            <div>
              <label className={s.logoLabel}>
                Company Logo
                <span className={s.requiredStar}>*</span>
              </label>
              <div className={s.logoContainer}>
                <div className={s.previewWrapper}>
                  {logoPreview ? (
                    <div className={s.previewBox}>
                      <img
                        src={logoPreview}
                        alt="logo"
                        className={s.previewImage}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview("");
                          try {
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          } catch (error) {
                            // Fixed ESLint unused variable error
                            console.error("Failed to reset input value:", error);
                          }
                        }}
                        className={s.removeLogoBtn}
                        aria-label="Remove Logo"
                      >
                         <X size={16} color="#fff" />
                      </button>
                    </div>
                  ) : (
                    <div className={s.placeholderBox}>
                      <Upload size={24} />
                    </div>
                  )}
                </div>
                <div className={s.uploadArea}>
                  <label htmlFor="logo-upload" className={s.uploadLabel}>
                    <Upload size={16} />
                    <span>Choose File</span>
                  </label>
                  <input
                    type="file"
                    id="logo-upload"
                    ref={fileInputRef}
                    accept="image/*, image/jpeg, image/svg+xml, .ico"
                    onChange={handleLogoChange}
                    className={s.fileInputHidden}
                  />
                </div>
              </div>
              {errors.logo && <p className={s.errorText}>{errors.logo}</p>}
            </div>

            {/* Website */}
            <div>
              <label className={s.websiteLabel}>
                Website URL <span className={s.requiredStar}>*</span>
              </label>
              <div className="relative">
                <Link2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={`${s.website} pl-10 ${
                    errors.website ? s.inputError : s.inputDefault
                  }`}
                  placeholder="https://example.com"
                />
              </div>
              {errors.website && (
                <p className={s.errorText}>{errors.website}</p>
              )}
            </div>
            
            {/* submit btn */}
            <div className={s.submitSection}>
              <button
                type="submit"
                disabled={isLoading}
                className={`${s.submitBtn} ${
                  isLoading ? s.submitBtnDisabled : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className={s.spinner} />
                  </>
                ) : (
                  "Add Company"
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* company list */}
        {companies.length > 0 && (
          <div className={s.listSection}>
            <h2 className={s.listTitle}>Companies</h2>
            <div className={s.grid}>
              {companies.map((c) => (
                <div key={c._id} className={s.companyCard}>
                  {/* logo */}
                  <div className={s.cardLogoWrapper}>
                    <div className={s.cardLogoBox}>
                      {c.logo ? (
                        <img
                          src={c.logo}
                          alt="logo"
                          className={s.cardLogoImage}
                        />
                      ) : (
                        <div className={s.cardNoImage}>No Image</div>
                      )}
                    </div>
                  </div>
                  <div className={s.cardDetails}>
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noreferrer"
                      className={s.cardLink}
                    >
                      {c.website}
                    </a>
                  </div>
                  {/* delete icon */}
                  <div className={s.cardDeleteWrapper}>
                    <button 
                      onClick={() => requestDeleteCompany(c._id)}
                      className={s.deleteBtn}
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Companies;