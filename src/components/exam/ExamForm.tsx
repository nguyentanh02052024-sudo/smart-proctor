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
  Trash2, 
  GripVertical, 
  ImagePlus,
  Save,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { QuestionEditor } from './QuestionEditor';
import type { Question, QuestionOption } from '@/types/exam';

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

  const handleSave = () => {
    if (!examData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài kiểm tra');
      return;
    }
    // TODO: Save to database
    toast.success('Đã lưu bài kiểm tra!');
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
          <Button variant="outline" className="gap-2">
            <Eye className="w-4 h-4" />
            Xem trước
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Lưu bài kiểm tra
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
                <Label htmlFor="title">Tiêu đề</Label>
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
    </div>
  );
}
