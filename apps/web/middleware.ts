import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAdminEmail } from '@/lib/admin';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
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

  // Refresh session so it doesn't expire
  const { data: { user } } = await supabase.auth.getUser();

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/enroll', request.url));
  }

  // Role-aware redirects for auth entry pages
  if (user && request.nextUrl.pathname === '/mentor-login') {
    const admin = isAdminEmail(user.email);
    if (admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle<{ role: 'student' | 'mentor' }>();

    if (profile?.role === 'mentor') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const { data: intakeForm } = await supabase
      .from('intake_forms')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle<{ id: string }>();

    if (intakeForm) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.redirect(new URL('/enroll', request.url));
  }

  if (user && request.nextUrl.pathname === '/enroll') {
    const admin = isAdminEmail(user.email);
    if (admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle<{ role: 'student' | 'mentor' }>();

    if (profile?.role === 'mentor') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const { data: intakeForm } = await supabase
      .from('intake_forms')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle<{ id: string }>();

    if (intakeForm) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/dashboard/:path*', '/enroll', '/mentor-login'],
};
