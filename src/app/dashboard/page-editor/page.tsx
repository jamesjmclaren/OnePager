"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GripVertical, ArrowUp, ArrowDown } from "lucide-react";

interface LayoutItem {
  type: string;
  label: string;
}

interface Integration {
  platform: string;
  is_active: boolean;
  cached_data: Record<string, unknown>;
}

const platformLabels: Record<string, string> = {
  youtube: "YouTube",
  twitter: "Twitter / X",
  twitch: "Twitch",
};

export default function PageEditorPage() {
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: page }, { data: ints }, { data: profile }] = await Promise.all([
        supabase.from("pages").select("*").eq("user_id", user.id).single(),
        supabase.from("integrations").select("*").eq("user_id", user.id).eq("is_active", true),
        supabase.from("profiles").select("slug").eq("id", user.id).single(),
      ]);

      setSlug(profile?.slug ?? null);
      setIsPublished(page?.is_published ?? false);

      const existingLayout = (page?.layout as LayoutItem[]) ?? [];
      const connectedPlatforms = (ints ?? []).map((i: Integration) => i.platform);

      // Merge: keep existing order, add new integrations, remove disconnected
      const merged = existingLayout.filter((item) =>
        connectedPlatforms.includes(item.type)
      );
      connectedPlatforms.forEach((platform: string) => {
        if (!merged.find((m) => m.type === platform)) {
          merged.push({ type: platform, label: platformLabels[platform] ?? platform });
        }
      });

      setLayout(merged);
      setIntegrations(ints ?? []);
    };
    load();
  }, []);

  const moveItem = (index: number, direction: -1 | 1) => {
    const newLayout = [...layout];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newLayout.length) return;
    [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
    setLayout(newLayout);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/page", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout, is_published: isPublished }),
    });

    if (res.ok) {
      setMessage("Saved!");
    } else {
      const data = await res.json();
      setMessage(data.error ?? "Failed to save");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Page Editor</h1>
          <p className="mt-1 text-gray-600">
            Arrange your widgets and publish your page.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {message && (
        <p className={`mt-4 text-sm ${message === "Saved!" ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="published"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
          <Label htmlFor="published">Published</Label>
        </div>
        {slug && isPublished && (
          <span className="text-sm text-gray-500">
            Live at{" "}
            <a href={`/${slug}`} className="text-blue-600 hover:underline">
              /{slug}
            </a>
          </span>
        )}
        {!slug && (
          <span className="text-sm text-amber-600">
            Set a username in Settings first
          </span>
        )}
      </div>

      <div className="mt-8 space-y-3">
        {layout.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Connect integrations to add widgets to your page.
            </CardContent>
          </Card>
        ) : (
          layout.map((item, index) => (
            <Card key={item.type}>
              <CardHeader className="flex flex-row items-center gap-4 py-3">
                <GripVertical className="h-5 w-5 text-gray-400" />
                <CardTitle className="flex-1 text-base">
                  {item.label ?? platformLabels[item.type] ?? item.type}
                </CardTitle>
                <Badge variant="secondary">{item.type}</Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === layout.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
