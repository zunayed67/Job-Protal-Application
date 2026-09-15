import { useEffect, useState } from "react";
import { viewProfilePageStyles as s } from "../assets/dummyStyles";

import {
  Edit3,
  FileText,
  Loader2,
  Mail,
  Phone,
  Save,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";

// Toast component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={s.toast.container}>
      <div
        className={`${s.toast.card} ${
          type === "success" ? s.toast.cardSuccess : s.toast.cardError
        }`}
      >
        <div
          className={`${s.toast.indicator} ${
            type === "success"
              ? s.toast.indicatorSuccess
              : s.toast.indicatorError
          }`}
        />

        <span className={s.toast.message}>{message}</span>

        <button onClick={onClose} className={s.toast.closeButton}>
          <X className={s.toast.closeIcon} />
        </button>
      </div>
    </div>
  );
};

const ViewProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null,
  });

  const [originalProfile, setOriginalProfile] = useState(null);

  const [toast, setToast] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // FETCH USER PROFILE
  // ==========================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = localStorage.getItem("jobportal_user");

        if (!storedUser) {
          throw new Error("User information not found.");
        }

        const user = JSON.parse(storedUser);

        if (!user?.token) {
          throw new Error("Authentication token not found.");
        }

        const res = await fetch("http://localhost:5000/api/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success || !data.user) {
          throw new Error(data.message || "Failed to fetch profile.");
        }

        setProfile({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          resume: data.user.resume || null,
        });

        setOriginalProfile({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          resume: data.user.resume || null,
          _id: data.user._id,
        });
      } catch (error) {
        console.error("Profile fetch error:", error);

        setToast({
          message: error.message || "Failed to load profile.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE PHONE CHANGE
  // ==========================================

  const handlePhoneChange = (e) => {
    const raw = e.target.value;

    const digits = raw.replace(/\D/g, "").slice(0, 10);

    setProfile((prev) => ({
      ...prev,
      phone: digits,
    }));
  };

  // ==========================================
  // HANDLE RESUME UPLOAD
  // ==========================================

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setProfile((prev) => ({
      ...prev,
      resume: file,
    }));
  };

  // ==========================================
  // DELETE RESUME
  // ==========================================

  const handleDeleteResume = () => {
    setProfile((prev) => ({
      ...prev,
      resume: null,
    }));
  };

  // ==========================================
  // VALIDATE FORM
  // ==========================================

  const validate = () => {
    if (!profile.name.trim()) {
      return "Name is required";
    }

    if (!profile.email.trim()) {
      return "Email is required";
    }

    if (!/\S+@\S+\.\S+/.test(profile.email)) {
      return "Email is invalid";
    }

    if (!profile.phone) {
      return "Phone is required";
    }

    if (!/^\d{10}$/.test(profile.phone)) {
      return "Phone must be exactly 10 digits";
    }

    return null;
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSave = async () => {
    const error = validate();

    if (error) {
      setToast({
        message: error,
        type: "error",
      });

      return;
    }

    try {
      setIsSaving(true);

      const storedUser = localStorage.getItem("jobportal_user");

      if (!storedUser) {
        throw new Error("User information not found.");
      }

      const user = JSON.parse(storedUser);

      if (!user?.token) {
        throw new Error("Authentication token not found.");
      }

      const formData = new FormData();

      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);

      if (profile.resume instanceof File) {
        formData.append("resume", profile.resume);
      }

      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.user) {
        throw new Error(data.message || "Failed to update profile.");
      }

      const updatedProfile = {
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        resume: data.user.resume || null,
        _id: data.user._id,
      };

      setProfile(updatedProfile);

      setOriginalProfile(updatedProfile);

      setIsEditing(false);

      setToast({
        message: "Profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Profile update error:", error);

      setToast({
        message: error.message || "Update failed",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // CANCEL EDITING
  // ==========================================

  const handleCancel = () => {
    if (originalProfile) {
      setProfile({
        name: originalProfile.name || "",
        email: originalProfile.email || "",
        phone: originalProfile.phone || "",
        resume: originalProfile.resume || null,
      });
    }

    setIsEditing(false);
  };

  // ==========================================
  // GET RESUME FILE NAME
  // ==========================================

  const getFileName = (resume) => {
    if (!resume) {
      return "";
    }

    if (resume instanceof File) {
      return resume.name;
    }

    if (typeof resume === "string") {
      const fileName = resume.split("/").pop();

      if (!fileName) {
        return "Resume";
      }

      return fileName.split("-").slice(1).join("-") || fileName;
    }

    return "Resume";
  };

  // ==========================================
  // VIEW RESUME
  // ==========================================

  const handleViewResume = () => {
    if (!profile.resume) {
      return;
    }

    // If newly selected file
    if (profile.resume instanceof File) {
      const url = URL.createObjectURL(profile.resume);

      window.open(url, "_blank");

      // Clean up URL later
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      return;
    }

    // If existing resume from server
    if (typeof profile.resume === "string") {
      if (!originalProfile?._id) {
        setToast({
          message: "Unable to identify your profile.",
          type: "error",
        });

        return;
      }

      const fullUrl = `http://localhost:5000/api/user/resume/${originalProfile._id}`;

      window.open(fullUrl, "_blank");
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (isLoading) {
    return (
      <div className={s.container}>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className={s.container}>
      <div className={s.innerContainer}>
        {/* HEADER */}
        <div className={s.header}>
          <h1 className={s.headerTitle}>My Profile</h1>

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className={s.editButton}>
              <Edit3 className={s.editIcon} />
              Edit Profile
            </button>
          ) : (
            <div className={s.actionButtons}>
              <button onClick={handleCancel} className={s.cancelButton}>
                <X className={s.cancelIcon} />
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`${s.saveButton} ${
                  isSaving ? s.saveButtonDisabled : ""
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className={s.savingSpinner} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className={s.saveIcon} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* PROFILE CARD */}
        <div className={s.profileCard}>
          {/* AVATAR */}
          <div className={s.avatarSection}>
            <div className={s.avatar}>
              {profile.name
                ? profile.name
                    .trim()
                    .split(/\s+/)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "U"}
            </div>

            <div className={s.avatarInfo}>
              <h2 className={s.avatarName}>{profile.name || "Your Name"}</h2>

              <p className={s.avatarEmail}>
                <Mail className={s.avatarEmailIcon} />

                {profile.email || "example@email.com"}
              </p>
            </div>
          </div>

          {/* FORM GRID */}
          <div className={s.formGrid}>
            {/* NAME */}
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>
                <User className={s.fieldIcon} />
                Full Name
                <span className={s.requiredStar}>*</span>
              </label>

              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="John Doe"
                  required
                />
              ) : (
                <p className={s.displayText}>
                  {profile.name || "Not provided"}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>
                <Mail className={s.fieldIcon} />
                Email Address
                <span className={s.requiredStar}>*</span>
              </label>

              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="john@example.com"
                  required
                />
              ) : (
                <p className={s.displayText}>
                  {profile.email || "Not provided"}
                </p>
              )}
            </div>

            {/* PHONE */}
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>
                <Phone className={s.fieldIcon} />
                Phone
                <span className={s.requiredStar}>*</span>
              </label>

              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handlePhoneChange}
                  className={s.input}
                  placeholder="0123456789"
                  maxLength={11}
                  required
                />
              ) : (
                <p className={s.displayText}>
                  {profile.phone || "Not provided"}
                </p>
              )}
            </div>

            {/* RESUME */}
            <div className={s.resumeSection}>
              <label className={s.fieldLabel}>
                <FileText className={s.fieldIcon} />
                Resume (PDF or Word)
              </label>

              {isEditing ? (
                <div className={s.resumeUploadWrapper}>
                  <div className={s.resumeUploadRow}>
                    <label className={s.resumeUploadLabel}>
                      <div className={s.resumeUploadBox}>
                        <Upload className={s.resumeUploadIcon} />

                        <span className={s.resumeFileName}>
                          {profile.resume
                            ? getFileName(profile.resume)
                            : "Choose file..."}
                        </span>
                      </div>

                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleResumeUpload}
                      />
                    </label>

                    {profile.resume && (
                      <button
                        type="button"
                        onClick={handleDeleteResume}
                        className={s.resumeDeleteButton}
                        title="Delete resume"
                      >
                        <Trash2 className={s.resumeDeleteIcon} />
                      </button>
                    )}
                  </div>

                  {profile.resume && (
                    <p className={s.resumeSuccessText}>
                      File selected: {getFileName(profile.resume)}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  {profile.resume ? (
                    <button
                      type="button"
                      onClick={handleViewResume}
                      className={s.resumeViewButton}
                    >
                      <FileText className={s.resumeViewIcon} />
                      View Resume ({getFileName(profile.resume)})
                    </button>
                  ) : (
                    <p className={s.noResumeText}>No resume uploaded</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* GLOBAL STYLES */}
      <style>{s.globalStyles}</style>
    </div>
  );
};

export default ViewProfilePage;
