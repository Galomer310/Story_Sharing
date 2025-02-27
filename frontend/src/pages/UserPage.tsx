// frontend/src/pages/UserPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser, selectCurrentUser } from "../store/authSlice";
import { fetchStories, selectAllStories } from "../store/storySlice";
import { AppDispatch } from "../store/store";
import { Story } from "../types/types";

interface Comment {
  id: number;
  story_id: number;
  user_id: number;
  comment_text: string;
  created_at: string;
  username: string; // from the JOIN with users
}

// We'll store comments in local component state (not in Redux) for simplicity
// But you could create a commentSlice if you prefer.
const UserPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Current logged-in user
  const user = useSelector(selectCurrentUser);
  // All stories from Redux
  const stories = useSelector(selectAllStories);

  // For each story, we store an array of comments
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>({});

  // For new comment text
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>(
    {}
  );

  // For editing a comment
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchStories());
  }, [dispatch]);

  // Whenever stories change, fetch comments for each story
  useEffect(() => {
    const fetchCommentsForStory = async (storyId: number) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch(`${apiUrl}/api/comments/${storyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCommentsMap((prev) => ({ ...prev, [storyId]: data }));
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    // Fetch comments for each story
    stories.forEach((story: Story) => {
      fetchCommentsForStory(story.id);
    });
  }, [stories]);

  // Handle new comment
  const handleAddComment = async (storyId: number) => {
    const text = newCommentText[storyId]?.trim();
    if (!text) return alert("Comment cannot be empty.");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }
      const response = await fetch(`${apiUrl}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storyId, comment_text: text }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to add comment");
        return;
      }
      const newComment = await response.json();
      setCommentsMap((prev) => ({
        ...prev,
        [storyId]: [...(prev[storyId] || []), newComment],
      }));
      setNewCommentText((prev) => ({ ...prev, [storyId]: "" }));
    } catch (error) {
      alert("Error adding comment: " + (error as Error).message);
    }
  };

  // Handle edit start
  const startEditComment = (commentId: number, currentText: string) => {
    setEditCommentId(commentId);
    setEditCommentText(currentText);
  };

  // Handle edit save
  const handleSaveComment = async (storyId: number) => {
    if (!editCommentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }
      const response = await fetch(`${apiUrl}/api/comments/${editCommentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment_text: editCommentText }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update comment");
        return;
      }
      const updatedComment = await response.json();
      // Update local state
      setCommentsMap((prev) => {
        const updated = prev[storyId].map((c) =>
          c.id === updatedComment.id ? updatedComment : c
        );
        return { ...prev, [storyId]: updated };
      });
      setEditCommentId(null);
      setEditCommentText("");
    } catch (error) {
      alert("Error updating comment: " + (error as Error).message);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (storyId: number, commentId: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }
      const response = await fetch(`${apiUrl}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete comment");
        return;
      }
      setCommentsMap((prev) => {
        const filtered = prev[storyId].filter((c) => c.id !== commentId);
        return { ...prev, [storyId]: filtered };
      });
    } catch (error) {
      alert("Error deleting comment: " + (error as Error).message);
    }
  };

  return (
    <div className="user-container">
      <h1>Welcome, {user ? user.username : "loading..."}</h1>
      <button onClick={() => navigate("/create-story")}>
        Create New Story
      </button>
      <button onClick={() => navigate("/messages")}>Messages</button>

      <h3>All Users' Stories</h3>
      {stories && stories.length > 0 ? (
        stories.map((story) => {
          const storyComments = commentsMap[story.id] || [];
          return (
            <div
              key={story.id}
              className="storyBox"
              style={{
                backgroundColor: story.background_color,
                marginBottom: "1rem",
              }}
            >
              <h4>{story.title}</h4>
              <p>Story by {story.author_username}</p>
              <p>{story.content}</p>
              <div
                style={{
                  textAlign: "right",
                  fontSize: "0.8rem",
                  color: "#555",
                }}
              >
                {new Date(story.created_at).toLocaleString()}
              </div>
              {story.user_role === "author" && (
                <>
                  <button onClick={() => navigate(`/edit-story/${story.id}`)}>
                    Edit
                  </button>
                </>
              )}

              {/* Comment Section */}
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem",
                  background: "#fafafa",
                }}
              >
                <strong>Comment Section:</strong>
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {storyComments.map((comment) => (
                    <li key={comment.id} style={{ marginTop: "0.5rem" }}>
                      {editCommentId === comment.id ? (
                        // Edit mode
                        <div>
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            rows={2}
                          />
                          <button onClick={() => handleSaveComment(story.id)}>
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditCommentId(null);
                              setEditCommentText("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        // View mode
                        <div>
                          <strong>{comment.username}:</strong>{" "}
                          {comment.comment_text}
                          <br />
                          <small>
                            {new Date(comment.created_at).toLocaleString()}
                          </small>
                          {/* If this user wrote the comment, show edit/delete */}
                          {user && user.id === comment.user_id && (
                            <>
                              <button
                                onClick={() =>
                                  startEditComment(
                                    comment.id,
                                    comment.comment_text
                                  )
                                }
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteComment(story.id, comment.id)
                                }
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {/* New comment form */}
                <div style={{ marginTop: "0.5rem" }}>
                  <textarea
                    rows={2}
                    placeholder="Add a comment..."
                    value={newCommentText[story.id] || ""}
                    onChange={(e) =>
                      setNewCommentText((prev) => ({
                        ...prev,
                        [story.id]: e.target.value,
                      }))
                    }
                  />
                  <button onClick={() => handleAddComment(story.id)}>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p>No stories available.</p>
      )}
      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
};

export default UserPage;
