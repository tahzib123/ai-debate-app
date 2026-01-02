import { useState, useMemo } from "react";
import { useTopics } from "../../api/requests/getPosts";
import type { ITopicDetail } from "../../types/DTO/getPosts";

interface TopicBrowserProps {
  onSelectTopic?: (topic: ITopicDetail) => void;
  selectedTopicId?: number | null;
  showCreateButton?: boolean;
  onCreateNew?: () => void;
}

export function TopicBrowser({
  onSelectTopic,
  selectedTopicId,
  showCreateButton = true,
  onCreateNew,
}: TopicBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'alphabetical'>('popular');
  
  const { data: topics = [], isLoading } = useTopics();

  const filteredAndSortedTopics = useMemo(() => {
    let filtered = topics;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = topics.filter(
        (topic) =>
          topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort topics
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.post_count || 0) - (a.post_count || 0);
        case 'recent':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [topics, searchQuery, sortBy]);

  const LoadingSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-600 rounded w-1/2 mb-2"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-slate-700 rounded-full w-16"></div>
            <div className="h-6 bg-slate-700 rounded-full w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Browse Topics</h3>
        {showCreateButton && (
          <button
            onClick={onCreateNew}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Topic
          </button>
        )}
      </div>

      {/* Search and Sort Controls */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          />
        </div>

        <div className="flex gap-2">
          <span className="text-sm text-gray-400 self-center">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1 bg-slate-900/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="popular">Most Popular</option>
            <option value="recent">Most Recent</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>
      </div>

      {/* Topics List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredAndSortedTopics.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {filteredAndSortedTopics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => onSelectTopic?.(topic)}
              className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer group ${
                selectedTopicId === topic.id
                  ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/20'
                  : 'bg-slate-800/50 border-slate-700/30 hover:bg-slate-700/50 hover:border-slate-600/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                  {topic.name}
                </h4>
                {topic.post_count > 0 && (
                  <span className="text-xs bg-slate-700 text-gray-300 px-2 py-1 rounded-full">
                    {topic.post_count} posts
                  </span>
                )}
              </div>
              
              {topic.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {topic.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {topic.activity_score > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Active
                  </span>
                )}
                {topic.created_at && (
                  <span>
                    Created {new Date(topic.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">
            {searchQuery ? 'No topics match your search' : 'No topics available'}
          </p>
          {showCreateButton && !searchQuery && (
            <button
              onClick={onCreateNew}
              className="mt-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Create the first topic
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(51, 65, 85, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(100, 116, 139, 0.6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(100, 116, 139, 0.8);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}