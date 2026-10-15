import Link from 'next/link';
import type { Metadata } from 'next';
export const metadata:Metadata={title:'개인정보처리방침 | 차근차근 바리스타'};
export default function PrivacyPage(){
 return <div className="app-shell"><header className="site-header"><Link className="brand" href="/">차근차근 바리스타</Link><Link className="teacher-link" href="/">연습 화면으로</Link></header>
 <main className="main-content privacy-document"><span className="eyebrow">PRIVACY</span><h1>개인정보처리방침</h1>
 <p className="notice">현재 앱의 동작을 설명하는 검토 중 안내입니다. 운영주체·개인정보 보호책임자·문의 방법·시행일과 외부 음성 서비스의 세부 처리 조건은 아직 확정되지 않았습니다. 정식 방침의 모든 항목이 확정된 상태는 아닙니다.</p>
 <section><h2>1. 처리 목적과 항목</h2><p>바리스타 대사 연습, 피드백, 이어하기와 교사용 기록 확인을 위해 입력한 이름 또는 별칭·수험번호, 입력하거나 음성으로 말한 대사의 텍스트, 연습 시각·단계·시도·평가·피드백·힌트 사용·연습 시간·진행 상태를 처리합니다. 이름 대신 별칭을 사용할 수 있습니다.</p></section>
 <section><h2>2. 기기에 저장되는 기록</h2><p>학습 기록은 이용 중인 브라우저의 localStorage에 저장됩니다. 이 공유용 버전에는 Google Sheets 전송이나 외부 AI 평가 API가 없습니다. 다른 기기의 기록을 자동으로 모으지 않습니다.</p><p>같은 공용 브라우저를 사용하는 사람은 교사용 기록에서 이전 학생의 기록을 볼 수 있습니다. 별도의 교사용 로그인이나 저장 기록 자체의 암호화는 제공하지 않습니다. 교사 관리하에 사용해 주세요.</p></section>
 <section><h2>3. 보유 기간과 삭제</h2><p>자동 만료 기간은 없습니다. 교사용 기록에서 해당 연습을 삭제하거나 브라우저의 사이트 데이터를 지울 때까지 기기에 남습니다. 교사용 기록에서 연습을 삭제하면 해당 시도와 이어하기 정보도 정리됩니다.</p><p>잘못된 기록은 삭제하고 다시 연습할 수 있습니다. CSV로 내려받은 사본은 앱의 삭제 기능으로 지워지지 않습니다. 학교가 보관 기간과 관리·삭제 절차를 정해야 합니다.</p><Link className="privacy-policy-link" href="/admin/">교사용 기록에서 확인·삭제하기</Link></section>
 <section><h2>4. 마이크와 음성 안내</h2><p>마이크를 사용하면 브라우저의 음성 인식 서비스가 음성을 처리할 수 있습니다. 앱은 녹음 파일을 저장하지 않고 인식된 텍스트를 기록합니다. 외부 음성 처리를 원하지 않으면 마이크 대신 직접 입력을 이용할 수 있습니다.</p><p>심사위원 음성 안내는 브라우저의 음성 합성 기능으로 단계 안내 문장을 읽습니다. 음성 서비스 제공자·처리 국가·보유 기간은 실제 사용하는 브라우저와 음성에 따라 달라질 수 있으며 아직 확인 전입니다.</p></section>
 <section><h2>5. 호스팅과 외부 처리</h2><p>앱은 GitHub Pages에서 제공됩니다. 접속 과정에서 호스팅 제공자가 IP 주소·브라우저 정보 등 접속 정보를 처리할 수 있습니다. 위탁·제3자 제공·국외 이전의 구체적인 조건과 권리 행사 절차는 실제 운영 환경 및 제공자의 공식 방침으로 추가 확인해야 합니다.</p><a className="privacy-policy-link" href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub 공식 개인정보 안내</a></section>
 <section><h2>6. 이용 연령과 권리 행사</h2><p>주요 대상은 만 15세 이상 학생입니다. 만 14세 미만 이용을 추가하면 법정대리인 동의 등 필요한 절차를 별도로 검토해야 합니다. 이용자는 해당 기기의 교사용 기록에서 내용을 확인·CSV로 내려받기·삭제할 수 있습니다.</p></section>
 <section><h2>7. 운영 정보와 방침 변경</h2><p>운영주체·제공자, 개인정보 보호책임자 및 문의 방법, 시행일과 변경 고지 절차는 운영자가 확인하여 기재할 예정입니다. 확인되지 않은 개인 이름이나 연락처를 임의로 표시하지 않았습니다.</p></section>
 </main></div>;
}
