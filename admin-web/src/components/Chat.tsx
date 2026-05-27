import React, { useState, useRef, useEffect } from 'react';
import { X, Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface Message {
  id: string;
  from: 'recepcao' | 'admin';
  text: string;
  time: string;
}

const mockMsgs: Record<string, Message[]> = {
  e1: [
    { id: '1', from: 'admin', text: 'Bom dia! Tenho um visitante chegando às 10h, chama-se Gabriel Moura.', time: '09:45' },
    { id: '2', from: 'recepcao', text: 'Certo! Já cadastrei ele aqui, aguardando liberação do senhor.', time: '09:47' },
    { id: '3', from: 'admin', text: 'Pode aprovar, ele está autorizado.', time: '09:48' },
    { id: '4', from: 'recepcao', text: 'Aprovado! QR Code gerado para ele.', time: '09:49' },
  ],
  e2: [
    { id: '1', from: 'recepcao', text: 'Boa tarde, Fernanda. Há um visitante aguardando liberação para o 5º andar.', time: '13:30' },
    { id: '2', from: 'admin', text: 'Pode liberar, é da empresa parceira.', time: '13:35' },
  ],
  e3: [],
  e4: [
    { id: '1', from: 'admin', text: 'Preciso bloquear o acesso do Lucas Ferreira temporariamente.', time: '11:20' },
    { id: '2', from: 'recepcao', text: 'Feito! Credencial bloqueada no sistema.', time: '11:22' },
  ],
  e5: [],
};

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chat({ isOpen, onClose }: ChatProps) {
  const { empresas, funcionarios } = useAdmin();
  const [selectedEmpresa, setSelectedEmpresa] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMsgs);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedEmpresa) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedEmpresa]);

  const sendMessage = () => {
    if (!input.trim() || !selectedEmpresa) return;
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const msg: Message = { id: Date.now().toString(), from: 'recepcao', text: input.trim(), time: now };
    setMessages(prev => ({ ...prev, [selectedEmpresa]: [...(prev[selectedEmpresa] || []), msg] }));
    setInput('');
  };

  const getAdminEmpresa = (empresaId: string) =>
    funcionarios.find(f => f.empresa_id === empresaId && f.role === 'admin')?.nome_completo ?? 'Administrador';

  const getLastMsg = (empresaId: string) => {
    const msgs = messages[empresaId];
    return msgs && msgs.length > 0 ? msgs[msgs.length - 1] : null;
  };

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
              const last = getLastMsg(e.id);
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
                      {last && <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{last.time}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {last ? `${last.from === 'recepcao' ? 'Você: ' : `${adminNome.split(' ')[0]}: `}${last.text}` : 'Iniciar conversa...'}
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
              {conv.map(msg => (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: msg.from === 'recepcao' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '9px 13px',
                    borderRadius: msg.from === 'recepcao' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: msg.from === 'recepcao'
                      ? 'linear-gradient(135deg, var(--blue), #1e7ad1)'
                      : 'var(--bg-elevated)',
                    color: msg.from === 'recepcao' ? '#fff' : 'var(--text-primary)',
                    fontSize: 13,
                    lineHeight: 1.45,
                    border: msg.from !== 'recepcao' ? '1px solid var(--border)' : 'none',
                  }}>
                    <div>{msg.text}</div>
                    <div style={{ fontSize: 10, opacity: 0.65, marginTop: 4, textAlign: 'right' }}>{msg.time}</div>
                  </div>
                </div>
              ))}
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
