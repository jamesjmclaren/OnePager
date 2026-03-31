import { randomBytes } from "crypto";

export function generateTxtRecord(): string {
  return `onepager-verify=${randomBytes(16).toString("hex")}`;
}

export async function verifyDomainDns(
  domain: string,
  expectedTxtRecord: string
): Promise<boolean> {
  try {
    // Use DNS-over-HTTPS for edge compatibility (works in both Node.js and Edge Runtime)
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return false;

    const data = await res.json();
    const txtRecords: string[] = (data.Answer ?? [])
      .filter((a: { type: number }) => a.type === 16) // TXT record type
      .map((a: { data: string }) => a.data.replace(/"/g, ""));

    return txtRecords.some((record) => record.includes(expectedTxtRecord));
  } catch {
    return false;
  }
}

export async function addDomainToVercel(domain: string): Promise<boolean> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) return false;

  try {
    const res = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/domains`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: domain }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function removeDomainFromVercel(domain: string): Promise<boolean> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) return false;

  try {
    const res = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
