import React from "react";

const ApplicantsTable = ({ applicantsData }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        Applicants
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-3">Name</th>
            <th className="py-3">Job Title</th>
            <th className="py-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {applicantsData?.map((applicant) => (
            <tr key={applicant._id} className="border-b">
              <td className="py-3">
                {applicant.candidateName}
              </td>

              <td className="py-3">
                {applicant.title}
              </td>

              <td className="py-3 capitalize">
                {applicant.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicantsTable;