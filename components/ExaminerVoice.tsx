'use client';
import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { examinerVoiceEnabled, setExaminerVoiceEnabled, speakExaminerInstruction, stopExaminerSpeech } from '@/lib/examinerSpeech';

export function ExaminerVoice({ instruction, disabled }: { instruction: string; disabled?: boolean }) {
  const [enabled, setEnabled] = useState(examinerVoiceEnabled);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    speakExaminerInstruction(instruction, () => setFailed(true));
    return stopExaminerSpeech;
  }, [instruction]);
  return <button type="button" className="examiner-voice" disabled={disabled} aria-pressed={enabled}
    aria-label={failed ? '심사위원 안내 듣기' : `심사위원 음성 ${enabled ? '끄기' : '켜기'}`}
    title="기기의 한국어 음성으로 단계 안내를 읽어요. 남성 음성이 있으면 우선 사용해요."
    onClick={() => {
      const next = failed || !enabled;
      setEnabled(next); setExaminerVoiceEnabled(next); setFailed(false);
      if (next) speakExaminerInstruction(instruction, () => setFailed(true));
    }}>
    {enabled ? <Volume2 size={17}/> : <VolumeX size={17}/>}
    <span>{failed ? '안내 듣기' : enabled ? '음성 켜짐' : '음성 꺼짐'}</span>
  </button>;
}
