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
  const [orderCriteria, setOrderCriteria] = useState<"date" | "sender">("date");
  const [showSendForm, setShowSendForm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [replyTo, setReplyTo] = useState<User | null>(null);

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

  // Order messages based on selected criteria
  const orderedMessages = [...messages].sort((a, b) => {
    if (orderCriteria === "date") {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      return a.sender_username.localeCompare(b.sender_username);
    }
  });

  // Show/hide send message form; optionally prefill for reply
  const handleShowSendForm = async (prefillUserId: number | null = null) => {
    setShowSendForm((prev) => !prev);
    if (prefillUserId) {
      setSelectedUserId(prefillUserId);
    }
    if (!showSendForm) {
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

  // Send a message with extra alert
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
      alert(
        "Message sent! Sent messages will be visible until you leave the private messages area."
      );
      setShowSendForm(false);
      setSelectedUserId(null);
      setMessageText("");
      setReplyTo(null);
      const newMessage = await response.json();
      setMessages((prev) => [newMessage, ...prev]);
    } catch (error) {
      alert("Error sending message: " + (error as Error).message);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (messageId: number) => {
    try {
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }
      const response = await fetch(`${apiUrl}/api/messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete message");
        return;
      }
      alert("Message deleted.");
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      alert("Error deleting message: " + (error as Error).message);
    }
  };

  // Reply to a message
  const handleReply = (senderId: number, senderUsername: string) => {
    setReplyTo({ id: senderId, username: senderUsername });
    handleShowSendForm(senderId);
  };

  return (
    <div className="messages-container">
      <h1>Your Private Messages</h1>
      <div>
        <label>Order messages by: </label>
        <select
          value={orderCriteria}
          onChange={(e) => setOrderCriteria(e.target.value as any)}
        >
          <option value="date">Date (Newest First)</option>
          <option value="sender">Sender Name (A-Z)</option>
        </select>
      </div>
      <button onClick={() => navigate("/user")}>Back to Dashboard</button>
      <button onClick={() => handleShowSendForm()}>Send a Message</button>

      {showSendForm && (
        <form onSubmit={handleSendMessage} className="message-form">
          <label>Select a User:</label>
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
      ) : orderedMessages.length > 0 ? (
        <ul className="message-list">
          {orderedMessages.map((msg) => (
            <li key={msg.id} className="message-item">
              <div>
                <strong>From:</strong> {msg.sender_username}
              </div>
              <div>
                <strong>Message:</strong> {msg.message_text}
              </div>
              <div>
                <strong>Message Sent At:</strong>
                <small>{new Date(msg.created_at).toLocaleString()}</small>
              </div>
              <div className="message-actions">
                <button
                  onClick={() =>
                    handleReply(msg.sender_id, msg.sender_username)
                  }
                >
                  Reply
                </button>
                <button onClick={() => handleDeleteMessage(msg.id)}>
                  Delete
                </button>
              </div>
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
