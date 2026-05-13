import React from "react";
import { IG, FB, Threads, TikTok, XLogo, YT } from "./Icons";

const ICONS = [
  { href: "https://www.instagram.com/quees_ia", title: "Instagram", Svg: IG },
  { href: "https://www.facebook.com/share/16tCkmXBzp/", title: "Facebook", Svg: FB },
  { href: "https://www.threads.net/@quees_ia", title: "Threads", Svg: Threads },
  { href: "https://www.tiktok.com/@quees_ia", title: "TikTok", Svg: TikTok },
  { href: "https://x.com/quees_ia", title: "X", Svg: XLogo },
  { href: "https://www.youtube.com/@Quees_IA", title: "YouTube", Svg: YT },
];

export default function SocialBubblesHybrid({ dockLeftPx = 16 }) {
  return (
    <div
      className="fixed z-[90] pointer-events-none hidden md:block"
      style={{
        left: dockLeftPx,
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <ul className="flex flex-col gap-3">
        {ICONS.map(({ href, title, Svg }) => (
          <li key={title}>
            <a
              className="pointer-events-auto block p-3 rounded-full bg-white/70 backdrop-blur-md ring-1 ring-white/50 shadow-lg hover:shadow-xl hover:bg-white/90 transition text-blue-600"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
            >
              <Svg className="w-5 h-5" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}