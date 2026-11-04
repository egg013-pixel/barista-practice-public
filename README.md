# 차근차근 바리스타 — 독립 공유용

공유 링크: https://egg013-pixel.github.io/barista-practice-public/

이름·수험번호 입력 없이 글 대본/3D 시험장 연습을 바로 시작합니다. 음성·직접 입력과 내장 피드백, 심사위원 안내, 11단계 제조·서빙 흐름을 제공합니다. 자기소개 단계에는 가상의 이름과 번호를 사용할 수 있습니다.

## 저장하지 않는 연습

대사·결과·진행 상태는 현재 화면에서만 사용하며 localStorage, sessionStorage, IndexedDB, 쿠키에 저장하지 않습니다. 새로고침/창 닫기 후에는 복구하지 않습니다. 교사용 기록·CSV·학생 계정·외부 AI 평가·Google Sheets 전송은 없습니다. 이전 공유용 버전의 저장 키 3개만 접속 시 삭제합니다. 다른 앱의 저장 키는 건드리지 않습니다.

브라우저 음성 서비스와 GitHub Pages의 접속 정보 처리는 별도입니다. 공개 개인정보처리방침에 실제 저장/음성 처리 방식과 문의처를 안내합니다. 기존 원본 앱 egg013-pixel/barista-practice-app은 변경하지 않습니다.

## 자동 배포

현재 GitHub Pages의 Source는 Deploy from a branch → gh-pages → /(root)입니다. `.github/workflows/publish-pages.yml`이 main 변경 때 내장 평가 테스트 → 정적 빌드 → 허용된 gh-pages 브랜치 업데이트 → Pages 빌드 요청을 실행합니다. 기존 gh-pages 전용 배포 보호 규칙을 유지합니다. Actions에서 수동 실행할 수도 있습니다. 소스를 main에 푸시해야 자동 반영되며, 작업 공간에서 수정만 한 상태는 배포되지 않습니다.

`npm ci` 후 `npm run dev`로 로컬 개발, `npm test`, `npm run test:e2e`로 검증합니다. `npm run build:pages`는 `/barista-practice-public` 경로의 정적 파일을 `out/`에 생성합니다. API 키는 필요하지 않습니다.
