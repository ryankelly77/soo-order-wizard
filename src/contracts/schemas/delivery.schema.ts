import { z } from 'zod';

export const deliveryStatusSchema = z.enum([
  'pending',
  'assigned',
  'picked_up',
  'in_transit',
  'arriving',
  'delivered',
  'failed',
]);

export const geoLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  updatedAt: z.coerce.date(),
});

export const driverInfoSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  phone: z.string().min(10),
  photoUrl: z.string().url().optional(),
  vehicleInfo: z.string().optional(),
});

export const deliveryStatusUpdateSchema = z.object({
  status: deliveryStatusSchema,
  timestamp: z.coerce.date(),
  note: z.string().optional(),
  location: geoLocationSchema.optional(),
});

export const shipdayWebhookSchema = z.object({
  orderId: z.string(),
  status: z.string(),
  timestamp: z.string(),
  driverInfo: z
    .object({
      name: z.string(),
      phone: z.string(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
    .optional(),
});

export type DeliveryStatusInput = z.infer<typeof deliveryStatusSchema>;
export type ShipdayWebhookInput = z.infer<typeof shipdayWebhookSchema>;
