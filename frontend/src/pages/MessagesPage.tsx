// frontend/src/pages/MessagesPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_text: string;
  is_read: boolean;
  created_at: string;
  sender_username: string;
}

interface User {
  id: number;
  username: string;
}

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSendForm, setShowSendForm] = useState(false);

  // For sending a new message
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const token = localStorage.getItem("accessToken");

  // Fetch messages on load
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!token) {
          alert("No token found. Please log in again.");
          return;
        }
        const response = await fetch(`${apiUrl}/api/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch messages");
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [apiUrl, token]);

  // Fetch user list (for sending messages) only when needed
  const handleShowSendForm = async () => {
    setShowSendForm((prev) => !prev);

    if (!showSendForm) {
      // Just opened the form, so fetch user list
      try {
        if (!token) {
          alert("No token found. Please log in again.");
          return;
        }
        const response = await fetch(`${apiUrl}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user list");
        }
        const userList = await response.json();
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    }
  };

  // Send the message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !messageText.trim()) {
      alert("Please select a user and enter a message.");
      return;
    }
    try {
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }
      const response = await fetch(`${apiUrl}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: selectedUserId,
          message_text: messageText,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to send message");
        return;
      }
      // Successfully sent
      alert("Message sent!");
      setShowSendForm(false);
      setSelectedUserId(null);
      setMessageText("");
      // Optionally re-fetch messages
      const newMessage = await response.json();
      setMessages((prev) => [newMessage, ...prev]); // put new message at top
    } catch (error) {
      alert("Error sending message: " + (error as Error).message);
    }
  };

  return (
    <div className="messages-container">
      <h1>Your Private Messages</h1>

      <button onClick={() => navigate("/user")}>Back to Dashboard</button>
      <button onClick={handleShowSendForm}>
        {showSendForm ? "Cancel" : "Send a Message"}
      </button>

      {showSendForm && (
        <form onSubmit={handleSendMessage} style={{ marginTop: "1rem" }}>
          <label>Select a User to Message:</label>
          <select
            value={selectedUserId || ""}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
          >
            <option value="">-- Select --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>

          <br />
          <label>Message Text:</label>
          <textarea
            rows={4}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />

          <br />
          <button type="submit">Send</button>
        </form>
      )}

      <hr />

      {isLoading ? (
        <p>Loading messages...</p>
      ) : messages.length > 0 ? (
        <ul>
          {messages.map((msg) => (
            <li key={msg.id}>
              <strong>From:</strong> {msg.sender_username} <br />
              <strong>Message:</strong> {msg.message_text} <br />
              <small>{new Date(msg.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No messages.</p>
      )}
    </div>
  );
};

export default MessagesPage;
