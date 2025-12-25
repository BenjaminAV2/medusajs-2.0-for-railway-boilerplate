import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Seed shipping options for French carriers
 * Run with: npx medusa exec ./src/scripts/seed-shipping.ts
 */
export default async function seedShippingOptions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  logger.info("Seeding French shipping carriers...")

  // Get region
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
    filters: { name: "Europe" },
  })

  if (!regions.length) {
    logger.error("Europe region not found. Please run the main seed first.")
    return
  }

  const region = regions[0]
  logger.info(`Found region: ${region.name} (${region.id})`)

  // Get shipping profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })

  if (!shippingProfiles.length) {
    logger.error("Default shipping profile not found. Please run the main seed first.")
    return
  }

  const shippingProfile = shippingProfiles[0]
  logger.info(`Found shipping profile: ${shippingProfile.name} (${shippingProfile.id})`)

  // Get fulfillment sets to find the service zone
  const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets(
    {},
    { relations: ["service_zones"] }
  )

  if (!fulfillmentSets.length || !fulfillmentSets[0].service_zones?.length) {
    logger.error("No fulfillment set with service zones found. Please run the main seed first.")
    return
  }

  const serviceZone = fulfillmentSets[0].service_zones[0]
  logger.info(`Found service zone: ${serviceZone.name} (${serviceZone.id})`)

  // Check existing shipping options to avoid duplicates
  const existingOptions = await fulfillmentModuleService.listShippingOptions({})
  const existingNames = existingOptions.map((opt: any) => opt.name)

  const frenchCarriers = [
    {
      name: "Colissimo",
      price: 595, // 5.95 EUR in cents
      label: "Colissimo",
      description: "Livraison en 2-3 jours ouvrés",
      code: "colissimo",
    },
    {
      name: "Colissimo Signature",
      price: 795, // 7.95 EUR
      label: "Colissimo Signature",
      description: "Livraison avec signature en 2-3 jours",
      code: "colissimo-signature",
    },
    {
      name: "Chronopost",
      price: 1295, // 12.95 EUR
      label: "Chronopost",
      description: "Livraison express en 24h",
      code: "chronopost",
    },
    {
      name: "Mondial Relay",
      price: 495, // 4.95 EUR
      label: "Mondial Relay",
      description: "Livraison en point relais sous 3-5 jours",
      code: "mondial-relay",
      metadata: {
        isRelayService: true,
        relayProvider: "mondial-relay",
      },
    },
    {
      name: "Relais Colis",
      price: 445, // 4.45 EUR
      label: "Relais Colis",
      description: "Livraison en point relais sous 3-5 jours",
      code: "relais-colis",
      metadata: {
        isRelayService: true,
        relayProvider: "relais-colis",
      },
    },
    {
      name: "Lettre Suivie",
      price: 295, // 2.95 EUR
      label: "Lettre Suivie",
      description: "Envoi en lettre suivie sous 2-4 jours",
      code: "lettre-suivie",
    },
  ]

  const carriersToCreate = frenchCarriers.filter(
    (carrier) => !existingNames.includes(carrier.name)
  )

  if (carriersToCreate.length === 0) {
    logger.info("All French carriers already exist. Skipping creation.")
    return
  }

  logger.info(`Creating ${carriersToCreate.length} new shipping options...`)

  const shippingOptionsInput = carriersToCreate.map((carrier) => ({
    name: carrier.name,
    price_type: "flat" as const,
    provider_id: "manual_manual",
    service_zone_id: serviceZone.id,
    shipping_profile_id: shippingProfile.id,
    type: {
      label: carrier.label,
      description: carrier.description,
      code: carrier.code,
    },
    prices: [
      {
        currency_code: "eur",
        amount: carrier.price,
      },
      {
        region_id: region.id,
        amount: carrier.price,
      },
    ],
    rules: [
      {
        attribute: "enabled_in_store",
        value: "true",
        operator: "eq" as const,
      },
      {
        attribute: "is_return",
        value: "false",
        operator: "eq" as const,
      },
    ],
    data: carrier.metadata || {},
  }))

  await createShippingOptionsWorkflow(container).run({
    input: shippingOptionsInput,
  })

  logger.info(`Successfully created ${carriersToCreate.length} French shipping carriers:`)
  carriersToCreate.forEach((carrier) => {
    logger.info(`  - ${carrier.name}: ${(carrier.price / 100).toFixed(2)} EUR`)
  })

  logger.info("Finished seeding French shipping carriers.")
}
