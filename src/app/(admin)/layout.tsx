import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminNav } from '@/components/admin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?error=unauthorized');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard?error=not_admin');
  }

  return (
    <div className="flex min-h-screen bg-soo-bg-light">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 bg-white border-r border-soo-gray">
          <div className="flex items-center h-16 px-4 border-b border-soo-gray">
            <span className="text-xl font-heading font-bold text-soo-red">SOO</span>
            <span className="text-xl font-heading font-bold text-soo-dark ml-1">Admin</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto p-4">
            <AdminNav />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:pl-64">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
