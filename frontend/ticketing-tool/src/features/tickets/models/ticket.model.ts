export interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  assigned_to: number;
  assignee: any;
}
