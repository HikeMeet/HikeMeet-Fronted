// src/requests/notificationRequests.ts

const API_BASE = `${process.env.EXPO_LOCAL_SERVER}/api/notification`;

/** Build headers given a bearer token */
export function buildHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Fetch all notifications for the logged‑in user.
 */
export async function fetchNotifications(token: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/`, {
    method: "GET",
    headers: buildHeaders(token),
  });
  if (!res.ok) {
    throw new Error(`Error fetching notifications: ${res.status}`);
  }
  const { notifications } = await res.json();

  return notifications;
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(
  token: string,
  notificationId: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/${notificationId}/read`, {
    method: "PATCH",
    headers: buildHeaders(token),
  });
  // if the notification was already deleted, the server will 404:
  if (res.status === 405) {
    console.warn(
      `Notification ${notificationId} not found on server, skipping`
    );
    return;
  }
  if (!res.ok) {
    throw new Error(`Error marking notification read: ${res.status}`);
  }
  return res.json();
}

/**
 * Mark *all* unread notifications as read.
 */
export async function markAllNotificationsAsRead(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/read-all`, {
    method: "PATCH",
    headers: buildHeaders(token),
  });
  if (!res.ok) {
    throw new Error(`Error marking all notifications read: ${res.status}`);
  }
}

/**
 * Delete a single notification.
 */
export async function deleteNotification(
  token: string,
  notificationId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/${notificationId}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });
  if (!res.ok) {
    throw new Error(`Error deleting notification: ${res.status}`);
  }
}

/**
 * Clear *all* notifications for this user.
 */
export async function clearAllNotifications(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });
  if (!res.ok) {
    throw new Error(`Error clearing notifications: ${res.status}`);
  }
}

export const sendPushNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, any>
) => {
  const messages = tokens.map((to) => ({
    to,
    sound: "default",
    title,
    body,
    data,
  }));
  // Expo push endpoint
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });
};
