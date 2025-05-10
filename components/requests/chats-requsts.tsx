// src/utils/chat-api.ts
import { buildHeaders } from "./notification-requsts";

const API_BASE = `${process.env.EXPO_LOCAL_SERVER}/api/chat`;
export async function fetchChatrooms(token: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/`, {
    method: "GET",
    headers: buildHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch chatrooms");
  }
  const body = await res.json();
  return body;
}

export async function openChatroom(
  partnerId: string,
  token: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/user/${partnerId}`, {
    method: "POST",
    headers: buildHeaders(token),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to open chatroom");
  }
}

export async function closeChatroom(
  partnerId: string,
  token: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/user/${partnerId}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to close chatroom");
  }
}

export async function openGroupChatroom(
  groupId: string,
  token: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/group/${groupId}`, {
    method: "POST",
    headers: buildHeaders(token),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to open chatroom");
  }
}

export async function closeGroupChatroom(
  groupId: string,
  token: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/group/${groupId}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to close chatroom");
  }
}
