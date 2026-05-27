import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { chatService, type Mensagem } from '../services/chatService';

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
    try {
      await chatService.sendMensagem(selectedEmpresa, texto);
      await loadMensagens(selectedEmpresa);
    } catch (e: any) {
      console.error('[Chat] erro ao enviar:', e?.response?.data ?? e?.message);
      setInput(texto); // devolve o texto se falhou
    }
  };

  const getAdminEmpresa = (empresaId: string) =>
    funcionarios.find(f => f.empresa_id === empresaId && f.role === 'admin')?.nome_completo ?? 'Administrador';

  const empresa = empresas.find(e => e.id === selectedEmpresa);
  const conv = selectedEmpresa ? (messages[selectedEmpresa] || []) : [];

  return (
    <>
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 149 }}
          onClick={onClose}
        />
      )}

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 360,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        zIndex: 150,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: isOpen ? '-8px 0 32px rgba(0,0,0,0.2)' : 'none',
      }}>
        {/* Header do painel */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
          minHeight: 64,
        }}>
          {selectedEmpresa ? (
            <>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedEmpresa(null)}>
                <ArrowLeft size={16} />
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {empresa?.nome}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {getAdminEmpresa(selectedEmpresa)} · {empresa?.andar}º andar
                </div>
              </div>
            </>
          ) : (
            <>
              <MessageSquare size={18} color="var(--blue)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Chat</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Administradores do prédio</div>
              </div>
            </>
          )}
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Conteúdo */}
        {!selectedEmpresa ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {empresas.filter(e => e.status === 'Ativa').map(e => {
              const last = lastMsg[e.id];
              const adminNome = getAdminEmpresa(e.id);
              return (
                <button
                  key={e.id}
                  onClick={() => setSelectedEmpresa(e.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '12px 18px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12,
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={ev => (ev.currentTarget.style.background = 'none')}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: `${e.avatarColor}18`,
                    border: `1px solid ${e.avatarColor}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 15, color: e.avatarColor,
                  }}>
                    {e.nome.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{e.nome}</span>
                      {lastMsg[e.id] && <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(lastMsg[e.id]!.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lastMsg[e.id] ? `${lastMsg[e.id]!.from_role === 'recepcionista' ? 'Você: ' : `${adminNome.split(' ')[0]}: `}${lastMsg[e.id]!.texto}` : 'Iniciar conversa...'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {conv.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 40 }}>
                  Nenhuma mensagem ainda.<br />Inicie a conversa.
                </div>
              )}
              {conv.map(msg => {
                const mine = msg.from_role === 'recepcionista';
                const hora = new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '75%', padding: '9px 13px',
                      borderRadius: mine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      background: mine ? 'linear-gradient(135deg, var(--blue), #1e7ad1)' : 'var(--bg-elevated)',
                      color: mine ? '#fff' : 'var(--text-primary)',
                      fontSize: 13, lineHeight: 1.45,
                      border: !mine ? '1px solid var(--border)' : 'none',
                    }}>
                      <div>{msg.texto}</div>
                      <div style={{ fontSize: 10, opacity: 0.65, marginTop: 4, textAlign: 'right' }}>{hora}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Escreva uma mensagem..."
                style={{ flex: 1, padding: '9px 14px', fontSize: 13 }}
              />
              <button
                className="btn btn-primary btn-icon"
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{ padding: '9px 14px' }}
              >
                <Send size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
