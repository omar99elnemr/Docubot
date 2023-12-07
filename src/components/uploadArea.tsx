"use client";
import { useUploadThing } from "@/lib/uploadThing";
import { useState } from "react";
import Dropzone from "react-dropzone";
import { AiOutlineCloud, AiOutlineFile } from "react-icons/ai";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

function UploadArea({ isSubscribed }: { isSubscribed: boolean }) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { startUpload } = useUploadThing(
    isSubscribed ? "proPlanUploader" : "freePlanUploader"
  );
  const { toast } = useToast();
  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`);
    },
    retry: true,
    retryDelay: 500,
  });
  const progresSimulation = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);
    return interval;
  };
  return (
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFile) => {
        setIsUploading(true);
        const progressInterval = progresSimulation();

        const res = await startUpload(acceptedFile);
        if (!res) {
          return toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }
        const [fileResponse] = res;
        const key = fileResponse.key;

        if (!key) {
          return toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
        startPolling({ key });
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col justify-center items-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <AiOutlineCloud size={`40px`} />
                <p className="mb-2 text-sm text-zinc-700 ">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-sm text-zinc-500">
                  PDF (up to {isSubscribed ? "16MB & 25 pages" : "4MB & 10 pages"})
                </p>
              </div>

              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <AiOutlineFile />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (
                <div className="flex flex-col justify-center items-center first-letter:w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    className="progress progress-info w-56"
                    indicatorColor={
                      uploadProgress === 100
                        ? 'bg-green-500'
                        : ''
                    }
                    value={uploadProgress}
                  />
                  {uploadProgress === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <div role="status">
                      <Loader2 className='h-3 w-3 animate-spin  text-blue-700 inline' />
                        Redirecting...
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <input
                type="file"
                className="hidden"
                id="dropzone-file"
                {...getInputProps() }
         
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
}

export default UploadArea;
