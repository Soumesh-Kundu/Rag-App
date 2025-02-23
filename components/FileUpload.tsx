"use client";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import Dotwave from "./Loaders/Dotwave";
export default function FileUpload() {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<any>(null);
  const [files, setFiles] = useState<any>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const params = useParams();
  function handleChange(e: any) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      for (let i = 0; i < e.target.files["length"]; i++) {
        setFiles((prevState: any) => [...prevState, e.target.files[i]]);
      }
    }
  }

  async function handleSubmitFile(e: any): Promise<void> {
    if (files.length === 0) {
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("threadId", params.id as string);
    for (let file of files) {
      formData.append("files", file);
    }
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        router.push(`/${params.id}/query`);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  function handleDrop(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      for (let i = 0; i < e.dataTransfer.files["length"]; i++) {
        setFiles((prevState: any) => [...prevState, e.dataTransfer.files[i]]);
      }
    }
  }

  function handleDragLeave(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDragOver(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragEnter(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function removeFile(fileName: any, idx: any) {
    const newArr = [...files];
    newArr.splice(idx, 1);
    setFiles([]);
    setFiles(newArr);
  }

  function openFileExplorer() {
    inputRef.current.value = "";
    inputRef.current.click();
  }

  return (
    <div className="space-y-4 max-w-6xl w-full scrollbar px-2 lg:px-0 grid place-items-center">
      <div className="w-[calc(100%-20px)] sm:w-2/3 md:w-1/3 rounded-xl bg-white p-4 shadow-xl ">
          <form
            className={`${
              dragActive ? "bg-blue-400" : "bg-gray-100"
            }  p-6 w-full rounded-lg   text-center flex flex-col items-center justify-center`}
            onDragEnter={handleDragEnter}
            onSubmit={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
          >
            {/* this input element allows us to select files for upload. We make it hidden so we can activate it when the user clicks select files */}
            <input
              placeholder="fileInput"
              className="hidden"
              ref={inputRef}
              type="file"
              multiple
              onChange={handleChange}
              accept=".pdf"
            />

            <p>
              Drag & Drop files or{" "}
              <span
                className="font-bold text-blue-600 cursor-pointer"
                onClick={openFileExplorer}
              >
                <u>Select files</u>
              </span>{" "}
              to upload (PDF only)
            </p>

            <div className="flex flex-col items-center p-3 ">
              {files.map((file: any, idx: any) => (
                <div
                  key={idx}
                  className="grid grid-cols-4 place-items-center w-full items-center space-x-5 gap-4"
                >
                  <span className="col-span-3 my-1 place-self-center">
                    {file.name}
                  </span>
                  <span
                    className="text-red-500 cursor-pointer"
                    onClick={() => removeFile(file.name, idx)}
                  >
                    <Trash2 strokeWidth={2.3} size={24} />
                  </span>
                </div>
              ))}
            </div>

            <Button
              className="!bg-ui-600 rounded-lg  mt-3 w-auto"
              onClick={handleSubmitFile}
            >
              {isLoading ? (
                <span className="px-1 ">
                  <Dotwave size={40} speed={1.6} color="white"></Dotwave>
                </span>
              ) : (
                <span className="px-1 text-white">Upload</span>
              )}
            </Button>
          </form>
        </div>
      </div>
  );
}
