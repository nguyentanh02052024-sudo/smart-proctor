import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, GripVertical, ImagePlus, X } from 'lucide-react';
import type { Question, QuestionOption } from '@/types/exam';

interface QuestionEditorProps {
  question: Partial<Question>;
  index: number;
  onUpdate: (question: Partial<Question>) => void;
  onRemove: () => void;
}

export function QuestionEditor({ question, index, onUpdate, onRemove }: QuestionEditorProps) {
  const handleTypeChange = (type: Question['type']) => {
    let options = question.options;
    if (type === 'essay') {
      options = undefined;
    } else if (!options || options.length === 0) {
      options = [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
      ];
    }
    onUpdate({ ...question, type, options, correct_answers: [] });
  };

  const handleOptionChange = (optionIndex: number, text: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = { ...newOptions[optionIndex], text };
    onUpdate({ ...question, options: newOptions });
  };

  const handleCorrectAnswerChange = (optionId: string, isCorrect: boolean) => {
    let newCorrectAnswers = [...(question.correct_answers || [])];
    
    if (question.type === 'multiple_choice_single') {
      newCorrectAnswers = isCorrect ? [optionId] : [];
    } else {
      if (isCorrect) {
        newCorrectAnswers.push(optionId);
      } else {
        newCorrectAnswers = newCorrectAnswers.filter((id) => id !== optionId);
      }
    }
    
    onUpdate({ ...question, correct_answers: newCorrectAnswers });
  };

  const addOption = () => {
    const options = question.options || [];
    const newId = String.fromCharCode(97 + options.length); // a, b, c, d, e...
    onUpdate({
      ...question,
      options: [...options, { id: newId, text: '' }],
    });
  };

  const removeOption = (optionIndex: number) => {
    const newOptions = question.options?.filter((_, i) => i !== optionIndex) || [];
    const removedId = question.options?.[optionIndex]?.id;
    const newCorrectAnswers = question.correct_answers?.filter((id) => id !== removedId) || [];
    onUpdate({ ...question, options: newOptions, correct_answers: newCorrectAnswers });
  };

  return (
    <Card className="border-0 shadow-medium">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="cursor-grab text-muted-foreground hover:text-foreground">
            <GripVertical className="w-5 h-5" />
          </div>
          <span className="font-semibold">Câu {index + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={question.type}
            onValueChange={(value) => handleTypeChange(value as Question['type'])}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice_single">Trắc nghiệm (1 đáp án)</SelectItem>
              <SelectItem value="multiple_choice_multiple">Trắc nghiệm (nhiều đáp án)</SelectItem>
              <SelectItem value="essay">Tự luận</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Label htmlFor={`points-${question.id}`} className="text-sm whitespace-nowrap">
              Điểm:
            </Label>
            <Input
              id={`points-${question.id}`}
              type="number"
              min={0}
              className="w-16"
              value={question.points}
              onChange={(e) => onUpdate({ ...question, points: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Nội dung câu hỏi</Label>
          <Textarea
            placeholder="Nhập nội dung câu hỏi..."
            value={question.content}
            onChange={(e) => onUpdate({ ...question, content: e.target.value })}
            rows={3}
          />
          <Button variant="outline" size="sm" className="gap-2">
            <ImagePlus className="w-4 h-4" />
            Thêm hình ảnh
          </Button>
        </div>

        {question.type !== 'essay' && (
          <div className="space-y-3">
            <Label>Các đáp án</Label>
            {question.options?.map((option, optIndex) => (
              <div key={option.id} className="flex items-center gap-3">
                {question.type === 'multiple_choice_single' ? (
                  <RadioGroup
                    value={question.correct_answers?.[0] || ''}
                    onValueChange={(value) => handleCorrectAnswerChange(value, true)}
                  >
                    <RadioGroupItem value={option.id} id={`option-${question.id}-${option.id}`} />
                  </RadioGroup>
                ) : (
                  <Checkbox
                    checked={question.correct_answers?.includes(option.id)}
                    onCheckedChange={(checked) =>
                      handleCorrectAnswerChange(option.id, checked as boolean)
                    }
                  />
                )}
                <span className="font-medium w-6">{option.id.toUpperCase()}.</span>
                <Input
                  placeholder={`Đáp án ${option.id.toUpperCase()}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                  className="flex-1"
                />
                {(question.options?.length || 0) > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(optIndex)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addOption}>
              + Thêm đáp án
            </Button>
            <p className="text-sm text-muted-foreground">
              {question.type === 'multiple_choice_single'
                ? 'Chọn một đáp án đúng'
                : 'Chọn một hoặc nhiều đáp án đúng'}
            </p>
          </div>
        )}

        {question.type === 'essay' && (
          <p className="text-sm text-muted-foreground italic">
            Học sinh sẽ nhập câu trả lời tự luận. Giáo viên chấm điểm thủ công sau khi nộp bài.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
