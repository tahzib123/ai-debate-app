import { useState } from "react";
import { Layout } from "../../layouts/main";
import { TopicBrowser } from "../../components/TopicBrowser";
import { useTopics, usePosts } from "../../api/requests/getPosts";
import { useModal } from "../../providers/ModalProvider";
import type { ITopicDetail } from "../../types/DTO/getPosts";

export function Topics() {
  const [selectedTopic, setSelectedTopic] = useState<ITopicDetail | null>(null);
  const { data: topics = [], isLoading: topicsLoading } = useTopics();
  const { data: posts = [], isLoading: postsLoading } = usePosts(
    undefined,
    selectedTopic?.id
  );
  const { openNewDebateModal } = useModal();

  const handleTopicSelect = (topic: ITopicDetail) => {
    setSelectedTopic(topic);
  };

  const handleCreateNew = () => {
    openNewDebateModal();
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="p-6 border-b border-slate-700/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Browse Topics
              </h1>
              <p className="text-gray-400">
                Explore debate topics and join meaningful conversations
              </p>
            </div>
            <button
              onClick={openNewDebateModal}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 self-start sm:self-center"
            >
              + New Topic
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex gap-6 p-6 overflow-hidden">
          {/* Topics Browser */}
          <div className="w-full lg:w-1/2">
            <TopicBrowser
              onSelectTopic={handleTopicSelect}
              selectedTopicId={selectedTopic?.id || null}
              onCreateNew={handleCreateNew}
            />
          </div>

          {/* Selected Topic Details */}
          <div className="w-full lg:w-1/2 hidden lg:block">
            {selectedTopic ? (
              <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-6 h-full flex flex-col">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">
                      {selectedTopic.name}
                    </h2>
                    <span className="text-xs bg-slate-700 text-gray-300 px-2 py-1 rounded-full">
                      {selectedTopic.post_count || 0} posts
                    </span>
                  </div>

                  {selectedTopic.description && (
                    <p className="text-gray-400 text-sm mb-4">
                      {selectedTopic.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {selectedTopic.activity_score > 0 && (
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Active
                      </span>
                    )}
                    {selectedTopic.created_at && (
                      <span>
                        Created{" "}
                        {new Date(
                          selectedTopic.created_at
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Recent Posts */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Recent Posts
                  </h3>

                  {postsLoading ? (
                    <div className="space-y-3 animate-pulse">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
                          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                      {posts.slice(0, 10).map((post) => (
                        <div
                          key={post.id}
                          className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:bg-slate-700/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-white">
                              {post.created_by_detail.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{post.like_count || 0} likes</span>
                            <span>{post.comment_count || 0} replies</span>
                            <span>{post.view_count || 0} views</span>
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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <p className="text-sm">No posts in this topic yet</p>
                      <button
                        onClick={openNewDebateModal}
                        className="mt-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        Be the first to post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-6 h-full flex flex-col items-center justify-center text-gray-400">
                <svg
                  className="w-16 h-16 mb-4 opacity-50"
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
                <h3 className="text-lg font-medium text-white mb-2">
                  Select a Topic
                </h3>
                <p className="text-center text-sm">
                  Choose a topic from the list to see details and recent posts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
    </Layout>
  );
}
