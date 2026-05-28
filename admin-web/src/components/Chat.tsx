import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, ArrowLeft, MessageSquare, Circle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { chatService, type Mensagem } from '../services/chatService';

const TYPING_CSS = `
@keyframes typingBounce {
  0%, 100% { transform: translateY(0); }
  40%       { transform: translateY(-5px); }
}
.typing-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--text-muted); animation: typingBounce 1s infinite; }
.typing-dot:nth-child(2) { animation-delay: 0.15s; }
.typing-dot:nth-child(3) { animation-delay: 0.30s; }
`;

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chat({ isOpen, onClose }: ChatProps) {
  const { empresas, funcionarios } = useAdmin();
  const [selectedEmpresa, setSelectedEmpresa] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Mensagem[]>>({});
  const [lastMsg, setLastMsg] = useState<Record<string, Mensagem | null>>({});
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMensagens = useCallback(async (empresaId: string) => {
    try {
      const data = await chatService.getMensagens(empresaId);
      setMessages(prev => ({ ...prev, [empresaId]: data }));
      setLastMsg(prev => ({ ...prev, [empresaId]: data[data.length - 1] ?? null }));
    } catch { }
  }, []);

  // Carrega e polling ao selecionar empresa
  useEffect(() => {
    if (!selectedEmpresa) return;
    loadMensagens(selectedEmpresa);
    const t = setInterval(() => loadMensagens(selectedEmpresa), 4000);
    return () => clearInterval(t);
  }, [selectedEmpresa, loadMensagens]);

  // Pré-carrega última mensagem de cada empresa quando painel abre
  useEffect(() => {
    if (!isOpen) return;
    empresas.filter(e => e.status === 'Ativa').forEach(e => loadMensagens(e.id));
  }, [isOpen, empresas, loadMensagens]);

  useEffect(() => {
    if (selectedEmpresa) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedEmpresa]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedEmpresa) return;
    const texto = input.trim();
    setInput('');
    setTyping(true);
    setTimeout(() => setTyping(false), 2200);
    try {
      await chatService.sendMensagem(selectedEmpresa, texto);
      await loadMensagens(selectedEmpresa);
    } catch (e: any) {
      console.error('[Chat] erro ao enviar:', e?.response?.data ?? e?.message);
      setInput(texto);
      setTyping(false);
    }
  };

  const getAdminEmpresa = (empresaId: string) =>
    funcionarios.find(f => f.empresa_id === empresaId && f.role === 'admin')?.nome_completo ?? 'Administrador';

  const empresa = empresas.find(e => e.id === selectedEmpresa);
  const conv = selectedEmpresa ? (messages[selectedEmpresa] || []) : [];

  return (
    <>
      <style>{TYPING_CSS}</style>

      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 149 }} onClick={onClose} />}

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
        background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', zIndex: 150,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: isOpen ? '-8px 0 40px rgba(0,0,0,0.25)' : 'none',
      }}>

        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, minHeight: 64 }}>
          {selectedEmpresa ? (
            <>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedEmpresa(null)}>
                <ArrowLeft size={16} />
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{empresa?.nome}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{getAdminEmpresa(selectedEmpresa).split(' ')[0]} · {empresa?.andar}º andar</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--blue-dim)', border: '1px solid rgba(76,158,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={16} color="var(--blue)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Chat</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mensagens com administradores</div>
              </div>
            </>
          )}
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Lista de conversas */}
        {!selectedEmpresa ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
            {empresas.filter(e => e.status === 'Ativa').map(e => {
              const last = lastMsg[e.id];
              const adminNome = getAdminEmpresa(e.id);
              const hora = last ? new Date(last.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null;
              return (
                <button
                  key={e.id}
                  onClick={() => setSelectedEmpresa(e.id)}
                  style={{ width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', transition: 'background 0.12s' }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={ev => (ev.currentTarget.style.background = 'none')}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, background: `${e.avatarColor}18`, border: `1px solid ${e.avatarColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: e.avatarColor }}>
                    {e.nome.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>{e.nome}</span>
                      {hora && <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{hora}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {last ? `${last.from_role === 'recepcionista' ? 'Você: ' : `${adminNome.split(' ')[0]}: `}${last.texto}` : 'Iniciar conversa...'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            {/* Mensagens */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {conv.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 48 }}>
                  <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Nenhuma mensagem</div>
                  <div style={{ fontSize: 12 }}>Inicie a conversa abaixo.</div>
                </div>
              )}
              {conv.map((msg, idx) => {
                const mine = msg.from_role === 'recepcionista';
                const hora = new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                const thisDate = new Date(msg.created_at).toLocaleDateString('pt-BR');
                const prevDate = idx > 0 ? new Date(conv[idx - 1].created_at).toLocaleDateString('pt-BR') : null;
                const showDate = thisDate !== prevDate;

                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{thisDate}</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '75%', padding: '9px 13px',
                        borderRadius: mine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        background: mine ? 'linear-gradient(135deg, var(--blue), #1e7ad1)' : 'var(--bg-elevated)',
                        color: mine ? '#fff' : 'var(--text-primary)',
                        fontSize: 13, lineHeight: 1.5,
                        border: !mine ? '1px solid var(--border)' : 'none',
                        boxShadow: mine ? '0 2px 8px rgba(76,158,255,0.25)' : '0 1px 4px rgba(0,0,0,0.08)',
                      }}>
                        {!mine && <div style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 700, marginBottom: 3 }}>Admin</div>}
                        <div>{msg.texto}</div>
                        <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>{hora}</div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {/* Typing indicator */}
              {typing && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end', background: 'var(--bg-surface)' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Mensagem..."
                style={{ flex: 1, padding: '9px 14px', fontSize: 13, borderRadius: 20, background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-light)')}
              />
              <button
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{ padding: '9px 14px', borderRadius: 20, flexShrink: 0, transition: 'transform 0.1s', transform: 'scale(1)' }}
                onMouseDown={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.92)')}
                onMouseUp={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
              >
                <Send size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
