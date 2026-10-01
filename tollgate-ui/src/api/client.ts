export interface RateLimitResponse {
  status: number;
  message: string;
  headers: {
    limit: string | null;
    remaining: string | null;
  };
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const IS_MOCK = import.meta.env.VITE_MOCK === "1";

export const apiClient = {
  async sendTestRequest(): Promise<RateLimitResponse> {
    if (IS_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const rand = Math.random();
          resolve({
            status: rand > 0.8 ? 429 : 200,
            message: rand > 0.8 ? "Too Many Requests" : "Request successful",
            headers: {
              limit: "10",
              remaining: rand > 0.8 ? "0" : Math.floor(Math.random() * 9 + 1).toString(),
            }
          });
        }, 300);
      });
    }

    try {
      const cacheBust = `?t=${Date.now()}_${Math.random()}`;
      const response = await fetch(`${BASE_URL}/test${cacheBust}`, { cache: 'no-store' });
      
      // If we receive a 429, it blocked. If we receive a 404 from NGINX at the end of the proxy, it passed!
      const isAllowed = response.status !== 429;
      
      return {
        status: response.status,
        message: isAllowed ? "Request successful (Proxied)" : "Too Many Requests",
        headers: {
          limit: response.headers.get("X-RateLimit-Limit"),
          remaining: response.headers.get("X-RateLimit-Remaining"),
        }
      };
    } catch (e: any) {
      return {
        status: 500,
        message: "Network Error",
        headers: { limit: null, remaining: null }
      };
    }
  }
};
