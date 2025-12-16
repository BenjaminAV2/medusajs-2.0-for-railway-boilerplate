import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    // Configure body size limit for all admin upload routes
    {
      method: ["POST"],
      matcher: "/admin/uploads",
      bodyParser: { sizeLimit: "20mb" },
    },
    {
      method: ["POST"],
      matcher: "/admin/uploads/*",
      bodyParser: { sizeLimit: "20mb" },
    },
    {
      method: ["POST"],
      matcher: "/admin/uploads/**",
      bodyParser: { sizeLimit: "20mb" },
    },
    // Presigned URLs
    {
      method: ["POST"],
      matcher: "/admin/uploads/presigned-urls",
      bodyParser: { sizeLimit: "20mb" },
    },
    // Product routes
    {
      method: ["POST"],
      matcher: "/admin/products",
      bodyParser: { sizeLimit: "20mb" },
    },
    {
      method: ["POST"],
      matcher: "/admin/products/*",
      bodyParser: { sizeLimit: "20mb" },
    },
    {
      method: ["POST"],
      matcher: "/admin/products/**",
      bodyParser: { sizeLimit: "20mb" },
    },
  ],
})
