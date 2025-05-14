import { LoadingIcon } from "@/app/components/loading-icon";

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
      <LoadingIcon size={40} />
    </div>
  );
}
