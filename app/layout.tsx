import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'차근차근 바리스타 | 실기 대본 연습',description:'한마디씩 자신 있게. 바리스타 2급 실기 11단계 음성 연습.'};
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="ko"><body><a className="skip-link" href="#main">본문으로 바로가기</a><div id="main">{children}</div></body></html>;
}
