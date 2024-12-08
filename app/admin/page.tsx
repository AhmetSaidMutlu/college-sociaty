"use client";

import { redirect } from 'next/navigation';
import AdminPanel from '@/components/admin-panel';
import { useUser } from '@clerk/nextjs';
import { Container } from 'lucide-react';

export default function AdminPage() {
  const { user, isLoaded } = useUser();

  // If the user data is still loading, show a loading state
  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  const isAdmin = user?.publicMetadata?.role === 'admin';

  if (!isAdmin) {
    return (
      <Container>
        Bu sayfayı görüntüleme yetkiniz yok.
      </Container>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <AdminPanel />
    </div>
  );
}
