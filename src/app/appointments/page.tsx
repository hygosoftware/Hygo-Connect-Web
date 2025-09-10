"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UniversalHeader, Typography, AppointmentCard, FloatingButton } from "../../components/atoms";
import { appointmentService, Appointment } from "../../services/apiServices";
import { useAuth } from "../../hooks/useAuth";

const AppointmentsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const loadAppointments = useCallback(async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentsByUserId(user._id);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch appointments", e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const splitAppointments = useMemo(() => {
    const now = new Date();
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    for (const apt of appointments) {
      const status = String(apt.status).toLowerCase();
      let appointmentDateTime: Date;
      // Combine date and end time if available, otherwise just use date
      if (apt.appointmentDate && apt.appointmentTime && apt.appointmentTime.to) {
        // Assume time is in 'HH:mm' format
        const datePart = apt.appointmentDate.split('T')[0];
        const timePart = apt.appointmentTime.to;
        appointmentDateTime = new Date(`${datePart}T${timePart.length === 5 ? timePart : timePart.padStart(5, '0')}:00`);
      } else {
        appointmentDateTime = new Date(apt.appointmentDate);
      }
      const isPastAppointment = !isNaN(appointmentDateTime.getTime()) && appointmentDateTime < now;
      
      if (status === 'scheduled' && !isPastAppointment) {
        // Only show scheduled appointments in Upcoming tab if the date/time is not passed
        upcoming.push(apt);
      } else {
        // Show in Past tab if:
        // 1. Status is cancelled/canceled
        // 2. Status is completed
        // 3. Status is scheduled but appointment date/time has passed
        past.push(apt);
      }
    }

    // sort by date asc for upcoming, desc for past
    upcoming.sort((a, b) => {
      const aDate = a.appointmentDate && a.appointmentTime && a.appointmentTime.to ? new Date(`${a.appointmentDate.split('T')[0]}T${a.appointmentTime.to.length === 5 ? a.appointmentTime.to : a.appointmentTime.to.padStart(5, '0')}:00`) : new Date(a.appointmentDate);
      const bDate = b.appointmentDate && b.appointmentTime && b.appointmentTime.to ? new Date(`${b.appointmentDate.split('T')[0]}T${b.appointmentTime.to.length === 5 ? b.appointmentTime.to : b.appointmentTime.to.padStart(5, '0')}:00`) : new Date(b.appointmentDate);
      return aDate.getTime() - bDate.getTime();
    });
    past.sort((a, b) => {
      const aDate = a.appointmentDate && a.appointmentTime && a.appointmentTime.to ? new Date(`${a.appointmentDate.split('T')[0]}T${a.appointmentTime.to.length === 5 ? a.appointmentTime.to : a.appointmentTime.to.padStart(5, '0')}:00`) : new Date(a.appointmentDate);
      const bDate = b.appointmentDate && b.appointmentTime && b.appointmentTime.to ? new Date(`${b.appointmentDate.split('T')[0]}T${b.appointmentTime.to.length === 5 ? b.appointmentTime.to : b.appointmentTime.to.padStart(5, '0')}:00`) : new Date(b.appointmentDate);
      return bDate.getTime() - aDate.getTime();
    });

    return { upcoming, past };
  }, [appointments]);

  // Group upcoming by date for headers (Today, Tomorrow, or formatted date)
  const groupedUpcoming = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const formatKey = (dateStr: string) => {
      const d = new Date(dateStr);
      const dYMD = d.toDateString();
      const todayYMD = today.toDateString();
      const tomorrowYMD = tomorrow.toDateString();
      if (dYMD === todayYMD) return 'Today';
      if (dYMD === tomorrowYMD) return 'Tomorrow';
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    for (const apt of splitAppointments.upcoming) {
      const key = formatKey(apt.appointmentDate);
      map.set(key, [...(map.get(key) || []), apt]);
    }
    return map;
  }, [splitAppointments.upcoming]);

  const list = activeTab === "upcoming" ? splitAppointments.upcoming : splitAppointments.past;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white">
        <UniversalHeader
          title="My Appointments"
          subtitle={activeTab === "upcoming" ? "Upcoming" : "Past"}
          showBackButton
          onBackPress={() => router.back()}
          variant="gradient"
        />

        {/* Tabs */}
        <div className="px-4 border-b border-gray-200 bg-white">
          <div className="flex gap-4">
            <button
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "upcoming"
                  ? "border-[#0e3293] text-[#0e3293]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming Appointments
            </button>
            <button
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "past"
                  ? "border-[#0e3293] text-[#0e3293]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("past")}
            >
              Past Appointments
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <main className="px-4 py-4 pb-28">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full h-40 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16">
            <Typography variant="body1" className="text-gray-600">
              {activeTab === "upcoming" ? "No upcoming appointments" : "No past appointments"}
            </Typography>
            {activeTab === "upcoming" && (
              <button
                onClick={() => router.push("/booking")}
                className="mt-3 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Typography variant="body2" className="text-white">Book Appointment</Typography>
              </button>
            )}
          </div>
        ) : (
          <>
            {activeTab === 'upcoming' ? (
              // Grouped sections for upcoming
              Array.from(groupedUpcoming.entries()).map(([label, items]) => (
                <section key={label} className="mb-6">
                  <div className="sticky top-16 bg-white z-10 py-2">
                    <Typography variant="body1" className="font-semibold text-gray-700">
                      {label}
                    </Typography>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {items.map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        doctor={{
                          fullName: appointment.doctor.fullName,
                          specializations: appointment.doctor.specializations,
                          avatar: appointment.doctor.profileImage,
                        }}
                        variant="modern"
                        date={appointment.appointmentDate}
                        actualStartTime={appointment.appointmentTime.from}
                        actualEndTime={appointment.appointmentTime.to}
                        mode="InPerson"
                        status={((): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' => {
                          const s = String(appointment.status).toLowerCase();
                          if (s === 'scheduled') return 'upcoming';
                          if (s === 'ongoing') return 'ongoing';
                          if (s === 'completed') return 'completed';
                          if (s === 'cancelled' || s === 'canceled') return 'cancelled';
                          return 'upcoming';
                        })()}
                        reason={(appointment as any).notes}
                        paymentStatus={(() => {
                          const ps = String((appointment as any)?.payment?.status || '').toLowerCase();
                          if (ps === 'pending') return 'pending';
                          if (ps === 'paid' || ps === 'success') return 'paid';
                          if (ps === 'failed') return 'failed';
                          return undefined;
                        })()}
                        clinic={{
                          _id: appointment.clinic._id,
                          clinicName: appointment.clinic.clinicName,
                          clinicAddress: {
                            addressLine: appointment.clinic.clinicAddress || 'N/A',
                          },
                        }}
                        clinicName={appointment.clinic.clinicName}
                        clinicCity={appointment.clinic.clinicAddress || 'N/A'}
                        qrCode={`appointment-${appointment._id}`}
                        appointmentId={appointment._id}
                        onPress={() => {
                          router.push(`/appointments/${appointment._id}`);
                        }}
                        className="w-full"
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              // Simple responsive grid for past
              <div className="grid grid-cols-1 gap-4">
                {list.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    doctor={{
                      fullName: appointment.doctor.fullName,
                      specializations: appointment.doctor.specializations,
                      avatar: appointment.doctor.profileImage,
                    }}
                    variant="modern"
                    date={appointment.appointmentDate}
                    actualStartTime={appointment.appointmentTime.from}
                    actualEndTime={appointment.appointmentTime.to}
                    mode="InPerson"
                    status={((): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' => {
                      const s = String(appointment.status).toLowerCase();
                      if (s === 'scheduled') return 'upcoming';
                      if (s === 'ongoing') return 'ongoing';
                      if (s === 'completed') return 'completed';
                      if (s === 'cancelled' || s === 'canceled') return 'cancelled';
                      return 'completed';
                    })()}
                    reason={(appointment as any).notes}
                    paymentStatus={(() => {
                      const ps = String((appointment as any)?.payment?.status || '').toLowerCase();
                      if (ps === 'pending') return 'pending';
                      if (ps === 'paid' || ps === 'success') return 'paid';
                      if (ps === 'failed') return 'failed';
                      return undefined;
                    })()}
                    clinic={{
                      _id: appointment.clinic._id,
                      clinicName: appointment.clinic.clinicName,
                      clinicAddress: {
                        addressLine: appointment.clinic.clinicAddress || 'N/A',
                      },
                    }}
                    clinicName={appointment.clinic.clinicName}
                    clinicCity={appointment.clinic.clinicAddress || 'N/A'}
                    qrCode={`appointment-${appointment._id}`}
                    appointmentId={appointment._id}
                    onPress={() => {
                      router.push(`/appointments/${appointment._id}`);
                    }}
                    className="w-full"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* FAB to add new appointment */}
      <FloatingButton
        icon="plus"
        onClick={() => router.push("/booking")}
        position="bottom-right"
        variant="primary"
      />
    </div>
  );
};

export default AppointmentsPage;
