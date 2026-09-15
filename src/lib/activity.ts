import { db } from "@/db";
import { activityLog } from "@/db/schema";

export async function logActivity(params: {
  siteId: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
}) {
  await db.insert(activityLog).values({
    siteId: params.siteId,
    userId: params.userId,
    action: params.action,
    entity: params.entity,
    entityId: params.entityId,
  });
}
