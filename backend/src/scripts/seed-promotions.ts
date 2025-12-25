/**
 * Seed script for promotions in Medusa v2
 * Run with: npx medusa exec ./src/scripts/seed-promotions.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

interface PromotionConfig {
  code: string
  type: "standard" | "buyget"
  is_automatic: boolean
  application_method: {
    type: "percentage" | "fixed"
    target_type: "items" | "shipping_methods" | "order"
    allocation?: "each" | "across"
    value: number
    currency_code?: string
    max_quantity?: number | null
  }
}

const TEST_PROMOTIONS: PromotionConfig[] = [
  // TEST100 - 100% discount for testing (allows free orders)
  {
    code: "TEST100",
    type: "standard",
    is_automatic: false,
    application_method: {
      type: "percentage",
      target_type: "order",
      allocation: "across",
      value: 100,
    },
  },
  // WELCOME10 - 10% discount for new customers
  {
    code: "WELCOME10",
    type: "standard",
    is_automatic: false,
    application_method: {
      type: "percentage",
      target_type: "items",
      allocation: "across",
      value: 10,
    },
  },
  // FREESHIP - Free shipping
  {
    code: "FREESHIP",
    type: "standard",
    is_automatic: false,
    application_method: {
      type: "percentage",
      target_type: "shipping_methods",
      allocation: "across",
      value: 100,
    },
  },
  // SAVE5 - Fixed 5€ discount
  {
    code: "SAVE5",
    type: "standard",
    is_automatic: false,
    application_method: {
      type: "fixed",
      target_type: "order",
      allocation: "across",
      value: 5,
      currency_code: "eur",
    },
  },
]

export default async function seedPromotions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const promotionModuleService = container.resolve(Modules.PROMOTION)

  logger.info("Seeding test promotions...")

  for (const config of TEST_PROMOTIONS) {
    try {
      // Check if promotion already exists
      const existingPromotions = await promotionModuleService.listPromotions({
        code: config.code,
      })

      if (existingPromotions.length > 0) {
        logger.info(`Promotion ${config.code} already exists, skipping...`)
        continue
      }

      // Create the promotion
      const promotion = await promotionModuleService.createPromotions({
        code: config.code,
        type: config.type,
        is_automatic: config.is_automatic,
        application_method: config.application_method,
      })

      logger.info(`Created promotion: ${config.code} (ID: ${promotion.id})`)
    } catch (error) {
      logger.error(`Error creating promotion ${config.code}:`, error)
    }
  }

  // List all promotions
  const allPromotions = await promotionModuleService.listPromotions()
  logger.info(`\nTotal promotions: ${allPromotions.length}`)
  for (const promo of allPromotions) {
    logger.info(`  - ${promo.code} (${promo.type}, ${promo.is_automatic ? 'automatic' : 'manual'})`)
  }

  logger.info("\nFinished seeding promotions!")
  logger.info("\nTest promotion codes:")
  logger.info("  TEST100   - 100% discount (for testing free orders)")
  logger.info("  WELCOME10 - 10% discount on items")
  logger.info("  FREESHIP  - Free shipping")
  logger.info("  SAVE5     - 5€ off")
}
