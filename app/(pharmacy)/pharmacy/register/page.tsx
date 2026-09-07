"use client"

import { type FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function PharmacyRegisterPage() {
  const [name, setName] = useState("")
  const [license, setLicense] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!name || !license || !address || !phone) {
      setError("Please complete all required fields before continuing.")
      return
    }

    router.push("/pharmacy/Dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="rounded-[1.5rem] bg-white p-8 shadow-sm border border-slate-200">
            <CardHeader className="space-y-3 p-0">
              <CardTitle className="text-3xl font-semibold">Register your pharmacy</CardTitle>
              <p className="text-slate-500">
                Add your pharmacy details and create the profile that connects you to customers.
              </p>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Pharmacy name</Label>
                  <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License number</Label>
                  <Input id="license" value={license} onChange={(event) => setLicense(event.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={(event) => setAddress(event.target.value)} required />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={website} onChange={(event) => setWebsite(event.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Short description of your pharmacy"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <CardFooter className="flex flex-col gap-3 p-0">
                <Button type="submit" className="w-full">Create pharmacy</Button>
              </CardFooter>
            </form>
          </div>

          <aside className="rounded-[1.5rem] bg-slate-950 p-8 text-white shadow-sm border border-slate-800">
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Pharmacy setup</p>
                <h2 className="mt-4 text-3xl font-bold">Complete your pharmacy profile</h2>
              </div>
              <div className="space-y-4 text-sm leading-7 text-slate-300">
                <p>
                  Add your pharmacy details once you are signed in with Clerk. This lets your pharmacy appear in your dashboard and inventory tools.
                </p>
                <p>
                  Use the Pharmacy link in the navbar to return to this registration page at any time.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-200">After submission, you will be redirected to the pharmacy dashboard.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
