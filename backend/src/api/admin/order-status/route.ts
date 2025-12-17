import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import OrderStatusModuleService from "../../../modules/order-status/service"
import { ORDER_STATUS_MODULE } from "../../../modules/order-status"

/**
 * GET /admin/order-status
 * Returns available order statuses and payment statuses
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const orderStatusService: OrderStatusModuleService = req.scope.resolve(
    ORDER_STATUS_MODULE
  )

  res.json({
    order_statuses: orderStatusService.getAvailableStatuses(),
    payment_statuses: orderStatusService.getAvailablePaymentStatuses(),
  })
}

/**
 * POST /admin/order-status
 * List all order statuses with filtering
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const orderStatusService: OrderStatusModuleService = req.scope.resolve(
    ORDER_STATUS_MODULE
  )

  const { filters = {}, limit = 50, offset = 0 } = req.body as {
    filters?: Record<string, unknown>
    limit?: number
    offset?: number
  }

  const [statuses, count] = await orderStatusService.listAndCountOrderStatus(
    filters,
    {
      skip: offset,
      take: limit,
      order: { created_at: "DESC" },
    }
  )

  res.json({
    order_statuses: statuses,
    count,
    limit,
    offset,
  })
}
