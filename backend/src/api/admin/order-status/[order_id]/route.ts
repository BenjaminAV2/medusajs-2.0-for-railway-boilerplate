import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import OrderStatusModuleService from "../../../../modules/order-status/service"
import { ORDER_STATUS_MODULE } from "../../../../modules/order-status"

type OrderStatusType =
  | "pending_payment"
  | "paid_awaiting_bat"
  | "in_production"
  | "production_complete"
  | "preparing_shipment"
  | "in_delivery"
  | "delivered"
  | "cancelled"
  | "refund_full"
  | "refund_partial"

type PaymentStatusType = "pending" | "paid" | "failed" | "refunded"

interface UpdateOrderStatusBody {
  status?: OrderStatusType
  payment_status?: PaymentStatusType
  bat_approved?: boolean
  bat_file_url?: string
  shipping_carrier?: string
  tracking_number?: string
  notes?: string
  metadata?: Record<string, unknown>
}

/**
 * GET /admin/order-status/:order_id
 * Get order status for a specific order
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const orderStatusService: OrderStatusModuleService = req.scope.resolve(
    ORDER_STATUS_MODULE
  )

  const { order_id } = req.params

  const status = await orderStatusService.getByOrderId(order_id)

  if (!status) {
    res.status(404).json({
      message: `No status found for order ${order_id}`,
    })
    return
  }

  res.json({
    order_status: status,
  })
}

/**
 * POST /admin/order-status/:order_id
 * Create or update order status
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const orderStatusService: OrderStatusModuleService = req.scope.resolve(
    ORDER_STATUS_MODULE
  )

  const { order_id } = req.params
  const body = req.body as UpdateOrderStatusBody

  const status = await orderStatusService.upsertOrderStatus(order_id, body)

  res.json({
    order_status: status,
  })
}

/**
 * DELETE /admin/order-status/:order_id
 * Delete order status record
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const orderStatusService: OrderStatusModuleService = req.scope.resolve(
    ORDER_STATUS_MODULE
  )

  const { order_id } = req.params

  const status = await orderStatusService.getByOrderId(order_id)

  if (!status) {
    res.status(404).json({
      message: `No status found for order ${order_id}`,
    })
    return
  }

  await orderStatusService.deleteOrderStatus(status.id)

  res.json({
    id: status.id,
    object: "order_status",
    deleted: true,
  })
}
