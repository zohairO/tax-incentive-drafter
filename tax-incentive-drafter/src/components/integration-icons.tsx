import type { ComponentPropsWithoutRef } from "react";
import {
  SiConfluence,
  SiGithub,
  SiJira,
  SiLinear,
  SiSlack,
} from "react-icons/si";

type IconProps = ComponentPropsWithoutRef<"svg">;

export function GitHubLogo(props: IconProps) {
  return <SiGithub {...props} />;
}

export function JiraLogo(props: IconProps) {
  return <SiJira {...props} />;
}

export function SlackLogo(props: IconProps) {
  return <SiSlack {...props} />;
}

export function ConfluenceLogo(props: IconProps) {
  return <SiConfluence {...props} />;
}

export function LinearLogo(props: IconProps) {
  return <SiLinear {...props} />;
}
