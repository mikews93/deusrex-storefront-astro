/**
 * Server-side fetch helpers for Astro SSR pages.
 * Calls the NestJS backend public API endpoints.
 */

const API_URL = import.meta.env.BACKEND_API_URL || 'http://localhost:3000';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API ${path} returned ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchProducts(orgSlug: string) {
  try {
    return await apiFetch<any[]>(`/public/store/${orgSlug}/products`);
  } catch {
    return [];
  }
}

export async function fetchProduct(orgSlug: string, productId: string) {
  try {
    return await apiFetch<any>(`/public/store/${orgSlug}/products/${productId}`);
  } catch {
    return null;
  }
}

export async function fetchServices(orgSlug: string) {
  try {
    return await apiFetch<any[]>(`/public/booking/${orgSlug}/services`);
  } catch {
    return [];
  }
}

export async function fetchService(orgSlug: string, serviceId: string) {
  try {
    const services = await fetchServices(orgSlug);
    return services.find((s: any) => s.id === serviceId) || null;
  } catch {
    return null;
  }
}

export async function fetchCourses(orgSlug: string) {
  try {
    return await apiFetch<any[]>(`/public/store/${orgSlug}/courses`);
  } catch {
    return [];
  }
}

export async function fetchCourse(orgSlug: string, courseId: string) {
  try {
    return await apiFetch<any>(`/public/store/${orgSlug}/courses/${courseId}`);
  } catch {
    return null;
  }
}
