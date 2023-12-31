import ChatWrapper from "@/components/chat/chatwrapper";
import PdfRenderer from "@/components/pdfRenderer";
import { db } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    fileid: string;
  };
}

async function Page({ params }: PageProps) {
  const { fileid } = params;
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`);

  const file = await db.file.findFirst({
    where: {
      id: fileid,
      userId: user.id,
    },
  });

  if (!file) notFound();

  const plan = await getUserSubscriptionPlan()
  
  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left side where PDF is */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <PdfRenderer url={file.url} />
          </div>
        </div>

        {/* Right hand side */}
        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96  lg:border-l lg:border-t-0">
          <ChatWrapper fileId={file.id}  isSubscribed={plan.isSubscribed} />
        </div>
      </div>
    </div>
  );
}

export default Page;
