// src/navigation/RootNavigation.ts
import {
  createNavigationContainerRef,
  CommonActions,
  ParamListBase,
} from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef<ParamListBase>();

export function navigate(name: string, params?: Record<string, any>) {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.navigate({ name, params: params ?? {} })
  );
}
