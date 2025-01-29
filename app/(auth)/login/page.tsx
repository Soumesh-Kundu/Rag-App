import LoginForm from "@/components/LoginForm";
export const dynamic = 'auto'
// insertData()
export default async function page() {
  return (
    <main className="grid place-items-center h-screen w-screen ">
      <LoginForm />
    </main>
  );
}
