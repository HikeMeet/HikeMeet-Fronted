export const updateUserStatusUnified = (
  userId: string,
  action: "accept" | "decline" | "remove" | "invite",
  newUserData: any,
  updatePending: (updater: (prev: any[]) => any[]) => void,
  updateMembers?: (updater: (prev: any[]) => any[]) => void
): void => {
  if (action === "accept") {
    updatePending((prevPending) => {
      const acceptedUser = prevPending.find((user) => user._id === userId);
      const updatedPending = prevPending.filter((user) => user._id !== userId);
      if (updateMembers && acceptedUser) {
        updateMembers((prevMembers) => {
          if (!prevMembers.find((user) => user._id === userId)) {
            return [...prevMembers, acceptedUser];
          }
          return prevMembers;
        });
      }
      return updatedPending;
    });
  } else if (action === "decline") {
    updatePending((prev) => prev.filter((user) => user._id !== userId));
  } else if (action === "remove") {
    if (updateMembers) {
      updateMembers((prev) => prev.filter((user) => user._id !== userId));
    }
  } else if (action === "invite") {
    updatePending((prev) => {
      if (!prev.find((user) => user._id === userId)) {
        return newUserData ? [...prev, newUserData] : prev;
      }
      return prev;
    });
  }
};
