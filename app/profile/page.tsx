import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfileData } from "@/lib/db/profile";
import { UserAvatar } from "@/components/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { iconMap } from "@/lib/icon-map";
import { CalendarDays, Mail, User } from "lucide-react";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const profile = await getProfileData(session.user.id);

  if (!profile) {
    redirect("/sign-in");
  }

  const hasPassword = !!profile.hashedPassword;

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-muted-foreground">Your account and usage overview</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* User Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <UserAvatar
                name={profile.name}
                image={profile.image}
                className="size-16 text-lg"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {profile.name ?? "No name set"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {profile.email}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="size-4 shrink-0" />
                <span className="truncate">{profile.name ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4 shrink-0" />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Totals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-2xl font-bold">{profile.totalItems}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-2xl font-bold">{profile.totalCollections}</p>
                <p className="text-sm text-muted-foreground">Collections</p>
              </div>
            </div>

            <Separator />

            {/* Per-type breakdown */}
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                By Type
              </p>
              <ul className="space-y-2">
                {profile.itemTypeCounts.map((type) => {
                  const Icon = iconMap[type.icon] ?? iconMap.Code;
                  return (
                    <li
                      key={type.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className="size-4 shrink-0"
                          style={{ color: type.color }}
                        />
                        <span className="text-sm capitalize">{type.name}s</span>
                      </div>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {type.count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardContent>
        </Card>

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
