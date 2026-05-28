const API_URL = import.meta.env.BACKEND_API_URL || 'http://localhost:3000';
async function apiFetch(path) {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) {
        throw new Error(`API ${path} returned ${res.status}`);
    }
    return res.json();
}
export async function fetchProducts(orgSlug) {
    try {
        return await apiFetch(`/public/store/${orgSlug}/products`);
    }
    catch {
        return [];
    }
}
export async function fetchProduct(orgSlug, productId) {
    try {
        return await apiFetch(`/public/store/${orgSlug}/products/${productId}`);
    }
    catch {
        return null;
    }
}
export async function fetchServices(orgSlug) {
    try {
        return await apiFetch(`/public/booking/${orgSlug}/services`);
    }
    catch {
        return [];
    }
}
export async function fetchService(orgSlug, serviceId) {
    try {
        const services = await fetchServices(orgSlug);
        return services.find((s) => s.id === serviceId) || null;
    }
    catch {
        return null;
    }
}
export async function fetchCourses(orgSlug) {
    try {
        return await apiFetch(`/public/store/${orgSlug}/courses`);
    }
    catch {
        return [];
    }
}
export async function fetchCourse(orgSlug, courseId) {
    try {
        return await apiFetch(`/public/store/${orgSlug}/courses/${courseId}`);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=api.js.map