import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <h1>Welcome to Story Sharing!</h1>
      <p>
        Ever dreamed of a magical place where your stories burst into life? Here
        at Story Sharing, you can create, share, and explore tales that tickle
        your imagination. Whether you're here to pen your next epic or simply to
        lose yourself in enchanting narratives, you're in for a wild, fun ride!
      </p>
      <p>
        So, buckle up, let your creativity run free, and join our community of
        storytellers who know how to have fun with words!
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
