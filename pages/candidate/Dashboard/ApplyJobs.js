import React, { useState } from "react";

const ApplyJobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - replace with API call
  const allJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "Tech Corp",
      location: "Remote",
      type: "Full-time",
      salary: "$80,000 - $120,000",
      postedDate: "2026-04-22",
    },
    {
      id: 2,
      title: "React Developer",
      company: "StartupXYZ",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$70,000 - $100,000",
      postedDate: "2026-04-21",
    },
    {
      id: 3,
      title: "Junior Web Developer",
      company: "WebAgency",
      location: "Chicago, IL",
      type: "Part-time",
      salary: "$40,000 - $60,000",
      postedDate: "2026-04-20",
    },
    {
      id: 4,
      title: "UI Engineer",
      company: "DesignFirst",
      location: "Seattle, WA",
      type: "Full-time",
      salary: "$90,000 - $130,000",
      postedDate: "2026-04-19",
    },
    {
      id: 5,
      title: "JavaScript Developer",
      company: "CodeHub",
      location: "Remote",
      type: "Contract",
      salary: "$60 - $80/hour",
      postedDate: "2026-04-18",
    },
  ];

  const filteredJobs = allJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = (jobId) => {
    // Add your apply logic here
    alert(`Application submitted for job ID: ${jobId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        💼 Apply for New Jobs
      </h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search jobs by title, company, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company}</p>
            
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500">
                📍 {job.location}
              </p>
              <p className="text-xs text-gray-500">
                💼 {job.type}
              </p>
              <p className="text-xs text-gray-500">
                💰 {job.salary}
              </p>
              <p className="text-xs text-gray-400">
                Posted: {job.postedDate}
              </p>
            </div>
            
            <button
              onClick={() => handleApply(job.id)}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>
      
      {filteredJobs.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No jobs found matching your search.
        </p>
      )}
    </div>
  );
};

export default ApplyJobs;