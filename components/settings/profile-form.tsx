"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Camera } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export function ProfileForm() {
  const [name, setName] = useState("Mahesh KN")
  const [email, setEmail] = useState("mahesh@email.com")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
                  MK
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>

          <Separator />

          {/* Fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="full-name" className="text-sm">
                Full Name
              </Label>
              <Input
                id="full-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-addr" className="text-sm">
                Email
              </Label>
              <Input
                id="email-addr"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <motion.div animate={saved ? { scale: [1, 1.04, 1] } : {}}>
              <Button onClick={handleSave} size="sm" className="h-8">
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
