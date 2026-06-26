// Catalog reads: services, service_categories, typologies, extras, service_pricing_rules.
// Mirrors the existing FlashClean Core schema; no new tables are created.

import { supabase } from "@/src/lib/supabase";

export type Service = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  pricing_model: string | null;
  sort_order: number | null;
  is_active: boolean;
};

export type ServiceCategory = {
  id: string;
  service_id: string;
  slug: string;
  name: string;
  description: string | null;
  ideal_for: string | null;
  badge: string | null;
  included: string[] | null;
  not_included: string[] | null;
  sort_order: number | null;
  is_active: boolean;
};

export type Typology = {
  id: string;
  service_id: string;
  category_id: string | null;
  label: string;
  price: number;
  sort_order: number | null;
  is_active: boolean;
};

export type Extra = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  pricing_model: string | null;
  base_price: number | null;
  unit_label: string | null;
  tiers: any;
  is_active: boolean;
  sort_order: number | null;
};

export async function listServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id,slug,name,description,image_url,icon,pricing_model,sort_order,is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function listCategories(serviceId: string): Promise<ServiceCategory[]> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("service_id", serviceId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ServiceCategory[];
}

export async function listTypologies(categoryId: string): Promise<Typology[]> {
  const { data, error } = await supabase
    .from("typologies")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Typology[];
}

export async function listExtras(): Promise<Extra[]> {
  const { data, error } = await supabase
    .from("extras")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Extra[];
}
