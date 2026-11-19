import Link from "next/link";

export default function PaymentPage() {
  return (
    <main className="mx-auto max-w-screen-xl p-8">
      <Link href="/#pricing">
        <a className="text-blue-700 underline">View pricing plans</a>
      </Link>
    </main>
  );
}
