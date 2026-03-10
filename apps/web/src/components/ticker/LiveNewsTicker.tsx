import { useEffect, useState, useCallback } from 'react';
import { Rss, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewsItem {
  title: string;
  source: string;
  url?: string;
  publishedAt?: string;
  isBreaking?: boolean;
}

const FALLBACK_NEWS: NewsItem[] = [
  { title: 'Beware the risk of a scorched-earth strategy from Iran, say Bank of America strategists', source: 'MarketWatch' },
  { title: 'NATO allies boost defense spending amid rising geopolitical tensions', source: 'Reuters' },
  { title: 'EU strengthens sanctions framework targeting critical technology exports', source: 'Financial Times' },
  { title: 'Cyber threat landscape evolves as state-sponsored attacks increase globally', source: 'BBC World' },
  { title: 'Global supply chain disruptions persist amid Red Sea shipping route concerns', source: 'Bloomberg', isBreaking: true },
  { title: 'Climate-related displacement reaches record highs according to UNHCR report', source: 'Al Jazeera' },
];

const NEWS_INTERVAL = 8000;

export function LiveNewsTicker() {
  const [news] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [progressKey, setProgressKey] = useState(0);

  const nextItem = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % news.length);
      setIsVisible(true);
      setProgressKey(prev => prev + 1);
    }, 300);
  }, [news.length]);

  useEffect(() => {
    const timer = setInterval(nextItem, NEWS_INTERVAL);
    return () => clearInterval(timer);
  }, [nextItem]);

  if (news.length === 0) {
    return (
      <div className="h-8 flex items-center px-4 border-b border-slate-800/30 bg-slate-900/85 backdrop-blur-xl">
        <AlertCircle className="w-3.5 h-3.5 text-slate-500 mr-2" />
        <span className="text-xs text-slate-500">No geopolitically material developments</span>
      </div>
    );
  }

  const currentNews = news[currentIndex];

  return (
    <div className="h-8 flex items-center overflow-hidden border-b border-slate-800/30 bg-slate-900/85 backdrop-blur-xl relative">
      {/* Live indicator */}
      <div className="flex items-center gap-2 px-4 flex-shrink-0 z-10 bg-slate-900/95">
        <Rss className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Live</span>
        <div
          className="w-1.5 h-1.5 rounded-full bg-red-500"
          style={{ animation: 'live-pulse 1.5s ease-in-out infinite', boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)' }}
        />
      </div>

      {/* News content */}
      <div className="flex-1 overflow-hidden px-3">
        <div
          className="flex items-center gap-3 transition-all duration-300"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(8px)' }}
        >
          {currentNews.isBreaking && (
            <Badge className="bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider h-auto py-0.5 border-0 hover:bg-red-600">
              Breaking
            </Badge>
          )}
          <span className="text-xs text-slate-200 truncate">{currentNews.title}</span>
          <span className="text-[10px] text-slate-500 flex-shrink-0 hidden md:inline">
            {currentNews.source}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent">
        <div
          key={progressKey}
          className="h-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]"
          style={{ animation: `news-progress ${NEWS_INTERVAL}ms linear` }}
        />
      </div>
    </div>
  );
}
