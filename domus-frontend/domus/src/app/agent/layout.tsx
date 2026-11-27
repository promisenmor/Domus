import { AgentShell } from "@/components/agent/AgentShell";

export default function AgentLayout({ children }: LayoutProps<"/agent">) {
  return <AgentShell>{children}</AgentShell>;
}
