import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { addMessageToConversation, createConversation, tagMessage, markMessage, generateSummary, searchMessages } from "../utils/chat";
import { decryptData } from "../utils/encryptData";

const useApi = () => {
  const [data, setData] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const OPEN_AI_API_KEY = () => decryptData(localStorage.getItem("icp-dai-open-ai"));

  const chatCompletion = useCallback(async (payload) => {
    const url = "https://api.openai.com/v1/chat/completions";
    setLoading(true);
    try {
      await addMessageToConversation(payload.at(-1));
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + OPEN_AI_API_KEY()?.split('"')[1],
        },
        body: JSON.stringify({
          messages: payload.map((message) => ({
            content: message.content,
            role: message.role,
          })),
          model: "gpt-3.5-turbo",
          temperature: 1,
        }),
      });

      const result = await response.json();

      if (response.status !== 200) {
        const message = result.error.message;
        toast.error(message);
        throw new Error(message);
      }

      const assistantContent = result.choices[0].message.content;
      const messageToSaveFromAssistant = {
        content: assistantContent,
        role: "assistant",
      };
      setChatMessages((prev) => [...prev, messageToSaveFromAssistant]);
      await addMessageToConversation(messageToSaveFromAssistant);
      setData(assistantContent);
      setError(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  }, []);

  const createNewConversation = useCallback(async (userIdentity) => {
    try {
      const conversation = await createConversation(userIdentity);
      setChatMessages(conversation.conversation);
    } catch (error) {
      toast.error("Failed to create conversation.");
      setError(error);
    }
  }, []);

  const addTagToMessage = useCallback(async (userIdentity, messageId, tag) => {
    try {
      await tagMessage(userIdentity, messageId, tag);
      toast.success("Tag added successfully.");
    } catch (error) {
      toast.error("Failed to add tag.");
      setError(error);
    }
  }, []);

  const markMessageAsReadUnread = useCallback(async (userIdentity, messageId, read) => {
    try {
      await markMessage(userIdentity, messageId, read);
      toast.success(`Message marked as ${read ? 'read' : 'unread'}.`);
    } catch (error) {
      toast.error("Failed to mark message.");
      setError(error);
    }
  }, []);

  const fetchSummary = useCallback(async (userIdentity) => {
    try {
      const summary = await generateSummary(userIdentity);
      setData(summary);
    } catch (error) {
      toast.error("Failed to generate summary.");
      setError(error);
    }
  }, []);

  const searchInMessages = useCallback(async (userIdentity, searchTerm) => {
    try {
      const results = await searchMessages(userIdentity, searchTerm);
      setChatMessages(results);
    } catch (error) {
      toast.error("Failed to search messages.");
      setError(error);
    }
  }, []);

  return {
    data,
    error,
    loading,
    chatCompletion,
    createNewConversation,
    addTagToMessage,
    markMessageAsReadUnread,
    fetchSummary,
    searchInMessages,
    setData,
    chatMessages,
    setChatMessages,
  };
};

export default useApi;
