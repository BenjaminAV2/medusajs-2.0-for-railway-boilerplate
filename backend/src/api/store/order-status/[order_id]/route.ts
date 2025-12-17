import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import OrderStatusModuleService from "../../../../modules/order-status/service"
import { ORDER_STATUS_MODULE } from "../../../../modules/order-status"

/**
 * GET /store/order-status/:order_id
 * Get order status for a specific order (customer view)
 * Only exposes relevant fields for customers
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

  // Return only customer-relevant fields
  res.json({
    order_status: {
      order_id: status.order_id,
      status: status.status,
      payment_status: status.payment_status,
      bat_approved: status.bat_approved,
      shipping_carrier: status.shipping_carrier,
      tracking_number: status.tracking_number,
      shipped_at: status.shipped_at,
      delivered_at: status.delivered_at,
      created_at: status.created_at,
      updated_at: status.updated_at,
    },
  })
}
