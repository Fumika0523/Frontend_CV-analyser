// emailHelpers.js
// Small, shared helpers used by both SignInModal and SignUpModal.
// Keeping them here (instead of copy-pasted in each modal) means there is
// only one place to fix if the rules ever change.

// Basic format check: something@something.something
// This is NOT a replacement for the backend's validateEmailForOtp check,
// which also confirms the domain can actually receive mail (MX records).
// This is just a fast, free check to catch obvious typos before we make
// a network request.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) => EMAIL_REGEX.test(email.trim());

// Domains that belong to free/personal email providers.
// Used only to show a hint on the company sign-up form — it does not
// block submission.
export const FREE_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "mail.com",
  "ymail.com",
  "googlemail.com",
  "msn.com",
  "me.com",
  "mac.com",
];

export const isPersonalEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return FREE_DOMAINS.includes(domain);
};