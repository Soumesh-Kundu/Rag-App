import ViewSection from "@/components/view-section";
export const dynamic='force-dynamic'

export default async function History({params}:{params:{id:string}}) {
  return (
    <main className="w-full grid place-items-center">
      <ViewSection />
    </main>
  );
}
