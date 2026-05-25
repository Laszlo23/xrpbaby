export type SiweVerifyResponse = {
  ok?: boolean;
  error?: string;
  address?: string;
  userId?: number | null;
  sessionEstablished?: boolean;
  sessionError?: "missing_database" | "missing_session_secret";
};
