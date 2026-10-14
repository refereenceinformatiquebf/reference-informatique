import type { Metadata } from "next";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import { MfaPanel } from "./mfa-panel";

export const metadata: Metadata = { title: "Sécurité" };
export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const active = data?.totp?.find((factor) => factor.status === "verified");

  return (
    <>
      <AdminHeader
        title="Sécurité du compte"
        subtitle="Protégez l'accès à l'administration avec un code sur votre téléphone."
      />
      <Panel title="Double vérification" className="max-w-2xl">
        <MfaPanel enabledFactorId={active?.id} />
      </Panel>
    </>
  );
}
