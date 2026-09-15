import { useEffect, useState } from "react";
import { dashboardStyles as s } from "../assets/dummyStyles.js";
import { useNavigate } from "react-router-dom";
import { Briefcase, Building, CheckCircle, Filter, MapPin, Search, TrendingUp, Users, X, XCircle } from "lucide-react";

const statColors = {
  blue: { bgLight: "bg-blue-100", gradient: "from-blue-500 to-blue-600" },
  rose: { bgLight: "bg-rose-100", gradient: "from-rose-500 to-rose-600" },
  emerald: { bgLight: "bg-emerald-100", gradient: "from-emerald-500 to-emerald-600" },
  amber: { bgLight: "bg-amber-100", gradient: "from-amber-500 to-amber-600" },
};

export const Dashboard = () => {
  const [companyFilter, setCompanyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  
  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: "0",
    closedJobs: "0",
    totalApplicants: "0",
    totalCompanies: "0",
  });
  
  const [toast, setToast] = useState(null);
  const [jobs, setJobs] = useState([]);

  const navigate = useNavigate();

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        // 🚨 I HAVE COMMENTED THIS OUT SO YOU CAN SEE YOUR UI 🚨
        // if (!token) {
        //   navigate("/login");
        //   return;
        // }

        // Fetch Stats
        const statsRes = await fetch("http://localhost:5000/api/job/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsRes.json();
        
        if (statsData?.success) {
          const newStats = statsData.stats || statsData.data || {};
          setDashboardStats((prev) => ({ ...prev, ...newStats }));
        }

        // Fetch Jobs
        const jobsRes = await fetch("http://localhost:5000/api/job/admin/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const jobsData = await jobsRes.json();
        
        if (jobsData?.success) {
          const jobsArray = Array.isArray(jobsData.jobs) ? jobsData.jobs : [];
          const mappedJobs = jobsArray.map((j) => ({
            id: j._id,
            name: j.companyName || "Unknown",
            role: j.roleName || "Unknown",
            location: j.location || "N/A",
            category: j.category || "N/A",
            logo: j.companyLogo?.startsWith("http")
              ? j.companyLogo
              : `http://localhost:5000${j.companyLogo || ""}`,
            applicants: j.applicantsCount || 0,
            status: j.status || "active",
          }));
          setJobs(mappedJobs);
        }
      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Handle toast auto-dismiss
  useEffect(() => {
    if (toast && !toast.confirm) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle close job initiation
  const handleCloseJob = (jobId) => {
    setToast({
      message: "Are you sure you want to close this job?",
      type: "confirm",
      confirm: true,
      jobId,
    });
  };

  // Confirm close
  const handleConfirmClose = async () => {
    const jobId = toast.jobId;
    setToast(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/job/${jobId}/close`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data?.success) {
        setToast({ message: "Job closed successfully!", type: "success" });
        
        const statsRes = await fetch("http://localhost:5000/api/job/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsRes.json();
        if (statsData?.success) {
          setDashboardStats((prev) => ({ ...prev, ...(statsData.stats || statsData.data || {}) }));
        }

        const jobsRes = await fetch("http://localhost:5000/api/job/admin/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const jobsData = await jobsRes.json();

        if (jobsData?.success) {
          const jobsArray = Array.isArray(jobsData.jobs) ? jobsData.jobs : [];
          const mappedJobs = jobsArray.map((j) => ({
            id: j._id,
            name: j.companyName,
            role: j.roleName,
            location: j.location,
            category: j.category,
            logo: j.companyLogo?.startsWith("http")
              ? j.companyLogo
              : `http://localhost:5000${j.companyLogo || ""}`,
            applicants: j.applicantsCount || 0,
            status: j.status || "active",
          }));
          setJobs(mappedJobs);
        }
      }
    } catch (error) {
      console.error("Error closing job: ", error);
      setToast({ message: "Failed to close job", type: "error" });
    }
  };

  // Safe Stats Array
  const stats = [
    {
      label: "Total Jobs",
      value: dashboardStats?.totalJobs || "0",
      icon: Briefcase,
      colors: statColors.blue,
    },
    {
      label: "Closed Jobs",
      value: dashboardStats?.closedJobs || "0",
      icon: Briefcase,
      colors: statColors.rose,
    },
    {
      label: "Total Applicants",
      value: dashboardStats?.totalApplicants || "0",
      icon: Users,
      colors: statColors.emerald,
    },
    {
      label: "Active Companies",
      value: dashboardStats?.totalCompanies || dashboardStats?.totalCompany || "0",
      icon: Building,
      colors: statColors.amber,
    },
  ];

  // Derived state (with safe default arrays)
  const uniqueCompanies = [...new Set((jobs || []).map((c) => c.name))];
  const uniqueRoles = [...new Set((jobs || []).map((c) => c.role))];

  const filteredJobs = (jobs || []).filter((job) => {
    const matchesCompany = companyFilter === "" || job.name === companyFilter;
    const matchesRole = roleFilter === "" || job.role === roleFilter;
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesCompany && matchesRole && matchesStatus;
  });

  const handleImageError = (e) => {
    if (e.target) e.target.style.display = "none";
    if (e.target.nextSibling) e.target.nextSibling.classList.remove("hidden");
  };

  const clearFilters = () => {
    setCompanyFilter("");
    setRoleFilter("");
    setStatusFilter("active");
  };

  return (
    <div className={s.container || ""}>
      {/* Toast Notification */}
      {toast && (
        <div className={s.toastWrapper}>
          <div
            className={`${s.toastBase} ${
              toast.type === "success"
                ? s.toastSuccess
                : toast.type === "error"
                ? s.toastError
                : s.toastDefault
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={20} className={s.toastIconSuccess} />
            ) : (
              <XCircle size={20} className={toast.type === "error" ? s.toastIconError : s.toastIconDefault} />
            )}
            <div className={s.toastFlex}>
              <p className={s.toastMessage}>{toast.message}</p>
              {toast.confirm && (
                <div className={s.toastButtonContainer}>
                  <button onClick={handleConfirmClose} className={s.toastConfirmBtn}>
                    Confirm
                  </button>
                  <button onClick={() => setToast(null)} className={s.toastCancelBtn}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {!toast.confirm && (
              <button onClick={() => setToast(null)} className={s.toastCloseBtn}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={s.contentWrapper}>
        <div className={s.headerContainer}>
          <div>
            <h1 className={s.headerTitle}>Job Portal Dashboard</h1>
            <p className={s.headerSubtitle}>
              <TrendingUp className={s.headerIcon} />
              <span>Real Time overview of jobs and application</span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={s.statsGrid}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon || Briefcase; 
            return (
              <div key={idx} className={s.statCard}>
                <div className={s.statCardOverlay}></div>
                <div className={s.statCardContent}>
                  <div className={s.statCardTextContainer}>
                    <p className={s.statCardLabel}>{stat.label}</p>
                    <p className={s.statCardValue}>{stat.value}</p>
                  </div>
                  <div
                    className={`${s.statCardIconWrapper} ${
                      stat.colors?.bgLight || "bg-gray-100"
                    } bg-gradient-to-br ${stat.colors?.gradient || "from-gray-500 to-gray-600"}`}
                  >
                    <Icon className={s.statCardIcon} strokeWidth={1.8} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* filter section */}
        <div className={s.filtersContainer}>
          <div className={s.filtersHeader}>
            <div className={s.filtersTitleContainer}>
              <Filter className={s.filtersIcon}/>
              <h2 className={s.filtersTitle}>Filters</h2>
            </div>
            {(companyFilter || roleFilter || statusFilter !== "active") && (
              <button onClick={clearFilters} className={s.filtersClearBtn}>
                <X className="w-4 h-4"/>
                Clear all
              </button>
            )}
          </div>

          <div className={s.filtersGrid}>
            <div className={s.filterInputContainer}>
              <label className={s.filterLabel}>Filter by Company</label>
              <div className={s.filterInputWrapper}>
                {/* Search icon placed back, sized slightly smaller to fit perfectly */}
                <Search className={s.filterSearchIcon} size={18} />
                <select 
                  value={companyFilter} 
                  onChange={(e)=> setCompanyFilter(e.target.value)}
                  style={{ paddingLeft: "2.5rem", width: "100%" }} // <--- This fixes the text overlap
                >
                  <option value="">All Companies</option>
                  {uniqueCompanies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* role filter */}
            <div className={s.filterInputContainer}>
              <label className={s.filterLabel}>Filter by Role</label>
              <div className={s.filterInputWrapper}>
                 {/* Search icon placed back */}
                <Search className={s.filterSearchIcon} size={18} />
                <select 
                  value={roleFilter} 
                  onChange={(e)=> setRoleFilter(e.target.value)}
                  style={{ paddingLeft: "2.5rem", width: "100%" }} // <--- This fixes the text overlap
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* companies section */}
        <div className={s.jobsSection}>
          <div className={s.jobsHeader}>
            <h2 className={s.jobsTitle}>
              <Building className={s.jobsTitleIcon}/>
              {statusFilter === "active" ? "Active Roles" : statusFilter === "closed" ? "Closed Roles" : "All Roles"}
            </h2>
            <div className={s.jobsFilterContainer}>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className={s.jobsStatusSelect}
              >
                  <option value="active">Active Jobs</option>
                  <option value="closed">Closed Jobs</option>
                  <option value="all">All Jobs</option>
                </select>
                <div className={s.jobsCount}>
                  {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
                </div>
            </div>
          </div>

          {/* job card */}
          {loading ? (
            <div className={s.loadingContainer}>
              <div className={s.loadingSpinner}></div>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className={s.jobsGrid}>
              {filteredJobs.map((job) => (
                <div key={job.id} className={s.jobCard}>
                  <div className={s.jobCardOverlay}></div>
                  <div className={s.jobCardContent}>
                    <div className={s.jobCardHeader}>
                      <div className={s.jobLogoContainer}>
                        <div className={s.jobLogoWrapper}>
                          <img src={job.logo} alt={job.name} className={s.jobLogo} 
                          onError={handleImageError}/>
                          <div className={s.jobLogoFallback}>
                            <Building className={s.jobLogoFallbackIcon}/>
                          </div>
                        </div>
                      </div>

                      {/* job details */}
                      <div className={s.jobDetails}>
                        <h3 className={s.jobRole}>{job.role}</h3>
                        <p className={s.jobCompany}>
                          <Building className={s.jobCompanyIcon}/>
                          {job.name}
                        </p>
                        <p className={s.jobLocation}>
                          <MapPin className={s.jobLocationIcon}/>
                          {job.location}
                        </p>
                      </div>
                    </div>

                    <div className={s.jobMeta}>
                      <span className={s.jobCategory}>{job.category}</span>
                      <div className={s.jobApplicants}>
                        <Users className={s.jobApplicantsIcon}/>
                        <span className={s.jobApplicantsCount}>
                          {job.applicants}
                        </span>
                        <span className={s.jobApplicantsLabel}>applicants</span>
                      </div>
                    </div>
                    <div className={s.jobActions}>
                      <button onClick={() => navigate("/applicants", {
                        state : {
                          jobId: job.id,
                          role: job.role,
                          companyName: job.name
                        }
                      })} className={s.viewApplicantsBtn}>
                        View Applicants
                      </button>
                      {job.status === "active" && (
                        <button onClick={() => handleCloseJob(job.id)}
                        className={s.closeJobBtn}
                        > Close Job </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={s.emptyState}>
              <Building className={s.emptyStateIcon}/>
              <h3 className={s.emptyStateTitle}>No matching jobs found</h3>
              <p className={s.emptyStateText}>
                Try adjusting your filters 
              </p>
              <button onClick={clearFilters} className={s.emptyStateBtn}>
                Clear Filter
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{s.animations}</style>
    </div>
  );
};

export default Dashboard;