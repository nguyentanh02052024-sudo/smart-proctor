import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus, 
  FileText, 
  Users, 
  AlertTriangle, 
  BarChart3,
  Clock,
  Eye,
  MoreVertical,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  Loader2,
  Trash2,
  Share2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useTeacherExams, usePublishExam, useDeleteExam } from '@/hooks/useExams';
import { toast } from 'sonner';

export function TeacherDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  
  const { data: exams, isLoading } = useTeacherExams();
  const publishExam = usePublishExam();
  const deleteExam = useDeleteExam();

  const totalExams = exams?.length || 0;
  const publishedExams = exams?.filter(e => e.is_published).length || 0;
  const totalAttempts = exams?.reduce((sum, e) => sum + (e.attempts_count || 0), 0) || 0;

  const stats = [
    { label: 'Bài kiểm tra', value: totalExams.toString(), icon: FileText, color: 'text-primary' },
    { label: 'Đã xuất bản', value: publishedExams.toString(), icon: Share2, color: 'text-success' },
    { label: 'Lượt làm bài', value: totalAttempts.toString(), icon: Users, color: 'text-accent-foreground' },
  ];

  const handleShare = (exam: any) => {
    setSelectedExam(exam);
    setShareDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép!');
  };

  const getShareLink = (examId: string) => {
    return `${window.location.origin}/exam/join?id=${examId}`;
  };

  if (isLoading) {
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
            Quản lý bài kiểm tra và theo dõi học sinh của bạn
          </p>
        </div>
        <Button onClick={() => navigate('/exam/create')} size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Tạo bài kiểm tra
        </Button>
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

      {/* Exams List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold">Bài kiểm tra của bạn</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/exams')}>
            Xem tất cả
          </Button>
        </div>

        {!exams || exams.length === 0 ? (
          <Card className="border-0 shadow-soft">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-semibold text-lg mb-2">Chưa có bài kiểm tra nào</h3>
              <p className="text-muted-foreground mb-6">
                Tạo bài kiểm tra đầu tiên của bạn để bắt đầu
              </p>
              <Button onClick={() => navigate('/exam/create')} className="gap-2">
                <Plus className="w-4 h-4" />
                Tạo bài kiểm tra
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam: any) => (
              <Card key={exam.id} className="border-0 shadow-soft hover:shadow-medium transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{exam.title}</h3>
                        <Badge variant={exam.is_published ? 'default' : 'secondary'}>
                          {exam.is_published ? 'Đã xuất bản' : 'Nháp'}
                        </Badge>
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
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {exam.attempts_count} lượt làm
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => navigate(`/exam/${exam.id}/submissions`)}
                      >
                        <Eye className="w-4 h-4" />
                        Xem bài làm
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleShare(exam)}
                      >
                        <Share2 className="w-4 h-4" />
                        Chia sẻ
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/exam/${exam.id}/edit`)}>
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => publishExam.mutate({ 
                              examId: exam.id, 
                              isPublished: !exam.is_published 
                            })}
                          >
                            {exam.is_published ? 'Ẩn bài kiểm tra' : 'Xuất bản'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              if (confirm('Bạn có chắc muốn xóa bài kiểm tra này?')) {
                                deleteExam.mutate(exam.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chia sẻ bài kiểm tra</DialogTitle>
            <DialogDescription>
              {selectedExam?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Access Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã bài kiểm tra</label>
              <div className="flex gap-2">
                <Input 
                  value={selectedExam?.access_key || ''} 
                  readOnly 
                  className="font-mono text-lg tracking-widest"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(selectedExam?.access_key)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Học sinh có thể nhập mã này để tham gia bài kiểm tra
              </p>
            </div>

            {/* Share Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Link chia sẻ</label>
              <div className="flex gap-2">
                <Input 
                  value={selectedExam ? getShareLink(selectedExam.id) : ''} 
                  readOnly 
                  className="text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(getShareLink(selectedExam?.id))}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!selectedExam?.is_published && (
              <div className="p-3 rounded-lg bg-warning/10 text-warning text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Bài kiểm tra chưa được xuất bản. Học sinh chưa thể truy cập.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
