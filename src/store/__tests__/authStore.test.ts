import { useAuthStore } from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      isLoading: false,
    });
  });

  it('should initialize with null user', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
  });

  it('should set user', () => {
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
    } as any;

    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
  });

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

