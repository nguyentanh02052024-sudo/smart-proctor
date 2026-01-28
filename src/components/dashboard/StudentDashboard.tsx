import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  FileText, 
  CheckCircle, 
  PlayCircle,
  Calendar,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data for demonstration
const mockAvailableExams = [
  {
    id: '1',
    title: 'Kiểm tra Toán học - Chương 1',
    description: 'Đại số và phương trình',
    duration_minutes: 45,
    questions_count: 20,
    teacher_name: 'Nguyễn Văn A',
    start_time: '2024-01-25 08:00',
    end_time: '2024-01-25 17:00',
  },
  {
    id: '2',
    title: 'Bài thi Vật lý giữa kỳ',
    description: 'Cơ học và động lực học',
    duration_minutes: 90,
    questions_count: 40,
    teacher_name: 'Trần Thị B',
    start_time: '2024-01-26 09:00',
    end_time: '2024-01-26 11:00',
  },
];

const mockCompletedExams = [
  {
    id: '3',
    title: 'Quiz Tiếng Anh - Unit 4',
    score: 85,
    total: 100,
    submitted_at: '2024-01-20',
    status: 'passed',
  },
  {
    id: '4',
    title: 'Kiểm tra Hóa học - Bài 3',
    score: 72,
    total: 100,
    submitted_at: '2024-01-18',
    status: 'passed',
  },
];

const stats = [
  { label: 'Bài đã làm', value: '8', icon: FileText, color: 'text-primary' },
  { label: 'Điểm TB', value: '82', icon: Trophy, color: 'text-success' },
  { label: 'Hoàn thành', value: '100%', icon: CheckCircle, color: 'text-accent-foreground' },
];

export function StudentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-display font-bold">
          Xin chào, {profile?.full_name?.split(' ').pop()}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Bạn có {mockAvailableExams.length} bài kiểm tra đang chờ
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-medium">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-display font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-accent ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Exams */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-4">Bài kiểm tra sắp tới</h2>
        <div className="grid gap-4">
          {mockAvailableExams.map((exam) => (
            <Card key={exam.id} className="border-0 shadow-soft hover:shadow-medium transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{exam.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{exam.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exam.duration_minutes} phút
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {exam.questions_count} câu hỏi
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {exam.end_time}
                      </span>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="gap-2"
                    onClick={() => navigate(`/exam/${exam.id}/take`)}
                  >
                    <PlayCircle className="w-5 h-5" />
                    Bắt đầu làm bài
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Completed Exams */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-4">Bài đã hoàn thành</h2>
        <div className="grid gap-4">
          {mockCompletedExams.map((exam) => (
            <Card key={exam.id} className="border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Nộp bài: {exam.submitted_at}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-success">
                        {exam.score}/{exam.total}
                      </p>
                      <p className="text-sm text-muted-foreground">điểm</p>
                    </div>
                    <Badge variant="default" className="bg-success">
                      Đạt
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
