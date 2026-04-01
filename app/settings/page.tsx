import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfileData } from "@/lib/db/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { EditorPreferencesCard } from "@/components/settings/EditorPreferencesCard";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const profile = await getProfileData(session.user.id);

  if (!profile) {
    redirect("/sign-in");
  }

  const { hasPassword } = profile;

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-muted-foreground">Manage your account preferences and security.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Editor Settings */}
        <EditorPreferencesCard />

        {/* Account Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              {hasPassword && <ChangePasswordDialog />}
              <DeleteAccountDialog />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
