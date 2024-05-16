import { localStorageController } from "./localStorageController";

const baseUrl = "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:4943";
const endpoints = {
  createConversation: "conversation",
  addMessageToConversation: "add/conversation",
  tagMessage: "conversation/tag",
  markMessage: "conversation/mark",
  generateSummary: "conversation/summary",
  searchMessages: (userIdentity, searchTerm) => `conversation/${userIdentity}/search?q=${searchTerm}`,
  getConversation: (userIdentity) => `conversation/${userIdentity}`
};

export async function createConversation(userIdentity) {
  try {
    const response = await fetch(`${baseUrl}/${endpoints.createConversation}`, {
      method: "PUT",
      headers: [["Content-Type", "application/json"]],
      body: JSON.stringify({ userIdentity }),
    });

    if (!response.ok) {
      throw await response.json();
    }

    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function addMessageToConversation(message) {
  try {
    const userIdentity = window.auth.principalText;
    const conversationId = localStorageController("conversation")?.id;

    const response = await fetch(`${baseUrl}/${endpoints.addMessageToConversation}`, {
      method: "POST",
      headers: [["Content-Type", "application/json"]],
      body: JSON.stringify({
        userIdentity,
        conversationId,
        message,
      }),
    });

    if (!response.ok) {
      throw await response.json();
    }

    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function tagMessage(userIdentity, messageId, tag) {
  try {
    const response = await fetch(`${baseUrl}/${endpoints.tagMessage}`, {
      method: "POST",
      headers: [["Content-Type", "application/json"]],
      body: JSON.stringify({ userIdentity, messageId, tag }),
    });

    if (!response.ok) {
      throw await response.json();
    }

    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function markMessage(userIdentity, messageId, read) {
  try {
    const response = await fetch(`${baseUrl}/${endpoints.markMessage}`, {
      method: "POST",
      headers: [["Content-Type", "application/json"]],
      body: JSON.stringify({ userIdentity, messageId, read }),
    });

    if (!response.ok) {
      throw await response.json();
    }

    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function generateSummary(userIdentity) {
  try {
    const response = await fetch(`${baseUrl}/${endpoints.generateSummary}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw await response.json();
    }

    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function searchMessages(userIdentity, searchTerm) {
  try {
    const response = await fetch(`${baseUrl}/${endpoints.searchMessages(userIdentity, searchTerm)}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw await response.json();
    }

    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function getConversation(userIdentity) {
  try {
    const response = await fetch(`${baseUrl}/${endpoints.getConversation(userIdentity)}`);

    if (!response.ok) {
      throw await response.json();
    }

    return await response.json();
  } catch (error) {
    console.log(error);
  }
}
