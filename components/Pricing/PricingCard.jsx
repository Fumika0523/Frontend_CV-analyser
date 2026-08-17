import React from "react";
import { FiCheck } from "react-icons/fi";

const PricingCard = ({
  title,
  description,
  price,
  period,
  features = [],
  buttonLabel,
  onSelect,
  featured = false,
}) => {
  return (
    <div
      className={`relative text-center flex h-full flex-col rounded-2xl border bg-white py-6 px-10 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        featured
          ? "border-blue-600 ring-2 ring-blue-100"
          : "border-slate-200"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-700 px-4 py-1 text-sm font-semibold text-white text-nowrap">
          Most Popular
        </span>
      )}

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-2 min-h-[48px] text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-2">
        <span className="text-4xl font-bold text-slate-900">
          {price}
        </span>

        {period && (
          <span className="ml-1 text-sm text-slate-500">
            /{period}
          </span>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-2 text-center">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex justify-center gap-1 text-sm text-slate-600"
          >
            <FiCheck className="mt-0.5 shrink-0 h-5 w-5 text-green-600" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSelect}
        className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
          featured
            ? "bg-blue-700 text-white hover:bg-blue-800"
            : "border border-blue-700 text-blue-700 hover:bg-blue-50"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default PricingCard;