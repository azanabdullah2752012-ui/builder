export interface EmojiItem {
  emoji: string;
  name: string;
  category: 'Popular' | 'Tech & Code' | 'Launch & Growth' | 'Business' | 'Reactions' | 'Badges';
  keywords: string;
}

export const EMOJI_CATALOG: EmojiItem[] = [
  // Popular
  { emoji: '🚀', name: 'Rocket', category: 'Popular', keywords: 'launch spaceship startup speed' },
  { emoji: '✨', name: 'Sparkles', category: 'Popular', keywords: 'magic shine clean star new' },
  { emoji: '🔥', name: 'Fire', category: 'Popular', keywords: 'flame hot trending lit' },
  { emoji: '⚡', name: 'Lightning Bolt', category: 'Popular', keywords: 'power speed electricity fast' },
  { emoji: '💎', name: 'Diamond', category: 'Popular', keywords: 'gem premium luxury value' },
  { emoji: '🎯', name: 'Bullseye / Target', category: 'Popular', keywords: 'goal accuracy focus aim' },
  { emoji: '🎉', name: 'Party Popper', category: 'Popular', keywords: 'celebrate confetti celebrate fun' },
  { emoji: '❤️', name: 'Red Heart', category: 'Popular', keywords: 'love favorite like' },
  { emoji: '💡', name: 'Lightbulb', category: 'Popular', keywords: 'idea insight knowledge think' },
  { emoji: '🌟', name: 'Glowing Star', category: 'Popular', keywords: 'rating favorite review quality' },

  // Tech & Code
  { emoji: '💻', name: 'Laptop', category: 'Tech & Code', keywords: 'computer coding dev software mac' },
  { emoji: '⚙️', name: 'Gear', category: 'Tech & Code', keywords: 'settings config system automate' },
  { emoji: '🛡️', name: 'Shield', category: 'Tech & Code', keywords: 'security safe protect privacy' },
  { emoji: '🌐', name: 'Globe with Meridians', category: 'Tech & Code', keywords: 'internet web world global network' },
  { emoji: '📱', name: 'Mobile Phone', category: 'Tech & Code', keywords: 'phone smartphone responsive app' },
  { emoji: '🎨', name: 'Artist Palette', category: 'Tech & Code', keywords: 'design color art ui styling' },
  { emoji: '🛠️', name: 'Hammer & Wrench', category: 'Tech & Code', keywords: 'tools build customize repair' },
  { emoji: '🤖', name: 'Robot', category: 'Tech & Code', keywords: 'ai bot automation smart future' },
  { emoji: '🔒', name: 'Padlock', category: 'Tech & Code', keywords: 'secure locked privacy safety' },
  { emoji: '🔋', name: 'Battery', category: 'Tech & Code', keywords: 'power energy full charge' },

  // Launch & Growth
  { emoji: '📈', name: 'Chart Increasing', category: 'Launch & Growth', keywords: 'growth analytics revenue up scale' },
  { emoji: '🏆', name: 'Trophy', category: 'Launch & Growth', keywords: 'winner first award success' },
  { emoji: '🥇', name: '1st Place Medal', category: 'Launch & Growth', keywords: 'gold top rank winner' },
  { emoji: '🌱', name: 'Seedling', category: 'Launch & Growth', keywords: 'grow plant nature fresh start' },
  { emoji: '🏁', name: 'Chequered Flag', category: 'Launch & Growth', keywords: 'finish goal complete ship' },
  { emoji: '💫', name: 'Dizzy / Sparkle Star', category: 'Launch & Growth', keywords: 'impact shine dynamic' },
  { emoji: '📣', name: 'Megaphone', category: 'Launch & Growth', keywords: 'announce marketing promo broadcast' },
  { emoji: '🚀', name: 'Spaceship', category: 'Launch & Growth', keywords: 'speed fast take off scale' },

  // Business & Money
  { emoji: '💰', name: 'Money Bag', category: 'Business', keywords: 'cash wealth finance revenue funding' },
  { emoji: '💳', name: 'Credit Card', category: 'Business', keywords: 'payment stripe checkout buy billing' },
  { emoji: '🤝', name: 'Handshake', category: 'Business', keywords: 'deal partnership agreement team trust' },
  { emoji: '📊', name: 'Bar Chart', category: 'Business', keywords: 'stats data metrics metrics dashboard' },
  { emoji: '💼', name: 'Briefcase', category: 'Business', keywords: 'work job office portfolio b2b' },
  { emoji: '🏷️', name: 'Price Tag', category: 'Business', keywords: 'discount coupon pricing sale' },
  { emoji: '⭐', name: 'Gold Star', category: 'Business', keywords: 'rating 5star review customer' },

  // Reactions & Gestures
  { emoji: '👍', name: 'Thumbs Up', category: 'Reactions', keywords: 'like approve yes agree good' },
  { emoji: '👏', name: 'Clapping Hands', category: 'Reactions', keywords: 'applause bravo celebrate praise' },
  { emoji: '🙌', name: 'Raising Hands', category: 'Reactions', keywords: 'yay hooray excitement win' },
  { emoji: '✌️', name: 'Victory Hand', category: 'Reactions', keywords: 'peace win cool positive' },
  { emoji: '🤩', name: 'Star-Struck', category: 'Reactions', keywords: 'wow excited amazed smile' },
  { emoji: '😎', name: 'Smiling with Sunglasses', category: 'Reactions', keywords: 'cool confident smooth hero' },
  { emoji: '💪', name: 'Flexed Biceps', category: 'Reactions', keywords: 'strong power robust resilient' },
  { emoji: '🤝', name: 'Collaboration', category: 'Reactions', keywords: 'together partner meet' },

  // Badges & Symbols
  { emoji: '✅', name: 'Check Mark Button', category: 'Badges', keywords: 'verified done approved complete' },
  { emoji: '🟢', name: 'Green Circle', category: 'Badges', keywords: 'active live status operational online' },
  { emoji: '🔵', name: 'Blue Circle', category: 'Badges', keywords: 'info status dot' },
  { emoji: '🟣', name: 'Purple Circle', category: 'Badges', keywords: 'badge dot luxury' },
  { emoji: '👑', name: 'Crown', category: 'Badges', keywords: 'king vip pro founder leader' },
  { emoji: '🪄', name: 'Magic Wand', category: 'Badges', keywords: 'automate ai wizard generate' },
  { emoji: '🔔', name: 'Bell', category: 'Badges', keywords: 'notify alert subscribe remind' },
  { emoji: '🎁', name: 'Gift Box', category: 'Badges', keywords: 'bonus perk free present prize' },
];

export const EMOJI_CATEGORIES = ['All', 'Popular', 'Tech & Code', 'Launch & Growth', 'Business', 'Reactions', 'Badges'] as const;
