import { AgentEnquiriesClient } from "@/components/agent/AgentEnquiriesClient";

export default async function AgentEnquiriesPage({ searchParams }: PageProps<"/agent/enquiries">) {
  const { status } = await searchParams;
  const initialStatus = typeof status === "string" ? status : "";
  return <AgentEnquiriesClient key={initialStatus} initialStatus={initialStatus} />;
}
