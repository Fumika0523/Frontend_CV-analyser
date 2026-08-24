import {
  FaInfoCircle,
  FaStar,
  FaCreditCard,
  FaComments,
  FaTachometerAlt,
  FaBriefcase,
  FaFileAlt,
  FaTools,
  FaUsers,
  FaPlusCircle,
} from "react-icons/fa";

/*
 * Guest navigation items all point to sections rendered
 * on the homepage.
 */
export const NAV_GUEST = [
  {
    id: "about",
    label: "About",
    icon: FaInfoCircle,
  },
  {
    id: "feature",
    label: "Feature",
    icon: FaStar,
  },
  {
    id: "pricing",
    label: "Pricing",
    icon: FaCreditCard,
  },
  {
    id: "testimonial",
    label: "Testimonial",
    icon: FaComments,
  },
];

/*
 * Candidate navigation
 */
export const NAV_CANDIDATE = [
  {
    label: "Dashboard",
    href: "/candidate/dashboard",
    icon: FaTachometerAlt,
  },
  {
    label: "Latest Jobs",
    href: "/candidate/Dashboard/LatestJobs",
    icon: FaBriefcase,
  },
  {
    label: "My Application",
    href: "/candidate/Dashboard/MyApplication/MyApplicationPage",
    icon: FaFileAlt,
  },
  {
    label: "Your Skills",
    href: "/candidate/skills",
    icon: FaTools,
  },
  {
    label: "Pricing",
    href: "/#pricing",
    icon: FaCreditCard,
  },
];

/*
 * Company navigation
 */
export const NAV_COMPANY = [
  {
    label: "Dashboard",
    href: "/company/dashboard",
    icon: FaTachometerAlt,
  },
  {
    label: "Post a New Job",
    href: "/company/Dashboard/PostJob/postJobPage",
    icon: FaPlusCircle,
  },
  {
    label: "Posted Jobs",
    href: "/company/Dashboard/PostedJobs/PostedJobsPage",
    icon: FaBriefcase,
  },
  {
    label: "Applicants",
    href: "/company/Dashboard/Applicants/ApplicantsPage",
    icon: FaUsers,
  },
  {
    label: "Pricing",
    href: "/#pricing",
    icon: FaCreditCard,
  },
];