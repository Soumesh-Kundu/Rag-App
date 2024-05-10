import ViewSection from "@/components/view-section";
export const dynamic='force-dynamic'
async function getAllMessages(threadId:String) {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/messages/${threadId}/get`,{
      cache:'no-store',
    });
    if(!res.ok) return []
    const data = await res.json()
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
async function delay(time:number){
  return new Promise((resolve) => setTimeout(resolve, time*1000));
}
export default async function History({params}:{params:{id:string}}) {
  const {messages} = (await getAllMessages(params.id)) ;
  return (
    <main className="w-full grid place-items-center">
      <ViewSection messages={messages} />
    </main>
  );
}
