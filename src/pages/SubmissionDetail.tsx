import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Flag,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSubmissionDetails, useGradeAnswer, useViolationLogs } from '@/hooks/useTeacherSubmissions';

export default function SubmissionDetail() {
  const { id: examId, submissionId } = useParams<{ id: string; submissionId: string }>();
  const navigate = useNavigate();
  const [essayScores, setEssayScores] = useState<Record<string, number>>({});

  const { data: submission, isLoading } = useSubmissionDetails(submissionId || '');
  const { data: violations } = useViolationLogs(submissionId || '');
  const gradeAnswer = useGradeAnswer();

  const handleGradeEssay = (answerId: string, maxPoints: number) => {
    const points = essayScores[answerId];
    if (points !== undefined && points >= 0 && points <= maxPoints) {
      gradeAnswer.mutate({ answerId, points });
    }
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'tab_switch':
      case 'window_blur':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'camera_off':
      case 'camera_denied':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
  };

  const getViolationLabel = (type: string) => {
    switch (type) {
      case 'tab_switch': return 'Chuyển tab';
      case 'window_blur': return 'Rời khỏi cửa sổ';
      case 'camera_off': return 'Tắt camera';
      case 'camera_denied': return 'Từ chối camera';
      case 'browser_minimize': return 'Thu nhỏ trình duyệt';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!submission) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p>Không tìm thấy bài làm</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/exam/${examId}/submissions`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold">
              Chi tiết bài làm
            </h1>
            <p className="text-muted-foreground">
              {submission.exam?.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {submission.is_cancelled ? (
              <Badge variant="destructive">Đã hủy</Badge>
            ) : submission.is_flagged ? (
              <Badge variant="secondary" className="bg-warning/20 text-warning">Nghi vấn</Badge>
            ) : (
              <Badge variant="default" className="bg-success">Hoàn thành</Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Student Info & Violations */}
          <div className="space-y-4">
            {/* Student Card */}
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-lg">Thông tin học sinh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{submission.student?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{submission.student?.email}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Bắt đầu</p>
                    <p className="font-medium">
                      {new Date(submission.started_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nộp bài</p>
                    <p className="font-medium">
                      {submission.submitted_at 
                        ? new Date(submission.submitted_at).toLocaleString('vi-VN')
                        : 'Chưa nộp'
                      }
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-1">Điểm số</p>
                  <p className="text-4xl font-display font-bold text-primary">
                    {submission.score || 0}/{(submission as any).max_points || (submission as any).total_points || '?'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Violations */}
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Vi phạm ({violations?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!violations || violations.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Không có vi phạm nào
                  </p>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {violations.map((v: any, index: number) => (
                        <div key={v.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                          {getViolationIcon(v.type)}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{getViolationLabel(v.type)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(v.timestamp).toLocaleString('vi-VN')}
                            </p>
                            {v.details && (
                              <p className="text-xs text-muted-foreground mt-1">{v.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Answers */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Bài làm</h2>
            
            {submission.answers?.map((answer: any, index: number) => {
              const question = answer.question;
              const isEssay = question?.type === 'essay';
              const isCorrect = answer.points_awarded === question?.points;
              
              return (
                <Card key={answer.id} className="border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="secondary">Câu {index + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {answer.points_awarded ?? '?'}/{question?.points} điểm
                        </span>
                        {answer.is_graded && !isEssay && (
                          isCorrect 
                            ? <CheckCircle className="w-5 h-5 text-success" />
                            : <XCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                    </div>
                    
                    <p className="font-medium mb-4">{question?.content}</p>
                    
                    {/* Multiple Choice Answer */}
                    {!isEssay && question?.options && (
                      <div className="space-y-2">
                        {(question.options as any[]).map((opt: any) => {
                          const isSelected = answer.selected_options?.includes(opt.id);
                          const isCorrectAnswer = question.correct_answers?.includes(opt.id);
                          
                          return (
                            <div
                              key={opt.id}
                              className={`p-3 rounded-lg border-2 ${
                                isSelected && isCorrectAnswer
                                  ? 'bg-success/10 border-success'
                                  : isSelected && !isCorrectAnswer
                                  ? 'bg-destructive/10 border-destructive'
                                  : isCorrectAnswer
                                  ? 'bg-success/5 border-success/50'
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{opt.id.toUpperCase()}.</span>
                                <span>{opt.text}</span>
                                {isSelected && (
                                  <Badge variant="secondary" className="ml-auto">
                                    Đã chọn
                                  </Badge>
                                )}
                                {isCorrectAnswer && (
                                  <CheckCircle className="w-4 h-4 text-success" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Essay Answer */}
                    {isEssay && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-accent/50">
                          <p className="text-sm whitespace-pre-wrap">
                            {answer.essay_answer || 'Không có câu trả lời'}
                          </p>
                        </div>
                        
                        {/* Grading */}
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium">Chấm điểm:</label>
                          <Input
                            type="number"
                            min={0}
                            max={question?.points || 10}
                            value={essayScores[answer.id] ?? answer.points_awarded ?? ''}
                            onChange={(e) => setEssayScores({
                              ...essayScores,
                              [answer.id]: parseFloat(e.target.value) || 0
                            })}
                            className="w-24"
                          />
                          <span className="text-muted-foreground">/ {question?.points} điểm</span>
                          <Button
                            size="sm"
                            onClick={() => handleGradeEssay(answer.id, question?.points || 10)}
                            disabled={gradeAnswer.isPending}
                          >
                            Lưu
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
