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
};

type BaseMessage = {
  role: string;
  content: string;
};

type ConversationPayload = {
  userIdentity: string;
};

type AddMessgeToConversationPayload = {
  userIdentity: string;
  conversationId: string;
  message: BaseMessage;
};

type Conversation = {
  id: string;
  conversation: Message[];
};

type ErrorMessage = {
  message: string;
};

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
    // Assuming AI functions are integrated into systemMessage
    const newConversation = {
      id: uuidv4(),
      conversation: [initialMessage],
    };

    userConversations[conversationPayload.userIdentity] = newConversation;
    return res.status(200).json({
      conversation: newConversation,
      // Modified to return the entire conversation
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
      return res
        .status(404)
        .json({ message: `No conversation found for ${userIdentity}` });
    }

    return res.status(200).json(conversation); // Return the entire conversation
  });

  // UPDATE
  app.post("/add/conversation", (req: Request, res: Response) => {
    const payload = req.body;
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
      return res.status(400).json({ message: "Invild payload" });
    }

    const newMessage = {
      role: payload.message.role,
      content: payload.message.content,
      id: uuidv4(),
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
      return res.status(400).json({
        message: `Cannot delete conversation with for user:${userIdentity}`,
      });
    }

    delete userConversations[userIdentity]; // Delete conversation
    return res
      .status(201)
      .send(`The conversation associated to ${userIdentity} has been deleted`);
  });

  // Additional service: User management
  type User = {
    id: string;
    name: string;
    email: string;
  };

  const users: User[] = [];

  /**
   * Create a new user
   * @route POST /users
   * @param {string} name - The name of the user
   * @param {string} email - The email of the user
   * @returns {User} The created user object
   */
  app.post("/users", (req: Request, res: Response) => {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const newUser = {
      id: uuidv4(),
      name,
      email,
    };

    users.push(newUser);
    return res.status(201).json(newUser);
  });

  /**
   * Get all users
   * @route GET /users
   * @returns {User[]} An array of user objects
   */
  app.get("/users", (_req: Request, res: Response) => {
    return res.status(200).json(users);
  });

  /**
   * Get a user by ID
   * @route GET /users/:id
   * @param {string} id - The ID of the user
   * @returns {User} The user object with the specified ID
   * @throws {404} If the user is not found
   */
  app.get("/users/:id", (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  });

  // Additional service: File management
  type File = {
    id: string;
    name: string;
    content: string;
  };

  const files: File[] = [];

  /**
   * Upload a file
   * @route POST /files
   * @param {string} name - The name of the file
   * @param {string} content - The content of the file
   * @returns {File} The uploaded file object
   */
  app.post("/files", (req: Request, res: Response) => {
    const { name, content } = req.body;
    if (!name || !content) {
      return res.status(400).json({ message: "Name and content are required" });
    }

    const newFile = {
      id: uuidv4(),
      name,
      content,
    };

    files.push(newFile);
    return res.status(201).json(newFile);
  });

  /**
   * Get all files
   * @route GET /files
   * @returns {File[]} An array of file objects
   */
  app.get("/files", (_req: Request, res: Response) => {
    return res.status(200).json(files);
  });

  /**
   * Get a file by ID
   * @route GET /files/:id
   * @param {string} id - The ID of the file
   * @returns {File} The file object with the specified ID
   * @throws {404} If the file is not found
   */
  app.get("/files/:id", (req: Request, res: Response) => {
    const fileId = req.params.id;
    const file = files.find((f) => f.id === fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    return res.status(200).json(file);
  });

  return app.listen();
});