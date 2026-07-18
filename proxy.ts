// proxy.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config"; // 💡 Clean configuration structure
import { NextResponse } from "next/server";

// Next.js 16 initializes context by passing the clean config object
const { auth } = NextAuth(authConfig);

// ⚡ CRITICAL: The exported function name must be exactly "proxy" in Next.js 16+
export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/employees");
  const isEmployeeRoute = nextUrl.pathname.startsWith("/my-profile") || nextUrl.pathname.startsWith("/time-off");
  const isAuthRoute = nextUrl.pathname.startsWith("/login");

  // 1. Unauthenticated Route Guard
  if (!isLoggedIn && (isAdminRoute || isEmployeeRoute)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 2. Authenticated Session Protection (Bypass Login Screen)
  if (isLoggedIn && isAuthRoute) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/my-profile", nextUrl));
  }

  // 3. Strict Admin Role Firewall Rule
  if (isAdminRoute && userRole !== "admin") {
    return NextResponse.redirect(new URL("/my-profile", nextUrl));
  }

  // 4. Strict Employee Role Firewall Rule
  if (isEmployeeRoute && userRole !== "employee") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

// Configure standard exclusions for core static resources and framework engine files
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};