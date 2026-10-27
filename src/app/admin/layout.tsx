import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#040d0a] text-white selection:bg-[#22c55e]/20">{children}</div>;
}
