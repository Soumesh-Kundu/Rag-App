import { TransformedMessage } from "@/components/transform";
import { Message } from "ai";

export interface ChatHandler {
  messages: TransformedMessage[];
  input: string;
  isLoading: boolean;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    ops?: {
      data?: any;
    },
  ) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reload?: () => void;
  stop?: () => void;
  onFileUpload?: (file: File) => Promise<void>;
  onFileError?: (errMsg: string) => void;
  topK:number
}
