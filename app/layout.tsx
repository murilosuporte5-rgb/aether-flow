import type {Metadata} from 'next';import './globals.css';import PerformanceMetrics from './performance-metrics';
export const metadata:Metadata={title:'Aether Flow · Radar de oportunidades',description:'Saiba quem precisa de retorno antes que a venda esfrie.',icons:{icon:'/brand/aether-mark.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><PerformanceMetrics />{children}</body></html>}
