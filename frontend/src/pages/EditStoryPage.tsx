import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateStory, removeStory } from "../store/storySlice";
import { AppDispatch } from "../store/store";
import { Story } from "../types/types";

const colorOptions = [
  "lightcoral",
  "lightblue",
  "lightgreen",
  "khaki",
  "plum",
  "peachpuff",
  "wheat",
  "thistle",
  "salmon",
  "powderblue",
];

const EditStoryPage: React.FC = () => {
  const { storyId } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState(colorOptions[0]);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchStory = async () => {
      if (!storyId) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("No token found. Please log in again.");
          return;
        }
        const response = await fetch(`${apiUrl}/api/stories/${storyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.error || "Failed to fetch story");
          return;
        }
        const data = await response.json();
        setStory(data);
        setTitle(data.title);
        setContent(data.content);
        setBackgroundColor(data.background_color);
      } catch (error) {
        alert("Error fetching story: " + (error as Error).message);
      }
    };
    fetchStory();
  }, [storyId]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyId) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }
      const response = await fetch(`${apiUrl}/api/stories/${storyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          background_color: backgroundColor,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update story");
        return;
      }
      const updated = await response.json();
      dispatch(updateStory(updated));
      navigate("/user");
    } catch (error) {
      alert("Error saving changes: " + (error as Error).message);
    }
  };

  const handleDeleteStory = async () => {
    if (!storyId) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }
      const response = await fetch(`${apiUrl}/api/stories/${storyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete story");
        return;
      }
      dispatch(removeStory(Number(storyId)));
      navigate("/user");
    } catch (error) {
      alert("Error deleting story: " + (error as Error).message);
    }
  };

  return (
    <div className="edit-story-container">
      <h2>Edit Story</h2>
      {story ? (
        <form onSubmit={handleSaveChanges}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <label>Select Background Color:</label>
          <select
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          >
            {colorOptions.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
          <button type="submit">Save Changes</button>
        </form>
      ) : (
        <p>Loading story...</p>
      )}
      <button onClick={handleDeleteStory}>Delete Story</button>
      <button onClick={() => navigate("/user")}>Go to User Page</button>
    </div>
  );
};

export default EditStoryPage;
