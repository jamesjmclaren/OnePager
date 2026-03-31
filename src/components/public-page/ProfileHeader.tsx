import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export function ProfileHeader({ displayName, bio, avatarUrl }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <Avatar className="h-20 w-20">
        <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
        <AvatarFallback
          className="text-2xl"
          style={{
            backgroundColor: "var(--card-bg)",
            color: "var(--text-primary)",
            borderColor: "var(--card-border)",
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <h1
        className="mt-4 text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {displayName}
      </h1>
      {bio && (
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {bio}
        </p>
      )}
    </div>
  );
}
