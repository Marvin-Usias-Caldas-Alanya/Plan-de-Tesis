/**
 * Obtiene el último mensaje por conversation_id (el de created_at más reciente).
 */
export function pickLastMessagePerConversation(messageRows) {
  const map = new Map();

  for (const row of messageRows ?? []) {
    const prev = map.get(row.conversation_id);
    if (!prev || new Date(row.created_at) > new Date(prev.created_at)) {
      map.set(row.conversation_id, {
        content: row.message,
        sender_type: row.sender_type,
        created_at: row.created_at,
      });
    }
  }

  return map;
}
