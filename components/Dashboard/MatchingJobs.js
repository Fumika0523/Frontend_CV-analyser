import React from "react";

const MatchingJobs = () => {
  // Mock data - replace with API call based on candidate profile
  const matchingJobs = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "InnovateTech",
      location: "Remote",
      matchScore: 95,
    },
    {
      id: 2,
      title: "Frontend Engineer",
      company: "WebSolutions",
      location: "New York, NY",
      matchScore: 88,
    },
    {
      id: 3,
      title: "JavaScript Developer",
      company: "CodeFactory",
      location: "San Francisco, CA",
      matchScore: 82,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        🎯 Jobs Matching Your Profile
      </h2>
      
      <div className="space-y-4">
        {matchingJobs.map((job) => (
          <div
            key={job.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <h3 className="font-medium text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company}</p>
            <p className="text-xs text-gray-500 mt-1">{job.location}</p>
            
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Match Score</span>
                <span className="text-xs font-medium text-green-600">
                  {job.matchScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${job.matchScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {matchingJobs.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No matching jobs found. Update your profile to get better matches.
        </p>
      )}
    </div>
  );
};

export default MatchingJobs;