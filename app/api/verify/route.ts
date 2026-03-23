import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Use a mock redis if env vars are missing so local dev doesn't crash
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : ({
        eval: async () => [1, 10, Date.now() + 60000],
        // Add stub methods Ratelimit might call
        get: async () => null,
        set: async () => 'OK',
        del: async () => 1,
      } as unknown as Redis); // mock fallback

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(`verify_${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        },
      );
    }

    const body = await req.json();
    if (!body.email || !body.walletAddress) {
      return NextResponse.json({ error: 'Missing email or walletAddress' }, { status: 400 });
    }

    // In a real implementation we might send a verification email with a code here.
    // For this sprint, we assume immediate true.
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
