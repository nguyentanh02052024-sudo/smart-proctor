import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Users, 
  AlertTriangle, 
  BarChart3,
  Clock,
  Eye,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

// Mock data for demonstration
const mockExams = [
  {
    id: '1',
    title: 'Kiểm tra Toán học - Chương 1',
    description: 'Đại số và phương trình',
    duration_minutes: 45,
    questions_count: 20,
    attempts_count: 35,
    violations_count: 3,
    is_published: true,
    created_at: '2024-01-15',
  },
  {
    id: '2',
    title: 'Bài thi Vật lý giữa kỳ',
    description: 'Cơ học và động lực học',
    duration_minutes: 90,
    questions_count: 40,
    attempts_count: 28,
    violations_count: 1,
    is_published: true,
    created_at: '2024-01-10',
  },
  {
    id: '3',
    title: 'Quiz Tiếng Anh - Unit 5',
    description: 'Grammar and Vocabulary',
    duration_minutes: 30,
    questions_count: 15,
    attempts_count: 0,
    violations_count: 0,
    is_published: false,
    created_at: '2024-01-20',
  },
];

const stats = [
  { label: 'Bài kiểm tra', value: '12', icon: FileText, color: 'text-primary' },
  { label: 'Học sinh', value: '156', icon: Users, color: 'text-success' },
  { label: 'Vi phạm', value: '7', icon: AlertTriangle, color: 'text-warning' },
  { label: 'Hoàn thành', value: '89%', icon: BarChart3, color: 'text-accent-foreground' },
];

export function TeacherDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Xin chào, {profile?.full_name?.split(' ').pop()}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý bài kiểm tra và theo dõi học sinh của bạn
          </p>
        </div>
        <Button onClick={() => navigate('/exam/create')} size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Tạo bài kiểm tra
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Exams List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold">Bài kiểm tra gần đây</h2>
          <Button variant="ghost" size="sm">
            Xem tất cả
          </Button>
        </div>

        <div className="grid gap-4">
          {mockExams.map((exam) => (
            <Card key={exam.id} className="border-0 shadow-soft hover:shadow-medium transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{exam.title}</h3>
                      <Badge variant={exam.is_published ? 'default' : 'secondary'}>
                        {exam.is_published ? 'Đã xuất bản' : 'Nháp'}
                      </Badge>
                    </div>
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
                        <Users className="w-4 h-4" />
                        {exam.attempts_count} lượt làm
                      </span>
                      {exam.violations_count > 0 && (
                        <span className="flex items-center gap-1 text-warning">
                          <AlertTriangle className="w-4 h-4" />
                          {exam.violations_count} vi phạm
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Xem log
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem>Xem kết quả</DropdownMenuItem>
                        <DropdownMenuItem>Sao chép link</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
