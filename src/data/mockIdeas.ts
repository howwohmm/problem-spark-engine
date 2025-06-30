
export const mockIdeas = [
  {
    id: '1',
    problem: 'Developers struggle to automatically announce their GitHub releases on social media platforms',
    targetUser: 'Open-source maintainers and indie developers',
    mvpSuggestion: 'A webhook service that automatically posts GitHub release notes to Twitter/X, LinkedIn, and other social platforms with customizable templates.',
    source: 'https://news.ycombinator.com/item?id=example1',
    sourceType: 'hackernews' as const,
    tags: ['DevTools', 'Automation', 'Social Media'],
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    problem: 'Small business owners waste hours manually scheduling social media posts across multiple platforms',
    targetUser: 'Small business owners and solopreneurs',
    mvpSuggestion: 'A simple scheduler that takes one post and adapts it for different platforms (Twitter, LinkedIn, Instagram) with optimal timing suggestions.',
    source: 'https://reddit.com/r/entrepreneur/example2',
    sourceType: 'reddit' as const,
    tags: ['Social Media', 'Automation', 'Small Business'],
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    problem: 'Remote teams struggle to maintain spontaneous conversations and team bonding without office water cooler moments',
    targetUser: 'Remote team managers and distributed teams',
    mvpSuggestion: 'A Slack/Discord bot that creates random 1:1 coffee chat pairings and suggests conversation starters for team members.',
    source: 'https://reddit.com/r/remotework/example3',
    sourceType: 'reddit' as const,
    tags: ['Remote Work', 'Team Building', 'Productivity'],
    timestamp: '6 hours ago'
  },
  {
    id: '4',
    problem: 'Content creators spend too much time manually creating video thumbnails that actually get clicks',
    targetUser: 'YouTube creators and content marketers',
    mvpSuggestion: 'An AI tool that analyzes high-performing thumbnails in your niche and generates click-worthy thumbnail variants with A/B testing capabilities.',
    source: 'https://news.ycombinator.com/item?id=example4',
    sourceType: 'hackernews' as const,
    tags: ['AI', 'Content Creation', 'Marketing'],
    timestamp: '8 hours ago'
  },
  {
    id: '5',
    problem: 'Freelancers struggle to track billable hours accurately across multiple projects and clients',
    targetUser: 'Freelancers and consultants',
    mvpSuggestion: 'A smart time tracker that auto-detects what you\'re working on based on browser tabs, apps, and calendar events, then categorizes time by client.',
    source: 'https://reddit.com/r/freelance/example5',
    sourceType: 'reddit' as const,
    tags: ['Productivity', 'Freelance', 'Time Tracking'],
    timestamp: '12 hours ago'
  },
  {
    id: '6',
    problem: 'Startup founders waste time crafting cold emails that never get opened or responded to',
    targetUser: 'B2B startup founders and sales teams',
    mvpSuggestion: 'An AI email assistant that researches prospects and writes personalized cold emails based on their recent social media activity and company news.',
    source: 'https://news.ycombinator.com/item?id=example6',
    sourceType: 'hackernews' as const,
    tags: ['AI', 'Sales', 'Email Marketing'],
    timestamp: '1 day ago'
  },
  {
    id: '7',
    problem: 'Parents struggle to find age-appropriate, educational screen time activities for their kids',
    targetUser: 'Parents of children aged 4-12',
    mvpSuggestion: 'A curated app that suggests daily educational games and activities based on the child\'s age, interests, and learning progress, with screen time limits built-in.',
    source: 'https://reddit.com/r/parenting/example7',
    sourceType: 'reddit' as const,
    tags: ['EdTech', 'Parenting', 'Mobile App'],
    timestamp: '1 day ago'
  },
  {
    id: '8',
    problem: 'Indie game developers can\'t afford expensive user research to improve their games before launch',
    targetUser: 'Independent game developers',
    mvpSuggestion: 'A platform where indie devs can upload game prototypes and get structured feedback from a community of gamers in exchange for early access or credits.',
    source: 'https://reddit.com/r/gamedev/example8',
    sourceType: 'reddit' as const,
    tags: ['Gaming', 'User Research', 'Community'],
    timestamp: '2 days ago'
  },
  {
    id: '9',
    problem: 'Restaurant owners struggle to reduce food waste while maintaining menu variety',
    targetUser: 'Restaurant owners and food service managers',
    mvpSuggestion: 'A smart inventory system that predicts demand based on weather, events, and historical data, then suggests daily specials to use up ingredients before they expire.',
    source: 'https://news.ycombinator.com/item?id=example9',
    sourceType: 'hackernews' as const,
    tags: ['AI', 'Food Tech', 'Sustainability'],
    timestamp: '2 days ago'
  },
  {
    id: '10',
    problem: 'Job seekers spend hours customizing resumes for different positions without knowing what actually works',
    targetUser: 'Job seekers and career changers',
    mvpSuggestion: 'An AI resume optimizer that analyzes job descriptions and suggests specific changes to improve ATS compatibility and hiring manager appeal.',
    source: 'https://reddit.com/r/jobs/example10',
    sourceType: 'reddit' as const,
    tags: ['AI', 'Career', 'HR Tech'],
    timestamp: '3 days ago'
  },
  {
    id: '11',
    problem: 'Podcast listeners want to quickly find and share specific moments from episodes',
    targetUser: 'Podcast enthusiasts and content creators',
    mvpSuggestion: 'A tool that creates searchable transcripts with timestamp links, allowing users to bookmark and share specific quotes or segments from any podcast.',
    source: 'https://news.ycombinator.com/item?id=example11',
    sourceType: 'hackernews' as const,
    tags: ['Audio', 'Content Creation', 'Search'],
    timestamp: '3 days ago'
  },
  {
    id: '12',
    problem: 'Small online stores struggle to compete with Amazon\'s personalized product recommendations',
    targetUser: 'E-commerce store owners',
    mvpSuggestion: 'A simple plugin that adds AI-powered product recommendations to any e-commerce site based on browsing behavior and purchase history.',
    source: 'https://reddit.com/r/ecommerce/example12',
    sourceType: 'reddit' as const,
    tags: ['AI', 'E-commerce', 'Personalization'],
    timestamp: '4 days ago'
  }
];
