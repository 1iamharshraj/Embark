import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/competitions.html", destination: "/hackathons", permanent: true },
      { source: "/competition.html", destination: "/hackathons", permanent: true },
      { source: "/competition/:path*", destination: "/hackathon/:path*", permanent: true },
      { source: "/competitions", destination: "/hackathons", permanent: true },
      { source: "/playbooks.html", destination: "/playbooks", permanent: true },
      { source: "/playbook.html", destination: "/playbooks", permanent: true },
      { source: "/mentorship.html", destination: "/mentorship", permanent: true },
      { source: "/guest-lectures.html", destination: "/guest-lectures", permanent: true },
      { source: "/account.html", destination: "/account", permanent: true },
      { source: "/mentor-profile.html", destination: "/experts", permanent: true },
      { source: "/mentor/:slug*", destination: "/experts", permanent: true },
      { source: "/become-speaker.html", destination: "/become-a-speaker", permanent: true },
      { source: "/invite-expert.html", destination: "/invite-an-expert", permanent: true },
    ];
  },
};

export default withPWA(nextConfig);
