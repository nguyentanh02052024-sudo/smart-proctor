import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Clock, 
  FileText, 
  User, 
  Camera, 
  AlertTriangle,
  ArrowRight,
  Search,
  Loader2
} from 'lucide-react';
import { useExamByKey } from '@/hooks/useExams';
import { useStartAttempt } from '@/hooks/useExamAttempt';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function JoinExam() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const initialKey = searchParams.get('key') || searchParams.get('id') || '';
  const [accessKey, setAccessKey] = useState(initialKey);
  const [searchedKey, setSearchedKey] = useState(initialKey);
  
  const { data: exam, isLoading, error } = useExamByKey(searchedKey);
  const startAttempt = useStartAttempt();

  useEffect(() => {
    if (initialKey) {
      setSearchedKey(initialKey);
    }
  }, [initialKey]);

  const handleSearch = () => {
    if (accessKey.trim().length >= 6) {
      setSearchedKey(accessKey.trim().toUpperCase());
    }
  };

  const handleStartExam = async () => {
    if (!exam || !user) return;
    
    try {
      const attempt = await startAttempt.mutateAsync(exam.id);
      navigate(`/exam/${exam.id}/take?attempt=${attempt.id}`);
    } catch (error) {
      console.error('Failed to start exam:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold mb-2">Tham gia bài kiểm tra</h1>
          <p className="text-muted-foreground">
            Nhập mã bài kiểm tra hoặc sử dụng link được chia sẻ
          </p>
        </div>

        {/* Search Box */}
        <Card className="border-0 shadow-medium">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Nhập mã bài kiểm tra (VD: ABC12345)"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 text-lg font-mono tracking-widest uppercase"
                />
              </div>
              <Button onClick={handleSearch} size="lg" className="gap-2" disabled={accessKey.length < 6}>
                <Search className="w-4 h-4" />
                Tìm
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* No Results */}
        {searchedKey && !isLoading && !exam && (
          <Card className="border-0 shadow-soft border-l-4 border-l-warning">
            <CardContent className="p-6 flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-warning" />
              <div>
                <h3 className="font-semibold">Không tìm thấy bài kiểm tra</h3>
                <p className="text-muted-foreground text-sm">
                  Mã "{searchedKey}" không tồn tại hoặc bài kiểm tra chưa được xuất bản.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exam Found */}
        {exam && (
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                  {exam.access_key}
                </Badge>
                <Badge variant="default" className="bg-success">
                  Đang mở
                </Badge>
              </div>
              <CardTitle className="text-2xl mt-4">{exam.title}</CardTitle>
              {exam.description && (
                <CardDescription className="text-base">{exam.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Exam Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-accent/50">
                  <Clock className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Thời gian</p>
                  <p className="font-semibold">{exam.duration_minutes} phút</p>
                </div>
                <div className="p-4 rounded-lg bg-accent/50">
                  <FileText className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Số lần vi phạm tối đa</p>
                  <p className="font-semibold">{exam.max_violations} lần</p>
                </div>
                <div className="p-4 rounded-lg bg-accent/50">
                  <Camera className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Camera</p>
                  <p className="font-semibold">{exam.require_camera ? 'Bắt buộc' : 'Không bắt buộc'}</p>
                </div>
                {exam.teacher?.full_name && (
                  <div className="p-4 rounded-lg bg-accent/50">
                    <User className="w-5 h-5 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Giáo viên</p>
                    <p className="font-semibold">{exam.teacher.full_name}</p>
                  </div>
                )}
              </div>

              {/* Warnings */}
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                <h4 className="font-semibold flex items-center gap-2 text-warning mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Lưu ý quan trọng
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Không được chuyển tab hoặc rời khỏi trang làm bài</li>
                  {exam.require_camera && <li>• Phải bật camera trong suốt thời gian làm bài</li>}
                  <li>• Bài làm sẽ tự động nộp khi hết giờ</li>
                  <li>• Vi phạm {exam.max_violations} lần sẽ bị đánh dấu gian lận</li>
                </ul>
              </div>

              {/* Start Button */}
              <Button 
                onClick={handleStartExam} 
                size="lg" 
                className="w-full gap-2 text-lg"
                disabled={startAttempt.isPending}
              >
                {startAttempt.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    Bắt đầu làm bài
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
