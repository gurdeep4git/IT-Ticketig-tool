
interface ChangeStatusProps {
  ticketId: number;
  currentStatus?: string;
  statuses: string[];
  onChangeStatus: (ticketId: number, status: string) => void;
}
export const ChangeStatus = ({ticketId, currentStatus, statuses, onChangeStatus}: ChangeStatusProps ) => {
  return (
    <>
      <select onChange={(e) => onChangeStatus(ticketId, e.target.value)} value={currentStatus ?? ''} defaultValue="Select" className="select">
        <option style={{ backgroundColor: "white" }}>
          Select
        </option>
        {statuses.map((item) => (
          <option key={item} value={item} style={{ backgroundColor: "white" }}>{item}</option>
        ))}
      </select>
    </>
  );
}
