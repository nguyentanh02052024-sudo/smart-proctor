import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  FileText, 
  CheckCircle, 
  PlayCircle,
  Trophy,
  Search,
  Key,
  User
} from 'lucide-react';
import { useAvailableExams, useStudentAttempts } from '@/hooks/useExamAttempt';
import { Loader2 } from 'lucide-react';

export function StudentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchKey, setSearchKey] = useState('');
  
  const { data: availableExams, isLoading: examsLoading } = useAvailableExams();
  const { data: attempts, isLoading: attemptsLoading } = useStudentAttempts();

  const completedAttempts = attempts?.filter(a => a.submitted_at) || [];
  const completedExamIds = completedAttempts.map(a => a.exam_id);
  const pendingExams = availableExams?.filter((e: any) => !completedExamIds.includes(e.id)) || [];
  
  const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
  const maxScore = completedAttempts.reduce((sum, a) => sum + ((a as any).max_points || (a as any).exam?.max_points || 10), 0);
  const averageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const stats = [
    { label: 'Bài đã làm', value: completedAttempts.length.toString(), icon: FileText, color: 'text-primary' },
    { label: 'Điểm TB', value: `${averageScore}%`, icon: Trophy, color: 'text-success' },
    { label: 'Đang chờ', value: pendingExams.length.toString(), icon: Clock, color: 'text-warning' },
  ];

  const handleSearchExam = () => {
    if (searchKey.trim()) {
      navigate(`/exam/join?key=${searchKey.trim().toUpperCase()}`);
    }
  };

  if (examsLoading || attemptsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Xin chào, {profile?.full_name?.split(' ').pop()}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Bạn có {pendingExams.length} bài kiểm tra đang chờ
          </p>
        </div>
      </div>

      {/* Search by Key */}
      <Card className="border-0 shadow-medium bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-primary/10">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Tham gia bài kiểm tra</h3>
                <p className="text-sm text-muted-foreground">Nhập mã bài kiểm tra để bắt đầu làm bài</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Nhập mã bài kiểm tra (VD: ABC12345)"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value.toUpperCase())}
                className="w-full md:w-64 uppercase"
                onKeyDown={(e) => e.key === 'Enter' && handleSearchExam()}
              />
              <Button onClick={handleSearchExam} className="gap-2">
                <Search className="w-4 h-4" />
                Tìm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
        <h2 className="text-xl font-display font-semibold mb-4">Bài kiểm tra có sẵn</h2>
        {pendingExams.length === 0 ? (
          <Card className="border-0 shadow-soft">
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Không có bài kiểm tra nào đang chờ</p>
              <p className="text-sm mt-1">Nhập mã bài kiểm tra ở trên để tham gia</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingExams.map((exam: any) => (
              <Card key={exam.id} className="border-0 shadow-soft hover:shadow-medium transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{exam.title}</h3>
                        {exam.access_key && (
                          <Badge variant="outline" className="font-mono">
                            {exam.access_key}
                          </Badge>
                        )}
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
                        {exam.teacher?.full_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {exam.teacher.full_name}
                          </span>
                        )}
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
        )}
      </div>

      {/* Completed Exams */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-4">Bài đã hoàn thành</h2>
        {completedAttempts.length === 0 ? (
          <Card className="border-0 shadow-soft">
            <CardContent className="p-8 text-center text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có bài kiểm tra nào được hoàn thành</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {completedAttempts.map((attempt: any) => (
              <Card key={attempt.id} className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{attempt.exam?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Nộp bài: {new Date(attempt.submitted_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-display font-bold text-success">
                          {attempt.score || 0}/{attempt.max_points || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.max_points ? Math.round(((attempt.score || 0) / attempt.max_points) * 100) : 0}%
                        </p>
                      </div>
                      {attempt.is_cancelled ? (
                        <Badge variant="destructive">Đã hủy</Badge>
                      ) : attempt.is_flagged ? (
                        <Badge variant="secondary" className="bg-warning/20 text-warning">Nghi vấn</Badge>
                      ) : (
                        <Badge variant="default" className="bg-success">Hoàn thành</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
