/**
 * Conversation Storage Utility
 * Manages saving, loading, and searching conversation history
 */

const STORAGE_KEY = "safetyai_conversations";
const FAVORITES_KEY = "safetyai_favorites";

/**
 * Save a conversation to local storage
 */
export function saveConversation(messages, title = null) {
  if (messages.length === 0) return null;

  const conversations = getAllConversations();

  // Auto-generate title from first user message
  const autoTitle =
    title ||
    messages.find((m) => m.role === "user")?.content.substring(0, 50) ||
    "Untitled Conversation";

  const conversation = {
    id: Date.now(),
    title: autoTitle,
    messages: messages,
    timestamp: new Date().toISOString(),
    messageCount: messages.length,
  };

  conversations.unshift(conversation); // Add to beginning

  // Keep only last 50 conversations
  const trimmedConversations = conversations.slice(0, 50);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedConversations));
    return conversation.id;
  } catch (error) {
    console.error("Failed to save conversation:", error);
    return null;
  }
}

/**
 * Get all saved conversations
 */
export function getAllConversations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load conversations:", error);
    return [];
  }
}

/**
 * Get a specific conversation by ID
 */
export function getConversation(id) {
  const conversations = getAllConversations();
  return conversations.find((conv) => conv.id === id);
}

/**
 * Delete a conversation
 */
export function deleteConversation(id) {
  const conversations = getAllConversations();
  const filtered = conversations.filter((conv) => conv.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return false;
  }
}

/**
 * Search conversations by keyword
 */
export function searchConversations(query) {
  if (!query.trim()) return getAllConversations();

  const conversations = getAllConversations();
  const lowerQuery = query.toLowerCase();

  return conversations.filter((conv) => {
    // Search in title
    if (conv.title.toLowerCase().includes(lowerQuery)) return true;

    // Search in messages
    return conv.messages.some((msg) => {
      if (msg.role === "user") {
        return msg.content.toLowerCase().includes(lowerQuery);
      }
      if (msg.data && msg.data.answer) {
        return msg.data.answer.toLowerCase().includes(lowerQuery);
      }
      return false;
    });
  });
}

/**
 * Favorite/Bookmark Management
 */
export function getFavorites() {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load favorites:", error);
    return [];
  }
}

export function addFavorite(message) {
  const favorites = getFavorites();

  const favorite = {
    id: Date.now(),
    message: message,
    timestamp: new Date().toISOString(),
  };

  favorites.unshift(favorite);

  // Keep only last 100 favorites
  const trimmed = favorites.slice(0, 100);

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(trimmed));
    return favorite.id;
  } catch (error) {
    console.error("Failed to add favorite:", error);
    return null;
  }
}

export function removeFavorite(id) {
  const favorites = getFavorites();
  const filtered = favorites.filter((fav) => fav.id !== id);

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to remove favorite:", error);
    return false;
  }
}

export function isFavorite(messageId) {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.message.id === messageId);
}
