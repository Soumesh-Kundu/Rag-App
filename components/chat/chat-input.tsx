import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import FileUploader from "../ui/file-uploader";
import { Input } from "../ui/input";
import { Send } from "lucide-react";
import UploadImagePreview from "../ui/upload-image-preview";
import { ChatHandler } from "./chat.interface";
import { useParams } from "next/navigation";

export default function ChatInput(
  props: Pick<
    ChatHandler,
    | "isLoading"
    | "input"
    | "onFileUpload"
    | "onFileError"
    | "handleSubmit"
    | "handleInputChange"
    | "topK"
  > & {
    multiModal?: boolean;
  }
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [text, setText] = useState<string>(props.input);
  const [isDoc, setIsDoc] = useState(false);
  const params = useParams();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (imageUrl) {
      props.handleSubmit(e, {
        data: { imageUrl: imageUrl, topK: props.topK, indexName: params.id },
      });
      setImageUrl(null);
      return;
    }
    setIsDoc(false);
    setText("");
    props.handleSubmit(e, {
      data: {
        topK: props.topK,
        indexName: params.id,
      },
    });
  };

  const onRemovePreviewImage = () => setImageUrl(null);
  useEffect(() => {
    if (!isDoc && /^\/doc/i.test(text)) {
      setIsDoc(true);
      setText("");
    }
  }, [text,isDoc]);

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
    if(isDoc){
      e.target.value='```/doc``` '+e.target.value;
    }
    props.handleInputChange(e);
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && text === "") {
      // e.preventDefault();
      setIsDoc(false);
    }
  }

  const handleUploadImageFile = async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
    setImageUrl(base64);
  };

  const handleUploadFile = async (file: File) => {
    try {
      if (props.multiModal && file.type.startsWith("image/")) {
        return await handleUploadImageFile(file);
      }
      props.onFileUpload?.(file);
    } catch (error: any) {
      props.onFileError?.(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl bg-white p-4 shadow-xl space-y-4"
    >
      {imageUrl && (
        <UploadImagePreview url={imageUrl} onRemove={onRemovePreviewImage} />
      )}
      <div className="flex w-full items-center justify-between gap-2 ">
        <div tabIndex={0} className="flex-1 ring-offset-background  flex gap-2  items-center border-2 border-input rounded-md px-3 has-[input:focus]:ring-2 has-[input:focus]:ring-offset-2 has-[input:focus]:ring-ring">
          {isDoc && (
            <code className=" font-semibold bg-gray-300 rounded-md px-2 py-1">/doc</code>
          )}
          <Input
            autoFocus
            name="message"
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="flex-1 border-none outline-none focus-visible:!ring-0 focus-visible:ring-offset-0 focus-visible:!bg-transparent !p-0 px-3"
            value={text}
            onChange={handleOnChange}
          />
        </div>
        <Button
          type="submit"
          disabled={props.isLoading}
          className="!px-2.5 h-full py-3 flex items-center gap-2 !bg-ui-600"
        >
          <Send className="lg:hidden" size={20}/>{" "}
          <span className="hidden lg:inline">Send message</span>
        </Button>
      </div>
    </form>
  );
}
