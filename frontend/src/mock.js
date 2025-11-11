// Mock data for the influencer marketplace

export const categories = [
  { id: 1, name: 'Social Media Shoutouts', icon: '📱', count: 2450 },
  { id: 2, name: 'Sponsored Content', icon: '📸', count: 1890 },
  { id: 3, name: 'Brand Collaborations', icon: '🤝', count: 1250 },
  { id: 4, name: 'Video Reviews', icon: '🎥', count: 980 },
  { id: 5, name: 'Product Unboxing', icon: '📦', count: 750 },
  { id: 6, name: 'Live Streaming', icon: '📡', count: 620 },
  { id: 7, name: 'Story Mentions', icon: '✨', count: 1420 },
  { id: 8, name: 'Podcast Features', icon: '🎙️', count: 380 }
];

export const influencers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    username: '@sarahj',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    rating: 4.9,
    reviewCount: 342,
    level: 'Top Rated',
    followers: '250K',
    platform: 'Instagram',
    categories: ['Social Media Shoutouts', 'Sponsored Content'],
    services: [
      {
        id: 101,
        title: 'I will create engaging Instagram story shoutout for your brand',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=300&fit=crop',
        packages: {
          basic: { name: 'Basic', price: 50, delivery: 2, features: ['1 Story Post', '24h Duration', 'Brand Tag'] },
          standard: { name: 'Standard', price: 100, delivery: 2, features: ['3 Story Posts', '48h Duration', 'Brand Tag', 'Swipe Up Link'] },
          premium: { name: 'Premium', price: 180, delivery: 3, features: ['5 Story Posts', '72h Duration', 'Brand Tag', 'Swipe Up Link', 'Dedicated Post'] }
        },
        description: 'Professional Instagram influencer with 250K engaged followers. I specialize in lifestyle and fashion content.',
        category: 'Social Media Shoutouts'
      }
    ]
  },
  {
    id: 2,
    name: 'Mike Chen',
    username: '@miketech',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    rating: 5.0,
    reviewCount: 189,
    level: 'Pro Verified',
    followers: '500K',
    platform: 'YouTube',
    categories: ['Video Reviews', 'Product Unboxing'],
    services: [
      {
        id: 102,
        title: 'I will review your tech product on my YouTube channel',
        image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&h=300&fit=crop',
        packages: {
          basic: { name: 'Basic', price: 200, delivery: 7, features: ['5-min Review Video', 'Product Mention', 'Description Link'] },
          standard: { name: 'Standard', price: 400, delivery: 7, features: ['10-min Review Video', 'Detailed Analysis', 'Pinned Comment', 'Description Link'] },
          premium: { name: 'Premium', price: 750, delivery: 10, features: ['15-min Review Video', 'Detailed Analysis', 'Dedicated Video', 'Social Promotion'] }
        },
        description: 'Tech reviewer with 500K subscribers. I create honest, in-depth product reviews.',
        category: 'Video Reviews'
      }
    ]
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    username: '@emmafitness',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    rating: 4.8,
    reviewCount: 276,
    level: 'Top Rated',
    followers: '180K',
    platform: 'TikTok',
    categories: ['Sponsored Content', 'Brand Collaborations'],
    services: [
      {
        id: 103,
        title: 'I will create viral TikTok content promoting your fitness brand',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=300&fit=crop',
        packages: {
          basic: { name: 'Basic', price: 80, delivery: 3, features: ['1 TikTok Video', 'Brand Mention', 'Hashtags'] },
          standard: { name: 'Standard', price: 150, delivery: 4, features: ['2 TikTok Videos', 'Brand Integration', 'Custom Hashtag', 'Bio Link'] },
          premium: { name: 'Premium', price: 280, delivery: 5, features: ['3 TikTok Videos', 'Full Brand Integration', 'Custom Hashtag', 'Bio Link', 'Instagram Reels'] }
        },
        description: 'Fitness influencer specializing in workout routines and healthy lifestyle content.',
        category: 'Sponsored Content'
      }
    ]
  },
  {
    id: 4,
    name: 'David Park',
    username: '@davidcooks',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    rating: 4.9,
    reviewCount: 421,
    level: 'Pro Verified',
    followers: '320K',
    platform: 'Instagram',
    categories: ['Product Unboxing', 'Sponsored Content'],
    services: [
      {
        id: 104,
        title: 'I will feature your food product in my cooking content',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&h=300&fit=crop',
        packages: {
          basic: { name: 'Basic', price: 120, delivery: 5, features: ['1 Recipe Post', 'Product Feature', 'Tagged Photo'] },
          standard: { name: 'Standard', price: 220, delivery: 5, features: ['2 Recipe Posts', 'Video Reel', 'Product Feature', 'Story Mention'] },
          premium: { name: 'Premium', price: 400, delivery: 7, features: ['3 Recipe Posts', '2 Video Reels', 'Dedicated Feature', 'Story Series'] }
        },
        description: 'Food content creator sharing delicious recipes with an engaged community.',
        category: 'Sponsored Content'
      }
    ]
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    username: '@lisalifestyle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    rating: 4.7,
    reviewCount: 198,
    level: 'Rising Talent',
    followers: '95K',
    platform: 'Instagram',
    categories: ['Story Mentions', 'Social Media Shoutouts'],
    services: [
      {
        id: 105,
        title: 'I will promote your lifestyle brand on Instagram',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=300&fit=crop',
        packages: {
          basic: { name: 'Basic', price: 45, delivery: 2, features: ['2 Story Mentions', 'Brand Tag'] },
          standard: { name: 'Standard', price: 85, delivery: 3, features: ['1 Feed Post', '3 Story Mentions', 'Swipe Up Link'] },
          premium: { name: 'Premium', price: 150, delivery: 3, features: ['2 Feed Posts', '5 Story Mentions', 'Swipe Up Link', 'IGTV Feature'] }
        },
        description: 'Lifestyle blogger focusing on fashion, travel, and daily inspiration.',
        category: 'Social Media Shoutouts'
      }
    ]
  },
  {
    id: 6,
    name: 'Alex Turner',
    username: '@alexgaming',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    rating: 5.0,
    reviewCount: 512,
    level: 'Pro Verified',
    followers: '750K',
    platform: 'Twitch',
    categories: ['Live Streaming', 'Brand Collaborations'],
    services: [
      {
        id: 106,
        title: 'I will showcase your gaming product during live streams',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&h=300&fit=crop',
        packages: {
          basic: { name: 'Basic', price: 250, delivery: 7, features: ['1 Stream Feature', '2hr Stream', 'Product Mention'] },
          standard: { name: 'Standard', price: 500, delivery: 7, features: ['2 Stream Features', '4hr Total', 'Gameplay Demo', 'Chat Engagement'] },
          premium: { name: 'Premium', price: 900, delivery: 10, features: ['4 Stream Features', '8hr Total', 'Dedicated Stream', 'Social Promotion'] }
        },
        description: 'Professional gamer and streamer with a dedicated gaming community.',
        category: 'Live Streaming'
      }
    ]
  }
];

export const allServices = influencers.flatMap(influencer => 
  influencer.services.map(service => ({
    ...service,
    influencer: {
      id: influencer.id,
      name: influencer.name,
      username: influencer.username,
      avatar: influencer.avatar,
      rating: influencer.rating,
      reviewCount: influencer.reviewCount,
      level: influencer.level,
      followers: influencer.followers,
      platform: influencer.platform
    }
  }))
);

export const reviews = [
  {
    id: 1,
    serviceId: 101,
    buyerName: 'John Smith',
    buyerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    rating: 5,
    comment: 'Amazing work! Sarah delivered exactly what I needed and the engagement was fantastic.',
    date: '2024-01-15'
  },
  {
    id: 2,
    serviceId: 101,
    buyerName: 'Maria Garcia',
    buyerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    rating: 5,
    comment: 'Professional and responsive. Will definitely work with her again!',
    date: '2024-01-10'
  },
  {
    id: 3,
    serviceId: 102,
    buyerName: 'Tech Startup Inc',
    buyerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech',
    rating: 5,
    comment: 'Mike provided an excellent review of our product. Very thorough and professional.',
    date: '2024-01-08'
  }
];

export const orders = [
  {
    id: 'ORD-1001',
    serviceId: 101,
    buyerId: 1,
    sellerId: 1,
    package: 'standard',
    price: 100,
    status: 'in_progress',
    createdAt: '2024-01-20',
    deliveryDate: '2024-01-22',
    requirements: 'Please promote our new eco-friendly water bottle line.',
    revisions: 1
  },
  {
    id: 'ORD-1002',
    serviceId: 103,
    buyerId: 2,
    sellerId: 3,
    package: 'premium',
    price: 280,
    status: 'delivered',
    createdAt: '2024-01-18',
    deliveryDate: '2024-01-23',
    requirements: 'Create content featuring our new protein powder.',
    revisions: 0
  }
];

export const messages = [
  {
    id: 1,
    orderId: 'ORD-1001',
    senderId: 1,
    senderName: 'Sarah Johnson',
    message: 'Hi! I received your order. Could you provide more details about the water bottle design?',
    timestamp: '2024-01-20 10:30',
    isRead: true
  },
  {
    id: 2,
    orderId: 'ORD-1001',
    senderId: 'buyer1',
    senderName: 'John Smith',
    message: 'Sure! It has a minimalist design with our logo. I\'ll send you the product photos.',
    timestamp: '2024-01-20 11:15',
    isRead: true
  },
  {
    id: 3,
    orderId: 'ORD-1001',
    senderId: 1,
    senderName: 'Sarah Johnson',
    message: 'Perfect! I\'ll create some amazing content for you. Expected delivery tomorrow.',
    timestamp: '2024-01-20 11:45',
    isRead: true
  }
];