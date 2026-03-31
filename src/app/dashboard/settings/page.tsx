"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Trash2, CheckCircle, Clock, Crown } from "lucide-react";

interface CustomDomain {
  id: string;
  domain: string;
  txt_record: string;
  verified: boolean;
  verified_at: string | null;
}

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [userPlan, setUserPlan] = useState("free");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Custom domains state
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainMessage, setDomainMessage] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name ?? "");
        setSlug(data.slug ?? "");
        setBio(data.bio ?? "");
        setUserPlan(data.plan ?? "free");
      }
    };
    loadProfile();
    loadDomains();
  }, []);

  const loadDomains = async () => {
    const res = await fetch("/api/domains");
    if (res.ok) {
      const data = await res.json();
      setDomains(data);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, slug: slug || null, bio })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Settings saved!");
    }
    setSaving(false);
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    setDomainLoading(true);
    setDomainMessage("");

    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: newDomain.trim() }),
    });
    const data = await res.json();

    if (res.ok) {
      setDomains((prev) => [data, ...prev]);
      setNewDomain("");
      setDomainMessage("Domain added! Add the TXT record to your DNS.");
    } else {
      setDomainMessage(data.error ?? "Failed to add domain");
    }
    setDomainLoading(false);
  };

  const handleVerify = async (domainId: string) => {
    setVerifyingId(domainId);
    setDomainMessage("");

    const res = await fetch("/api/domains/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domainId }),
    });
    const data = await res.json();

    if (data.verified) {
      setDomains((prev) =>
        prev.map((d) =>
          d.id === domainId ? { ...d, verified: true, verified_at: new Date().toISOString() } : d
        )
      );
      setDomainMessage("Domain verified successfully!");
    } else {
      setDomainMessage(data.message ?? "Verification failed");
    }
    setVerifyingId(null);
  };

  const handleDeleteDomain = async (domainId: string) => {
    const res = await fetch(`/api/domains?id=${domainId}`, { method: "DELETE" });
    if (res.ok) {
      setDomains((prev) => prev.filter((d) => d.id !== domainId));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-gray-600">Manage your profile and domain.</p>

      <Card className="mt-8 max-w-lg">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your public info</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Username</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">onepager.com/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="your-username"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio"
            />
          </div>
          {message && (
            <p className={`text-sm ${message.includes("saved") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>

      {/* Custom Domain Section */}
      <Card className="mt-8 max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Custom Domain
            </CardTitle>
            {userPlan === "pro" && (
              <Badge className="bg-yellow-100 text-yellow-800">
                <Crown className="mr-1 h-3 w-3" />
                Pro
              </Badge>
            )}
          </div>
          <CardDescription>
            Connect your own domain to your OnePager
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userPlan !== "pro" ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                Custom domains are a Pro feature.
              </p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => (window.location.href = "/dashboard/upgrade")}
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="links.yourdomain.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddDomain();
                  }}
                />
                <Button
                  onClick={handleAddDomain}
                  disabled={domainLoading || !newDomain.trim()}
                >
                  {domainLoading ? "Adding..." : "Add"}
                </Button>
              </div>

              {domainMessage && (
                <p
                  className={`text-sm ${
                    domainMessage.includes("verified") || domainMessage.includes("added")
                      ? "text-green-600"
                      : "text-amber-600"
                  }`}
                >
                  {domainMessage}
                </p>
              )}

              {domains.length > 0 && (
                <div className="space-y-3">
                  {domains.map((domain) => (
                    <div
                      key={domain.id}
                      className="rounded-lg border p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {domain.domain}
                          </span>
                          {domain.verified ? (
                            <Badge
                              variant="secondary"
                              className="bg-green-50 text-green-700"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDomain(domain.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>

                      {!domain.verified && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500">
                            Add this TXT record to your DNS:
                          </p>
                          <div className="rounded bg-gray-50 px-3 py-2 font-mono text-xs break-all">
                            {domain.txt_record}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerify(domain.id)}
                            disabled={verifyingId === domain.id}
                          >
                            {verifyingId === domain.id
                              ? "Checking..."
                              : "Verify DNS"}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
