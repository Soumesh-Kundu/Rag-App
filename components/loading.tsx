import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@radix-ui/react-dropdown-menu";

export default function loading() {
  return (
    <>
      <div className="space-y-4 max-w-6xl w-[calc(100%-2rem)] scrollbar px-2 lg:px-0">
        <div className="w-full rounded-xl bg-white p-4 shadow-xl pb-0">
          <div className="flex max-h-[85dvh] scrollbar pr-1 flex-col gap-5 divide-y overflow-y-auto pb-4 duration-300">
          <>
                <div className="w-full">
                  <div className="flex items-center gap-5 mb-4">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-3/5 h-3 rounded-full" />
                  </div>
                  <Separator />
                  <div className="flex gap-5 mt-4 w-full">
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    <div className="flex flex-col gap-2  flex-grow">
                      <Skeleton className="w-9/12 h-3 rounded-full" />
                      <Skeleton className="w-7/12 h-2 rounded-full" />
                      <Skeleton className="w-5/12 h-2 rounded-full" />
                    </div>
                    <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    </div>
                  </div>
                </div>
                <div className="w-full mt-4">
                  <div className="flex items-center gap-5 my-4">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-4/12 h-3 rounded-full" />
                  </div>
                  <Separator />
                  <div className="flex gap-5 mt-4 w-full">
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    <div className="flex flex-col gap-2  flex-grow">
                      <Skeleton className="w-7/12 h-3 rounded-full" />
                      <Skeleton className="w-9/12 h-2 rounded-full" />
                      <Skeleton className="w-5/12 h-2 rounded-full" />
                    </div>
                    <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    <Skeleton className="w-8 h-8 rounded-lg mt-2" />
                    </div>
                  </div>
                </div>
              </>
          </div>
        </div>
      </div>
    </>
  );
}
