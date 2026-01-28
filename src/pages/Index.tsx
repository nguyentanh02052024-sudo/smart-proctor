import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Shield, 
  Eye, 
  Clock, 
  CheckCircle, 
  Users,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Chống gian lận mạnh mẽ',
    description: 'Phát hiện chuyển tab, thu nhỏ trình duyệt, mở tab mới và cảnh báo ngay lập tức.',
  },
  {
    icon: Eye,
    title: 'Giám sát camera',
    description: 'Yêu cầu bật camera trong suốt thời gian làm bài, ghi log khi tắt camera.',
  },
  {
    icon: Clock,
    title: 'Log thời gian thực',
    description: 'Giáo viên theo dõi realtime mọi vi phạm của học sinh trong khi thi.',
  },
  {
    icon: CheckCircle,
    title: 'Chấm điểm tự động',
    description: 'Tự động chấm câu trắc nghiệm, hỗ trợ chấm tự luận thủ công.',
  },
];

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container relative">
          <nav className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">ExamGuard</span>
            </div>
            <Button onClick={handleGetStarted} variant="outline">
              {user ? 'Vào Dashboard' : 'Đăng nhập'}
            </Button>
          </nav>

          <div className="py-20 md:py-32 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm mb-8">
              <Shield className="w-4 h-4" />
              Hệ thống thi trực tuyến an toàn #1 Việt Nam
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold max-w-4xl mx-auto leading-tight">
              Kiểm tra trực tuyến
              <span className="bg-gradient-primary bg-clip-text text-transparent"> chống gian lận </span>
              cho trường học
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Nền tảng thi trực tuyến với giám sát camera, phát hiện chuyển tab, 
              và log vi phạm realtime. Được thiết kế cho giáo viên và học sinh Việt Nam.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="gap-2 text-lg px-8">
                Bắt đầu miễn phí
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                <Users className="w-5 h-5" />
                Xem demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Tính năng nổi bật
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Mọi công cụ bạn cần để tổ chức kỳ thi trực tuyến an toàn và hiệu quả
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-background border border-border shadow-soft hover:shadow-medium transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container">
          <div className="bg-gradient-hero rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Đăng ký miễn phí ngay hôm nay và tạo bài kiểm tra đầu tiên của bạn trong vài phút.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleGetStarted}
              className="gap-2 text-lg px-8"
            >
              Đăng ký miễn phí
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">ExamGuard</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 ExamGuard. Được phát triển cho giáo dục Việt Nam.
          </p>
        </div>
      </footer>
    </div>
  );
}
