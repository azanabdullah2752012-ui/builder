export interface StockImageItem {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  category: 'Mockup' | 'Abstract' | 'Avatar' | 'Workspace';
}

export const STOCK_IMAGES: StockImageItem[] = [
  {
    id: 'stock-saas-dashboard',
    name: 'SaaS Analytics Dashboard',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=70',
    category: 'Mockup',
  },
  {
    id: 'stock-3d-fluid',
    name: '3D Liquid Gradient Wave',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=70',
    category: 'Abstract',
  },
  {
    id: 'stock-neon-sphere',
    name: 'Iridescent Cyber Sphere',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=300&q=70',
    category: 'Abstract',
  },
  {
    id: 'stock-tech-workspace',
    name: 'Modern Minimalist Workspace',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=300&q=70',
    category: 'Workspace',
  },
  {
    id: 'stock-avatar-1',
    name: 'Executive Portrait 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=70',
    category: 'Avatar',
  },
  {
    id: 'stock-avatar-2',
    name: 'Founder Portrait 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=70',
    category: 'Avatar',
  },
];

export const STOCK_PRESETS = STOCK_IMAGES;
