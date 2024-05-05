import ViewSection from "@/components/view-section";
async function getAllMessages() {
  try {
    const res = await fetch("http://localhost:3000/api/messages/get",{
      cache: 'no-cache',
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
export default async function History() {
  const {messages} = (await getAllMessages()) ;
  return (
    <main className="w-full grid place-items-center">
      <ViewSection messages={messages} />
    </main>
  );
}
