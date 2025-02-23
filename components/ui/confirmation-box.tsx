import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "./dialog";
import Loader from "../Loader";
import { DialogTitle } from "@radix-ui/react-dialog";
type ConfirmationBoxProps = {
  itemName: string;
  status: "open" | "closed" | string;
  id: number;
  onConfirm: (
    id: number
  ) => Promise<void>;
  onCancel: () => void;
};

export default function ConfirmationBox({
  itemName,
  status,
  id,
  onCancel,
  onConfirm,
}: ConfirmationBoxProps) {
  const [boxOpen, setBoxOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  useEffect(() => {
    if (status === "open") {
      setBoxOpen(true);
    }
  }, [status]);

  async function handleConfirm() {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsHidden(true);
    }, 200);
    try {
      await onConfirm(id);
    } catch (error) {
      console.log(error);
    }
    setTimeout(() => {
      setIsHidden(false);
      setBoxOpen(false);
      onCancel();
      setIsLoading(false);
    }, 50);
  }
  return (
    <Dialog
      open={boxOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setBoxOpen(false);
          onCancel()
          setIsHidden(false);
          setIsLoading(false);
        }
      }}
    >
      <DialogContent className="max-w-sm w-[calc(100%-16px)] rounded-lg p-10 flex flex-col gap-8 items-center">
        <DialogTitle className="hidden">sdfsd</DialogTitle>
        <span className="w-[calc(100%-20px)] text-center">
          Are you sure to delete <strong>{itemName.slice(0, 25)}</strong> and
          all its history and data ?
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
          <DialogClose asChild>
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
