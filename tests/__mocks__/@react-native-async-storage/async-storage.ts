// __mocks__/@react-native-async-storage/async-storage.ts
export default {
  setItem: jest.fn((key: string, value: string): Promise<void> => Promise.resolve()),
  getItem: jest.fn((key: string): Promise<string | null> => Promise.resolve(null)),
  removeItem: jest.fn((key: string): Promise<void> => Promise.resolve()),
  clear: jest.fn((): Promise<void> => Promise.resolve()),
};
