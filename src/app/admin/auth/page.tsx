import type { Metadata } from "next"
import { AdminAuthForm } from "./admin-auth-form"

export const metadata: Metadata = {
  title: "Admin access",
}

export default function AdminAuthPage() {
  return <AdminAuthForm />
}
