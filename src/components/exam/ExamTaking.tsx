import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Clock, 
  Camera, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useExam } from '@/hooks/useExams';
import { useStartAttempt, useSaveAnswer, useLogViolation, useSubmitExam } from '@/hooks/useExamAttempt';
import { supabase } from '@/integrations/supabase/client';
import type { QuestionOption } from '@/types/exam';

interface Answer {
  questionId: string;
  selectedOptions?: string[];
  essayAnswer?: string;
}

export function ExamTaking() {
  const { id: examId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptIdParam = searchParams.get('attempt');
  
  const [attemptId, setAttemptId] = useState<string | null>(attemptIdParam);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { data: exam, isLoading: examLoading } = useExam(examId || '');
  const startAttempt = useStartAttempt();
  const saveAnswer = useSaveAnswer();
  const logViolation = useLogViolation();
  const submitExam = useSubmitExam();

  const questions = exam?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Initialize attempt
  useEffect(() => {
    if (examId && !attemptId) {
      startAttempt.mutateAsync(examId).then((attempt) => {
        setAttemptId(attempt.id);
      }).catch((err) => {
        console.error('Failed to start attempt:', err);
        toast.error('Không thể bắt đầu bài thi');
        navigate('/dashboard');
      });
    }
  }, [examId, attemptId]);

  // Initialize timer
  useEffect(() => {
    if (exam) {
      setTimeLeft(exam.duration_minutes * 60);
    }
  }, [exam]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  // Camera setup
  useEffect(() => {
    if (exam?.require_camera) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          setCameraError(true);
          if (attemptId) {
            logViolation.mutate({
              attemptId,
              type: 'camera_denied',
              details: 'Không cấp quyền camera',
            });
          }
        });
    }

    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [exam?.require_camera, attemptId]);

  // Anti-cheat: Tab visibility
  useEffect(() => {
    if (!attemptId || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('tab_switch', 'Chuyển sang tab khác');
      }
    };

    const handleBlur = () => {
      handleViolation('window_blur', 'Rời khỏi cửa sổ trình duyệt');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [attemptId, violations, isSubmitted]);

  const handleViolation = useCallback((type: 'tab_switch' | 'window_blur' | 'camera_off' | 'camera_denied' | 'browser_minimize', message: string) => {
    if (!attemptId || isSubmitted) return;
    
    setViolations((prev) => {
      const newCount = prev + 1;
      setViolationMessage(message);
      setShowViolationAlert(true);

      logViolation.mutate({
        attemptId,
        type,
        details: message,
      });

      if (exam && newCount >= exam.max_violations) {
        toast.error('Bạn đã vi phạm quá nhiều lần!', {
          description: 'Bài làm sẽ được nộp tự động.',
        });
        setTimeout(() => handleSubmit(), 2000);
      }

      return newCount;
    });
  }, [attemptId, exam, isSubmitted]);

  const getCurrentAnswer = () => {
    if (!currentQuestion) return undefined;
    return answers.find((a) => a.questionId === currentQuestion.id);
  };

  const updateAnswer = async (update: Partial<Answer>) => {
    if (!currentQuestion || !attemptId) return;
    
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === currentQuestion.id);
      if (existing) {
        return prev.map((a) =>
          a.questionId === currentQuestion.id ? { ...a, ...update } : a
        );
      }
      return [...prev, { questionId: currentQuestion.id, ...update }];
    });

    // Save to database
    saveAnswer.mutate({
      attemptId,
      questionId: currentQuestion.id,
      selectedOptions: update.selectedOptions,
      essayAnswer: update.essayAnswer,
    });
  };

  const handleOptionSelect = (optionId: string) => {
    const current = getCurrentAnswer();
    
    if (currentQuestion?.type === 'multiple_choice_single') {
      updateAnswer({ selectedOptions: [optionId] });
    } else {
      const currentSelected = current?.selectedOptions || [];
      const newSelected = currentSelected.includes(optionId)
        ? currentSelected.filter((id) => id !== optionId)
        : [...currentSelected, optionId];
      updateAnswer({ selectedOptions: newSelected });
    }
  };

  const handleSubmit = async () => {
    if (!attemptId || isSubmitted) return;
    
    try {
      const result = await submitExam.mutateAsync(attemptId);
      setIsSubmitted(true);
      setExamResult(result);
      
      // Stop camera
      cameraStream?.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error('Submit failed:', error);
      toast.error('Lỗi khi nộp bài');
    }
  };

  const isTimeWarning = timeLeft <= 300; // 5 minutes warning

  if (examLoading || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show results after submission
  if (isSubmitted && examResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-0 shadow-medium">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Đã nộp bài thành công!</h1>
            <p className="text-muted-foreground mb-8">{exam.title}</p>
            
            <div className="p-6 rounded-xl bg-accent mb-6">
              <p className="text-muted-foreground mb-2">Điểm số của bạn</p>
              <p className="text-5xl font-display font-bold text-primary">
                {examResult.totalScore}/{examResult.maxScore}
              </p>
              <p className="text-lg text-muted-foreground mt-2">
                {examResult.percentage}%
              </p>
            </div>

            {violations > 0 && (
              <div className="p-4 rounded-lg bg-warning/10 text-warning text-sm mb-6">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Số lần vi phạm: {violations}
              </div>
            )}

            <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full">
              Quay về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-card border-b shadow-soft">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="font-display font-bold text-lg truncate max-w-md">
              {exam.title}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Violation Counter */}
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${violations > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
              <span className={`font-medium ${violations > 0 ? 'text-warning' : ''}`}>
                {violations}/{exam.max_violations}
              </span>
            </div>

            {/* Camera Status */}
            {exam.require_camera && (
              <div className="flex items-center gap-2">
                <Camera className={`w-5 h-5 ${cameraError ? 'text-destructive' : 'text-success'}`} />
                <span className="text-sm">
                  {cameraError ? 'Lỗi' : 'Đang ghi'}
                </span>
              </div>
            )}

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isTimeWarning ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-accent'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="exam-timer font-mono">{formatTime(timeLeft)}</span>
            </div>

            <Button onClick={handleSubmit} className="gap-2" disabled={submitExam.isPending}>
              {submitExam.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Nộp bài
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-1" />
      </div>

      <div className="container py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            {currentQuestion && (
              <Card className="border-0 shadow-medium">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <Badge variant="secondary" className="text-sm">
                      Câu {currentQuestionIndex + 1} / {totalQuestions}
                    </Badge>
                    <Badge variant="outline">{currentQuestion.points} điểm</Badge>
                  </div>

                  <h2 className="text-xl font-medium mb-8">{currentQuestion.content}</h2>

                  {/* Multiple Choice Single */}
                  {currentQuestion.type === 'multiple_choice_single' && currentQuestion.options && (
                    <RadioGroup
                      value={getCurrentAnswer()?.selectedOptions?.[0] || ''}
                      onValueChange={(value) => handleOptionSelect(value)}
                      className="space-y-3"
                    >
                      {(currentQuestion.options as QuestionOption[]).map((option) => (
                        <Label
                          key={option.id}
                          htmlFor={`option-${option.id}`}
                          className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            getCurrentAnswer()?.selectedOptions?.includes(option.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                          <span className="font-medium">{option.id.toUpperCase()}.</span>
                          <span>{option.text}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Multiple Choice Multiple */}
                  {currentQuestion.type === 'multiple_choice_multiple' && currentQuestion.options && (
                    <div className="space-y-3">
                      {(currentQuestion.options as QuestionOption[]).map((option) => (
                        <Label
                          key={option.id}
                          htmlFor={`option-${option.id}`}
                          className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            getCurrentAnswer()?.selectedOptions?.includes(option.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Checkbox
                            id={`option-${option.id}`}
                            checked={getCurrentAnswer()?.selectedOptions?.includes(option.id)}
                            onCheckedChange={() => handleOptionSelect(option.id)}
                          />
                          <span className="font-medium">{option.id.toUpperCase()}.</span>
                          <span>{option.text}</span>
                        </Label>
                      ))}
                      <p className="text-sm text-muted-foreground mt-4">
                        Có thể chọn nhiều đáp án
                      </p>
                    </div>
                  )}

                  {/* Essay */}
                  {currentQuestion.type === 'essay' && (
                    <Textarea
                      placeholder="Nhập câu trả lời của bạn..."
                      value={getCurrentAnswer()?.essayAnswer || ''}
                      onChange={(e) => updateAnswer({ essayAnswer: e.target.value })}
                      rows={10}
                      className="resize-none"
                    />
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Câu trước
                    </Button>
                    <Button
                      onClick={() =>
                        setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                      }
                      disabled={currentQuestionIndex === totalQuestions - 1}
                      className="gap-2"
                    >
                      Câu sau
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Camera Preview */}
            {exam.require_camera && (
              <Card className="border-0 shadow-medium overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {cameraError ? (
                    <div className="absolute inset-0 flex items-center justify-center text-destructive">
                      <Camera className="w-8 h-8" />
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-destructive text-destructive-foreground text-xs">
                    <div className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
                    REC
                  </div>
                </div>
              </Card>
            )}

            {/* Question Navigator */}
            <Card className="border-0 shadow-medium">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Danh sách câu hỏi</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, index) => {
                    const hasAnswer = answers.some((a) => a.questionId === q.id);
                    return (
                      <Button
                        key={q.id}
                        variant={currentQuestionIndex === index ? 'default' : 'outline'}
                        size="sm"
                        className={`w-full ${hasAnswer && currentQuestionIndex !== index ? 'bg-success/10 border-success text-success' : ''}`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-success/10 border border-success" />
                    <span>Đã làm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" />
                    <span>Chưa làm</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Violation Alert */}
      <AlertDialog open={showViolationAlert} onOpenChange={setShowViolationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Cảnh báo vi phạm!
            </AlertDialogTitle>
            <AlertDialogDescription>
              {violationMessage}
              <br /><br />
              <strong>Số lần vi phạm: {violations}/{exam.max_violations}</strong>
              <br />
              Nếu bạn tiếp tục vi phạm, bài làm có thể bị nộp tự động hoặc hủy kết quả.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Tôi đã hiểu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
