// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import axios from "axios";

// import AuthModal from "../../Auth/authModal";
// import OtpModal from "../../Auth/otpModal";
// import SettingsModal from "../../Auth/settingsModal";
// import ButtonPrimary from "../../misc/ButtonPrimary";

// import {
//   FiInfo,
//   FiStar,
//   FiCreditCard,
//   FiMessageCircle,
//   FiGrid,
//   FiBriefcase,
//   FiFileText,
//   FiSearch,
//   FiUsers,
//   FiPlusCircle,
// } from "react-icons/fi";

// import {
//   FaSignInAlt,
//   FaUserPlus,
//   FaBuilding,
//   FaUser,
// } from "react-icons/fa";

// const EMPTY_SET_GUEST_VIEW = () => { };

// /*
//  * Guest navigation items all point to sections
//  * rendered on the homepage.
//  *
//  * The id must exactly match the section's HTML id:
//  *
//  * <section id="about">
//  * <section id="feature">
//  * <section id="pricing">
//  * <section id="testimonial">
//  */
// const NAV_GUEST = [
//   {
//     id: "about",
//     label: "About",
//     icon: FiInfo,
//   },
//   {
//     id: "feature",
//     label: "Feature",
//     icon: FiStar,
//   },
//   {
//     id: "pricing",
//     label: "Pricing",
//     icon: FiCreditCard,
//   },
//   {
//     id: "testimonial",
//     label: "Testimonial",
//     icon: FiMessageCircle,
//   },
// ];

// /*
//  * Candidate navigation.
//  *
//  * Pricing returns to the pricing section on the homepage.
//  */
// const NAV_CANDIDATE = [
//   {
//     label: "Dashboard",
//     href: "/candidate/dashboard",
//     icon: FiGrid,
//   },
//   {
//     label: "Latest Jobs",
//     href: "/candidate/Dashboard/LatestJobs",
//     icon: FiBriefcase,
//   },
//   {
//     label: "My Application",
//     href: "/candidate/Dashboard/MyApplication/MyApplicationPage",
//     icon: FiFileText,
//   },
//   {
//     label: "Your skills",
//     href: "/candidate/skills",
//     icon: FiSearch,
//   },
//   {
//     label: "Pricing",
//     href: "/#pricing",
//     icon: FiCreditCard,
//   },
// ];

// /*
//  * Company navigation.
//  *
//  * Pricing also returns to the homepage pricing section.
//  */
// const NAV_COMPANY = [
//   {
//     label: "Dashboard",
//     href: "/company/dashboard",
//     icon: FiGrid,
//   },
//   {
//     label: "Post a new job",
//     href: "/company/Dashboard/PostJob/postJobPage",
//     icon: FiPlusCircle,
//   },
//   {
//     label: "Posted Jobs",
//     href: "/company/Dashboard/PostedJobs/PostedJobsPage",
//     icon: FiBriefcase,
//   },
//   {
//     label: "Applicants",
//     href: "/company/Dashboard/Applicants/ApplicantsPage",
//     icon: FiUsers,
//   },
//   {
//     label: "Pricing",
//     href: "/#pricing",
//     icon: FiCreditCard,
//   },
// ];

// const Header = ({
//   guestView = "candidate",
//   setGuestView = EMPTY_SET_GUEST_VIEW,
// }) => {
//   const router = useRouter();

//   const [activeLink, setActiveLink] = useState(null);
//   const [scrollActive, setScrollActive] = useState(false);
//   const [settingsModalOpen, setSettingsModalOpen] =
//     useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [user, setUser] = useState(null);

//   /*
//    * Controls the Sign In and Sign Up modal.
//    */
//   const [authModal, setAuthModal] = useState({
//     isOpen: false,
//     mode: "signin",
//   });

//   /*
//    * Controls the OTP verification modal.
//    */
//   const [otpModal, setOtpModal] = useState({
//     isOpen: false,
//     _id: "",
//     email: "",
//   });

//   /*
//    * Returns the navigation links for the current
//    * logged-in account type.
//    */
//   const navLinks = user
//     ? user.role === "company"
//       ? NAV_COMPANY
//       : NAV_CANDIDATE
//     : [];

//   /*
//    * Builds the initials displayed inside the user avatar.
//    */
//   const initials = user
//     ? (
//       `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""
//       }` ||
//       user.name?.slice(0, 2) ||
//       "U"
//     ).toUpperCase()
//     : "";

//   /*
//    * Converts the user received from the backend into
//    * the structure used by this Header.
//    */
//   const normaliseUser = (userData) => {
//     if (!userData) return null;

//     return {
//       id: userData._id || userData.id,
//       userId: userData.userId,
//       firstName: userData.firstName || "",
//       lastName: userData.lastName || "",
//       name:
//         `${userData.firstName || ""} ${userData.lastName || ""
//           }`.trim() ||
//         userData.name ||
//         "User",
//       email: userData.email || "",
//       role: userData.role,
//       phoneNumber: userData.phoneNumber || "",
//       companyName: userData.companyName || "",
//       companyDescription:
//         userData.companyDescription || "",
//       location: userData.location || {
//         city: "",
//         country: "",
//       },
//     };
//   };

//   /*
//    * Runs when the AuthModal successfully signs in
//    * an existing user.
//    */
//   const handleAuthSuccess = (userData) => {
//     const authenticatedUser = normaliseUser(userData);

//     if (!authenticatedUser) return;

//     setUser(authenticatedUser);

//     if (authenticatedUser.role === "company") {
//       setGuestView("company");
//     } else {
//       setGuestView("candidate");
//     }
//   };

//   /*
//    * Runs when signup or sign-in requires OTP verification.
//    */
//   const handleOtpSent = (data) => {
//     const mongoId = data?._id;

//     if (!mongoId) {
//       console.error(
//         "OTP modal cannot open because _id is missing:",
//         data
//       );
//       return;
//     }

//     setAuthModal({
//       isOpen: false,
//       mode: "signin",
//     });

//     setOtpModal({
//       isOpen: true,
//       _id: mongoId,
//       email: data.email || "",
//     });
//   };

//   /*
//    * Clears the authentication token and returns
//    * the user to the homepage.
//    */
//   const handleLogout = async () => {
//     localStorage.removeItem("token");

//     setUser(null);
//     setDropdownOpen(false);
//     setGuestView("candidate");

//     await router.push("/");
//   };

//   /*
//    * Scrolls to a homepage section.
//    *
//    * If the user is already on the homepage, it scrolls
//    * directly.
//    *
//    * If the user is on another page, it first returns
//    * to the homepage using the section hash.
//    */
//   const handleHomepageSectionClick = async (sectionId) => {
//     setActiveLink(sectionId);

//     if (router.pathname === "/") {
//       const section =
//         document.getElementById(sectionId);

//       if (!section) {
//         console.warn(
//           `Homepage section with id "${sectionId}" was not found.`
//         );
//         return;
//       }

//       section.scrollIntoView({
//         behavior: "smooth",
//         block: "start",
//       });

//       return;
//     }

//     await router.push(`/#${sectionId}`);
//   };

//   /*
//    * Adds a small Header shadow after the page is scrolled.
//    */
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrollActive(window.scrollY > 20);
//     };

//     window.addEventListener("scroll", handleScroll);
//     handleScroll();

//     return () => {
//       window.removeEventListener(
//         "scroll",
//         handleScroll
//       );
//     };
//   }, []);

//   /*
//    * Closes the account dropdown when the user clicks
//    * elsewhere on the page.
//    */
//   useEffect(() => {
//     const closeDropdown = () => {
//       setDropdownOpen(false);
//     };

//     if (dropdownOpen) {
//       document.addEventListener(
//         "click",
//         closeDropdown
//       );
//     }

//     return () => {
//       document.removeEventListener(
//         "click",
//         closeDropdown
//       );
//     };
//   }, [dropdownOpen]);

//   /*
//    * When navigating to /#pricing, /#feature, and similar
//    * routes, scroll to the correct section after the page
//    * has finished loading.
//    */
//   useEffect(() => {
//     const scrollToHashSection = () => {
//       if (router.pathname !== "/") return;

//       const hash = window.location.hash.replace(
//         "#",
//         ""
//       );

//       if (!hash) return;

//       /*
//        * A small delay allows the homepage components
//        * to finish rendering before finding the section.
//        */
//       window.setTimeout(() => {
//         const section =
//           document.getElementById(hash);

//         if (section) {
//           section.scrollIntoView({
//             behavior: "smooth",
//             block: "start",
//           });

//           setActiveLink(hash);
//         }
//       }, 100);
//     };

//     scrollToHashSection();

//     router.events.on(
//       "routeChangeComplete",
//       scrollToHashSection
//     );

//     return () => {
//       router.events.off(
//         "routeChangeComplete",
//         scrollToHashSection
//       );
//     };
//   }, [router.pathname, router.events]);

//   /*
//    * Loads the logged-in user when the Header first mounts.
//    */
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token =
//           localStorage.getItem("token");

//         if (!token) {
//           setUser(null);
//           return;
//         }

//         const response = await axios.get(
//           "http://localhost:8002/user-profile",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         const fetchedUser =
//           normaliseUser(response.data.user);

//         if (!fetchedUser) {
//           setUser(null);
//           return;
//         }

//         setUser(fetchedUser);

//         if (fetchedUser.role === "company") {
//           setGuestView("company");
//         } else {
//           setGuestView("candidate");
//         }
//       } catch (error) {
//         console.error(
//           "Failed to fetch user:",
//           error.response?.data ||
//           error.message
//         );

//         const status =
//           error.response?.status;

//         const message =
//           error.response?.data?.message;

//         const tokenErrors = [
//           "jwt expired",
//           "invalid token",
//           "Invalid token",
//         ];

//         if (
//           status === 401 &&
//           tokenErrors.includes(message)
//         ) {
//           localStorage.removeItem("token");
//           setUser(null);
//         }
//       }
//     };

//     fetchUser();
//   }, [setGuestView]);

//   return (
//     <>
//       {/* Desktop header */}
//     <header
//   className={`fixed top-0 z-30 w-full border-b transition-all duration-300 ${
//     scrollActive
//       ? "border-slate-200/80 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl"
//       : "border-transparent bg-transparent shadow-none"
//   }`}
// >
//         <nav className="mx-auto grid max-w-screen-xl grid-flow-col items-center px-6 py-3 sm:px-8 sm:py-4 lg:px-16">
//           {/* Logo */}
//          <Link href="/">
//   <a className="col-start-1 col-end-2 flex items-center gap-2.5">
//     <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-sky-400 text-white shadow-sm">
//       <FiBriefcase aria-hidden="true" size={18} />
//     </span>

//     <span className="text-xl font-bold tracking-tight text-[#0f2f68]">
//       SkillfulJobs
//       <span className="text-blue-600">.ai</span>
//     </span>
//   </a>
// </Link>

//           {/* Desktop navigation */}
//           <ul className="col-start-4 col-end-8 hidden items-center text-slate-200  lg:flex">
//             {user
//               ? navLinks.map((item) => {
//                 const Icon = item.icon;

//                 const isActive =
//                   router.asPath === item.href;

//                 return (
//                   <li key={item.href}>
//                     <Link href={item.href}>
//                      <a
//   className={`group mx-1 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm  font-medium transition-all duration-200 ${
//     activeLink === item.id
//       ? "bg-blue-50 text-blue-900"
//       : "text-slate-600 hover:bg-sky-100/40 hover:text-slate-900"
//   }`}
// >
//   <Icon
//     aria-hidden="true"
//     className={`h-5 w-5 transition-colors ${
//       isActive
//         ? "text-sky-500"
//         : "text-blue-700 group-hover:text-sky-500"
//     }`}
//   />

//   {item.label}
// </a>
//                     </Link>
//                   </li>
//                 );
//               })
//               : NAV_GUEST.map((item) => {
//                 const Icon = item.icon;

//                 return (
//                   <li key={item.id}>
//                    <button
//   type="button"
//   onClick={() =>
//     handleHomepageSectionClick(item.id)
//   }
//   className={`group mx-1 inline-flex items-center gap-1 rounded-lg bg-transparent px-3 py-2 text-sm font-medium transition-all duration-200 ${
//     activeLink === item.id
//       ? "bg-blue-50 text-blue-900"
//       : "text-slate-600 hover:bg-sky-100/40 hover:text-slate-900"
//   }`}
// >
//   <Icon
//     aria-hidden="true"
//     className={`h-5 w-5 transition-colors ${
//       activeLink === item.id
//         ? "text-sky-600"
//         : "text-blue-700 group-hover:text-blue-400"
//     }`}
//   />

//   {item.label}
// </button>
//                   </li>
//                 );
//               })}
//           </ul>

//           {/* Authentication and account area */}
//           <div className="col-start-10 col-end-12 flex items-center justify-end gap-3 font-medium">
//             {user ? (
//               <div className="relative flex items-center gap-3">
//                 {/* Current account role */}
//                 <span
//   className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
//     user.role === "company"
//       ? "border-emerald-200 bg-emerald-50 text-emerald-700"
//       : "border-blue-200 bg-blue-50 text-blue-700"
//   }`}
// >
//   {user.role === "company" ? (
//     <>
//       <FaBuilding aria-hidden="true" />
//       Company
//     </>
//   ) : (
//     <>
//       <FaUser aria-hidden="true" />
//       Candidate
//     </>
//   )}
// </span>

//                 {/* Account avatar and dropdown */}
//                 <div className="relative">
//                   <button
//                     type="button"
//                     aria-label="Open account menu"
//                     onClick={(event) => {
//                       event.stopPropagation();

//                       setDropdownOpen(
//                         (previous) => !previous
//                       );
//                     }}
//                     className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-slate-900 to-blue-700 text-xs font-bold text-white shadow-[0_0_0_2px_#0f172a] transition hover:shadow-[0_0_0_3px_#1d4ed8]"
//                   >
//                     {initials}
//                   </button>

//                   {dropdownOpen && (
//                     <div
//                       onClick={(event) =>
//                         event.stopPropagation()
//                       }
//                       className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[180px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
//                     >
//                       {user.role ===
//                         "candidate" && (
//                           <Link href="/candidate/viewMyCVs">
//                             <a className="block w-full rounded-lg px-3.5 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 hover:text-blue-600">
//                               📄 Uploaded CV
//                             </a>
//                           </Link>
//                         )}

//                       <button
//                         type="button"
//                         onClick={() => {
//                           setSettingsModalOpen(true);
//                           setDropdownOpen(false);
//                         }}
//                         className="block w-full rounded-lg px-3.5 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
//                       >
//                         ⚙️ Settings
//                       </button>

//                       <div className="my-1 border-t border-blue-100" />

//                       <button
//                         type="button"
//                         onClick={handleLogout}
//                         className="block w-full rounded-lg px-3.5 py-2 text-left text-sm text-slate-700 transition hover:bg-red-50 hover:text-rose-600"
//                       >
//                         🚪 Sign Out
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <>
//                 {/* Candidate/company guest view toggle */}
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setGuestView(
//                       guestView === "candidate"
//                         ? "company"
//                         : "candidate"
//                     )
//                   }
//                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100">
//                   <span className="text-lg md:hidden">
//                     {guestView === "candidate" ? (
//                       <FaBuilding />
//                     ) : (
//                       <FaUser />
//                     )}
//                   </span>

//                   <span className="hidden items-center gap-2 md:flex">
//                     {guestView === "candidate" ? (
//                       <>
//                         <FaBuilding className="text-lg" />
//                         Recruiting? Post a job
//                       </>
//                     ) : (
//                       <>
//                         <FaUser className="text-lg" />
//                         Apply for new job
//                       </>
//                     )}
//                   </span>
//                 </button>

//                 {/* Sign In */}
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setAuthModal({
//                       isOpen: true,
//                       mode: "signin",
//                     })
//                   }
//                   className="mx-2 cursor-pointer text-slate-600 transition hover:text-blue-800 sm:mx-4"
//                 >
//                   <span className="inline text-lg md:hidden">
//                     <FaSignInAlt />
//                   </span>

//                   <span className="hidden md:inline">
//                     Sign In
//                   </span>
//                 </button>

//                 {/* Sign Up */}
//                 <ButtonPrimary
//                   onClick={() =>
//                     setAuthModal({
//                       isOpen: true,
//                       mode: "signup",
//                     })
//                   }
//                 >
//                   <span className="inline text-lg md:hidden">
//                     <FaUserPlus />
//                   </span>

//                   <span className="hidden md:inline">
//                     Sign Up
//                   </span>
//                 </ButtonPrimary>
//               </>
//             )}
//           </div>
//         </nav>
//       </header>

//       {/* Mobile bottom navigation */}
//       <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white shadow-lg lg:hidden">
//         <div className="px-2 sm:px-6">
//           <ul className="flex w-full items-center justify-around overflow-x-auto text-slate-600">
//             {user
//               ? navLinks.map((item) => {
//                 const Icon = item.icon;

//                 const isActive =
//                   router.asPath === item.href;

//                 return (
//                   <li key={item.href}>
//                     <Link href={item.href}>
//                       <a
//                         className={`flex min-w-[78px]  shrink-0 flex-col items-center border-t-2 px-2 py-2 text-xs transition ${
//                           isActive
//                             ? "border-blue-700 text-blue-700"
//                             : "border-transparent text-sky-600 hover:border-blue-700 hover:text-sky-600"
//                           }`}
//                       >
//                         <Icon className="mb-0.5 h-5 w-5 text-blue-900" />

//                         <span className="whitespace-nowrap">
//                           {item.label}
//                         </span>
//                       </a>
//                     </Link>
//                   </li>
//                 );
//               })
//               : NAV_GUEST.map((item) => {
//                 const Icon = item.icon;

//                 return (
//                   <li key={item.id}>
//                     <button
//                       type="button"
//                       onClick={() =>
//                         handleHomepageSectionClick(
//                           item.id
//                         )
//                       }
//                       className={`mx-1 flex min-w-[70px] flex-col items-center border-t-2 bg-transparent px-2 py-2 text-xs transition ${activeLink === item.id
//                           ? "border-blue-700 text-blue-700"
//                           : "border-transparent text-slate-600 hover:border-blue-700 hover:text-blue-700"
//                         }`}
//                     >
//                       <Icon className="mb-0.5 h-5 w-5" />
//                       <span>{item.label}</span>
//                     </button>
//                   </li>
//                 );
//               })}
//           </ul>
//         </div>
//       </nav>

//       {/* Authentication modal */}
//       <AuthModal
//         isOpen={authModal.isOpen}
//         initialMode={authModal.mode}
//         initialRole={guestView}
//         onClose={() =>
//           setAuthModal({
//             isOpen: false,
//             mode: "signin",
//           })
//         }
//         onAuthSuccess={handleAuthSuccess}
//         onOtpSent={handleOtpSent}
//       />

//       {/* OTP verification modal */}
//       {otpModal.isOpen && (
//         <OtpModal
//           isOpen={otpModal.isOpen}
//           _id={otpModal._id}
//           email={otpModal.email}
//           onClose={() =>
//             setOtpModal({
//               isOpen: false,
//               _id: "",
//               email: "",
//             })
//           }
//           onVerified={(data) => {
//             if (data?.token) {
//               localStorage.setItem(
//                 "token",
//                 data.token
//               );
//             }

//             localStorage.removeItem(
//               "guest_session_id"
//             );

//             const verifiedUser =
//               normaliseUser(data?.user);

//             if (verifiedUser) {
//               handleAuthSuccess(verifiedUser);
//             }

//             setOtpModal({
//               isOpen: false,
//               _id: "",
//               email: "",
//             });

//             if (
//               verifiedUser?.role === "company"
//             ) {
//               router.push("/company/dashboard");
//             } else {
//               router.push("/candidate/dashboard");
//             }
//           }}
//         />
//       )}

//       {/* Account settings modal */}
//       {settingsModalOpen && (
//         <SettingsModal
//           isOpen={settingsModalOpen}
//           user={user}
//           onClose={() =>
//             setSettingsModalOpen(false)
//           }
//           onUserUpdated={(updatedUser) => {
//             const normalisedUpdatedUser =
//               normaliseUser(updatedUser);

//             setUser(normalisedUpdatedUser);
//             setSettingsModalOpen(false);
//           }}
//         />
//       )}
//     </>
//   );
// };

// export default Header;