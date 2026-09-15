import { footerStyles as s } from "../assets/dummyStyles";
import logo from "../assets/logo.png";
import Companylogo from "../assets/hexagonlogo.png";
import { LuFacebook, LuInstagram, LuLinkedin, LuTwitter } from "react-icons/lu";
import { Mail, MapPin, Phone } from "lucide-react"; // Removed unused icons

// social icons
const SocialIcan = ({ href, icon, label }) => (
  <a href={href} aria-label={label} className={s.socialIcon}>
    {icon}
  </a>
);

// footer links (Fixed 'Children' to 'children' so the text renders)
const FooterLink = ({ href, children }) => (
  <li>
    <a href={href} className={s.footerLinkItem}>
      <span className={s.footerLinkText}>{children}</span>
    </a>
  </li>
);

// for contact
const ContactItem = ({ icon, text, href }) => (
  <div className={s.contactItemContainer}>
    <div className={s.contactIconWrapper}>{icon}</div>
    {href ? (
      <a href={href} className={s.contactText}>
        {text}
      </a>
    ) : (
      <span className={s.contactTextNoLink}>{text}</span>
    )}
  </div>
);

const Footer = () => {
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <div className={s.grid}>
          
          {/* Company Section */}
          <div className={s.companySection}>
            <div className={s.logoWrapper}>
              <a href="/" className={s.logoLink}>
                <img src={logo} alt="logo" className={s.logoImage} />
              </a>
              <div>
                <h2 className={s.companyTitle}>JobPortal</h2>
                <p className={s.companyTagline}> Find Your Dream Job</p>
              </div>
            </div>
            <p className={s.companyDescription}>
              Connecting talented professionals with top companies worldwide.
              Your career journey starts here.
            </p>

            <div className={s.socialIconsContainer}>
              <SocialIcan
                href="#"
                icon={<LuLinkedin className=" w-4 h-4 sm:w-5 sm:h-5 " />}
                label="Linkedin"
              />
              <SocialIcan
                href="#"
                icon={<LuTwitter className=" w-4 h-4 sm:w-5 sm:h-5 " />}
                label="Twitter"
              />
              <SocialIcan
                href="#"
                icon={<LuFacebook className=" w-4 h-4 sm:w-5 sm:h-5 " />}
                label="Facebook"
              />
              <SocialIcan
                href="#"
                icon={<LuInstagram className=" w-4 h-4 sm:w-5 sm:h-5 " />}
                label="Instagram"
              />
            </div>
          </div>

          {/* Quick Links Section - Icons removed to match screenshot */}
          <div>
            <h3 className={s.sectionHeader}>Quick Links</h3>
            <ul className={s.linkList}>
              <FooterLink href="/jobs">Find Jobs</FooterLink>
              <FooterLink href="/companies">Companies</FooterLink>
              <FooterLink href="/roles">Roles</FooterLink>
              <FooterLink href="/saved">Saved</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </ul>
          </div>
          
          {/* For Employers Section - Icons removed to match screenshot */}
          <div>
            <h3 className={s.sectionHeader}>For Employers</h3>
            <ul className={s.linkList}>
              <FooterLink href="/">Post a Job</FooterLink>
              <FooterLink href="/">Pricing</FooterLink>
              <FooterLink href="/">Recruitment Solutions</FooterLink>
              <FooterLink href="/">Employer Dashboard</FooterLink>
              <FooterLink href="/">Employer Branding</FooterLink>
            </ul>
          </div>

          {/* Contact Info Section */}
          <div>
            <h3 className={s.sectionHeader}>Contact Us</h3>
            <div className={s.contactList}>
              <ContactItem
                icon={<Mail className=" w-4 h-4 sm:w-5 sm:h-5" />}
                text="support@jobportal.com"
                href="mailto:support@jobportal.com"
              />
              <ContactItem
                icon={<Phone className=" w-4 h-4 sm:w-5 sm:h-5" />}
                text="+880 1819776678"
                href="tel:+15551234567"
              />
              <ContactItem
                icon={<MapPin className=" w-4 h-4 sm:w-5 sm:h-5" />}
                text="29, Munshipara, Khulna-9100"
              />
            </div>
          </div>
        </div>

        <div className={s.divider}></div>
        <div className={s.bottomFooter}>
          <img src={Companylogo} alt="logo" className={s.bottomLogo} />
          <span className={s.designedByText}>Designed by</span>
          <a
            href="https://claude.ai/new"
            target="_blank"
            rel="noopener noreferrer"
            className={s.designedByLink}
          >
            BeeCode Digital Services
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;