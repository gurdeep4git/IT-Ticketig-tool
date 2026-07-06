import { useForm } from "react-hook-form";
import type { TicketFormValues } from "../models/ticket.model";
import { useTickets } from "../hooks/useTickets";
import { useNavigate } from "react-router-dom";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const AddTicket = () => {
  const { createTicket } = useTickets();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TicketFormValues>({
    defaultValues: {
      title: "",
      description: "",
      priority: "low",
    },
  });

  const onSubmit = async (data: TicketFormValues) => {
    try {
      await createTicket(data);
      reset();
      navigate("/tickets");
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-3">Add Ticket</h1>
      <div className="w-full lg:w-1/3">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div>
            <label htmlFor="title" className="block mb-1 font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <span className="text-red-500 text-sm">
                {errors.title.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block mb-1 font-medium">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <span className="text-red-500 text-sm">
                {errors.description.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="priority" className="block mb-1 font-medium">
              Priority
            </label>
            <select
              id="priority"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("priority", { required: "Priority is required" })}
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.priority && (
              <span className="text-red-500 text-sm">
                {errors.priority.message}
              </span>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-4 py-2 rounded-md transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save Ticket"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
