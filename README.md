# 차근차근 바리스타 — 독립 공유용

공유 링크: https://egg013-pixel.github.io/barista-practice-public/

원본 보존 버전: egg013-pixel/barista-practice-app @ 3abf50b.

글 대본·3D 시험장·11단계 음성 및 타자 연습·심사위원 안내·피드백·이어하기·교사용 기간 조회/삭제·CSV 다운로드를 유지합니다.

## 기기에만 저장

Google Sheets 자동 전송·재전송·전송 대기 표시를 제거했습니다. 서버 API도 포함하지 않는 정적 배포본이므로, API 키 또는 Sheets 자격 증명을 추가해도 외부로 연습 기록을 전송하지 않습니다. 피드백은 원래 앱의 내장 평가를 사용합니다. 마이크 음성 인식과 심사위원 음성은 브라우저 음성 서비스를 사용합니다.

기록은 접속한 브라우저에 저장됩니다. 다른 기기의 기록을 자동으로 통합하지 않으며 CSV로 보관할 수 있습니다. 원본과 별도 주소 및 별도 저장 키를 사용하므로 기록이 섞이지 않습니다. 원본 앱의 코드·설정·주소는 수정하지 않았습니다.

## GitHub Pages 배포

`npm ci` 후 `PAGES_BASE_PATH=/barista-practice-public npm run build`로 정적 파일을 `out/`에 생성합니다. `out/`의 내용을 `.nojekyll`과 함께 `gh-pages` 브랜치의 루트에 게시합니다. 저장소 Settings → Pages → Deploy from a branch → gh-pages → /(root) → Save를 선택합니다.

배포 주소: https://egg013-pixel.github.io/barista-practice-public/ (배포 완료, 로그인 없이 접속 가능).

## 로컬 개발

`npm ci`, `npm run dev`, `npm run build`, `npm test`, `npm run test:e2e`.

기존 private 저장소와 별도의 공유 복사본입니다. API 키와 학생 기록은 소스나 정적 배포 파일에 포함하지 않습니다.
