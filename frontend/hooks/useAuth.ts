import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import { TokenStorage } from '@/lib/token-storage';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = TokenStorage.getAccessToken();
      const refreshToken = TokenStorage.getRefreshToken();
      
      if (!token && !refreshToken) {
        return null;
      }
      
      const { data } = await api.get('/users/me');
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      TokenStorage.setAccessToken(data.access_token);
      TokenStorage.setRefreshToken(data.refresh_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Login failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.post('/auth/register', userData);
      return data;
    },
    onSuccess: () => {
      router.push('/login?registered=true');
      toast.success("Account created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Registration failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = TokenStorage.getRefreshToken();
      await api.post('/auth/logout', { refresh_token: token });
    },
    onSuccess: () => {
      TokenStorage.clearTokens();
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/login');
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};
