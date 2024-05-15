import React, { useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import Loading from "./Loading";
import { login, logout } from "../utils/auth";
import toast from "react-hot-toast";
import { getConversation } from "../utils/chat";
import TextInput from "./TextInput";
import { encryptData } from "../utils/encryptData";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const {
    loading,
    chatCompletion,
    chatMessages,
    setChatMessages,
    addTagToMessage,
    markMessageAsReadUnread,
    fetchSummary,
  } = useApi();

  const updateChatMessages = async () => {
    if (window.auth.principalText && window.auth.isAuthenticated) {
      const conversation = await getConversation(window.auth.principalText);
      if (conversation) {
        setChatMessages(conversation.conversation);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.auth.isAuthenticated) {
      toast.error("You are not authenticated");
      return;
    }

    const openaiKey = localStorage.getItem("icp-dai-open-ai");
    if (!openaiKey) {
      toast.error("No OpenAI key found");
      return;
    }

    if (question) {
      const history = [...chatMessages, { content: question, role: "user" }];
      setChatMessages(history);
      await chatCompletion(history);
      setQuestion("");
    }
  };

  useEffect(() => {
    updateChatMessages();
  }, []);

  const onValidateOpenaiAPI = (e) => {
    if (e.target.value.match(/^sk-[a-zA-Z0-9]{32,}$/)) {
      setOpenaiKey(e.target.value);
    } else {
      setOpenaiKey("");
    }
  };

  const onSaveOpenaiKey = () => {
    if (!openaiKey) return toast.error("Invalid OpenAI key");
    const encryptedApiKey = encryptData(openaiKey);
    localStorage.setItem("icp-dai-open-ai", encryptedApiKey);
    toast.success("OpenAI key successfully saved and encrypted");
    setOpenaiKey("");
  };

  const handleTagMessage = (messageId, tag) => {
    addTagToMessage(window.auth.principalText, messageId, tag);
  };

  const handleMarkMessage = (messageId, read) => {
    markMessageAsReadUnread(window.auth.principalText, messageId, read);
  };

  const handleGenerateSummary = async () => {
    await fetchSummary(window.auth.principalText);
  };

  return (
    <div className="wrapper">
      <div className="wrapper-header">
        <h1>Dai</h1>
        <button
          className="auth-button auth-button__hover"
          onClick={() => (window.auth.isAuthenticated ? logout() : login())}
        >
          {window.auth.isAuthenticated ? "Log out" : "Login"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <TextInput
          onChange={onValidateOpenaiAPI}
          placeholder="Pass your OpenAI API key here..."
        />
        <button
          className="auth-button auth-button__hover"
          onClick={onSaveOpenaiKey}
        >
          Save
        </button>
      </div>
      <div className="container">
        <div className="right">
          <div className="chat active-chat">
            <div className="conversation-start"></div>
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`bubble ${
                  message.role === "user" ? "me" : "assistant"
                } ${
                  chatMessages.length - 1 === index && !loading
                    ? "last-message"
                    : ""
                }
                `}
              >
                {message.content}
                <div className="message-options">
                  <button onClick={() => handleTagMessage(message.id, "important")}>
                    Tag as Important
                  </button>
                  <button onClick={() => handleMarkMessage(message.id, !message.read)}>
                    Mark as {message.read ? "Unread" : "Read"}
                  </button>
                </div>
              </div>
            ))}

            {loading && (
              <div className={`bubble assistant`}>
                <Loading />
              </div>
            )}
          </div>
          <div className="write">
            <input
              placeholder="Ask me..."
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? handleSubmit(e) : null)}
            />
            {!loading && (
              <a
                onClick={(e) => {
                  handleSubmit(e);
                }}
                className="write-link send"
              ></a>
            )}
          </div>
        </div>
      </div>
      <div className="summary-button">
        <button onClick={handleGenerateSummary}>Generate Summary</button>
      </div>
    </div>
  );
}
