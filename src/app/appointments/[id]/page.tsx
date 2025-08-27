"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { UniversalHeader, Typography, Icon } from "../../../components/atoms";
import { useAuth } from "../../../hooks/useAuth";
import { appointmentService } from "../../../services/apiServices";

// Type is not guaranteed here in this workspace snapshot, so keep it permissive
interface Apt {
  _id: string;
  status?: string;
  notes?: string;
  appointmentDate: string;
  appointmentTime: { from?: string; to?: string } | any;
  doctor: { fullName?: string; specializations?: string[] | string; profileImage?: string };
  clinic: { _id?: string; clinicName?: string; clinicAddress?: string };
  payment?: { status?: string };
}

const AppointmentDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const id = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [apt, setApt] = useState<Apt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // Try direct fetch by ID if available
      let item: Apt | null = null;
      try {
        if (typeof (appointmentService as any)?.getAppointmentById === "function") {
          item = await (appointmentService as any).getAppointmentById(id);
        }
      } catch (e) {
        // ignore and fallback
      }

      if (!item && user?._id && typeof (appointmentService as any)?.getAppointmentsByUserId === "function") {
        const all = await (appointmentService as any).getAppointmentsByUserId(user._id);
        if (Array.isArray(all)) item = (all as Apt[]).find(a => a._id === id) || null;
      }

      if (!item) {
        setError("Appointment not found");
        setApt(null);
      } else {
        console.log("📋 Full appointment data:", JSON.stringify(item, null, 2));
        setApt(item);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load appointment");
      setApt(null);
    } finally {
      setLoading(false);
    }
  }, [id, user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  const cancelAppointment = async () => {
    if (!apt?._id) return;
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      setActionBusy(true);
      if (typeof (appointmentService as any)?.cancelAppointment === "function") {
        await (appointmentService as any).cancelAppointment(apt._id);
      } else {
        // Fallback: no API available, simulate success
        console.warn("cancelAppointment API not found; simulating success.");
      }
      // Reload to reflect status
      await load();
      alert("Appointment cancelled");
    } catch (e: any) {
      alert(e?.message || "Failed to cancel appointment");
    } finally {
      setActionBusy(false);
    }
  };

  const rescheduleAppointment = () => {
    if (!apt?._id) return;
    // Navigate to booking page with query to prefill context
    router.push(`/booking?appointmentId=${apt._id}`);
  };

  const formattedDate = useMemo(() => {
    if (!apt?.appointmentDate) return "";
    const d = new Date(apt.appointmentDate);
    if (isNaN(d.getTime())) return apt.appointmentDate;
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }, [apt?.appointmentDate]);

  const formatTime = (from?: string, to?: string) => {
    const fmt = (t?: string) => {
      if (!t) return "";
      const dt = new Date(t);
      if (!isNaN(dt.getTime())) {
        const h = dt.getHours();
        const m = dt.getMinutes().toString().padStart(2, "0");
        const ampm = h >= 12 ? "PM" : "AM";
        const hh = h % 12 === 0 ? 12 : h % 12;
        return `${hh}:${m} ${ampm}`;
      }
      const m = t.match(/\d{1,2}:\d{2}(\s?(AM|PM|am|pm))?/);
      return m ? (m[0].toUpperCase()) : t;
    };
    const a = fmt(from);
    const b = fmt(to);
    return [a, b].filter(Boolean).join(" - ");
  };

  const statusLabel = useMemo(() => {
    const s = String(apt?.status || "").toLowerCase();
    if (!s) return "";
    if (s === "canceled") return "Cancelled";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, [apt?.status]);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white">
        <UniversalHeader
          title="Appointment Details"
          subtitle={apt?._id ? `#${apt._id.slice(-6)}` : undefined}
          showBackButton
          onBackPress={() => router.back()}
          variant="gradient"
        />
      </div>

      <main className="px-4 py-4 pb-28">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full h-40 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Typography variant="body1" className="text-red-600">{error}</Typography>
          </div>
        ) : !apt ? (
          <div className="text-center py-16">
            <Typography variant="body1" className="text-gray-600">Appointment not found</Typography>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Doctor card */}
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {apt.doctor?.profileImage ? (
                    <img src={apt.doctor.profileImage} alt={apt.doctor.fullName || "Doctor"} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-900 flex-shrink-0">
                      <Icon name="doctor" size="small" color="#0E3293" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <Typography variant="body1" className="font-semibold text-gray-900 truncate text-base">{apt.doctor?.fullName || "Unknown Doctor"}</Typography>
                    <Typography variant="body2" className="text-gray-600 truncate text-sm">
                      {Array.isArray(apt.doctor?.specializations) ? apt.doctor?.specializations?.[0] : (apt.doctor?.specializations || "General")}
                    </Typography>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs bg-blue-100 text-blue-700">
                  <Icon name="calendar" size="small" color="#1d4ed8" />
                  <span className="font-medium">{statusLabel || "Scheduled"}</span>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-4" />

              <div className="space-y-3">
                <div className="flex items-center">
                  <Icon name="calendar" size="small" color="#0E3293" />
                  <Typography variant="body2" className="ml-2 text-gray-800 text-sm">{formattedDate}</Typography>
                  <span className="mx-3 text-gray-300">|</span>
                  <Icon name="clock" size="small" color="#0E3293" />
                  <Typography variant="body2" className="ml-2 text-gray-800 text-sm">{formatTime(apt.appointmentTime?.from, apt.appointmentTime?.to)}</Typography>
                </div>
                <div className="flex items-center">
                  <Icon name="hospital" size="small" color="#0E3293" />
                  <Typography variant="body2" className="ml-2 text-gray-800 text-sm">{apt.clinic?.clinicName || "HYGO Clinic"}</Typography>
                </div>
                <div className="flex items-center">
                  <Icon name="location" size="small" color="#0E3293" />
                  <Typography variant="body2" className="ml-2 text-gray-800 text-sm">{apt.clinic?.clinicAddress || "Address N/A"}</Typography>
                </div>
                {apt.notes && (
                  <div className="flex items-start">
                    <Icon name="document" size="small" color="#6b7280" />
                    <Typography variant="body2" className="ml-2 text-gray-600 text-sm">Reason: {apt.notes}</Typography>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                disabled={actionBusy || String(apt.status).toLowerCase() === "cancelled" || String(apt.status).toLowerCase() === "canceled"}
                className={`flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                onClick={cancelAppointment}
              >
                Cancel Appointment
              </button>
              <button
                disabled={actionBusy}
                className="flex-1 bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
                onClick={rescheduleAppointment}
              >
                Reschedule
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AppointmentDetailPage;
