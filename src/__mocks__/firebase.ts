// Mock Firebase for Jest tests
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: null,
};

export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    callback(mockUser);
    return jest.fn(); // Return unsubscribe function
  }),
};

export const getAuth = jest.fn(() => auth);

export const signInWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({ user: mockUser })
);

export const createUserWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({ user: mockUser })
);

export const signOut = jest.fn(() => Promise.resolve());

export const User = jest.fn().mockImplementation(() => mockUser);

export const onAuthStateChanged = auth.onAuthStateChanged;

