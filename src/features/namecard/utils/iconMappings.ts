// Social icons mapping
export const SOCIAL_ICONS: Record<string, string> = {
  // Common social platforms
  'facebook': '/asset/icons/facebook.svg',
  'twitter': '/asset/icons/twitter.svg',
  'instagram': '/asset/icons/instagram.svg',
  'linkedin': '/asset/icons/linkedin.svg',
  'github': '/asset/icons/github.svg',
  'gitlab': '/asset/icons/gitlab.svg',
  'youtube': '/asset/icons/youtube.svg',
  'medium': '/asset/icons/medium.svg',
  'discord': '/asset/icons/discord.svg',
  'behance': '/asset/icons/behance.svg',
  'dribbble': '/asset/icons/dribbble.svg',
  'pinterest': '/asset/icons/pinterest.svg',
  'mastodon': '/asset/icons/mastodon.svg',
  'email': '/asset/icons/email.svg',
  'website': '/asset/icons/website.svg',
  'phone': '/asset/icons/Mobile.svg',
  'location': '/asset/icons/location.svg',
  // Add more icons as needed
};

// Function to get icon path safely with type checking
export const getIconPath = (platform: string): string => {
  return SOCIAL_ICONS[platform] || '/asset/icons/link.svg'; // Default icon
};
