import dynamic from "next/dynamic";
import { getSSRSession } from "@/lib/get-server-session";
import { isUserSubscribed } from "@/use-cases/subscriptions";

// Dynamically import the client component
const FileUploadClient = dynamic(() => import("./fileUpload"), { ssr: false });

export default async function Knowledgebase() {
  const { user } = await getSSRSession();
  if (!user) {
    return (
      <div>
        <h1>Unauthorized</h1>
      </div>
    );
  }
  const subscribed = await isUserSubscribed(user.id);

  return (
    <div className="max-w-2xl mx-auto w-full py-12 min-h-screen">
      <FileUploadClient userId={user.id} isSubscribed={subscribed} />
    </div>
  );
}
