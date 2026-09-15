import Banner from "../components/Banner";
import Candidate from "../components/Candidate";
import Career from "../components/Career";
import Navbar from "../components/Navbar";
import InterviewQuestion from "../components/InterviewQuestion";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      <Navbar />
      <Banner />
      <Candidate />
      <Career />
      <InterviewQuestion />
      <Footer />
    </div>
  );
};

export default Home;