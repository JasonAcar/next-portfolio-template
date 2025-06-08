"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Technology } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { Error } from "@/lib/types" // Declare the Error type

interface TechnologyFormProps {
  technology: Technology | null
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

export function TechnologyForm({ technology, userId, onSuccess, onCancel }: TechnologyFormProps) {
  const [formData, setFormData] = useState({
    name: technology?.name || "",
    category: technology?.category || "",
    proficiency: technology?.proficiency || 3,
    icon_url: technology?.icon_url || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null) // Declare the error state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        user_id: userId,
      }

      let responseError: Error | null = null

      if (technology) {
        const { error } = await supabase.from("technologies").update(data).eq("id", technology.id)
        responseError = error
      } else {
        const { error } = await supabase.from("technologies").insert([data])
        responseError = error
      }

      if (responseError) throw responseError
      onSuccess()
    } catch (error) {
      console.error("Error saving technology:", error)
      alert("Error saving technology")
      setError(error as Error) // Set the error state
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{technology ? "Edit Technology" : "Add Technology"}</CardTitle>
        <CardDescription>Add or update technology skills</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="language">Language</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proficiency">Proficiency: {formData.proficiency}/5</Label>
            <Slider
              id="proficiency"
              min={1}
              max={5}
              step={1}
              value={[formData.proficiency]}
              onValueChange={(value) => setFormData({ ...formData, proficiency: value[0] })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon_url">Icon URL</Label>
            <Input
              id="icon_url"
              type="url"
              value={formData.icon_url}
              onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
              placeholder="URL to technology icon/logo"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Technology"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
