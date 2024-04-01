import { useState } from "react";
import { Button } from "./ui/button";

type NewChatProps = {
  revalidationRoot: () => Promise<void>;
};
export default function NewChat({ revalidationRoot }: NewChatProps) {
  const [isLoading, setLoading] = useState<boolean>(false);
  async function deleteCache() {
    try {
      setLoading(true);
      const res = await fetch("/api/deleteCache", {
        method: "DELETE",
      });
      if (!res.ok) {
        console.log("failed to delete");
      }
      await revalidationRoot();
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }
  return (
    <div className="w-full flex justify-end gap-4">
      <Button variant="outline" className="" onClick={deleteCache}>
        {isLoading ? (
          <span className="px-3">
            <l-dot-wave size={37} speed={1.6} color="black"></l-dot-wave>
          </span>
        ) : (
          <span>New Chat</span>
        )}
      </Button>
    </div>
  );
}
