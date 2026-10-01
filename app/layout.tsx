import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'Aether Flow · Radar de oportunidades',description:'Saiba quem precisa de retorno antes que a venda esfrie.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
