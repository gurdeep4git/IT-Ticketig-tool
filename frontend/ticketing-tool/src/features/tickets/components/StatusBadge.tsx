import type { Ticket } from "../models/ticket.model";

export const StatusBadge = ({ status }: { status: Ticket['status'] }) => {
  const styles: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    closed: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
};
