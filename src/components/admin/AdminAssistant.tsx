//components/admin/AdminAssistant.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePizzeria } from '../../context/PizzeriaContext';
import styles from './AdminAssistant.module.css';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function AdminAssistant() {
  const { departments, categories, menu } = usePizzeria();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Ciao! Sono il tuo assistente IA per la gestione della pizzeria. Come posso aiutarti oggi tra menu, impostazioni o reparti?',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    setTimeout(() => {
      let aiResponse = "Posso aiutarti a gestire il menu, configurare i reparti di produzione o impostare i parametri del database.";
      const lower = text.toLowerCase();

      if (lower.includes('menu') || lower.includes('prodotto') || lower.includes('categoria')) {
        aiResponse = `📦 **Gestione Menu e Categorie (${categories.length} categorie, ${menu.length} prodotti):**\n\nQuesta sezione ti permette di organizzare l'offerta della pizzeria. Ogni prodotto appartiene a una categoria e **ogni categoria deve essere collegata a un reparto di produzione** (es. Pizze, Bevande). Questo legame è fondamentale perché permette al KDS (Kitchen Display System) di smistare automaticamente gli ordini sugli schermi corretti dei reparti.`;
      } else if (lower.includes('reparto') || lower.includes('reparti') || lower.includes('forno')) {
        aiResponse = `🏭 **Reparti di Produzione (${departments.length} registrati):**\n\nI reparti dividono il lavoro in cucina:\n• **Reparti Ciclici (es. Pizze):** Non hanno un tempo fisso configurato; utilizzano i parametri di capienza e i cicli di cottura dei forni per calcolare i flussi e smistare gli ordini.\n• **Reparti a Tempo Fisso (es. Bevande/Dolci):** Gestiscono prodotti preconfezionati o rapidi con un tempo di preparazione standard predefinito.`;
      } else if (lower.includes('orari') || lower.includes('cancellati') || lower.includes('database')) {
        aiResponse = `⏰ **Impostazioni di Sistema e Database:**\n\nDalla pagina delle configurazioni puoi:\n• Registrare gli **orari di apertura e chiusura**, che regolano l'accettazione automatica degli ordini online.\n• Definire il timer di **pulizia automatica del database**, stabilendo dopo quanto tempo gli ordini completati o ritirati vengono rimossi per mantenere il sistema leggero e veloce.`;
      } else if (lower.includes('chi siamo') || lower.includes('pagina')) {
        aiResponse = `🎨 **Personalizzazione "Chi Siamo":**\n\nIn questa sezione puoi modificare direttamente l'aspetto e i testi della vetrina pubblica del ristorante. Puoi aggiornare la storia, i contatti, le immagini di presentazione e i banner promozionali visibili ai clienti prima di effettuare un ordine.`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse,
      };

      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className={styles.assistantContainer}>
      {/* Pulsante Flottante */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className={styles.floatingBtn}>
          🤖 Assistente Admin
        </button>
      )}

      {/* Finestra della Chat */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <h3 className={styles.chatTitle}>🤖 Smart Configurator</h3>
            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
              ✕
            </button>
          </div>

          {/* Messaggi */}
          <div className={styles.messagesContainer}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`${styles.message} ${
                  m.sender === 'user' ? styles.userMessage : styles.aiMessage
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className={styles.loadingText}>L'assistente sta scrivendo...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggerimenti Rapidi */}
          <div className={styles.suggestionsContainer}>
            <button
              onClick={() => handleSendMessage("Come gestisco il menu e le categorie?")}
              className={styles.suggestionChip}
            >
              🍕 Menu & Prodotti
            </button>
            <button
              onClick={() => handleSendMessage("Come funzionano i reparti di produzione?")}
              className={styles.suggestionChip}
            >
              🏭 Reparti & Forni
            </button>
            <button
              onClick={() => handleSendMessage("Cancellazione ordini e orari")}
              className={styles.suggestionChip}
            >
              ⏰ Configurazioni
            </button>
          </div>

          {/* Input Box */}
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Chiedi supporto sulla gestione..."
              className={styles.inputField}
            />
            <button onClick={() => handleSendMessage()} className={styles.sendBtn}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}