import DemoWorkspace, { type DemoView } from "./demo-workspace";

export const dynamic = "force-dynamic";

const views: DemoView[] = ["panel", "alerts", "contacts", "pipeline", "messages", "data", "team"];

export default async function DemoPage({searchParams}:{searchParams?:Promise<{view?:string}>}){
  const params = searchParams ? await searchParams : {};
  const view = views.includes(params.view as DemoView) ? (params.view as DemoView) : "panel";
  return <DemoWorkspace view={view} />;
}
