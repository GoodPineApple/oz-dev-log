export type User = {
  id: string;
  email: string;
  nickname: string;
  totalCredits: number;
  createdAt: string;
};

export type ApiLog = {
  id: number;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
};

export type Attachment = {
  id: number;
  logId: number;
  fileName: string;
  fileUrl: string;
  fileType: "image" | "file";
  fileSize: number;
  createdAt: string;
};

export type CreditTransaction = {
  id: number;
  userId: string;
  logId: number | null;
  amount: number;
  type: "earn" | "spend" | "bonus" | "adjust";
  description: string | null;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};
