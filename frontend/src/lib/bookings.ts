// Bookings read/write + realtime — talks directly to the existing `bookings`
// table in the shared FlashClean Supabase project. RLS gates per-user access.

import type { RealtimeChannel } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";

export type Booking = {
  id: string;
  client_id: string | null;
  service_id: string | null;
  category_id: string | null;
  typology_id: string | null;
  status: string | null;
  base_price: number | null;
  total_price: number | null;
  frequency: string | null;
  is_recurring: boolean | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  service_address: string | null;
  postal_code: string | null;
  city: string | null;
  notes: string | null;
  payment_method: string | null;
  payment_status: string | null;
  created_at: string;
};

export type NewBooking = {
  client_id: string;
  service_id: string;
  category_id?: string | null;
  typology_id?: string | null;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:MM[:SS]
  client_name: string;
  client_email: string;
  client_phone: string;
  service_address: string;
  postal_code?: string | null;
  city?: string | null;
  floor?: string | null;
  notes?: string | null;
  base_price?: number | null;
  total_price?: number | null;
  frequency?: string | null;
  is_recurring?: boolean | null;
  payment_method?: string | null;
};

export async function createBooking(input: NewBooking): Promise<Booking> {
  const row = {
    ...input,
    status: "pending" as const,
    extras_total: 0,
    discount_amount: 0,
    base_price: input.base_price ?? 0,
    total_price: input.total_price ?? input.base_price ?? 0,
    is_recurring: input.is_recurring ?? false,
    frequency: input.frequency ?? "one_time",
    payment_method: input.payment_method ?? "pending",
    payment_status: "pending",
  };
  const { data, error } = await supabase
    .from("bookings")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data as Booking;
}

export async function listMyBookings(clientId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("client_id", clientId)
    .order("scheduled_date", { ascending: false })
    .order("scheduled_time", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export function subscribeToMyBookings(
  clientId: string,
  onChange: (booking: Booking, event: "INSERT" | "UPDATE" | "DELETE") => void,
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`bookings-${clientId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookings",
        filter: `client_id=eq.${clientId}`,
      },
      (payload) => {
        const row = (payload.new ?? payload.old) as Booking | undefined;
        if (!row) return;
        onChange(row, payload.eventType as any);
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
