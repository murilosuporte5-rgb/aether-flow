import type {Metadata} from 'next';import {DM_Sans,Manrope} from 'next/font/google';import './globals.css';import PerformanceMetrics from './performance-metrics';
const dmSans=DM_Sans({subsets:['latin'],weight:['400','500','600','700'],variable:'--font-dm-sans',display:'swap'});
const manrope=Manrope({subsets:['latin'],weight:['400','500','600','700','800'],variable:'--font-manrope',display:'swap'});
export const metadata:Metadata={title:'Aether Flow · Radar de oportunidades',description:'Saiba quem precisa de retorno antes que a venda esfrie.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body className={`${dmSans.variable} ${manrope.variable}`}><PerformanceMetrics />{children}</body></html>}
