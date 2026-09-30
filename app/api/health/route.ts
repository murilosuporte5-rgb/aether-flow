export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json({status:'ok',product:'Aether Flow'}, {headers:{'Cache-Control':'no-store'}});
}
