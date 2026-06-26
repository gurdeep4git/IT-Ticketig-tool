import type { User } from "../../users/models/user.model";

interface AssigneeSelectProps {
  ticketId: number;
  currentAgentId?: number;
  agents: User[];
  onAssign: (ticketId: number, agentId: number) => void;
}

export const AddAssignee = ({ticketId, currentAgentId, agents, onAssign}: AssigneeSelectProps) => {
  return (
    <>
      <select onChange={(e) => onAssign(ticketId, Number(e.target.value))} value={currentAgentId ?? ''} defaultValue="Select" className="select">
        <option style={{ backgroundColor: "white" }}>
          Select
        </option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id} style={{ backgroundColor: "white" }}>{agent.first_name} {agent.last_name}</option>
        ))}
      </select>
    </>
  );
};
