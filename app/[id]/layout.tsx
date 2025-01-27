import { cookies } from "next/headers";
import { permanentRedirect } from "next/navigation";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  if (cookieStore.get("authToken") === undefined) {
    permanentRedirect("/login");
  }
  return <>{children}</>;
}
