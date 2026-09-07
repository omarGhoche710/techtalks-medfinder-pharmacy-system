"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function PharmacyLoginPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-sky-50 text-slate-900">
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-3 p-8">
            <CardTitle className="text-3xl font-semibold">Pharmacy Login</CardTitle>
            <CardDescription className="text-slate-500">
              Sign in with Clerk to access your pharmacy dashboard and manage inventory.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-700">
                The form below uses Clerk authentication. Continue with Clerk to reach your pharmacy tools.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 p-8 pt-0">
            <Button className="w-full" onClick={() => router.push("/sign-in")}>Sign in with Clerk</Button>
            <Button variant="outline" className="w-full" onClick={() => router.push("/sign-up")}>Create a Clerk account</Button>
            <p className="text-center text-sm text-slate-500">
              After signing in, use the Pharmacy link in the navbar to register your pharmacy.
            </p>
          </CardFooter>
        </Card>
      </div>

      <div className="relative flex-1 hidden items-center justify-center overflow-hidden rounded-[1.5rem] bg-slate-900 text-white lg:flex">
        <div className="absolute inset-0 bg-[url('/auth-bg.jpg')] bg-cover bg-center opacity-90" />
        <div className="absolute inset-0 bg-slate-950/25" />
        <div className="relative z-10 p-10 max-w-lg">
          <p className="text-sm uppercase tracking-[0.32em] text-sky-300">MedFinder Pharmacy</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight tracking-[-0.03em]">
            Manage stock, patients, and inventory with one secure login.
          </h1>
          <p className="mt-6 text-base leading-7 text-slate-200">
            Access your pharmacy dashboard, add medications, and keep your business visible to local customers.
          </p>
          <div className="grid gap-4 mt-10">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-sm text-slate-100">Secure account access powered by Clerk.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-sm text-slate-100">Register your pharmacy details once signed in.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
