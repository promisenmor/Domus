import { AuthPanel } from "@/components/auth/AuthPanel";

type ResetPasswordPageProps = {
  searchParams: Promise<{ uid?: string; token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { uid, token } = await searchParams;
  return <AuthPanel mode="reset" uid={uid} token={token} />;
}
