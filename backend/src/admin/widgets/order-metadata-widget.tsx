import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"

interface ShippingMethod {
  id: string
  title: string
  price_cents: number
  price_eur: string
  estimated_delivery: string
}

interface PricingEur {
  subtotal_ttc: string
  subtotal_ht: string
  tva: string
  tva_rate: string
  shipping: string
  discount: string
  total: string
}

interface AppliedPromotion {
  id: string
  code?: string
  type?: string
  value?: number
  target?: string
}

interface ItemSummary {
  title: string
  quantity: number
  support: string
  shape: string
  dimensions: string
  unit_price_eur: string
  total_eur: string
}

interface OrderMetadata {
  source?: string
  version?: string
  created_at?: string
  shipping_method?: ShippingMethod
  pricing_eur?: PricingEur
  pricing_cents?: Record<string, number>
  applied_promotions?: AppliedPromotion[]
  items_summary?: ItemSummary[]
}

const OrderMetadataWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const metadata = data.metadata as OrderMetadata | null

  if (!metadata || metadata.source !== 'storefront') {
    return null
  }

  const { shipping_method, pricing_eur, applied_promotions, items_summary } = metadata

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Commande Storefront</Heading>
        <Badge color="purple">v{metadata.version || '1.0'}</Badge>
      </div>

      {/* Shipping Method */}
      {shipping_method && (
        <div className="px-6 py-4">
          <Text size="small" weight="plus" className="text-ui-fg-subtle mb-2">
            Livraison
          </Text>
          <div className="bg-ui-bg-subtle rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <Text weight="plus">{shipping_method.title}</Text>
              <Text weight="plus">{shipping_method.price_eur} EUR</Text>
            </div>
            <Text size="small" className="text-ui-fg-muted">
              {shipping_method.estimated_delivery}
            </Text>
          </div>
        </div>
      )}

      {/* Pricing Breakdown */}
      {pricing_eur && (
        <div className="px-6 py-4">
          <Text size="small" weight="plus" className="text-ui-fg-subtle mb-2">
            Tarification
          </Text>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text size="small">Sous-total HT</Text>
              <Text size="small">{pricing_eur.subtotal_ht} EUR</Text>
            </div>
            <div className="flex justify-between">
              <Text size="small">TVA ({pricing_eur.tva_rate})</Text>
              <Text size="small">{pricing_eur.tva} EUR</Text>
            </div>
            <div className="flex justify-between">
              <Text size="small">Sous-total TTC</Text>
              <Text size="small">{pricing_eur.subtotal_ttc} EUR</Text>
            </div>
            <div className="flex justify-between">
              <Text size="small">Livraison</Text>
              <Text size="small">{pricing_eur.shipping} EUR</Text>
            </div>
            {parseFloat(pricing_eur.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <Text size="small">Remise</Text>
                <Text size="small">-{pricing_eur.discount} EUR</Text>
              </div>
            )}
            <div className="border-t border-ui-border-base pt-2 mt-2">
              <div className="flex justify-between">
                <Text weight="plus">Total</Text>
                <Text weight="plus">{pricing_eur.total} EUR</Text>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applied Promotions */}
      {applied_promotions && applied_promotions.length > 0 && (
        <div className="px-6 py-4">
          <Text size="small" weight="plus" className="text-ui-fg-subtle mb-2">
            Codes Promo
          </Text>
          <div className="flex flex-wrap gap-2">
            {applied_promotions.map((promo, index) => (
              <Badge key={index} color="green">
                {promo.code || promo.id}
                {promo.type === 'percentage' && ` (-${promo.value}%)`}
                {promo.type === 'fixed' && ` (-${(promo.value || 0) / 100} EUR)`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Items Summary */}
      {items_summary && items_summary.length > 0 && (
        <div className="px-6 py-4">
          <Text size="small" weight="plus" className="text-ui-fg-subtle mb-2">
            Articles ({items_summary.length})
          </Text>
          <div className="space-y-3">
            {items_summary.map((item, index) => (
              <div key={index} className="bg-ui-bg-subtle rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <Text weight="plus" className="flex-1">{item.title}</Text>
                  <Text size="small" className="ml-2">x{item.quantity}</Text>
                </div>
                <div className="grid grid-cols-2 gap-1 text-ui-fg-muted">
                  {item.support && (
                    <Text size="xsmall">Support: {item.support}</Text>
                  )}
                  {item.shape && (
                    <Text size="xsmall">Forme: {item.shape}</Text>
                  )}
                  {item.dimensions && (
                    <Text size="xsmall">Dimensions: {item.dimensions}</Text>
                  )}
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-ui-border-base">
                  <Text size="small">{item.unit_price_eur} EUR/unit</Text>
                  <Text size="small" weight="plus">{item.total_eur} EUR</Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.before",
})

export default OrderMetadataWidget
