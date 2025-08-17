// /api/_env_check.js  (ESM)
export default async function handler(req, res) {
  const present = (k) => Boolean(process.env[k] && String(process.env[k]).trim().length > 0);
  return res.status(200).json({
    ok: true,
    has_PUBLIC_URL: present("PUBLIC_URL"),
    has_CORS_ORIGINS: present("CORS_ORIGINS"),
    has_STRIPE_SECRET_KEY: present("STRIPE_SECRET_KEY"),
    has_FB_PROJECT_ID: present("FB_PROJECT_ID"),
    has_FB_CLIENT_EMAIL: present("FB_CLIENT_EMAIL"),
    has_FB_PRIVATE_KEY: present("FB_PRIVATE_KEY"),
    env: process.env.VERCEL_ENV || "unknown",
  });
}
