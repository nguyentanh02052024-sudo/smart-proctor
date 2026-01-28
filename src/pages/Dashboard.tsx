import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      {profile?.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
    </DashboardLayout>
  );
}
