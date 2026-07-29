import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

export const useScans = (skip = 0, limit = 20) => {
  return useQuery({
    queryKey: ['scans', skip, limit],
    queryFn: async () => {
      const { data } = await api.get(`/scans?skip=${skip}&limit=${limit}`);
      return data;
    },
  });
};

export const useScan = (scanId: string) => {
  return useQuery({
    queryKey: ['scan', scanId],
    queryFn: async () => {
      const { data } = await api.get(`/scans/${scanId}`);
      return data;
    },
    enabled: !!scanId,
    refetchInterval: (query) => {
      // Poll every 3 seconds if status is uploaded or processing
      const status = query.state?.data?.status;
      if (status === 'uploaded' || status === 'processing') return 3000;
      return false;
    }
  });
};

export const useUploadScan = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/scans/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      router.push(`/dashboard/scan/${data.id}`);
    },
  });
};

export const useDeleteScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scanId: string) => {
      await api.delete(`/scans/${scanId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });
};
