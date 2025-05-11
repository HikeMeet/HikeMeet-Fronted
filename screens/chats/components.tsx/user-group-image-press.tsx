// src/utils/chat-navigation.ts
import { IGroup } from "../../../interfaces/group-interface";
import { IUser } from "../../../interfaces/post-interface";


export type ChatType = "user" | "group";

export interface ProfilePressParams {
  type: ChatType;
  user?: IUser; // only when type === "user"
  group?: IGroup; // only when type === "group"
  mongoId: string;
  navigation: any;
}

/**
 * Navigate to the appropriate profile or group page when
 * the avatar/title is tapped in chat.
 */
export function handleProfilePress({
  type,
  user,
  group,
  mongoId,
  navigation,
}: ProfilePressParams) {
  if (type === "user") {
    if (!user) return;
    if (user._id === mongoId) {
      navigation.push("Tabs", { screen: "Profile" });
    } else {
      navigation.push("AccountStack", {
        screen: "UserProfile",
        params: { userId: user._id },
      });
    }
  } else {
    if (!group) return;
    navigation.navigate("GroupsStack", {
      screen: "GroupPage",
      params: { groupId: group._id },
    });
  }
}
