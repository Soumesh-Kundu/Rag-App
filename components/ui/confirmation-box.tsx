import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "./dialog";
import Loader from "../Loader";
type ConfirmationBoxProps = {
  itemName: string;
  status: "open" | "closed" | string;
  id: string;
  onConfirm: (id: string) => Promise<{success:boolean}>;
  onCancel: () => void;
};

export default function ConfirmationBox({
  itemName,
  status,
  id,
  onCancel,
  onConfirm,
}: ConfirmationBoxProps) {
  const BoxTriggerRef = useRef<HTMLButtonElement>(null);
  const BoxCloseRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  useEffect(() => {
    if (status === "open") {
      BoxTriggerRef.current?.click();
    }
  }, [status]);

  async function handleConfirm() {
    setIsLoading(true);
    setTimeout(() => {
      setIsHidden(true);
    }, 200);
    try {
        const {success}=await onConfirm(id);
    } catch (error) {
        console.log(error)
    }
    BoxCloseRef.current?.click();
  }
  return (
    <Dialog
      onOpenChange={(e) => {
        if (!e) {
          onCancel();
          setIsLoading(false);
          setIsHidden(false);
        }
      }}
    >
      <DialogTrigger ref={BoxTriggerRef}></DialogTrigger>
      <DialogContent className="max-w-sm p-10 flex flex-col gap-8 items-center">
        <span className="w-[calc(100%-20px)] text-center">
          Are you sure to delete <strong>{itemName.slice(0, 25)}</strong> ?
        </span>
        <div className="w-full flex items-center gap-3 justify-around">
          <Button
            onClick={handleConfirm}
            variant="destructive"
            className="px-12 w-full transition-all "
          >
            {isLoading ? (
              <Loader stroke={1.8} size={26} color="white" />
            ) : (
              "Yes"
            )}
          </Button>
          <DialogClose ref={BoxCloseRef}>
            <Button
              variant="outline"
              className={`px-12 duration-200 w-full transition-all ease-linear scale-100 ${
                isLoading ? "w-0 p-0 overflow-hidden" : ""
              } ${isHidden ? "hidden" : ""}`}
            >
              No
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
