"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Lock,
  Check,
  Plus,
  Trash2,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { themes, type Theme } from "@/lib/themes";
import { PLAN_LIMITS, type PlanType } from "@/lib/plan";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LayoutItem {
  type: string;
  label: string;
  itemType?: "integration" | "header";
  id?: string;
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
  github: "GitHub",
  bluesky: "Bluesky",
  custom_link: "Custom Link",
  spotify: "Spotify",
  discord: "Discord",
  substack: "Substack",
  medium: "Medium",
  reddit: "Reddit",
  kick: "Kick",
  soundcloud: "SoundCloud",
  mastodon: "Mastodon",
};

function getItemId(item: LayoutItem, index: number): string {
  return item.id ?? `${item.type}-${index}`;
}

function SortableItem({
  item,
  index,
  totalItems,
  isPro,
  onMoveUp,
  onMoveDown,
  onRemove,
  onLabelChange,
}: {
  item: LayoutItem;
  index: number;
  totalItems: number;
  isPro: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove?: () => void;
  onLabelChange?: (label: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: getItemId(item, index), disabled: !isPro });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isHeader = item.itemType === "header";

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={isHeader ? "border-dashed" : ""}>
        <CardHeader className="flex flex-row items-center gap-4 py-3">
          <div
            {...(isPro ? { ...attributes, ...listeners } : {})}
            className={isPro ? "cursor-grab active:cursor-grabbing" : ""}
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          {isHeader ? (
            <Input
              value={item.label}
              onChange={(e) => onLabelChange?.(e.target.value)}
              className="flex-1 text-base font-semibold border-none shadow-none p-0 h-auto"
              placeholder="Section title..."
            />
          ) : (
            <CardTitle className="flex-1 text-base">
              {item.label ?? platformLabels[item.type] ?? item.type}
            </CardTitle>
          )}
          <Badge variant="secondary">
            {isHeader ? "header" : item.type}
          </Badge>
          <div className="flex gap-1">
            {!isPro && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMoveUp}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMoveDown}
                  disabled={index === totalItems - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </>
            )}
            {isHeader && onRemove && (
              <Button variant="ghost" size="sm" onClick={onRemove}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function PageEditorPage() {
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [layoutMode, setLayoutMode] = useState<"single" | "grid">("single");
  const [userPlan, setUserPlan] = useState<PlanType>("free");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isPro = userPlan === "pro";
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: page }, { data: ints }, { data: profile }] = await Promise.all([
        supabase.from("pages").select("*").eq("user_id", user.id).single(),
        supabase.from("integrations").select("*").eq("user_id", user.id).eq("is_active", true),
        supabase.from("profiles").select("slug, plan").eq("id", user.id).single(),
      ]);

      setSlug(profile?.slug ?? null);
      setUserPlan((profile?.plan as PlanType) ?? "free");
      setIsPublished(page?.is_published ?? false);
      setSelectedTheme(page?.theme ?? "default");
      setLayoutMode(page?.layout_mode ?? "single");

      const existingLayout = (page?.layout as LayoutItem[]) ?? [];
      const connectedPlatforms = (ints ?? []).map((i: Integration) => i.platform);

      const merged = existingLayout.filter(
        (item) =>
          item.itemType === "header" ||
          connectedPlatforms.includes(item.type)
      );
      connectedPlatforms.forEach((platform: string) => {
        if (!merged.find((m) => m.type === platform && m.itemType !== "header")) {
          merged.push({
            type: platform,
            label: platformLabels[platform] ?? platform,
            itemType: "integration",
          });
        }
      });

      // Ensure all items have ids for dnd-kit
      const withIds = merged.map((item, i) => ({
        ...item,
        id: item.id ?? `${item.type}-${i}-${Date.now()}`,
      }));

      setLayout(withIds);
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLayout((items) => {
      const oldIndex = items.findIndex((item, i) => getItemId(item, i) === active.id);
      const newIndex = items.findIndex((item, i) => getItemId(item, i) === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const addSectionHeader = () => {
    const id = `header-${Date.now()}`;
    setLayout((prev) => [
      ...prev,
      { type: "header", label: "New Section", itemType: "header", id },
    ]);
  };

  const removeItem = (index: number) => {
    setLayout((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLabel = (index: number, label: string) => {
    setLayout((prev) =>
      prev.map((item, i) => (i === index ? { ...item, label } : item))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/page", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        layout,
        theme: selectedTheme,
        layout_mode: layoutMode,
        is_published: isPublished,
      }),
    });

    if (res.ok) {
      setMessage("Saved!");
    } else {
      const data = await res.json();
      setMessage(data.error ?? "Failed to save");
    }
    setSaving(false);
  };

  const allowedThemes = PLAN_LIMITS[userPlan].themes;
  const isThemeLocked = (theme: Theme) =>
    !(allowedThemes as readonly string[]).includes(theme.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Page Editor</h1>
          <p className="mt-1 text-gray-600">
            Arrange your widgets, pick a theme, and publish your page.
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

      {/* Theme Picker */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Theme</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose a look for your public page.
          {!isPro && " Upgrade to Pro for premium themes."}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {themes.map((theme) => {
            const locked = isThemeLocked(theme);
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  if (locked) {
                    window.location.href = "/dashboard/upgrade";
                    return;
                  }
                  setSelectedTheme(theme.id);
                }}
                className={`group relative overflow-hidden rounded-xl border-2 p-1 transition-all ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                } ${locked ? "opacity-60" : ""}`}
              >
                <div
                  className="aspect-[4/3] w-full rounded-lg"
                  style={{ background: theme.preview }}
                />
                <div className="mt-1.5 flex items-center justify-center gap-1 pb-1">
                  {locked && <Lock className="h-3 w-3 text-gray-400" />}
                  {isSelected && <Check className="h-3 w-3 text-blue-500" />}
                  <span className="text-xs font-medium truncate">
                    {theme.name}
                  </span>
                </div>
                {theme.tier === "pro" && (
                  <Badge
                    variant="secondary"
                    className="absolute right-1 top-1 text-[10px] px-1 py-0"
                  >
                    PRO
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout Mode + Pro Controls */}
      <div className="mt-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Widget Order</h2>
          {isPro && (
            <p className="mt-1 text-sm text-gray-500">
              Drag to reorder. Add section headers to organize.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Layout mode toggle */}
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <button
              onClick={() => setLayoutMode("single")}
              className={`rounded-md p-1.5 transition-colors ${
                layoutMode === "single" ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
              title="Single column"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (!isPro) {
                  window.location.href = "/dashboard/upgrade";
                  return;
                }
                setLayoutMode("grid");
              }}
              className={`rounded-md p-1.5 transition-colors ${
                layoutMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"
              } ${!isPro ? "opacity-50" : ""}`}
              title={isPro ? "Two-column grid" : "Grid layout (Pro)"}
            >
              <LayoutGrid className="h-4 w-4" />
              {!isPro && <Lock className="h-2.5 w-2.5 absolute" />}
            </button>
          </div>
          {isPro && (
            <Button variant="outline" size="sm" onClick={addSectionHeader}>
              <Plus className="mr-1 h-4 w-4" />
              Add Header
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {layout.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Connect integrations to add widgets to your page.
            </CardContent>
          </Card>
        ) : isPro ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={layout.map((item, i) => getItemId(item, i))}
              strategy={verticalListSortingStrategy}
            >
              {layout.map((item, index) => (
                <SortableItem
                  key={getItemId(item, index)}
                  item={item}
                  index={index}
                  totalItems={layout.length}
                  isPro={true}
                  onMoveUp={() => moveItem(index, -1)}
                  onMoveDown={() => moveItem(index, 1)}
                  onRemove={
                    item.itemType === "header"
                      ? () => removeItem(index)
                      : undefined
                  }
                  onLabelChange={
                    item.itemType === "header"
                      ? (label) => updateLabel(index, label)
                      : undefined
                  }
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          layout.map((item, index) => (
            <SortableItem
              key={getItemId(item, index)}
              item={item}
              index={index}
              totalItems={layout.length}
              isPro={false}
              onMoveUp={() => moveItem(index, -1)}
              onMoveDown={() => moveItem(index, 1)}
            />
          ))
        )}
      </div>
    </div>
  );
}
