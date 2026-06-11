const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiClient {
  private guestBootstrap: Promise<void> | null = null;

  constructor(
    private baseUrl = API_URL,
    private getToken: () => string | null = () =>
      typeof window !== "undefined" ? localStorage.getItem("ankommen_token") : null,
  ) {}

  private async ensureGuestSession(): Promise<void> {
    if (typeof window === "undefined" || this.getToken()) return;
    if (!this.guestBootstrap) {
      const deviceId = localStorage.getItem("ankommen_device_id") ?? undefined;
      this.guestBootstrap = this.createGuest(deviceId)
        .then(() => undefined)
        .catch((err) => {
          this.guestBootstrap = null;
          throw err;
        });
    }
    await this.guestBootstrap;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!path.startsWith("/auth/")) {
      await this.ensureGuestSession();
    }

    const token = this.getToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error((err as { message?: string }).message ?? "API error");
    }
    return res.json() as Promise<T>;
  }

  setToken(token: string) {
    if (typeof window !== "undefined") localStorage.setItem("ankommen_token", token);
  }

  async createGuest(deviceId?: string) {
    const res = await fetch(`${this.baseUrl}/auth/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error((err as { message?: string }).message ?? "Guest auth failed");
    }
    const data = (await res.json()) as {
      accessToken: string;
      deviceId: string;
      user: { id: string; name: string };
    };
    this.setToken(data.accessToken);
    if (typeof window !== "undefined") localStorage.setItem("ankommen_device_id", data.deviceId);
    return data;
  }

  async getMe() {
    return this.request("/me");
  }

  async getEntitlements() {
    return this.request("/me/entitlements");
  }

  async submitOnboarding(data: Record<string, unknown>) {
    return this.request<{ profile: unknown; checklist: unknown[] }>("/me/onboarding", { method: "POST", body: JSON.stringify(data) });
  }

  async getConversations() {
    return this.request("/conversations");
  }

  async createConversation(data?: { agentType?: string; language?: string; title?: string }) {
    return this.request<{ id: string }>("/conversations", { method: "POST", body: JSON.stringify(data ?? {}) });
  }

  async sendMessage(conversationId: string, content: string) {
    return this.request<{ message: { content: string; citations?: unknown[] }; disclaimer?: string; nextSteps?: string[] }>(
      `/conversations/${conversationId}/messages`,
      { method: "POST", body: JSON.stringify({ content }) },
    );
  }

  async getOffices(params?: { city?: string; category?: string }) {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/offices${q ? `?${q}` : ""}`);
  }

  async getNgos(params?: { city?: string; category?: string }) {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/ngos${q ? `?${q}` : ""}`);
  }

  async submitBenefitCheck(answers: Record<string, unknown>) {
    return this.request<{ results: { answer?: string }; disclaimer?: string }>("/benefit-checks", { method: "POST", body: JSON.stringify(answers) });
  }

  async uploadDocument(file: File) {
    const token = this.getToken();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${this.baseUrl}/documents/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  }

  async translate(text: string, from: string, to: string) {
    const conv = await this.createConversation({ agentType: "TRANSLATION", language: to });
    return this.sendMessage((conv as { id: string }).id, `Translate from ${from} to ${to}:\n${text}`);
  }

  async createCheckout(planCode: string) {
    return this.request<{ url: string }>("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ planCode }),
    });
  }

  async getIdentityStatus() {
    return this.request<{
      identityTier: string;
      eidVerified: boolean;
      wallet: { address: string; chain: string; chainId: number; linkedAt: string } | null;
      escrowedBcc: number;
      bccBalance: number | null;
      treasuryAddress: string | null;
    }>("/identity/status");
  }

  async identityWalletChallenge(address: string, chainId?: number) {
    return this.request<{ message: string; nonce: string }>("/identity/wallet/challenge", {
      method: "POST",
      body: JSON.stringify({ address, chainId }),
    });
  }

  async identityWalletVerify(address: string, signature: string, nonce: string) {
    return this.request<{ linked: boolean; address: string; claimTxHash: string | null }>(
      "/identity/wallet/verify",
      {
        method: "POST",
        body: JSON.stringify({ address, signature, nonce }),
      },
    );
  }

  async payWithBcc(planCode: string, txHash: string) {
    return this.request<{ subscription: unknown; txHash: string }>("/billing/pay-with-bcc", {
      method: "POST",
      body: JSON.stringify({ planCode, txHash }),
    });
  }

  async exportData() {
    return this.request("/me/export", { method: "POST" });
  }

  async deleteAccount() {
    return this.request("/me/account", { method: "DELETE" });
  }
}

export const api = new ApiClient();
