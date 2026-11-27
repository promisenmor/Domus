import { AgentListingForm } from "@/components/agent/AgentListingForm";

export default async function EditAgentListingPage({ params }: PageProps<"/agent/listings/[id]/edit">) {
  const { id } = await params;
  return <AgentListingForm listingId={id} />;
}
