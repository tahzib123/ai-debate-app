import { Link, useLocation, useSearchParams } from "react-router";
import { TrendingPosts } from "../TrendingPosts";
import { useTopics } from "../../api/requests/getPosts";
import { useModal } from "../../providers/ModalProvider";

export function Sidebar() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openNewDebateModal } = useModal();

  // Get selected topic from URL parameters
  const selectedTopicFromURL = searchParams.get("topic");
  const selectedTopic = selectedTopicFromURL
    ? parseInt(selectedTopicFromURL)
    : null;

  // Function to update topic in URL
  const setSelectedTopic = (topicId: number | null) => {
    if (topicId) {
      searchParams.set("topic", topicId.toString());
    } else {
      searchParams.delete("topic");
    }
    setSearchParams(searchParams);
  };

  // Use real topics data from API
  const { data: apiTopics = [] } = useTopics();

  // Convert API topics to local format
  const topics = apiTopics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    count: topic.post_count || 0,
    isActive: topic.is_active || false,
  }));

  const navigationItems = [
    {
      name: "Home",
      path: "/",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Browse Topics",
      path: "/topics",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      name: "Trending",
      path: "/trending",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
    {
      name: "My Debates",
      path: "/my-debates",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      name: "Bookmarks",
      path: "/bookmarks",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-full h-full glass border-r border-slate-700/30 flex flex-col overflow-hidden">
      {/* Navigation Section */}
      <div className="p-4 lg:p-6">
        <h2 className="text-base lg:text-lg font-semibold text-white mb-4 flex items-center gap-2">
          Navigation
        </h2>

        <nav className="space-y-1 lg:space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-700/30 mx-4 lg:mx-6"></div>

      {/* Topics Section */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
            Topics
          </h2>
        </div>

        {/* All Topics Button */}
        <button
          onClick={() => setSelectedTopic(null)}
          className={`w-full flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl text-sm font-medium mb-3 transition-all duration-200 ${
            selectedTopic === null
              ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30"
              : "text-gray-300 hover:text-white hover:bg-slate-700/50 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2 lg:gap-3 min-w-0">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate">All Topics</span>
          </div>
          <span className="text-xs bg-slate-700/50 px-2 py-1 rounded-full flex-shrink-0">
            {topics.reduce((sum, topic) => sum + topic.count, 0)}
          </span>
        </button>

        {/* Topic List */}
        <div className="space-y-1 lg:space-y-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`w-full flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl text-sm font-medium transition-all duration-200 group ${
                selectedTopic === topic.id
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30 shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-slate-700/50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full transition-colors duration-200 flex-shrink-0 ${
                    topic.isActive ? "bg-green-400" : "bg-gray-500"
                  }`}
                ></div>
                <span className="truncate">{topic.name}</span>
              </div>
              <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                <span
                  className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 ${
                    selectedTopic === topic.id
                      ? "bg-blue-500/30 text-blue-300"
                      : "bg-slate-700/50 text-gray-400 group-hover:text-gray-300"
                  }`}
                >
                  {topic.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 lg:p-6 border-t border-slate-700/30 flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-400 mb-3">
          Quick Actions
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={openNewDebateModal}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 min-w-0"
          >
            <span className="block lg:hidden">New</span>
            <span className="hidden lg:block">New Debate</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
