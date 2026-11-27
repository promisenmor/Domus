import { AgentEnquiryDetail } from "@/components/agent/AgentEnquiryDetail";

export default async function AgentEnquiryPage({ params }: PageProps<"/agent/enquiries/[id]">) {
  const { id } = await params;
  return <AgentEnquiryDetail enquiryId={id} />;
}
