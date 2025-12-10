"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar automaticamente para /fs (Rooftop Floripa Square)
    router.replace("/fs");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-orange-500 mx-auto"></div>
        <p className="text-white text-lg">Redirecionando...</p>
      </div>
    </div>
  );
}
