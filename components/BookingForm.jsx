"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import bookRoom from "@/app/actions/bookRoom";
import checkRoomAvailability from "@/app/actions/checkRoomAvailability";

const BookingForm = ({ room }) => {
  const [state, formAction] = useActionState(bookRoom, {});

  const router = useRouter();

  const [checkInDate, setCheckInDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");

  const [unavailableTimes, setUnavailableTimes] = useState([]);

  const [isRoomAvailable, setIsRoomAvailable] = useState(null); // null: not checked yet, true: available, false: unavailable
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Room has been booked !");
      router.push("/bookings");
    }
  }, [state.success]);

  // Check availability when all fields are filled
  useEffect(() => {
    const triggerCheckAvailability = async () => {
      console.log(room);
      if (
        checkInDate &&
        checkInTime &&
        checkOutDate &&
        checkOutTime &&
        room.$id
      ) {
        // Combine date and time to ISO 8601 format
        const checkInDateTime = `${checkInDate}T${checkInTime}`;
        const checkOutDateTime = `${checkOutDate}T${checkOutTime}`;
        const isAvailable = await checkRoomAvailability(
          room.$id,
          checkInDateTime,
          checkOutDateTime
        );

        setIsRoomAvailable(isAvailable);
        if (isAvailable) {
          setAvailabilityMessage(
            "The room is  available for the selected dates."
          );
        } else {
          setAvailabilityMessage(
            "The room is not available for the selected dates."
          );
        }
      }
    };
    triggerCheckAvailability();
  }, [
    checkInDate,
    checkInTime,
    checkOutDate,
    checkOutTime,
    room.$id,
    checkRoomAvailability,
  ]);

  // useEffect(() => {
  //   // Fetch unavailable times when the date changes
  //   const fetchUnavailableTimes = async () => {
  //     if (checkOutDate) {
  //       try {
  //         const times = await getUnavailableTimes({
  //           roomId: room.$id,
  //           checkOutDate,
  //         });
  //         setUnavailableTimes(times); // Array of unavailable times, e.g., ["10:00", "11:00"]
  //       } catch (error) {
  //         console.error("Error fetching unavailable times:", error);
  //       }
  //     }
  //   };

  //   fetchUnavailableTimes();
  // }, [checkOutDate, room.$id, getUnavailableTimes]);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold">Book this Room</h2>
      <form
        action={formAction}
        className="mt-4"
      >
        <input
          type="hidden"
          name="room_id"
          value={room.$id}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="check_in_date"
              className="block text-sm font-medium text-gray-700"
            >
              Check-In Date
            </label>
            <input
              type="date"
              id="check_in_date"
              name="check_in_date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="check_in_time"
              className="block text-sm font-medium text-gray-700"
            >
              Check-In Time
            </label>
            <input
              type="time"
              id="check_in_time"
              name="check_in_time"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="check_out_date"
              className="block text-sm font-medium text-gray-700"
            >
              Check-Out Date
            </label>
            <input
              type="date"
              id="check_out_date"
              name="check_out_date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="check_out_time"
              className="block text-sm font-medium text-gray-700"
            >
              Check-Out Time
            </label>
            <input
              type="time"
              id="check_out_time"
              name="check_out_time"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              required
            />
          </div>
        </div>

        {availabilityMessage && (
          <p
            className={`mt-4 text-sm ${
              isRoomAvailable ? "text-green-600" : "text-red-600"
            }`}
          >
            {availabilityMessage}
          </p>
        )}

        <div className="mt-6">
          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isRoomAvailable === false
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
            }`}
            disabled={isRoomAvailable === false}
          >
            Book Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
