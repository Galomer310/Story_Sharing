import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addStory } from "../store/storySlice";
import { AppDispatch } from "../store/store";

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

const CreateStoryPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState(colorOptions[0]);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }

      const response = await fetch(`${apiUrl}/api/stories`, {
        method: "POST",
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
        alert(errorData.error || "Failed to create story");
        return;
      }
      const newStory = await response.json();
      // Update Redux
      dispatch(addStory(newStory));
      navigate("/user");
    } catch (error) {
      alert("Error creating story: " + (error as Error).message);
    }
  };

  return (
    <div className="create-story">
      <h2>Create New Story</h2>
      <form onSubmit={handleCreateStory}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <label>Select Background Color:</label>
        <select
          className="select-color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
        >
          {colorOptions.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
        <button type="submit">Create Story</button>
      </form>
      <button onClick={() => navigate("/user")}>Go to User Page</button>
    </div>
  );
};

export default CreateStoryPage;
