import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;

export const CARD_WIDTH = SCREEN_WIDTH * 0.85; // רוחב כרטיס בקרוסלה
export const GAP = 10; // רווח בין כרטיסים
export const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2; // כדי שהכרטיס הראשון/אחרון יישבו באמצע

// כרטיס + רווח – נוח לחישובי אינדקס
export const CARD_WIDTH_WITH_GAP = CARD_WIDTH + GAP;
