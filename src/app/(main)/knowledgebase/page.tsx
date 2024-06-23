import { getSSRSession } from "@/lib/get-server-session";

export default async function Knowledgebase() {
  const { user } = await getSSRSession();

  if (!user) {
    return (
      <div>
        <h1>Unauthorized</h1>
      </div>
    );
  }

  return (
    <div>
      <>something interesting here</>
    </div>
  );
}
