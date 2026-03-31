import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

// Lightweight Supabase client for domain lookups (no cookie handling needed)
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const appDomain = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").host;

  // Custom domain routing — if the hostname doesn't match the app domain,
  // check if it's a verified custom domain and rewrite to the owner's page
  if (hostname !== appDomain && !hostname.startsWith("localhost")) {
    const domainName = hostname.split(":")[0]; // strip port if present

    const supabase = createServiceClient();
    const { data: domain } = await supabase
      .from("custom_domains")
      .select("user_id")
      .eq("domain", domainName)
      .eq("verified", true)
      .single();

    if (domain) {
      // Look up the user's slug
      const { data: profile } = await supabase
        .from("profiles")
        .select("slug")
        .eq("id", domain.user_id)
        .single();

      if (profile?.slug) {
        // Rewrite to the user's public page (preserves the custom domain in the URL bar)
        const url = request.nextUrl.clone();
        url.pathname = `/${profile.slug}`;
        return NextResponse.rewrite(url);
      }
    }

    // Unknown custom domain — show 404
    return NextResponse.next();
  }

  // Standard app routing below — auth handling for dashboard/login
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login
  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
