import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/requests/axios/instance";
import type { ITopicDetail, IPost } from "../../types/DTO/getPosts";
import { useTopics } from "../../api/requests/getPosts";

interface NewDebateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreatePostRequest {
  content: string;
  created_by: number;
  topic: number;
}

const createPostFn = async (data: CreatePostRequest): Promise<IPost> => {
  const res = await api.post("/post/create/", data);
  return res.data;
};

export function NewDebateModal({ isOpen, onClose }: NewDebateModalProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  // Fetch available topics for dropdown
  const { data: topics = [] } = useTopics();

  const createPostMutation = useMutation({
    mutationFn: createPostFn,
    onSuccess: () => {
      // Invalidate and refetch posts to show the new one
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["topics"] }); // Also refresh topics to update post counts

      // Reset form and close modal
      resetForm();
      onClose();
    },
    onError: (error) => {
      console.error("Failed to create post:", error);
    },
  });

  const resetForm = () => {
    setSelectedTopicId(null);
    setContent("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate post creation
    if (!content.trim() || !selectedTopicId) return;

    createPostMutation.mutate({
      content: content.trim(),
      created_by: 2, // Assuming user ID 2 is the current user
      topic: selectedTopicId,
    });
  };

  const handleClose = () => {
    if (!createPostMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const isLoading = createPostMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-xl border border-slate-700/50 p-6 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Share Your Perspective
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            disabled={isLoading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="topic-select"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Topic *
            </label>
            <select
              id="topic-select"
              value={selectedTopicId || ""}
              onChange={(e) =>
                setSelectedTopicId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full p-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              required
              disabled={isLoading}
            >
              <option value="">Select a topic...</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="debate-content"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Your Position *
            </label>
            <textarea
              id="debate-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts and position on this topic..."
              rows={4}
              className="w-full p-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
              maxLength={1000}
              required
              disabled={isLoading}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {content.length}/1000
            </div>
          </div>

          {/* Error message */}
          {createPostMutation.error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              Failed to create post. Please try again.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !content.trim() || !selectedTopicId}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </div>
              ) : (
                'Publish Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
