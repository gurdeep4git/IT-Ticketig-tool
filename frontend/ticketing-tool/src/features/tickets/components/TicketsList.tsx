import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { useUsers } from "../../users/hooks/useUsers";
import { useTickets } from "../hooks/useTickets";
import { AddAssignee } from "./AddAssignee";
import { ChangeStatus } from "./ChangeStatus";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

export const TicketsList = () => {
  const { tickets, statuses, isLoading, error, assignAgent, assignStatus } =
    useTickets();
  const { agents } = useUsers();
  const { isAgent, isUser, isAdmin } = useAuth();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-3">Tickets</h1>
      {(isAdmin || isUser) && (
        <div className="flex justify-end mb-3">
          <Link to={"/tickets/add"}>
            <button className="btn btn-info">Create Ticket</button>
          </Link>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ticket Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              {!isAgent && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                  #{ticket.ticket_number}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {ticket.title}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {ticket.description}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {isUser ? (
                    <StatusBadge status={ticket.status} />
                  ) : (
                    <ChangeStatus
                      ticketId={ticket.id}
                      statuses={statuses}
                      currentStatus={ticket.status}
                      onChangeStatus={assignStatus}
                    />
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                {!isAgent && (
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {isAdmin ? (
                      <AddAssignee
                        ticketId={ticket.id}
                        agents={agents}
                        currentAgentId={ticket.assigned_to}
                        onAssign={assignAgent}
                      />
                    ) : ticket.assignee ? (
                      `${ticket.assignee.first_name} ${ticket.assignee.last_name}`
                    ) : '-'}
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
