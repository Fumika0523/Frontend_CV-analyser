import {
  FiInfo,
  FiStar,
  FiCreditCard,
  FiMessageCircle,
  FiGrid,
  FiBriefcase,
  FiFileText,
  FiSearch,
  FiUsers,
  FiPlusCircle,
} from "react-icons/fi";

/*
 * Guest navigation items all point to sections rendered
 * on the homepage. The id must exactly match the
 * section's HTML id:
 *
 * <section id="about">
 * <section id="feature">
 * <section id="pricing">
 * <section id="testimonial">
 */
export const NAV_GUEST = [
  { id: "about", label: "About", icon: FiInfo },
  { id: "feature", label: "Feature", icon: FiStar },
  { id: "pricing", label: "Pricing", icon: FiCreditCard },
  { id: "testimonial", label: "Testimonial", icon: FiMessageCircle },
];

/*
 * Candidate navigation. Pricing returns to the
 * pricing section on the homepage.
 */
export const NAV_CANDIDATE = [
  { label: "Dashboard", href: "/candidate/dashboard", icon: FiGrid },
  { label: "Latest Jobs", href: "/candidate/Dashboard/LatestJobs", icon: FiBriefcase },
  { label: "My Application", href: "/candidate/Dashboard/MyApplication/MyApplicationPage", icon: FiFileText },
  { label: "Your skills", href: "/candidate/skills", icon: FiSearch },
  { label: "Pricing", href: "/#pricing", icon: FiCreditCard },
];

/*
 * Company navigation. Pricing also returns to the
 * homepage pricing section.
 */
export const NAV_COMPANY = [
  { label: "Dashboard", href: "/company/dashboard", icon: FiGrid },
  { label: "Post a new job", href: "/company/Dashboard/PostJob/postJobPage", icon: FiPlusCircle },
  { label: "Posted Jobs", href: "/company/Dashboard/PostedJobs/PostedJobsPage", icon: FiBriefcase },
  { label: "Applicants", href: "/company/Dashboard/Applicants/ApplicantsPage", icon: FiUsers },
  { label: "Pricing", href: "/#pricing", icon: FiCreditCard },
];