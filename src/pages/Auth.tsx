import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';
import { Shield, Eye, Clock, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Chống gian lận',
    description: 'Phát hiện chuyển tab, thu nhỏ trình duyệt',
  },
  {
    icon: Eye,
    title: 'Giám sát camera',
    description: 'Theo dõi học sinh trong suốt bài thi',
  },
  {
    icon: Clock,
    title: 'Thời gian thực',
    description: 'Log vi phạm realtime cho giáo viên',
  },
  {
    icon: CheckCircle,
    title: 'Chấm điểm tự động',
    description: 'Tự động chấm trắc nghiệm ngay lập tức',
  },
];

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">
            ExamGuard
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Nền tảng thi trực tuyến an toàn với hệ thống chống gian lận tiên tiến
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20"
            >
              <feature.icon className="w-10 h-10 text-primary-foreground mb-4" />
              <h3 className="font-semibold text-primary-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-primary-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>

        <p className="text-primary-foreground/60 text-sm">
          © 2024 ExamGuard. Được phát triển cho giáo dục Việt Nam.
        </p>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <AuthForm />
      </div>
    </div>
  );
}
