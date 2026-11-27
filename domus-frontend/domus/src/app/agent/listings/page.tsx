import { AgentListingsClient } from "@/components/agent/AgentListingsClient";

export default async function AgentListingsPage({ searchParams }: PageProps<"/agent/listings">) {
  const { status } = await searchParams;
  const initialStatus = typeof status === "string" ? status : "";
  return <AgentListingsClient key={initialStatus} initialStatus={initialStatus} />;
}
