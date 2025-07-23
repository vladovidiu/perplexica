import { searchSearxng } from '@/lib/searxng';

const articleWebsites = [
  // AI & Tech
  'techcrunch.com',
  'theverge.com',
  'arstechnica.com',
  'wired.com',
  'venturebeat.com',
  'technologyreview.com',
  'zdnet.com',
  'engadget.com',

  // Tech Blogs & HackerNews Favorites
  'stratechery.com',
  'danluu.com',
  'paulgraham.com',
  'simonwillison.net',
  'thenewstack.io',
  'hackernoon.com',
  'dev.to',
  'medium.com',

  // AI Specific
  'openai.com',
  'anthropic.com',
  'deepmind.com',
  'huggingface.co',
  'towardsdatascience.com',
  'arxiv.org',

  // Finance
  'bloomberg.com',
  'reuters.com',
  'cnbc.com',
  'ft.com',
  'marketwatch.com',
  'wsj.com',
  'forbes.com',
  'coindesk.com',
  'cointelegraph.com',

  // Science
  'nature.com',
  'sciencemag.org',
  'scientificamerican.com',
  'newscientist.com',
  'phys.org',
  'sciencedaily.com',
  'quantamagazine.org',
  'nautil.us',

  // General Quality Sources
  'bbc.com',
  'theguardian.com',
  'nytimes.com',
  'theatlantic.com',
  'newyorker.com',

  // Developer & Open Source
  'github.blog',
  'stackoverflow.blog',
  'lwn.net',
  'theregister.com',
];

const topics = [
  'AI',
  'machine learning',
  'technology',
  'finance',
  'cryptocurrency',
  'science',
  'research',
  'startup',
  'open source',
  'programming',
]; /* TODO: Add UI to customize this */

// Popular subreddits for tech/AI/finance/science discussions
const subreddits = [
  'MachineLearning',
  'artificial',
  'technology',
  'programming',
  'science',
  'Futurology',
  'investing',
  'stocks',
  'CryptoCurrency',
  'compsci',
  'datascience',
  'LocalLLaMA',
  'singularity',
  'OpenAI',
];

export const GET = async (req: Request) => {
  try {
    const params = new URL(req.url).searchParams;
    const mode: 'normal' | 'preview' =
      (params.get('mode') as 'normal' | 'preview') || 'normal';

    let data = [];

    if (mode === 'normal') {
      // Select a random subset of websites to search (not all of them!)
      const selectedWebsites = articleWebsites
        .sort(() => Math.random() - 0.5)
        .slice(0, 20); // Increased to 20 websites

      // Select a subset of topics
      const selectedTopics = topics.sort(() => Math.random() - 0.5).slice(0, 4); // Increased to 4 topics

      // Select a few subreddits
      const selectedSubreddits = subreddits
        .sort(() => Math.random() - 0.5)
        .slice(0, 5); // Increased to 5 subreddits

      // Get articles from websites
      const websiteResults = await Promise.all(
        selectedWebsites.map(async (website, i) => {
          const topic = selectedTopics[i % selectedTopics.length];
          return (
            await searchSearxng(`site:${website} ${topic}`, {
              engines: ['bing news'],
              pageno: 1,
              language: 'en',
            })
          ).results.slice(0, 3); // Increased to 3 results per search
        }),
      );

      // Get Reddit discussions
      const redditResults = await Promise.all(
        selectedSubreddits.map(async (subreddit) => {
          return (
            await searchSearxng(`site:reddit.com/r/${subreddit}`, {
              engines: ['bing news'],
              pageno: 1,
              language: 'en',
            })
          ).results.slice(0, 3); // Increased to 3 results
        }),
      );

      // Get HackerNews searches for multiple topics
      const hackerNewsResults = await Promise.all(
        selectedTopics.slice(0, 2).map(async (topic) => {
          return (
            await searchSearxng(`site:news.ycombinator.com ${topic}`, {
              engines: ['bing news'],
              pageno: 1,
              language: 'en',
            })
          ).results.slice(0, 3);
        }),
      );

      // Combine and shuffle results
      data = [
        ...websiteResults.flat(),
        ...redditResults.flat(),
        ...hackerNewsResults.flat(),
      ]
        .flat()
        .filter((item) => item && item.url) // Filter out any null results
        .sort(() => Math.random() - 0.5);

      // Ensure diversity - increase limit to 3 articles per domain
      const domainCount = new Map<string, number>();
      const diverseData = [];

      for (const article of data) {
        try {
          const domain = new URL(article.url).hostname;
          const count = domainCount.get(domain) || 0;

          if (count < 3) {
            // Increased from 2 to 3
            domainCount.set(domain, count + 1);
            diverseData.push(article);
          }
        } catch (error) {
          // If URL parsing fails, include the article anyway
          diverseData.push(article);
        }
      }

      data = diverseData;
    } else {
      // Preview mode - also increase for better preview
      const previewWebsites = articleWebsites
        .sort(() => Math.random() - 0.5)
        .slice(0, 10); // Increased to 10 websites for preview

      const previewResults = await Promise.all(
        previewWebsites.map(async (website) => {
          const topic = topics[Math.floor(Math.random() * topics.length)];
          return (
            await searchSearxng(`site:${website} ${topic}`, {
              engines: ['bing news'],
              pageno: 1,
              language: 'en',
            })
          ).results.slice(0, 3); // Increased to 3 results
        }),
      );

      data = previewResults.flat().filter((item) => item && item.url);
    }

    return Response.json(
      {
        blogs: data,
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error(`An error occurred in discover route: ${err}`);
    return Response.json(
      {
        message: 'An error has occurred',
      },
      {
        status: 500,
      },
    );
  }
};
