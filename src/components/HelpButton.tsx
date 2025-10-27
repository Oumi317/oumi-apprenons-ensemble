import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Send, MessageSquare, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const HelpButton = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Message envoyé !",
      description: "Notre équipe vous répondra dans les 24h",
    });
    
    setOpen(false);
    setMessage("");
    setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-primary hover:scale-110 transition-transform z-50"
          size="icon"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Besoin d'aide ?
          </DialogTitle>
          <DialogDescription>
            Notre équipe est là pour vous aider. Choisissez votre méthode de contact préférée.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Contact rapide */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer text-center">
              <Mail className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">Email</p>
              <p className="text-xs text-muted-foreground">support@oumischool.com</p>
            </div>
            <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer text-center">
              <Phone className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">Téléphone</p>
              <p className="text-xs text-muted-foreground">+33 1 23 45 67 89</p>
            </div>
          </div>

          {/* Formulaire de contact */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Votre email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Votre message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre problème ou votre question..."
                rows={4}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Envoyer le message
            </Button>
          </form>

          {/* FAQ rapide */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Questions fréquentes :</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="hover:text-primary cursor-pointer">• Comment réserver une session ?</li>
              <li className="hover:text-primary cursor-pointer">• Comment suivre les progrès ?</li>
              <li className="hover:text-primary cursor-pointer">• Comment annuler un cours ?</li>
              <li className="hover:text-primary cursor-pointer">• Quels sont les modes de paiement ?</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
