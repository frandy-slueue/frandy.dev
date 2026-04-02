/**
 * Shared social platform config — single source of truth for
 * icon, label, and brand color used in Footer and Contact.
 *
 * Both components import from here so any update (new platform,
 * color tweak) is reflected everywhere automatically.
 */

import React from "react";
import {
  FaGithub, FaLinkedin, FaXTwitter, FaFacebook,
  FaMedium, FaHashnode, FaDev,
} from "react-icons/fa6";

export interface SocialLinks {
  social_github:   string | null;
  social_linkedin: string | null;
  social_x:        string | null;
  social_facebook: string | null;
  social_medium:   string | null;
  social_hashnode: string | null;
  social_devto:    string | null;
}

export const SOCIAL_EMPTY: SocialLinks = {
  social_github: null, social_linkedin: null, social_x: null,
  social_facebook: null, social_medium: null, social_hashnode: null,
  social_devto: null,
};

export interface SocialPlatform {
  key:   string;
  label: string;
  brand: string;
  /** Icon sized for Contact (20px) */
  icon:  React.ReactNode;
  /** Icon sized for Footer (18px) */
  iconSm: React.ReactNode;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: "social_linkedin",  label: "LinkedIn", brand: "#0A66C2", icon: React.createElement(FaLinkedin, { size: 20 }), iconSm: React.createElement(FaLinkedin, { size: 18 }) },
  { key: "social_github",    label: "GitHub",   brand: "#ffffff", icon: React.createElement(FaGithub,   { size: 20 }), iconSm: React.createElement(FaGithub,   { size: 18 }) },
  { key: "social_x",         label: "X",        brand: "#ffffff", icon: React.createElement(FaXTwitter, { size: 20 }), iconSm: React.createElement(FaXTwitter, { size: 18 }) },
  { key: "social_facebook",  label: "Facebook", brand: "#1877F2", icon: React.createElement(FaFacebook, { size: 20 }), iconSm: React.createElement(FaFacebook, { size: 18 }) },
  { key: "social_medium",    label: "Medium",   brand: "#ffffff", icon: React.createElement(FaMedium,   { size: 20 }), iconSm: React.createElement(FaMedium,   { size: 18 }) },
  { key: "social_hashnode",  label: "Hashnode", brand: "#2962FF", icon: React.createElement(FaHashnode, { size: 20 }), iconSm: React.createElement(FaHashnode, { size: 18 }) },
  { key: "social_devto",     label: "Dev.to",   brand: "#ffffff", icon: React.createElement(FaDev,      { size: 20 }), iconSm: React.createElement(FaDev,      { size: 18 }) },
];

/** Returns only platforms that have a URL set */
export function getActiveSocials(links: SocialLinks) {
  return SOCIAL_PLATFORMS.filter(({ key }) => !!links[key as keyof SocialLinks]);
}
