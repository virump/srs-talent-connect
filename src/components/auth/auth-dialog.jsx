'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { toast } from "sonner"

export function AuthDialog({ isOpen, onClose, mode = 'login', onModeChange }) {
  const handleSuccess = () => {
    toast.success(mode === 'login' ? 'Welcome back!' : 'Account created successfully!')
    onClose?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose?.()
      }
    }}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-lg mx-auto">
        <DialogHeader className="space-y-3 text-center sm:text-left">
          <DialogTitle className="text-2xl">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {mode === 'login' 
              ? 'Sign in to your account to continue'
              : 'Create a new account to get started'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          {mode === 'login' ? (
            <LoginForm 
              onSuccess={handleSuccess} 
              onRegisterClick={() => onModeChange?.('register')}
            />
          ) : (
            <RegisterForm 
              onSuccess={handleSuccess}
              onLoginClick={() => onModeChange?.('login')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
