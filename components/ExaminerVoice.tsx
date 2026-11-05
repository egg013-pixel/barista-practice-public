'use client';
import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { examinerVoiceEnabled, setExaminerVoiceEnabled, speakExaminerInstruction, stopExaminerSpeech } from '@/lib/examinerSpeech';

export function ExaminerVoice({ stepId, disabled }: { stepId: number; disabled?: boolean }) {
  const [enabled, setEnabled] = useState(examinerVoiceEnabled);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    speakExaminerInstruction(stepId, () => setFailed(true));
    return stopExaminerSpeech;
  }, [stepId]);
  return <button type="button" className="examiner-voice" disabled={disabled} aria-pressed={enabled}
    aria-label={failed ? '심사위원 안내 듣기' : `심사위원 음성 ${enabled ? '끄기' : '켜기'}`}
    title="Qwen3-TTS로 생성한 한국어 남성 안내 음성이에요."
    onClick={() => {
      const next = failed || !enabled;
      setEnabled(next); setExaminerVoiceEnabled(next); setFailed(false);
      if (next) speakExaminerInstruction(stepId, () => setFailed(true), true);
    }}>
    {enabled ? <Volume2 size={17}/> : <VolumeX size={17}/>}
    <span>{failed ? '안내 듣기' : enabled ? '음성 켜짐' : '음성 꺼짐'}</span>
  </button>;
}
