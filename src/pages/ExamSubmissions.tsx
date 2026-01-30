import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  ArrowLeft,
  Search,
  Eye,
  Flag,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Loader2,
  FileText
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTeacherSubmissions, useFlagSubmission, useCancelSubmission } from '@/hooks/useTeacherSubmissions';
import { useExam } from '@/hooks/useExams';

export default function ExamSubmissions() {
  const { id: examId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data: exam } = useExam(examId || '');
  const { data: submissions, isLoading } = useTeacherSubmissions(examId);
  const flagSubmission = useFlagSubmission();
  const cancelSubmission = useCancelSubmission();

  const filteredSubmissions = submissions?.filter((s: any) => 
    s.student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.student?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleFlag = (submission: any) => {
    flagSubmission.mutate({
      attemptId: submission.id,
      isFlagged: !submission.is_flagged,
      reason: submission.is_flagged ? undefined : 'Nghi vấn gian lận',
    });
  };

  const handleCancelClick = (submission: any) => {
    setSelectedSubmission(submission);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (selectedSubmission && cancelReason) {
      cancelSubmission.mutate({
        attemptId: selectedSubmission.id,
        reason: cancelReason,
      });
      setCancelDialogOpen(false);
    }
  };

  const getStatusBadge = (submission: any) => {
    if (submission.is_cancelled) {
      return <Badge variant="destructive">Đã hủy</Badge>;
    }
    if (submission.is_flagged) {
      return <Badge variant="secondary" className="bg-warning/20 text-warning">Nghi vấn</Badge>;
    }
    if (submission.submitted_at) {
      return <Badge variant="default" className="bg-success">Hoàn thành</Badge>;
    }
    return <Badge variant="secondary">Đang làm</Badge>;
  };

  const formatDuration = (startedAt: string, submittedAt?: string) => {
    const start = new Date(startedAt);
    const end = submittedAt ? new Date(submittedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} phút`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold">
              {exam?.title || 'Bài làm của học sinh'}
            </h1>
            <p className="text-muted-foreground">
              Quản lý và chấm điểm bài làm
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-0 shadow-soft">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Tổng bài làm</p>
              <p className="text-2xl font-display font-bold">{submissions?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-soft">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
              <p className="text-2xl font-display font-bold text-success">
                {submissions?.filter((s: any) => s.submitted_at).length || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-soft">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Nghi vấn</p>
              <p className="text-2xl font-display font-bold text-warning">
                {submissions?.filter((s: any) => s.is_flagged).length || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-soft">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Đã hủy</p>
              <p className="text-2xl font-display font-bold text-destructive">
                {submissions?.filter((s: any) => s.is_cancelled).length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email học sinh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card className="border-0 shadow-medium">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !filteredSubmissions || filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có bài làm nào</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học sinh</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Điểm</TableHead>
                    <TableHead>Thời gian làm</TableHead>
                    <TableHead>Vi phạm</TableHead>
                    <TableHead>Nộp bài</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission: any) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{submission.student?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{submission.student?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission)}</TableCell>
                      <TableCell>
                        {submission.submitted_at ? (
                          <span className="font-semibold">
                            {submission.score || 0}/{submission.max_points || 0}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {formatDuration(submission.started_at, submission.submitted_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={submission.violations_count > 0 ? 'text-warning font-medium' : ''}>
                          {submission.violations_count || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        {submission.submitted_at 
                          ? new Date(submission.submitted_at).toLocaleString('vi-VN')
                          : 'Chưa nộp'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/exam/${examId}/submission/${submission.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleFlag(submission)}
                            className={submission.is_flagged ? 'text-warning' : ''}
                          >
                            <Flag className="w-4 h-4" />
                          </Button>
                          {!submission.is_cancelled && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleCancelClick(submission)}
                              className="text-destructive"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Cancel Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hủy kết quả bài thi</DialogTitle>
              <DialogDescription>
                Bạn đang hủy kết quả của {selectedSubmission?.student?.full_name}. 
                Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Lý do hủy</label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy kết quả..."
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                Hủy bỏ
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelConfirm}
                disabled={!cancelReason}
              >
                Xác nhận hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
