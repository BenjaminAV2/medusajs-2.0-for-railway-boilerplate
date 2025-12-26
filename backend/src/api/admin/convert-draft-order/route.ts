import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * Custom endpoint to convert a draft order to a regular order
 * without inventory checks (for custom/unlimited stock products)
 *
 * POST /admin/convert-draft-order
 * Body: { order_id: string }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { order_id } = req.body as { order_id: string }

  if (!order_id) {
    res.status(400).json({
      success: false,
      error: "order_id is required",
    })
    return
  }

  try {
    // Get the order module service
    const orderModuleService = req.scope.resolve(Modules.ORDER)

    // Get the draft order
    const draftOrder = await orderModuleService.retrieveOrder(order_id, {
      relations: [
        "items",
        "items.tax_lines",
        "items.adjustments",
        "shipping_methods",
        "shipping_methods.tax_lines",
        "shipping_methods.adjustments",
        "shipping_address",
        "billing_address",
      ],
    })

    if (!draftOrder) {
      res.status(404).json({
        success: false,
        error: "Draft order not found",
      })
      return
    }

    // Check if it's already a regular order (not a draft)
    if (draftOrder.status !== "draft") {
      res.status(400).json({
        success: false,
        error: "This order is not a draft order",
        current_status: draftOrder.status,
      })
      return
    }

    // Update the order status to convert it from draft
    // In Medusa V2, we change the status to mark it as a real order
    const updatedOrder = await orderModuleService.updateOrders(order_id, {
      status: "pending",
      metadata: {
        ...draftOrder.metadata,
        converted_at: new Date().toISOString(),
        converted_from_draft: true,
      },
    })

    res.status(200).json({
      success: true,
      order: updatedOrder,
      message: "Draft order successfully converted to order",
    })
  } catch (error: any) {
    console.error("[Convert Draft Order] Error:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Failed to convert draft order",
    })
  }
}
