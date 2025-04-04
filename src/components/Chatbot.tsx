
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { useTheme } from "@/context/ThemeContext";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    content: "Bonjour ! Je suis l'assistant AI Horizon. Comment puis-je vous aider aujourd'hui ?",
    sender: "bot",
    timestamp: new Date(),
  },
];

const BOT_KNOWLEDGE = [
  { question: "comment fonctionne le programme d'affiliation", answer: "Le programme d'affiliation d'AI Horizon vous permet de gagner des commissions en partageant votre lien personnalisé. Chaque rendez-vous confirmé via votre lien vous rapporte une commission. Vous pouvez suivre vos statistiques en temps réel dans votre tableau de bord." },
  { question: "comment obtenir mon lien d'affiliation", answer: "Votre lien d'affiliation est disponible dans votre tableau de bord après connexion. Vous pouvez le copier et le partager sur vos réseaux sociaux, par email ou tout autre canal." },
  { question: "quel est le montant des commissions", answer: "Les commissions varient selon les produits. En général, vous recevez 10% du montant de chaque vente réalisée via votre lien. Les détails exacts sont disponibles dans la section Ressources de l'application." },
  { question: "comment sont payées les commissions", answer: "Les commissions sont payées mensuellement par virement bancaire, une fois que votre solde atteint un minimum de 50€. Vous pouvez suivre vos gains en temps réel dans votre tableau de bord." },
  { question: "comment fonctionne le suivi des clics", answer: "Nous utilisons une technologie avancée pour suivre chaque clic sur votre lien d'affiliation. Vous pouvez voir en temps réel combien de personnes ont cliqué sur votre lien dans la section statistiques de votre tableau de bord." },
  { question: "qui est derrière ai horizon", answer: "AI Horizon est une entreprise spécialisée dans l'intelligence artificielle et les solutions digitales innovantes. Nous proposons des services et produits de pointe pour aider les entreprises à se transformer digitalement." },
  { question: "comment contacter le support", answer: "Vous pouvez contacter notre équipe de support via l'adresse email info@aihorizon-agency.com ou par téléphone en cas d'urgence au +32493163742. Vous pouvez également utiliser le formulaire de contact disponible dans la section 'Ressources' de l'application." },
  { question: "email du support", answer: "L'adresse email du support est info@aihorizon-agency.com" },
  { question: "numéro de téléphone", answer: "En cas d'urgence, vous pouvez contacter le support au +32493163742" },
  { question: "comment voir mes statistiques", answer: "Vos statistiques d'affiliation sont disponibles en temps réel dans votre tableau de bord. Vous pouvez y voir le nombre de clics, de rendez-vous confirmés et vos commissions." },
  { question: "comment améliorer mes performances", answer: "Pour améliorer vos performances d'affiliation, partagez votre lien sur plusieurs canaux, créez du contenu de qualité autour de nos produits, et consultez régulièrement les ressources disponibles dans l'application pour rester à jour sur les meilleures pratiques." },
  { question: "quels sont les produits que je peux promouvoir", answer: "Vous pouvez promouvoir tous les services et produits d'AI Horizon, incluant nos solutions d'intelligence artificielle, nos services de transformation digitale et nos programmes de formation. Plus de détails sont disponibles dans la section Ressources." },
  { question: "comment s'inscrire au programme d'affiliation", answer: "Pour s'inscrire au programme d'affiliation, il suffit de créer un compte sur notre plateforme, de remplir votre profil et d'accepter les conditions du programme. Vous recevrez immédiatement votre lien d'affiliation personnalisé." },
  { question: "quelles sont les conditions du programme", answer: "Les conditions du programme incluent une commission de 10% sur les ventes, un paiement mensuel à partir de 50€ de gains, et l'interdiction de faire de la publicité trompeuse. L'ensemble des conditions est disponible dans la section Ressources du site." },
  { question: "puis-je avoir plusieurs liens d'affiliation", answer: "Actuellement, chaque affilié dispose d'un seul lien personnalisé. Cependant, vous pouvez suivre séparément les performances de ce lien sur différentes plateformes grâce à notre système de tracking avancé." },
  { question: "comment fonctionne l'intégration avec calendly", answer: "Notre système est intégré à Calendly pour suivre automatiquement les rendez-vous confirmés provenant de votre lien d'affiliation. Chaque fois qu'un prospect réserve un rendez-vous via votre lien, vous êtes crédité de la commission correspondante." },
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const generateResponse = (question: string): string => {
    // Convert to lowercase for case-insensitive matching
    const lowerQuestion = question.toLowerCase();
    
    // Try to find a matching knowledge entry
    for (const entry of BOT_KNOWLEDGE) {
      if (lowerQuestion.includes(entry.question.toLowerCase())) {
        return entry.answer;
      }
    }
    
    // Check for contact information questions specifically
    if (lowerQuestion.includes("contact") || 
        lowerQuestion.includes("email") || 
        lowerQuestion.includes("mail") || 
        lowerQuestion.includes("urgence") || 
        lowerQuestion.includes("téléphone") || 
        lowerQuestion.includes("numéro")) {
      return "Vous pouvez contacter notre support par email à info@aihorizon-agency.com ou par téléphone en cas d'urgence au +32493163742.";
    }
    
    // Default responses if no match is found
    const defaultResponses = [
      "Je n'ai pas d'information spécifique sur ce sujet. N'hésitez pas à contacter notre support à info@aihorizon-agency.com ou au +32493163742 en cas d'urgence.",
      "Cette question dépasse mes connaissances actuelles. Je peux vous aider sur le fonctionnement du programme d'affiliation, les commissions, ou le suivi des clics. Pour plus d'informations, contactez-nous à info@aihorizon-agency.com.",
      "Je vous suggère de consulter la section Ressources pour plus d'informations à ce sujet, ou de contacter notre support à info@aihorizon-agency.com ou au +32493163742 en cas d'urgence.",
      "Je suis spécialisé dans les informations concernant notre programme d'affiliation. Pour des questions plus spécifiques, n'hésitez pas à contacter notre équipe à info@aihorizon-agency.com."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot typing and respond after a delay
    setTimeout(() => {
      const botResponse = generateResponse(userMessage.content);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 z-50">
      {/* Floating button */}
      <motion.button
        onClick={toggleChatbot}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-brand-blue hover:bg-blue-600"
        } text-white transition-colors`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chatbot window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`absolute bottom-16 right-0 w-[320px] sm:w-[380px] h-[500px] rounded-2xl shadow-xl overflow-hidden flex flex-col ${
              theme === "dark" ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"
            }`}
          >
            {/* Chat header */}
            <div className="p-3 border-b flex justify-between items-center bg-brand-blue text-white">
              <div className="flex items-center">
                <Bot size={20} className="mr-2" />
                <h3 className="font-semibold">Assistant AI Horizon</h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleChatbot}
                className="h-8 w-8 text-white hover:bg-blue-600"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Chat messages */}
            <ScrollArea className="flex-grow p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="flex items-start max-w-[80%]">
                      {message.sender === "bot" && (
                        <Avatar className="h-8 w-8 mr-2 bg-brand-blue">
                          <Bot size={16} className="text-white" />
                        </Avatar>
                      )}
                      
                      <div
                        className={`rounded-xl p-3 ${
                          message.sender === "user"
                            ? "bg-brand-blue text-white rounded-br-none"
                            : theme === "dark"
                            ? "bg-gray-800 text-gray-100 rounded-bl-none"
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      
                      {message.sender === "user" && (
                        <Avatar className="h-8 w-8 ml-2 bg-gray-700">
                          <User size={16} className="text-white" />
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start max-w-[80%]">
                      <Avatar className="h-8 w-8 mr-2 bg-brand-blue">
                        <Bot size={16} className="text-white" />
                      </Avatar>
                      <div className={`rounded-xl p-3 ${
                        theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-800"
                      } rounded-bl-none`}>
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Chat input */}
            <div className="p-3 border-t">
              <div className="flex items-end">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question..."
                  className="min-h-[44px] max-h-[120px] resize-none flex-grow mr-2"
                  rows={1}
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="icon" 
                  className="h-[44px] w-[44px] bg-brand-blue hover:bg-blue-600"
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
