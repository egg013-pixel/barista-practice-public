import Link from 'next/link';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'개인정보처리방침 | 차근차근 바리스타'};
export default function PrivacyPage(){
 return <div className="app-shell"><header className="site-header"><Link className="brand" href="/">차근차근 바리스타</Link><Link className="teacher-link" href="/">연습 화면으로</Link></header>
 <main className="main-content privacy-document"><span className="eyebrow">PRIVACY</span><h1>개인정보처리방침</h1>
 <p>시행일: 2026년 10월 15일 · 최종 수정일: 2026년 11월 4일</p>
 <p className="notice">이번 변경으로 이름·수험번호 입력, 브라우저 학습 기록 저장, 교사용 기록·CSV 기능을 제거했습니다. 운영주체와 외부 음성 서비스의 세부 처리 조건은 아직 확인이 필요합니다.</p>
 <section><h2>1. 입력 정보와 이용 목적</h2><p>이름·수험번호 입력이나 가입 없이 연습할 수 있습니다. 바리스타 대사와 진행 상태, 피드백·결과는 현재 열려 있는 화면에서 연습을 진행하는 동안에만 사용합니다. 실제 개인정보 대신 가상의 이름과 번호로 자기소개를 연습해 주세요.</p></section>
 <section><h2>2. 저장하지 않는 정보</h2><p>이 앱은 학습 기록·대사·피드백·진행 상태를 localStorage, sessionStorage, IndexedDB 또는 쿠키에 저장하지 않습니다. 교사용 기록, CSV 다운로드, 저장된 연습 이어하기 기능은 없습니다. 새로고침하거나 창을 닫으면 현재 연습 내용은 사라집니다.</p><p>앱 자체 서버 API, Google Sheets 전송, 외부 AI 평가 API도 사용하지 않습니다. 피드백은 현재 브라우저에서 내장 평가로 제공합니다.</p></section>
 <section><h2>3. 이전 버전 기록의 정리</h2><p>이전 버전이 해당 브라우저에 남긴 이 앱의 기록·진행 정보는 새 버전 접속 시 삭제합니다. 다른 앱의 저장 공간은 지우지 않습니다. 브라우저가 저장 공간 접근을 차단하면 삭제가 불가능할 수 있으므로 브라우저 설정에서 이 사이트의 데이터를 직접 삭제할 수 있습니다. 예전에 내려받은 CSV 사본은 이 앱에서 삭제할 수 없습니다.</p></section>
 <section><h2>4. 마이크와 음성 안내</h2><p>마이크를 사용하면 브라우저 음성 인식 서비스가 음성을 처리할 수 있습니다. 앱은 녹음 파일을 저장하지 않으며 인식한 대사는 현재 연습 화면에서만 사용합니다. 음성 인식을 원하지 않으면 직접 입력으로 연습할 수 있습니다.</p><p>심사위원 음성 안내는 브라우저 음성 합성 기능으로 안내 문장을 읽습니다. 음성 서비스 제공자·처리 국가·보유 기간 등은 실제 브라우저와 음성에 따라 달라질 수 있으며 확인 전입니다. 학습 기록을 저장하지 않는다는 설명이 외부 음성 서비스의 처리가 전혀 없다는 뜻은 아닙니다.</p></section>
 <section><h2>5. 호스팅과 외부 처리</h2><p>앱은 GitHub Pages에서 제공합니다. 호스팅 제공자는 접속 과정에서 IP 주소·브라우저 정보 등의 접속 정보를 처리할 수 있습니다. 위탁·제3자 제공·국외 이전 조건과 권리 행사 방법은 실제 운영 환경 및 제공자의 공식 방침으로 확인해야 합니다.</p><a className="privacy-policy-link" href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub 공식 개인정보 안내</a></section>
 <section><h2>6. 이용 연령과 권리 행사</h2><p>주요 대상은 만 15세 이상 학생입니다. 만 14세 미만 이용을 추가하면 필요한 동의 절차를 별도로 검토해야 합니다. 현재 연습 내용은 처음 화면으로 돌아가거나 새로고침해 지울 수 있습니다. 앱에는 서버에 보관한 학생 기록이 없으며, 외부 음성·호스팅 제공자가 처리한 정보는 해당 제공자의 공식 절차를 확인해야 합니다.</p></section>
 <section><h2>7. 개인정보 보호책임자와 문의처</h2><p><strong>개인정보 보호책임자: 최세은</strong></p><p>문의처: 블로그 ‘오늘도 배우는 특수교사’ 운영자 ‘특수샘 혜윰’</p><p>블로그의 실제 주소는 확인되지 않아 링크로 표시하지 않았습니다. 운영주체·제공자의 구체적인 정보는 추가 확인이 필요합니다.</p></section>
 </main></div>;
}
