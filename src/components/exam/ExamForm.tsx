import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Save,
  Eye,
  ArrowLeft,
  Loader2,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { QuestionEditor } from './QuestionEditor';
import { useCreateExam, usePublishExam } from '@/hooks/useExams';
import type { Question, QuestionOption } from '@/types/exam';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Copy } from 'lucide-react';

interface ExamFormData {
  title: string;
  description: string;
  duration_minutes: number;
  max_violations: number;
  require_camera: boolean;
  auto_submit_on_violation: boolean;
}

export function ExamForm() {
  const navigate = useNavigate();
  const createExam = useCreateExam();
  const publishExam = usePublishExam();
  
  const [examData, setExamData] = useState<ExamFormData>({
    title: '',
    description: '',
    duration_minutes: 45,
    max_violations: 3,
    require_camera: true,
    auto_submit_on_violation: false,
  });

  const [questions, setQuestions] = useState<Partial<Question>[]>([
    {
      id: '1',
      type: 'multiple_choice_single',
      content: '',
      points: 1,
      options: [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
      ],
      correct_answers: [],
      order_index: 0,
    },
  ]);

  const [createdExam, setCreatedExam] = useState<any>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const addQuestion = () => {
    const newQuestion: Partial<Question> = {
      id: Date.now().toString(),
      type: 'multiple_choice_single',
      content: '',
      points: 1,
      options: [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
      ],
      correct_answers: [],
      order_index: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error('Bài kiểm tra phải có ít nhất 1 câu hỏi');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updatedQuestion: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const validateForm = () => {
    if (!examData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài kiểm tra');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content?.trim()) {
        toast.error(`Câu hỏi ${i + 1} chưa có nội dung`);
        return false;
      }
      if (q.type !== 'essay' && (!q.correct_answers || q.correct_answers.length === 0)) {
        toast.error(`Câu hỏi ${i + 1} chưa chọn đáp án đúng`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async (publish: boolean = false) => {
    if (!validateForm()) return;

    try {
      const exam = await createExam.mutateAsync({
        ...examData,
        questions,
      });

      setCreatedExam(exam);

      if (publish) {
        await publishExam.mutateAsync({ examId: exam.id, isPublished: true });
        setShowShareDialog(true);
      } else {
        toast.success('Đã lưu bài kiểm tra!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">Tạo bài kiểm tra mới</h1>
            <p className="text-muted-foreground">Thiết lập bài kiểm tra và thêm câu hỏi</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)} 
            disabled={createExam.isPending}
            className="gap-2"
          >
            {createExam.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu nháp
          </Button>
          <Button 
            onClick={() => handleSave(true)} 
            disabled={createExam.isPending}
            className="gap-2"
          >
            {createExam.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            Lưu & Xuất bản
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Exam Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
              <CardDescription>Cài đặt cơ bản cho bài kiểm tra</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  placeholder="VD: Kiểm tra Toán học - Chương 1"
                  value={examData.title}
                  onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn về bài kiểm tra..."
                  value={examData.description}
                  onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Thời gian làm bài (phút)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={examData.duration_minutes}
                  onChange={(e) => setExamData({ ...examData, duration_minutes: parseInt(e.target.value) || 45 })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle>Chống gian lận</CardTitle>
              <CardDescription>Cài đặt bảo mật cho bài thi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Yêu cầu camera</Label>
                  <p className="text-sm text-muted-foreground">Bật camera trong suốt bài thi</p>
                </div>
                <Switch
                  checked={examData.require_camera}
                  onCheckedChange={(checked) => setExamData({ ...examData, require_camera: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Tự động nộp khi vi phạm</Label>
                  <p className="text-sm text-muted-foreground">Nộp bài khi vượt giới hạn</p>
                </div>
                <Switch
                  checked={examData.auto_submit_on_violation}
                  onCheckedChange={(checked) => setExamData({ ...examData, auto_submit_on_violation: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-violations">Số lần vi phạm tối đa</Label>
                <Input
                  id="max-violations"
                  type="number"
                  min={1}
                  max={10}
                  value={examData.max_violations}
                  onChange={(e) => setExamData({ ...examData, max_violations: parseInt(e.target.value) || 3 })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Questions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Câu hỏi ({questions.length})</h2>
            <Button onClick={addQuestion} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm câu hỏi
            </Button>
          </div>

          {questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              onUpdate={(updated) => updateQuestion(index, updated)}
              onRemove={() => removeQuestion(index)}
            />
          ))}
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🎉 Bài kiểm tra đã sẵn sàng!</DialogTitle>
            <DialogDescription>
              Chia sẻ mã hoặc link sau cho học sinh để tham gia
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã bài kiểm tra</label>
              <div className="flex gap-2">
                <Input 
                  value={createdExam?.access_key || ''} 
                  readOnly 
                  className="font-mono text-lg tracking-widest text-center"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(createdExam?.access_key)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Link chia sẻ</label>
              <div className="flex gap-2">
                <Input 
                  value={`${window.location.origin}/exam/join?key=${createdExam?.access_key}`} 
                  readOnly 
                  className="text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(`${window.location.origin}/exam/join?key=${createdExam?.access_key}`)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button 
              onClick={() => {
                setShowShareDialog(false);
                navigate('/dashboard');
              }} 
              className="w-full"
            >
              Quay về Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
