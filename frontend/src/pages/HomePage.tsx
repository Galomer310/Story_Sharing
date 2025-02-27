import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <h1>Welcome to Story Sharing!</h1>
      <p>
        Ever dreamed of a place where your wildest ideas take flight? Here at
        Story Sharing, you can create, share, and explore stories from creative
        minds all around the world! Whether you’re here to craft your next
        masterpiece or simply to get lost in a tale, you’re in for a treat.
      </p>
      <p>
        So buckle up, let your imagination soar, and join the community of
        storytellers who aren’t afraid to share a laugh, a tear, or a twist!
      </p>
      <div>
        <Link to="/login">
          <button>Login</button>
        </Link>
      </div>
      <div>
        <Link to="/register">
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
