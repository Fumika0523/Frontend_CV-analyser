export const pricingPlans = {
  candidate: [
    {
      id: "candidate-free",
      title: "Free",
      description:
        "Explore SkillfulJobs.ai and submit your first applications.",
      price: "£0",
      period: "",
      buttonLabel: "Start Free",
      features: [
        "only for 7 days",
        "3 job applications",
        "Upload and store your CV",
        "Automatic skills extraction",
        "Job recommendations",
        "Private candidate profile",
      ],
    },
    {
      id: "candidate-monthly",
      title: "Premium Monthly",
      description:
        "For candidates actively searching for their next role.",
      price: "£7.99",
      period: "month",
      buttonLabel: "Choose Monthly",
      featured: true,
      features: [
        "Unlimited job applications",
        "Advanced job matching",
        "Detailed match scores",
        "Matched and missing skills",
        "Application status tracking",
        "Private platform messaging",
        "Priority access to new jobs",
      ],
    },
    {
      id: "candidate-yearly",
      title: "Premium Yearly",
      description:
        "The best value for a longer-term job search.",
      price: "£69.99",
      period: "year",
      buttonLabel: "Choose Yearly",
      features: [
        "Everything in Premium Monthly",
        "Unlimited job applications",
        "Save approximately £26 per year",
        "Future premium features included",
        "Priority customer support",
      ],
    },
  ],

  company: [
    {
      id: "company-single",
      title: "Single Job",
      description:
        "Suitable for employers making an occasional hire.",
      price: "£39",
      period: "job",
      buttonLabel: "Post One Job",
      features: [
        "1 job post",
        "Advert live for 30 days",
        "AI candidate matching",
        "Applicant management",
        "Platform messaging",
      ],
    },
    {
      id: "company-starter",
      title: "Starter",
      description:
        "For small companies with regular hiring needs.",
      price: "£79",
      period: "month",
      buttonLabel: "Choose Starter",
      features: [
        "Up to 10 job posts per month",
        "AI candidate recommendations",
        "Applicant status management",
        "Candidate match scores",
        "Platform messaging",
        "Company dashboard",
      ],
    },
    {
      id: "company-growth",
      title: "Growth",
      description:
        "For recruiters and growing hiring teams.",
      price: "£149",
      period: "month",
      buttonLabel: "Choose Growth",
      featured: true,
      features: [
        "Up to 30 job posts per month",
        "Everything in Starter",
        "Priority job visibility",
        "Advanced candidate matching",
        "Team applicant management",
        "Priority support",
      ],
    },
    {
      id: "company-unlimited-yearly",
      title: "Unlimited",
      description:
        "Annual hiring access for high-volume recruitment.",
      price: "£999",
      period: "year",
      buttonLabel: "Choose Annual",
      features: [
        "Unlimited job posts",
        "12 months of access",
        "Everything in Growth",
        "Employer branding tools",
        "Priority candidate matching",
        "Fair-use policy applies",
      ],
    },
  ],
};

export const pricingContent = {
  candidate: {
    badge: "Candidate Pricing",
    title: "Find the right job while keeping your details private",
    description:
      "Start with three free applications. Upgrade when you need unlimited applications and advanced matching tools.",
    noticeTitle: "Your privacy matters",
    noticeText:
      "Personal contact details can be hidden from the CV shown to recruiters. Recruiters communicate with you through SkillfulJobs.ai, helping reduce unwanted contact and keeping your information private.",
    footerText:
      "Prices are introductory and may change before the official launch. Subscriptions can be cancelled before renewal.",
  },

  company: {
    badge: "Recruiter Pricing",
    title: "Hire suitable candidates without expensive agency fees",
    description:
      "Publish jobs, receive matched candidates and manage every application from one secure hiring dashboard.",
    noticeTitle: "Better candidate matching",
    noticeText:
      "Candidate recommendations are based on job skills and location, with transparent matched skills, missing skills and an overall match score.",
    footerText:
      "Prices exclude VAT where applicable. Introductory pricing may change before the official launch.",
  },
};