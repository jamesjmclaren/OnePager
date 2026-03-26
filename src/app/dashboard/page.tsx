import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const { count: integrationCount } = await supabase
    .from("integrations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Welcome, {profile?.display_name ?? "there"}
      </h1>
      <p className="mt-1 text-gray-600">
        Manage your integrations and customize your page.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connected platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{integrationCount ?? 0}/3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Page</CardTitle>
            <CardDescription>Public URL</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.slug ? (
              <a
                href={`/${profile.slug}`}
                className="text-blue-600 hover:underline"
              >
                onepager.com/{profile.slug}
              </a>
            ) : (
              <p className="text-gray-500">Set a username in Settings</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Current tier</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold capitalize">
              {profile?.plan ?? "free"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
