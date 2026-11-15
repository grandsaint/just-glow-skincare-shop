import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/queries";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./icons";

export function SocialLinks({ className, variant = "soft" }: { className?: string; variant?: "soft" | "solid" }) {
  const { data } = useQuery(settingsQuery);
  const s = data ?? DEFAULT_SETTINGS;
  const links = [
    { label: "Instagram", href: s.instagram_url, Icon: InstagramIcon },
    { label: "Facebook", href: s.facebook_url, Icon: FacebookIcon },
    { label: "TikTok", href: s.tiktok_url, Icon: TikTokIcon },
  ];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={cn(
            "grid h-11 w-11 place-items-center rounded-full transition-all hover:-translate-y-0.5",
            variant === "soft"
              ? "bg-peach text-primary hover:bg-primary hover:text-primary-foreground"
              : "bg-primary text-primary-foreground shadow-soft hover:bg-primary-deep",
          )}
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}
