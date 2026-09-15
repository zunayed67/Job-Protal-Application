import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AddJobs from "./pages/AddJobs";
import ListJob from "./pages/ListJob";
import CompanyPage from "./pages/CompanyPage";
import CompanyQuestion from "./pages/CompanyQuestion";
import ListCompanyQs from "./pages/ListCompanyQs";
import RoleQuestion from "./pages/RoleQuestion";
import ListRoleQS from "./pages/ListRoleQS";
import ApplicantsPage from "./pages/ApplicantsPage";
import { useState } from "react";
import { useEffect } from "react";
import {useLocation} from "react-router-dom";
import {SquareArrowUp} from "lucide-react";

const App = () => {
  const location = useLocation();
  const [showTopBtn, setShowTopBtn] = useState(false);

  /* Scroll to top on route change */
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  /* Show button when scrolling */
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Scroll to top click */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <div className=" min-h-screen w-full overflow-x-hidden antialiased">
      <div className=" min-w-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/addjobs" element={<AddJobs />} />
          <Route path="/list/jobs" element={<ListJob />} />
          <Route path="/companies" element={<CompanyPage />} />
          <Route path="/company-questions" element={<CompanyQuestion />} />
          <Route path="/list/company-questions" element={<ListCompanyQs />} />
          <Route path="/role-questions" element={<RoleQuestion />} />
          <Route path="/list/role-questions" element={<ListRoleQS />} />
          <Route path="/applicants" element={<ApplicantsPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>

      {
  showTopBtn && (
    <button
      onClick={scrollToTop}
      className="
            fixed bottom-6 right-6
             text-white
            p-3 rounded-full
            shadow-lg 
            transition-all duration-300
            cursor-pointer
            z-50
             bg-blue-400  hover:bg-blue-600
          "
    >
      <SquareArrowUp size={22} />
    </button>
  )
}
    </div>
  );
};

export default App;
