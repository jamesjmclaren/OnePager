"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";

const freeFeatures = [
  "3 integrations",
  "YouTube, Twitter, Twitch, GitHub, Bluesky, Custom Link",
  "3 basic themes",
  "Single-column layout",
  "Public page with custom slug",
];

const proFeatures = [
  "Unlimited integrations",
  "All platforms including Spotify, Discord, Substack, Medium & more",
  "13+ premium themes",
  "Grid & single-column layouts",
  "Drag-and-drop page editor",
  "Section headers",
  "Custom domain support",
];

export default function UpgradePage() {
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [toggling, setToggling] = useState(false);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === "development");
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      setCurrentPlan(profile?.plan ?? "free");
    };
    load();
  }, []);

  const togglePlan = async () => {
    setToggling(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const newPlan = currentPlan === "free" ? "pro" : "free";
    await supabase
      .from("profiles")
      .update({ plan: newPlan })
      .eq("id", user.id);
    setCurrentPlan(newPlan);
    setToggling(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Upgrade to Pro</h1>
      <p className="mt-1 text-gray-600">
        Unlock unlimited integrations, premium themes, and advanced page customization.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className={currentPlan === "free" ? "ring-2 ring-gray-300" : ""}>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Get started with the basics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0</p>
            <p className="mt-1 text-sm text-gray-500">Forever</p>
            <ul className="mt-6 space-y-3">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  {feature}
                </li>
              ))}
            </ul>
            {currentPlan === "free" && (
              <Badge className="mt-6" variant="secondary">Current plan</Badge>
            )}
          </CardContent>
        </Card>

        <Card className={currentPlan === "pro" ? "ring-2 ring-yellow-400" : "ring-1 ring-gray-200"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Pro</CardTitle>
              <Crown className="h-5 w-5 text-yellow-500" />
            </div>
            <CardDescription>Everything you need to stand out</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Coming Soon</p>
            <p className="mt-1 text-sm text-gray-500">Pricing TBD</p>
            <ul className="mt-6 space-y-3">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                  {feature}
                </li>
              ))}
            </ul>
            {currentPlan === "pro" && (
              <Badge className="mt-6 bg-yellow-100 text-yellow-800">Current plan</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {isDev && (
        <div className="mt-8 rounded-lg border border-dashed border-orange-300 bg-orange-50 p-4">
          <p className="text-sm font-medium text-orange-800">Dev Mode Only</p>
          <p className="mt-1 text-sm text-orange-600">
            Toggle your plan for testing. This button is only visible in development.
          </p>
          <Button
            className="mt-3"
            variant="outline"
            onClick={togglePlan}
            disabled={toggling}
          >
            {toggling
              ? "Switching..."
              : `Switch to ${currentPlan === "free" ? "Pro" : "Free"}`}
          </Button>
        </div>
      )}
    </div>
  );
}
