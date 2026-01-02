import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,

      // Set auth data
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      // Logout
      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      // Update user
      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),

      // Documents cache
      documents: [],
      currentDocument: null,

      // Set documents
      setDocuments: (documents) => set({ documents }),

      // Set current document
      setCurrentDocument: (document) => set({ currentDocument: document }),

      // Add document
      addDocument: (document) =>
        set((state) => ({ documents: [document, ...state.documents] })),

      // Remove document
      removeDocument: (documentId) =>
        set((state) => ({
          documents: state.documents.filter((doc) => doc._id !== documentId),
        })),

      // Loading states
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),

      // Error state
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'ai-sentinel-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useStore;
