import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'Aether Flow · Próximo passo',description:'Próxima ação clara para cada oportunidade.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
