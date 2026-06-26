import { useState, useEffect } from 'react';
import type { User } from '../models/user.model';
import { UsersApi } from '../api/usersApi';


export function useUsers() {
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    UsersApi.getAll()
      .then(setAgents)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch agents'))
      .finally(() => setIsLoading(false));
  }, []);

  return { agents, isLoading, error };
}