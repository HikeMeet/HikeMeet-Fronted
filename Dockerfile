# שלב 1: תמונת בסיס עם Node.js
FROM node:18-alpine

# שלב 2: התקנת תלות ב-Python ו-watchman (נחוץ ל-react-native)
RUN apk add --no-cache bash git python3 make g++ dumb-init

# שלב 3: יצירת תיקיית העבודה
WORKDIR /app

# שלב 4: העתקת קבצי package והתקנת תלויות
COPY package.json package-lock.json ./
RUN npm install

# שלב 5: התקנת expo-cli (כלי CLI להפעלת אפליקציה)
RUN npm install -g expo-cli

# שלב 6: העתקת שאר הקבצים
COPY . .

# שלב 7: משתני סביבה (לגישה ל-backend מתוך ה-client)
# חשוב! ניתן להחליף את ה-URL לפי שם השירות ב-Docker Compose או IP חיצוני
ENV EXPO_LOCAL_SERVER=http://backend:3000

# שלב 8: פתיחת פורטים של expo
# expo go app (default dev)
EXPOSE 19000

# web version if used
EXPOSE 19006

# שלב 9: הפעלת השרת
CMD ["npm", "run", "start"]
