import { StableBTreeMap, Server } from "azle";
import { v4 as uuidv4 } from "uuid";
import { systemMessage } from "./utils/ai";
import express, { Request, Response } from "express";
import cors from "cors";

/**
 * Message record
 */
type Message = {
  role: string;
  content: string;
  id: string;
  tags?: string[];
  read?: boolean;
};

type BaseMessage = {
  role: string;
  content: string;
};

type ConversationPayload = { userIdentity: string };

type AddMessageToConversationPayload = {
  userIdentity: string;
  conversationId: string;
  message: BaseMessage;
};

type Conversation = {
  id: string;
  conversation: Message[];
};

type ErrorMessage = { message: string };

const userConversation = StableBTreeMap<string, Conversation>(0);
const userConversations: { [userIdentity: string]: Conversation } = {};

export default Server(() => {
  const app = express();
  app.use(express.json());
  app.use(cors());

  // CREATE
  app.put("/conversation", (req: Request, res: Response) => {
    const conversationPayload = req.body as ConversationPayload;
    if (!conversationPayload) {
      return res.status(400).json({ message: "Invalid conversation payload" });
    }

    const initialMessage = { ...systemMessage, id: uuidv4() };
    const newConversation = { id: uuidv4(), conversation: [initialMessage] };
    userConversations[conversationPayload.userIdentity] = newConversation;

    return res.status(200).json({
      conversation: newConversation,
      id: newConversation.id,
      initiator: conversationPayload.userIdentity,
    });
  });

  // READ
  app.get("/conversation/:userIdentity", (req: Request, res: Response) => {
    const userIdentity = req.params.userIdentity;
    if (!userIdentity) {
      return res.status(404).json({ message: "User Identity is required" });
    }

    const conversation = userConversations[userIdentity];
    if (!conversation) {
      return res.status(404).json({ message: `No conversation found for ${userIdentity}` });
    }

    return res.status(200).json(conversation);
  });

  // UPDATE
  app.post("/add/conversation", (req: Request, res: Response) => {
    const payload = req.body as AddMessageToConversationPayload;
    const conversation = userConversation.get(payload.userIdentity);
    if ("None" in conversation) {
      return res.status(404).json({
        message: `No conversation found for ${payload.userIdentity}`,
      });
    }

    if (
      typeof payload !== "object" ||
      Object.keys(payload).length === 0 ||
      !payload.message?.content ||
      !payload.message?.role
    ) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const newMessage: Message = {
      role: payload.message.role,
      content: payload.message.content,
      id: uuidv4(),
      read: false,
      tags: []
    };

    const messages = conversation.Some.conversation;
    const updatedMessages = [...messages, newMessage];
    const updatedConversation = {
      id: payload.conversationId,
      conversation: updatedMessages,
    };

    userConversation.insert(payload.userIdentity, updatedConversation);
    return res.status(201).json(newMessage);
  });

  // DELETE
  app.delete("/conversation/:userIdentity", (req: Request, res: Response) => {
    const userIdentity = req.params.userIdentity;

    if (!userConversations[userIdentity]) {
      return res.status(400).json({ message: `Cannot delete conversation for user: ${userIdentity}` });
    }

    delete userConversations[userIdentity];

    return res.status(201).send(`The conversation associated with ${userIdentity} has been deleted`);
  });

  // SEARCH MESSAGES
  app.get("/conversation/:userIdentity/search", (req: Request, res: Response) => {
    const userIdentity = req.params.userIdentity;
    const searchTerm = req.query.q as string;
    if (!userIdentity || !searchTerm) {
      return res.status(400).json({ message: "User Identity and search term are required" });
    }

    const conversation = userConversations[userIdentity];
    if (!conversation) {
      return res.status(404).json({ message: `No conversation found for ${userIdentity}` });
    }

    const results = conversation.conversation.filter(message =>
      message.content.includes(searchTerm)
    );

    return res.status(200).json(results);
  });

  // TAG MESSAGE
app.post("/conversation/:userIdentity/tag", (req: Request, res: Response) => {
  const { userIdentity, messageId, tag } = req.body;
  const conversation = userConversations[userIdentity];
  if (!conversation) {
    return res.status(404).json({ error: `No conversation found for ${userIdentity}` });
  }

  const message = conversation.conversation.find(msg => msg.id === messageId);
  if (!message) {
    return res.status(404).json({ error: `No message found with ID ${messageId}` });
  }

  if (!message.tags) {
    message.tags = [];
  }
  message.tags.push(tag);

  return res.status(200).json({ status: "Tag added", message });
});

// MARK MESSAGE AS READ/UNREAD
app.post("/conversation/:userIdentity/mark", (req: Request, res: Response) => {
  const { userIdentity, messageId, read } = req.body;
  const conversation = userConversations[userIdentity];
  if (!conversation) {
    return res.status(404).json({ error: `No conversation found for ${userIdentity}` });
  }

  const message = conversation.conversation.find(msg => msg.id === messageId);
  if (!message) {
    return res.status(404).json({ error: `No message found with ID ${messageId}` });
  }

  message.read = read;

  return res.status(200).json({ status: `Message marked as ${read ? 'read' : 'unread'}`, message });
});

// GENERATE SUMMARY
app.get("/conversation/:userIdentity/summary", (req: Request, res: Response) => {
  const userIdentity = req.params.userIdentity;
  const conversation = userConversations[userIdentity];
  if (!conversation) {
    return res.status(404).json({ error: `No conversation found for ${userIdentity}` });
  }

  const summary = conversation.conversation.map(msg => msg.content).join(' ');

  return res.status(200).json({ summary });
});

return app.listen();

});
