import discordLogo from '../../Discord-Symbol-Blurple.svg';

interface DiscordLogoProps {
  className?: string;
}

export function DiscordLogo({ className }: DiscordLogoProps) {
  return <img src={discordLogo} alt="" aria-hidden="true" className={className} />;
}
