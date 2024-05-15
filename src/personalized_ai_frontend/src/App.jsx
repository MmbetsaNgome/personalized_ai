import React, { useState } from "react";
import "./index.css";
import Chat from "./components/Chat";
import { Notification } from "./components/utils/Notifications";
import Cover from "./components/utils/Cover";
import { Toaster } from "react-hot-toast";
import useApi from "./hooks/useApi";

const App = function AppWrapper() {
  const [isConnected, setIsConnected] = useState(false);
  const { createNewConversation } = useApi();

  const handleLogin = () => {
    // Logic to handle login/connect action
    setIsConnected(true);
    createNewConversation("defaultUser"); // Example: Starting a new conversation for the user
  };

  return (
    <>
      {!isConnected ? (
        <Cover
          title="Welcome to Your Personalized AI"
          login={handleLogin}
          coverImg="/assets/img/cover.png" // Replace with your image path
        />
      ) : (
        <main>
          <div className="watermark">Dai</div>
          <Chat />
        </main>
      )}
      <Notification />
      <Toaster />
    </>
  );
};

export default App;
