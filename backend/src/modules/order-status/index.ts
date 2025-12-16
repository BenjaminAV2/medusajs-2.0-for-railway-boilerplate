import OrderStatusModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const ORDER_STATUS_MODULE = "orderStatusModuleService"

export default Module(ORDER_STATUS_MODULE, {
  service: OrderStatusModuleService,
})
