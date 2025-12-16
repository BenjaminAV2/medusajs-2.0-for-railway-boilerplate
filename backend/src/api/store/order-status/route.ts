import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import OrderStatusModuleService from "../../../modules/order-status/service"
import { ORDER_STATUS_MODULE } from "../../../modules/order-status"

/**
 * GET /store/order-status
 * Returns available order statuses for display in storefront
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
