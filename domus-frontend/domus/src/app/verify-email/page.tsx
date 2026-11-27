import { AuthPanel } from "@/components/auth/AuthPanel";

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;
  return <AuthPanel mode="verify" token={token} />;
}
