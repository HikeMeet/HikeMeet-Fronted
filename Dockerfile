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

# פורט 19000 – ברירת מחדל של expo dev server
EXPOSE 19000
# פורטים נוספים אם אתה רוצה גם web
EXPOSE 19006

# שלב 7: הפעלת expo (כברירת מחדל)
CMD ["npm", "run", "start"]
