"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [city, setCity] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      router.push(`/city/${city.trim()}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Real Estate Project Listing</h1>

      <form onSubmit={handleSearch} className="mb-8 w-full max-w-md flex gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name (e.g. Hyderabad)"
          className="flex-1 p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm"
        >
          Search
        </button>
      </form>

      <p className="mb-4 text-lg">Or select a popular city:</p>
      <div className="flex gap-4">
        <Link
          href="/city/Hyderabad"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          Hyderabad
        </Link>
        <Link
          href="/city/Bangalore"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          Bangalore
        </Link>
        <Link
          href="/city/Mumbai"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          Mumbai
        </Link>
      </div>
    </div>
  );
}
