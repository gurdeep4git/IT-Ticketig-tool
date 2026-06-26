// features/tickets/hooks/useTickets.ts
import { useState, useEffect, useCallback } from 'react';
import { ticketsApi } from '../api/ticketsApi';
import type { Ticket } from '../models/ticket.model';


interface UseTicketsParams {
  status?: string;
  search?: string;
}

interface UseTicketsResult {
  tickets: Ticket[];
  statuses:string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  assignAgent: (ticketId: number, agentId: number) => Promise<void>;
  assignStatus: (ticketId: number, status: string) => Promise<void>;
}

export function useTickets(params?: UseTicketsParams): UseTicketsResult {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.getAll(params);
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  }, [params?.status, params?.search]);

  const assignAgent = useCallback(async (ticketId: number, agentId: number) => {
    try {
      const updatedTicket = await ticketsApi.addAssignee(ticketId, agentId);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? updatedTicket : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign agent');
    }
  }, []);

  const fetchStatuses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.getStatutes();
      setStatuses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const assignStatus = useCallback(async (ticketId: number, status: string) => {
    try {
      const updatedTicket = await ticketsApi.changeStatus(ticketId, status);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? updatedTicket : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign agent');
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchStatuses();
  }, [fetchTickets]);

  return { tickets, statuses, isLoading, error, refetch: fetchTickets, assignAgent, assignStatus  };
}