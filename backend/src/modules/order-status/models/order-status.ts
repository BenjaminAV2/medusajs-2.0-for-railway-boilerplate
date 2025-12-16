import { model } from "@medusajs/framework/utils"

/**
 * Custom Order Status model for sticker production workflow
 * Tracks order through: payment -> BAT approval -> production -> shipping -> delivery
 */
const OrderStatus = model.define("order_status", {
  id: model.id().primaryKey(),

  // Reference to Medusa order
  order_id: model.text().index("IDX_ORDER_STATUS_ORDER_ID"),

  // Main order status in the production workflow
  status: model.enum([
    "pending_payment",      // En attente de paiement
    "paid_awaiting_bat",    // Payee - Attente BAT (Bon a Tirer)
    "in_production",        // En fabrication
    "production_complete",  // Fabrication terminee
    "preparing_shipment",   // Preparation expedition
    "in_delivery",          // En livraison
    "delivered",            // Livree
    "cancelled",            // Annulee
    "refund_full",          // Remboursement complet
    "refund_partial",       // Remboursement partiel
  ]).default("pending_payment"),

  // Payment status
  payment_status: model.enum([
    "pending",   // En attente
    "paid",      // Paye
    "failed",    // Echoue
    "refunded",  // Rembourse
  ]).default("pending"),

  // BAT (Bon a Tirer / Proof) approval tracking
  bat_approved: model.boolean().default(false),
  bat_approved_at: model.dateTime().nullable(),
  bat_file_url: model.text().nullable(),

  // Production tracking
  production_started_at: model.dateTime().nullable(),
  production_completed_at: model.dateTime().nullable(),

  // Shipping tracking
  shipping_carrier: model.text().nullable(),
  tracking_number: model.text().nullable(),
  shipped_at: model.dateTime().nullable(),
  delivered_at: model.dateTime().nullable(),

  // Notes and metadata
  notes: model.text().nullable(),
  metadata: model.json().nullable(),

  // Timestamps
  created_at: model.dateTime(),
  updated_at: model.dateTime(),
})

export default OrderStatus
