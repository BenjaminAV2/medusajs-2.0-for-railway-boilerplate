import { MedusaService } from "@medusajs/framework/utils"
import OrderStatus from "./models/order-status"

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

class OrderStatusModuleService extends MedusaService({
  OrderStatus,
}) {
  /**
   * Get all available order statuses with their labels
   */
  getAvailableStatuses() {
    return [
      { value: "pending_payment", label: "En attente de paiement", emoji: "⏳" },
      { value: "paid_awaiting_bat", label: "Payée - Attente BAT", emoji: "✅" },
      { value: "in_production", label: "En fabrication", emoji: "🏭" },
      { value: "production_complete", label: "Fabrication terminée", emoji: "✓" },
      { value: "preparing_shipment", label: "Préparation expédition", emoji: "📦" },
      { value: "in_delivery", label: "En livraison", emoji: "🚚" },
      { value: "delivered", label: "Livrée", emoji: "✓" },
      { value: "cancelled", label: "Annulée", emoji: "❌" },
      { value: "refund_full", label: "Remboursement complet", emoji: "💰" },
      { value: "refund_partial", label: "Remboursement partiel", emoji: "💸" },
    ]
  }

  /**
   * Get all available payment statuses with their labels
   */
  getAvailablePaymentStatuses() {
    return [
      { value: "pending", label: "En attente" },
      { value: "paid", label: "Payé" },
      { value: "failed", label: "Échoué" },
      { value: "refunded", label: "Remboursé" },
    ]
  }

  /**
   * Get order status by order ID
   */
  async getByOrderId(orderId: string) {
    const [status] = await this.listOrderStatus({ order_id: orderId })
    return status || null
  }

  /**
   * Create or update order status for an order
   */
  async upsertOrderStatus(
    orderId: string,
    data: {
      status?: OrderStatusType
      payment_status?: PaymentStatusType
      bat_approved?: boolean
      bat_file_url?: string
      shipping_carrier?: string
      tracking_number?: string
      notes?: string
      metadata?: Record<string, unknown>
    }
  ) {
    const existing = await this.getByOrderId(orderId)

    const now = new Date()
    const updateData: Record<string, unknown> = {
      ...data,
    }

    // Auto-set timestamps based on status changes
    if (data.status === "in_production" && (!existing || existing.status !== "in_production")) {
      updateData.production_started_at = now
    }

    if (data.status === "production_complete" && (!existing || existing.status !== "production_complete")) {
      updateData.production_completed_at = now
    }

    if (data.status === "in_delivery" && (!existing || existing.status !== "in_delivery")) {
      updateData.shipped_at = now
    }

    if (data.status === "delivered" && (!existing || existing.status !== "delivered")) {
      updateData.delivered_at = now
    }

    if (data.bat_approved && (!existing || !existing.bat_approved)) {
      updateData.bat_approved_at = now
    }

    if (existing) {
      return this.updateOrderStatus({ id: existing.id }, updateData)
    } else {
      return this.createOrderStatus({
        order_id: orderId,
        ...updateData,
      } as any)
    }
  }

  /**
   * Update order status
   */
  async updateStatus(orderId: string, newStatus: OrderStatusType) {
    return this.upsertOrderStatus(orderId, { status: newStatus })
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatusType) {
    return this.upsertOrderStatus(orderId, { payment_status: paymentStatus })
  }

  /**
   * Approve BAT for an order
   */
  async approveBat(orderId: string, batFileUrl?: string) {
    return this.upsertOrderStatus(orderId, {
      bat_approved: true,
      bat_file_url: batFileUrl,
      status: "in_production",
    })
  }

  /**
   * Add tracking information
   */
  async addTracking(orderId: string, carrier: string, trackingNumber: string) {
    return this.upsertOrderStatus(orderId, {
      shipping_carrier: carrier,
      tracking_number: trackingNumber,
      status: "in_delivery",
    })
  }
}

export default OrderStatusModuleService
