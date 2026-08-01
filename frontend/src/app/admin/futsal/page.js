"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminFutsal() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/gestion-deportiva');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-gray-500 font-bold animate-pulse">Redirigiendo a Gestión Deportiva & Futsal Unificada...</p>
    </div>
  );
}
