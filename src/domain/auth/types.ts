import type { Timestamp, UUID } from "@/domain/common/types";

export type Profile = {
  id: UUID;
  displayName: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
