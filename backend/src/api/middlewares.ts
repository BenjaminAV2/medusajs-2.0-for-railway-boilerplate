import { defineMiddlewares } from "@medusajs/framework/http"
import multer from "multer"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  }
})

export default defineMiddlewares({
  routes: [
    // Configure body size limit for admin uploads
    {
      method: ["POST"],
      matcher: "/admin/uploads",
      bodyParser: { sizeLimit: "20mb" },
    },
    {
      method: ["POST"],
      matcher: "/admin/uploads/**",
      bodyParser: { sizeLimit: "20mb" },
    },
    // Configure for product media uploads
    {
      method: ["POST"],
      matcher: "/admin/products/*/media",
      bodyParser: { sizeLimit: "20mb" },
      middlewares: [upload.array("files")],
    },
  ],
})
