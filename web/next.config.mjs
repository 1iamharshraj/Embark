import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/competitions.html", destination: "/hackathons", permanent: true },
      { source: "/competition.html", destination: "/hackathons", permanent: true },
      { source: "/competition", destination: "/hackathons", permanent: true },
      { source: "/competitions", destination: "/hackathons", permanent: true },
      { source: "/playbooks.html", destination: "/playbooks", permanent: true },
      { source: "/playbook.html", destination: "/playbooks", permanent: true },
      { source: "/mentorship.html", destination: "/mentorship", permanent: true },
      { source: "/guest-lectures.html", destination: "/guest-lectures", permanent: true },
      { source: "/account.html", destination: "/account", permanent: true },
      { source: "/mentor-profile.html", destination: "/experts", permanent: true },
      { source: "/become-speaker.html", destination: "/become-a-speaker", permanent: true },
      { source: "/invite-expert.html", destination: "/invite-an-expert", permanent: true },
    ];
  },
};

export default withPWA(nextConfig);
