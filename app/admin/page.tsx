"use client";

import AdminPanel from '@/components/admin-panel';
import { useUser } from '@clerk/nextjs';
import { SignInButton, SignOutButton } from '@clerk/nextjs';

export default function AdminPage() {
  const { user, isLoaded } = useUser();

  // If the user data is still loading, show a loading state
  if (!isLoaded) {
    console.log(isLoaded);

    return (<>
      {/* <p>Loading...</p> */}
      <SignInButton>
        <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 mb-2">Login</button>
      </SignInButton>
    </>);
  }

  const isAdmin = user?.publicMetadata?.role === 'admin';
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="mb-4">Bu sayfayı görüntüleme yetkiniz yok.</p>
        <SignInButton>
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 mb-2">Login</button>
        </SignInButton>
        <SignOutButton>
          <button className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700">Logout</button>
        </SignOutButton>
      </div>
    );
  }
  else {
    return (
      <div className="container mx-auto px-4 py-8">
        <AdminPanel />
      </div>
    );
  }
}
