// Mock Firebase config for tests
export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn();
  }),
};

export const db = {};

export default db;

