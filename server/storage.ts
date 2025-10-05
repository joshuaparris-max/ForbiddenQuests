// This storage interface is not currently used
// The app uses Zustand with localStorage for persistence
// Keeping this file for potential future backend integration

export interface IStorage {
  // Add storage methods here if needed
}

export class MemStorage implements IStorage {
  constructor() {
    // Empty for now
  }
}

export const storage = new MemStorage();
