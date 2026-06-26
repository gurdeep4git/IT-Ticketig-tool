import type { Ticket } from "../models/ticket.model";

export const PriorityBadge = ({
  priority,
}: {
  priority: Ticket["priority"];
}) => {
  const styles: Record<string, string> = {
    low: "text-gray-500",
    medium: "text-amber-600",
    high: "text-red-600",
  };
  return (
    <span
      className={`text-xs font-semibold uppercase ${styles[priority] ?? "text-gray-500"}`}
    >
      {priority}
    </span>
  );
};
