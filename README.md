# 차근차근 바리스타 — 독립 공유용

공유 링크: https://egg013-pixel.github.io/barista-practice-public/

이름·수험번호 입력 없이 글 대본/3D 시험장 연습을 바로 시작합니다. 음성·직접 입력과 내장 피드백, 심사위원 안내, 11단계 제조·서빙 흐름을 제공합니다. 자기소개 단계에는 가상의 이름과 번호를 사용할 수 있습니다.

## 저장하지 않는 연습

대사·결과·진행 상태는 현재 화면에서만 사용하며 localStorage, sessionStorage, IndexedDB, 쿠키에 저장하지 않습니다. 새로고침/창 닫기 후에는 복구하지 않습니다. 교사용 기록·CSV·학생 계정·외부 AI 평가·Google Sheets 전송은 없습니다. 이전 공유용 버전의 저장 키 3개만 접속 시 삭제합니다. 다른 앱의 저장 키는 건드리지 않습니다.

브라우저 음성 서비스와 GitHub Pages의 접속 정보 처리는 별도입니다. 공개 개인정보처리방침에 실제 저장/음성 처리 방식과 문의처를 안내합니다. 기존 원본 앱 egg013-pixel/barista-practice-app은 변경하지 않습니다.

## 자동 배포

현재 GitHub Pages의 Source는 Deploy from a branch → gh-pages → /(root)입니다. `.github/workflows/publish-pages.yml`이 main 변경 때 내장 평가 테스트 → 정적 빌드 → 허용된 gh-pages 브랜치 업데이트 → Pages 빌드 요청을 실행합니다. 기존 gh-pages 전용 배포 보호 규칙을 유지합니다. Actions에서 수동 실행할 수도 있습니다. 소스를 main에 푸시해야 자동 반영되며, 작업 공간에서 수정만 한 상태는 배포되지 않습니다.

`npm ci` 후 `npm run dev`로 로컬 개발, `npm test`, `npm run test:e2e`로 검증합니다. `npm run build:pages`는 `/barista-practice-public` 경로의 정적 파일을 `out/`에 생성합니다. API 키는 필요하지 않습니다.

## 음성 모델 (2026-11)

- TTS: Qwen3-TTS-12Hz-0.6B-CustomVoice, 공식 2026년 공개 모델, Aiden 남성 프리셋(중음역, 약 -20 LUFS 음량)의 한국어 안내 11개를 사전 생성하여 재생합니다. 런타임 TTS 서버나 학생 음성 복제는 없습니다. Apache-2.0, 체크포인트 85e237c12c027371202489a0ec509ded67b5e4b5.
- STT: OpenAI Whisper 계열의 large-v3-turbo(지원 WebGPU 기기, 4비트) / small(WebAssembly CPU, 8비트). 주 음성 인식은 기기 내부 웹 워커에서 처리하며 OS/브라우저 클라우드 음성 인식으로 자동 전환하지 않습니다. 모델 파일만 Hugging Face에서 내려받습니다. 모델은 선택 시점의 고정 리비전으로 로드합니다.
- 처음 음성 기능을 사용할 때 약 250~770MB를 내려받을 수 있습니다. 준비 상태·취소·30초 녹음 제한·직접 입력 대체를 제공합니다. 실행 속도는 기기 성능에 따라 달라집니다. 인식한 내용을 확인하고 직접 입력으로 수정할 수 있습니다.
- 녹음·대사·진행은 저장하지 않습니다. 모델은 열린 페이지 메모리에서 재사용하며 앱이 CacheStorage/IndexedDB에 모델을 보관하지 않습니다. 정적 파일 HTTP 캐시는 브라우저 설정을 따릅니다. 모델 다운로드 제공자가 접속 정보를 처리할 수 있으므로 방침에도 반영했습니다.
- `NEXT_PUBLIC_SPEECH_MODEL_HOST`는 학교가 신뢰하는 자체 모델 미러를 사용할 때만 지정하는 선택적 빌드 설정입니다. 기본값은 https://huggingface.co/ 입니다. 모델 미러를 바꾸면 공개 안내도 실제 제공자에 맞게 확인해야 합니다.
- 안내 문구 변경 시 `scripts/generate-examiner-audio.py`로 다시 생성하고 파일을 검토해야 합니다. 생성 환경은 별도 Python 가상환경의 qwen-tts 0.1.1, CPU torch/torchaudio 2.8 및 공식 의존성입니다. 모델 자체(약 2.4GB)는 저장소에 포함하지 않습니다.

공식 출처: https://github.com/QwenLM/Qwen3-TTS · https://github.com/openai/whisper · https://huggingface.co/onnx-community/whisper-large-v3-turbo · https://huggingface.co/onnx-community/whisper-small

모델/런타임 라이선스는 public/audio/examiner/LICENSE-QWEN.txt와 public/licenses에 있습니다. 이 안내가 앱 자체의 이용 허락 조건을 변경하지는 않습니다.
