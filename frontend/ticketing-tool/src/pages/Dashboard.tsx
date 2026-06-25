import { useEffect, useState } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
 const cards = [1, 2, 3, 4];
  useEffect(() => {
    let isMounted = true; // prevent state update on unmounted component

    const fetchDashboardStats = async () => {
      const url = "http://localhost:8000/dashboard";
      setLoading(true);
      try {
        const res = await fetch(url, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();

    return () => {
      isMounted = false; // cleanup
    };
  }, []);

  return <>
  {loading && <p>Loading...</p>}
  {error && <p>{error}</p>}
  {data && (
    <div className="flex flex-col lg:flex-row gap-6 justify-between">
        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-2">Total Tickets</h3>
          <p className="text-gray-600 font-bold text-4xl">{data.summary.total_tickets}</p>
        </div>

        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-2">Completed Tickets</h3>
          <p className="text-gray-600 font-bold text-4xl">{data.summary.done_tickets}</p>
        </div>

        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-2">Open Tickets</h3>
          <p className="text-gray-600 font-bold text-4xl">{data.summary.open_tickets}</p>
        </div>

        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-2">In Progress Tickets</h3>
          <p className="text-gray-600 font-bold text-4xl">{data.summary.progress_tickets}</p>
        </div>
      </div>
  )}
  </>;
}
