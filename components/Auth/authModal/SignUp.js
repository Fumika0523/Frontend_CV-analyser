const bcrypt = require("bcrypt");
const User = require("../Model/userModel");
const CV = require("../Model/cvModel");
const getNextSequence = require("../utils/getNextSequence");
const generateOTP = require("../utils/generateOTP");
const validateEmailForOtp = require("../utils/validateEmailForOtp");
const sendEmail = require("../utils/sendEmail");
const { otpEmailTemplate } = require("../utils/emailTemplates");

// If a candidate applied for jobs as a guest (no account yet) before
// signing up, their CVs are tagged with a guestSessionId instead of a
// candidateId. Once they create an account, re-link those CVs to the
// new candidateId and clear the guest tag.
const linkGuestCVsToCandidate = (guestSessionId, candidateId) =>
  CV.updateMany(
    { guestSessionId },
    { $set: { candidateId, guestSessionId: null } }
  );

exports.signUp = async (req, res) => {
  let user;

  try {
    const {
      firstName,
      lastName,
      // rawEmail: exactly what the user typed (req.body.email).
      // email (below): the validated, normalized version returned by
      // validateEmailForOtp — trimmed, lowercased, and confirmed to be
      // a real, deliverable address.
      email: rawEmail,
      password,
      role,
      phoneNumber,
      companyName,
      companyDescription,
      location,
      guestSessionId,
    } = req.body;

    // validateEmailForOtp never throws — it always resolves to
    // { status, email }. status is one of:
    //   "valid"           - format ok, domain has a working mail server
    //   "possible"        - format ok, domain exists but MX lookup was inconclusive
    //   "invalid-format"  - not shaped like an email at all
    //   "invalid-domain"  - domain doesn't exist / can't receive mail
    //   "unknown"         - DNS lookup itself failed (treat as "possible")
    const { status, email } = await validateEmailForOtp(rawEmail);

    if (status === "invalid-format" || status === "invalid-domain") {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists. Please login.",
      });
    }

    if (role === "company" && !companyName) {
      return res.status(400).json({
        message: "Company name is required for company account.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const userId = await getNextSequence("userId");

    const userData = {
      userId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
      location,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    };

    if (role === "company") {
      userData.companyName = companyName;
      userData.companyDescription = companyDescription;
    }

    user = await User.create(userData);

    if (role === "candidate" && guestSessionId) {
      await linkGuestCVsToCandidate(guestSessionId, userData.userId);
    }

    await sendEmail({
      to: email,
      subject: "Your SkillfulJobs.ai verification code",
      html: otpEmailTemplate(otp),
    });

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email",
      mongoId: user._id,
      userId: user.userId,
    });
  } catch (error) {
    console.error("SignUp error:", error);

    // Roll back the created user if anything failed after creation
    // (e.g. sending the OTP email), so we don't leave an unverifiable
    // account sitting in the database.
    if (user?._id) {
      await User.findByIdAndDelete(user._id);
    }

    if (error.name === "ValidationError" || error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Signup failed. Please try again.",
    });
  }
};