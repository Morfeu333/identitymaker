"use client"

import { useEffect, useState } from "react"
import { Mail } from "lucide-react"

import {
  PopoverForm,
  PopoverFormButton,
  PopoverFormSuccess,
} from "@/components/ui/popover-form"

type FormState = "idle" | "loading" | "success"

export function EmailFormExample() {
  const [formState, setFormState] = useState<FormState>("idle")
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")

  function submit() {
    setFormState("loading")
    setTimeout(() => {
      setFormState("success")
    }, 1500)

    setTimeout(() => {
      setOpen(false)
      setFormState("idle")
      setEmail("")
    }, 3300)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex w-full items-center justify-center">
      <PopoverForm
        title="Preencher Formulário"
        open={open}
        setOpen={setOpen}
        width="320px"
        showCloseButton={formState !== "success"}
        showSuccess={formState === "success"}
        openChild={
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!email) return
              submit()
            }}
            className="p-4"
          >
            <div className="mb-4 space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Mail className="text-muted-foreground size-4" />
                </div>
              </div>
              <p className="text-muted-foreground text-xs tracking-tight">
                Digite seu email para expandir o formulário completo
              </p>
            </div>
            <PopoverFormButton
              loading={formState === "loading"}
              text="Continuar"
            />
          </form>
        }
        successChild={
          <PopoverFormSuccess
            title="Email Confirmado!"
            description="Agora você pode preencher o formulário completo."
          />
        }
      />
    </div>
  )
}