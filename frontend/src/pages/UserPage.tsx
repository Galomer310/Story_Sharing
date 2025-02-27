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
  username: string;
}

const UserPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const stories = useSelector(selectAllStories);

  // Local state for ordering stories
  const [storyOrder, setStoryOrder] = useState<"date" | "updated" | "author">(
    "date"
  );

  // Comments stored per story (key = story.id)
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>({});
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>(
    {}
  );

  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchStories());
  }, [dispatch]);

  // Fetch comments for each story
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
    stories.forEach((story: Story) => {
      fetchCommentsForStory(story.id);
    });
  }, [stories]);

  // Reorder stories based on selected order
  const orderedStories = [...stories].sort((a, b) => {
    if (storyOrder === "date") {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (storyOrder === "updated") {
      // Assuming updated_at is available on the story object
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } else {
      return a.author_username.localeCompare(b.author_username);
    }
  });

  // Add a new comment to a story
  const handleAddComment = async (storyId: number) => {
    const text = newCommentText[storyId]?.trim();
    if (!text) return alert("Comment cannot be empty.");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");
      if (!token) return alert("No token found. Please log in again.");
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

  const startEditComment = (commentId: number, currentText: string) => {
    setEditCommentId(commentId);
    setEditCommentText(currentText);
  };

  const handleSaveComment = async (storyId: number) => {
    if (!editCommentText.trim()) return alert("Comment cannot be empty.");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");
      if (!token) return alert("No token found. Please log in again.");
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

  const handleDeleteComment = async (storyId: number, commentId: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");
      if (!token) return alert("No token found. Please log in again.");
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
      <button onClick={() => navigate("/")}>Log Out</button>

      <div style={{ margin: "1rem 0" }}>
        <label>Order stories by: </label>
        <select
          value={storyOrder}
          onChange={(e) => setStoryOrder(e.target.value as any)}
        >
          <option value="date">Date (Newest First)</option>
          <option value="updated">Last Updated</option>
          <option value="author">Author Name (A-Z)</option>
        </select>
      </div>

      <h3>All Users' Stories</h3>
      {orderedStories && orderedStories.length > 0 ? (
        orderedStories.map((story) => {
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
              <h5>Story by: {story.author_username}</h5>
              <p>{story.content}</p>
              <div className="story-date">
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
              <div className="comment-section">
                <strong>Comment Section:</strong>
                <ul>
                  {storyComments.map((comment) => (
                    <li key={comment.id}>
                      {editCommentId === comment.id ? (
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
                        <div>
                          <strong>{comment.username}:</strong>{" "}
                          {comment.comment_text}
                          <br />
                          <small>
                            {new Date(comment.created_at).toLocaleString()}
                          </small>
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
                <div>
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
    </div>
  );
};

export default UserPage;
