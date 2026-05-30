import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import {
  Car, Bike, ParkingCircle, Clock, CreditCard,
  Camera, CheckCircle, AlertCircle, Plus, Trash2, Crown,
} from 'lucide-react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../../services/api';
import { C } from '../../../constants/theme';

const ONBOARDING_KEY = '@nextaccess:parking_onboarded';

type Veiculo  = { id: string; placa: string; modelo: string; tipo: string; cor: string };
type Sessao   = { id: string; entrada: string; custo_atual: number; status: string; placa?: string; tolerancia_restante_segundos?: number };
type Plano    = { status: string; vencimento: string; valor: string };

/* ─── Onboarding ─── */
const SLIDES = [
  { icon: Camera,       title: 'Reconhecimento Facial', desc: 'Cadastre seu rosto uma única vez. A cancela abre automaticamente ao chegar.' },
  { icon: Car,          title: 'Seus Veículos',         desc: 'Adicione seus veículos para rastreamento. Funciona com carro e moto.' },
  { icon: CreditCard,   title: 'Pagamento pelo App',    desc: 'Pague diretamente pelo aplicativo via PIX ou cartão. Sem fila no guichê.' },
];

function Onboarding({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0);
  const S = SLIDES[slide];
  const Icon = S.icon;

  return (
    <View style={ob.root}>
      <View style={ob.card}>
        <View style={ob.iconWrap}>
          <Icon size={40} color={C.blue} strokeWidth={1.5} />
        </View>
        <Text style={ob.title}>{S.title}</Text>
        <Text style={ob.desc}>{S.desc}</Text>

        <View style={ob.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[ob.dot, i === slide && ob.dotActive]} />
          ))}
        </View>

        {slide < SLIDES.length - 1 ? (
          <TouchableOpacity style={ob.btn} onPress={() => setSlide(s => s + 1)}>
            <Text style={ob.btnText}>Próximo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={ob.btn} onPress={onDone}>
            <Text style={ob.btnText}>Começar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* ─── Cadastro Facial (2 fotos) ─── */
const FOTO_STEPS = [
  {
    key:    'normal'  as const,
    titulo: 'Foto 1 de 2 — Distância normal',
    desc:   'Segure o celular como uma selfie comum. Rosto centralizado e iluminado.',
    dica:   'Braço esticado, olhe direto para a câmera',
  },
  {
    key:    'proxima' as const,
    titulo: 'Foto 2 de 2 — Aproxime-se',
    desc:   'Chegue mais perto da câmera. Seu rosto deve ocupar a maior parte da tela.',
    dica:   'Rosto bem próximo, sem cortar o queixo nem a testa',
  },
];

function CadastroFacial({ onDone }: { onDone: () => void }) {
  const [perm, requestPerm] = useCameraPermissions();
  const [stepIdx,    setStepIdx]    = useState(0);
  const [fotoNormal, setFotoNormal] = useState<string | null>(null);
  const [capturando, setCapturando] = useState(false);
  const [enviando,   setEnviando]   = useState(false);
  const camRef = useRef<any>(null);

  const step = FOTO_STEPS[stepIdx];

  if (!perm?.granted) {
    return (
      <View style={cf.root}>
        <Camera size={48} color={C.muted} />
        <Text style={cf.title}>Permissão de câmera necessária</Text>
        <TouchableOpacity style={cf.btn} onPress={requestPerm}>
          <Text style={cf.btnText}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tirarFoto = async () => {
    if (!camRef.current || capturando || enviando) return;
    setCapturando(true);
    try {
      const foto = await camRef.current.takePictureAsync({ base64: true, quality: 0.75 });

      if (stepIdx === 0) {
        // Primeira foto — avança para a segunda
        setFotoNormal(foto.base64);
        setStepIdx(1);
        setCapturando(false);
        return;
      }

      // Segunda foto — envia as duas para o back-end
      setEnviando(true);
      await api.post('/facial/cadastrar', {
        foto_normal_base64:  fotoNormal,
        foto_proxima_base64: foto.base64,
      });
      Alert.alert('Pronto!', 'Rosto cadastrado com sucesso!\nA câmera do estacionamento já pode te reconhecer.');
      onDone();
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.error ?? 'Falha ao cadastrar rosto. Tente novamente.');
      setStepIdx(0);
      setFotoNormal(null);
    } finally {
      setCapturando(false);
      setEnviando(false);
    }
  };

  return (
    <View style={cf.root}>
      {/* Indicador de progresso */}
      <View style={cf.progress}>
        {FOTO_STEPS.map((_, i) => (
          <View key={i} style={[cf.progressDot, i <= stepIdx && cf.progressDotActive]} />
        ))}
      </View>

      <Text style={cf.title}>{step.titulo}</Text>
      <Text style={cf.sub}>{step.desc}</Text>

      <View style={cf.camWrap}>
        <CameraView ref={camRef} style={cf.cam} facing="front" />
        {/* Guia oval para posicionamento do rosto */}
        <View style={[cf.faceGuide, stepIdx === 1 && cf.faceGuideClose]} />
      </View>

      <Text style={cf.dica}>💡 {step.dica}</Text>

      <TouchableOpacity
        style={[cf.btn, (capturando || enviando) && { opacity: 0.6 }]}
        onPress={tirarFoto}
        disabled={capturando || enviando}
      >
        {enviando
          ? <><ActivityIndicator color="#fff" /><Text style={cf.btnText}> Salvando...</Text></>
          : <Text style={cf.btnText}>{capturando ? 'Aguarde...' : stepIdx === 0 ? 'Tirar foto 1' : 'Tirar foto 2 e salvar'}</Text>}
      </TouchableOpacity>

      {stepIdx === 1 && (
        <TouchableOpacity onPress={() => { setStepIdx(0); setFotoNormal(null); }} style={cf.voltarBtn}>
          <Text style={cf.voltarText}>← Refazer foto 1</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ─── Tela principal ─── */
export default function EstacionamentoScreen() {
  const { user } = useAuth();
  const [loading,        setLoading]        = useState(true);
  const [onboarded,      setOnboarded]      = useState<boolean | null>(null); // null = ainda verificando AsyncStorage
  const [facialOk,       setFacialOk]       = useState(false);
  const [veiculos,       setVeiculos]       = useState<Veiculo[]>([]);
  const [sessao,         setSessao]         = useState<Sessao | null>(null);
  const [plano,          setPlano]          = useState<Plano | null>(null);
  const [mostraCadFacial,setMostraCadFacial]= useState(false);
  const [mostraAddVeic,  setMostraAddVeic]  = useState(false);
  const [novaPlaca,      setNovaPlaca]      = useState('');
  const [novoModelo,     setNovoModelo]     = useState('');
  const [novoTipo,       setNovoTipo]       = useState<'carro'|'moto'>('carro');
  const [pagando,        setPagando]        = useState(false);
  const [assinando,      setAssinando]      = useState(false);
  const [elapsed,        setElapsed]        = useState(0);
  const [tolerancia,     setTolerancia]     = useState(0); // segundos restantes após pagamento

  const isMensalista = ['admin', 'funcionario'].includes(user?.role ?? '');

  // Verifica AsyncStorage uma vez ao montar
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then(val => setOnboarded(val === 'true'));
  }, []);

  const finalizarOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboarded(true);
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, vRes, sRes] = await Promise.all([
        api.get('/facial/status'),
        api.get('/estacionamento/veiculos'),
        api.get('/estacionamento/sessao/ativa'),
      ]);
      setFacialOk(fRes.data.cadastrado);
      setVeiculos(vRes.data);
      setSessao(sRes.data);
      if (isMensalista) {
        const pRes = await api.get('/estacionamento/plano');
        setPlano(pRes.data);
      }
    } catch {
      // timeout ou back-end fora — não trava a tela
    } finally {
      setLoading(false);
    }
  }, [isMensalista]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  // Timer de permanência (sessão ativa/aguardando)
  useEffect(() => {
    if (!sessao || sessao.status === 'paga') { setElapsed(0); return; }
    const update = () => setElapsed(Math.floor((Date.now() - new Date(sessao.entrada).getTime()) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [sessao?.id, sessao?.status]);

  // Contador regressivo de tolerância após pagamento
  useEffect(() => {
    if (!sessao || sessao.status !== 'paga') { setTolerancia(0); return; }
    const inicial = sessao.tolerancia_restante_segundos ?? 0;
    setTolerancia(inicial);
    if (inicial <= 0) return;
    const id = setInterval(() => setTolerancia(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [sessao?.id, sessao?.status]);

  const formatDur = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  const addVeiculo = async () => {
    if (!novaPlaca.trim()) { Alert.alert('Informe a placa'); return; }
    try {
      await api.post('/estacionamento/veiculos', { placa: novaPlaca, modelo: novoModelo, tipo: novoTipo });
      setMostraAddVeic(false);
      setNovaPlaca(''); setNovoModelo('');
      carregar();
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.error ?? 'Falha ao adicionar veículo');
    }
  };

  const removerVeiculo = (id: string) => {
    Alert.alert('Remover veículo?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        await api.delete(`/estacionamento/veiculos/${id}`);
        carregar();
      }},
    ]);
  };

  const iniciarPolling = () => {
    const check = setInterval(async () => {
      try {
        const { data: s } = await api.get('/estacionamento/sessao/ativa');
        if (!s || s.status === 'paga') { clearInterval(check); carregar(); }
      } catch { /* ignora erros de rede no polling */ }
    }, 4000);
    setTimeout(() => clearInterval(check), 120000);
  };

  const pagarSessao = async () => {
    if (!sessao) return;
    setPagando(true);
    try {
      const { data } = await api.post(`/estacionamento/sessao/${sessao.id}/pagar`);
      // openAuthSessionAsync fecha o browser automaticamente ao detectar o deep link academia://
      await WebBrowser.openAuthSessionAsync(data.checkout_url, 'academia://');
      // Verifica status diretamente na Stripe ao voltar pro app
      try {
        const { data: verificacao } = await api.post(`/estacionamento/sessao/${sessao.id}/verificar-pagamento`);
        if (verificacao.status === 'paga') { carregar(); return; }
      } catch { /* ignora e deixa o polling continuar */ }
      iniciarPolling();
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.error ?? 'Falha ao gerar pagamento');
    } finally {
      setPagando(false);
    }
  };

  const assinarMensalidade = async () => {
    setAssinando(true);
    try {
      const { data } = await api.post('/estacionamento/plano/assinar');
      await WebBrowser.openAuthSessionAsync(data.checkout_url, 'academia://');
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.error ?? 'Falha ao gerar pagamento');
    } finally {
      setAssinando(false);
    }
  };

  // Aguarda verificação do AsyncStorage
  if (onboarded === null) return <View style={s.center}><ActivityIndicator color={C.blue} size="large" /></View>;

  if (!onboarded) return <Onboarding onDone={finalizarOnboarding} />;
  if (mostraCadFacial) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenHeader title="Cadastro Facial" />
      <CadastroFacial onDone={() => { setMostraCadFacial(false); carregar(); }} />
    </SafeAreaView>
  );
  if (loading) return <View style={s.center}><ActivityIndicator color={C.blue} size="large" /></View>;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenHeader title="Estacionamento" />
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={carregar} tintColor={C.blue} />}
      >

        {/* Sessão ativa */}
        {sessao ? (
          sessao.status === 'paga' ? (
            /* ── Pagamento confirmado: mostrar contagem regressiva de tolerância ── */
            <View style={[s.sessionCard, { backgroundColor: C.success + '18', borderColor: C.success + '40' }]}>
              <View style={s.sessionHeader}>
                <CheckCircle size={14} color={C.success} />
                <Text style={[s.sessionTitle, { color: C.success }]}>Pagamento confirmado!</Text>
              </View>
              <Text style={[s.sessionCusto, { color: C.success }]}>R$ {sessao.custo_atual?.toFixed(2) ?? '0,00'}</Text>
              {tolerancia > 0 ? (
                <>
                  <Text style={[s.sessionTitle, { color: C.text, marginTop: 8 }]}>Saia em até</Text>
                  <Text style={[s.timer, { color: C.success }]}>{formatDur(tolerancia)}</Text>
                  <Text style={[s.emptySessionSub, { color: C.muted }]}>
                    Aproxime-se da câmera de saída antes do tempo acabar
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[s.sessionTitle, { color: C.danger, marginTop: 8 }]}>Tolerância expirada</Text>
                  <Text style={s.emptySessionSub}>Dirija-se ao balcão ou pague novamente pelo app</Text>
                </>
              )}
              {sessao.placa && <Text style={s.sessionPlaca}>{sessao.placa}</Text>}
            </View>
          ) : (
            /* ── Sessão ativa / aguardando pagamento ── */
            <View style={s.sessionCard}>
              <View style={s.sessionHeader}>
                <View style={s.sessionDot} />
                <Text style={s.sessionTitle}>
                  {sessao.status === 'aguardando_pagamento' ? 'Pagamento iniciado' : 'Sessão em andamento'}
                </Text>
              </View>
              <Text style={s.timer}>{formatDur(elapsed)}</Text>
              {sessao.placa && <Text style={s.sessionPlaca}>{sessao.placa}</Text>}
              <Text style={s.sessionCusto}>R$ {sessao.custo_atual?.toFixed(2) ?? '0,00'}</Text>
              <TouchableOpacity
                style={[s.payBtn, pagando && { opacity: 0.6 }]}
                onPress={pagarSessao}
                disabled={pagando}
              >
                {pagando
                  ? <ActivityIndicator color="#fff" />
                  : <><CreditCard color="#fff" size={18} /><Text style={s.payBtnText}>Pagar e Sair</Text></>}
              </TouchableOpacity>
              {sessao.status === 'aguardando_pagamento' && (
                <Text style={[s.emptySessionSub, { marginTop: 6 }]}>
                  Se não conseguir pagar, dirija-se ao balcão da recepção
                </Text>
              )}
            </View>
          )
        ) : (
          <View style={s.emptySession}>
            <ParkingCircle size={36} color={C.muted} strokeWidth={1.5} />
            <Text style={s.emptySessionText}>Nenhuma sessão ativa</Text>
            <Text style={s.emptySessionSub}>Aproxime-se da câmera de entrada para iniciar</Text>
          </View>
        )}

        {/* Plano mensal (func/admin) */}
        {isMensalista && (
          <View style={[s.card, plano?.status === 'ativo' && { borderColor: C.success + '60' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Crown size={18} color={C.warning} />
              <Text style={s.cardTitle}>Mensalidade</Text>
            </View>
            {plano?.status === 'ativo' ? (
              <>
                <Text style={[s.planStatus, { color: C.success }]}>● Ativo</Text>
                <Text style={s.planVenc}>Vence em: {new Date(plano.vencimento).toLocaleDateString('pt-BR')}</Text>
              </>
            ) : (
              <>
                <Text style={s.planDesc}>Estacione sem pagar por sessão. Acesso ilimitado no mês.</Text>
                <TouchableOpacity style={[s.planBtn, assinando && { opacity: 0.6 }]} onPress={assinarMensalidade} disabled={assinando}>
                  {assinando ? <ActivityIndicator color="#fff" /> : <Text style={s.planBtnText}>Assinar Mensalidade</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Cadastro facial */}
        <View style={s.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Camera size={18} color={C.blue} />
            <Text style={s.cardTitle}>Reconhecimento Facial</Text>
          </View>
          {facialOk ? (
            <View style={s.facialOk}>
              <CheckCircle size={16} color={C.success} />
              <Text style={{ color: C.success, fontSize: 13, fontWeight: '600' }}>Rosto cadastrado</Text>
            </View>
          ) : (
            <View style={s.facialPend}>
              <AlertCircle size={16} color={C.warning} />
              <Text style={{ color: C.warning, fontSize: 13 }}>Cadastre seu rosto para usar o estacionamento</Text>
            </View>
          )}
          <TouchableOpacity style={s.facialBtn} onPress={() => setMostraCadFacial(true)}>
            <Text style={s.facialBtnText}>{facialOk ? 'Atualizar foto' : 'Cadastrar agora'}</Text>
          </TouchableOpacity>
        </View>

        {/* Veículos */}
        <View style={s.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Car size={18} color={C.blue} />
              <Text style={s.cardTitle}>Meus Veículos</Text>
            </View>
            <TouchableOpacity onPress={() => setMostraAddVeic(true)} style={s.addBtn}>
              <Plus size={16} color={C.blue} />
            </TouchableOpacity>
          </View>

          {veiculos.length === 0 ? (
            <Text style={s.emptyText}>Nenhum veículo cadastrado</Text>
          ) : veiculos.map(v => (
            <View key={v.id} style={s.veicRow}>
              {v.tipo === 'moto' ? <Bike size={18} color={C.muted} /> : <Car size={18} color={C.muted} />}
              <View style={{ flex: 1 }}>
                <Text style={s.veicPlaca}>{v.placa}</Text>
                {v.modelo ? <Text style={s.veicModelo}>{v.modelo}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => removerVeiculo(v.id)}>
                <Trash2 size={16} color={C.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Modal adicionar veículo */}
      <Modal visible={mostraAddVeic} transparent animationType="slide">
        <View style={mo.overlay}>
          <View style={mo.sheet}>
            <Text style={mo.title}>Adicionar Veículo</Text>

            <Text style={mo.label}>Placa *</Text>
            <TextInput style={mo.input} value={novaPlaca} onChangeText={setNovaPlaca}
              placeholder="ABC-1234" placeholderTextColor={C.muted} autoCapitalize="characters" />

            <Text style={mo.label}>Modelo</Text>
            <TextInput style={mo.input} value={novoModelo} onChangeText={setNovoModelo}
              placeholder="Ex: Honda Civic" placeholderTextColor={C.muted} />

            <Text style={mo.label}>Tipo</Text>
            <View style={mo.tipoRow}>
              {(['carro', 'moto'] as const).map(t => (
                <TouchableOpacity key={t} style={[mo.tipoBtn, novoTipo === t && mo.tipoBtnActive]}
                  onPress={() => setNovoTipo(t)}>
                  {t === 'carro' ? <Car size={18} color={novoTipo === t ? '#fff' : C.muted} /> : <Bike size={18} color={novoTipo === t ? '#fff' : C.muted} />}
                  <Text style={[mo.tipoBtnText, novoTipo === t && { color: '#fff' }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={mo.confirmBtn} onPress={addVeiculo}>
              <Text style={mo.confirmBtnText}>Adicionar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={mo.cancelBtn} onPress={() => setMostraAddVeic(false)}>
              <Text style={mo.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ─── Styles ─── */
const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.bg },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  scroll:        { padding: 16, gap: 14, paddingBottom: 40 },
  card:          { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16 },
  cardTitle:     { color: C.text, fontSize: 15, fontWeight: '700' },

  sessionCard:   { backgroundColor: C.blue + '18', borderRadius: 16, borderWidth: 1, borderColor: C.blue + '40', padding: 20, alignItems: 'center', gap: 8 },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: C.success },
  sessionTitle:  { color: C.text, fontSize: 13, fontWeight: '600' },
  timer:         { color: C.text, fontSize: 40, fontWeight: '800', fontVariant: ['tabular-nums'] as any },
  sessionPlaca:  { color: C.muted, fontSize: 13 },
  sessionCusto:  { color: C.blue, fontSize: 28, fontWeight: '800' },
  payBtn:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.blue, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 4 },
  payBtnText:    { color: '#fff', fontSize: 16, fontWeight: '800' },

  emptySession:  { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 24, alignItems: 'center', gap: 8 },
  emptySessionText: { color: C.text, fontSize: 15, fontWeight: '700' },
  emptySessionSub:  { color: C.muted, fontSize: 13, textAlign: 'center' },

  planStatus:    { fontSize: 14, fontWeight: '700' },
  planVenc:      { color: C.muted, fontSize: 12, marginTop: 2 },
  planDesc:      { color: C.muted, fontSize: 13, marginBottom: 10 },
  planBtn:       { backgroundColor: C.warning, borderRadius: 12, padding: 12, alignItems: 'center' },
  planBtnText:   { color: '#fff', fontWeight: '700' },

  facialOk:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  facialPend:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  facialBtn:     { backgroundColor: C.surface, borderWidth: 1, borderColor: C.blue, borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 4 },
  facialBtnText: { color: C.blue, fontWeight: '600', fontSize: 13 },

  addBtn:        { width: 30, height: 30, borderRadius: 8, backgroundColor: C.blue + '18', alignItems: 'center', justifyContent: 'center' },
  emptyText:     { color: C.muted, fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  veicRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.border },
  veicPlaca:     { color: C.text, fontWeight: '700', fontSize: 14 },
  veicModelo:    { color: C.muted, fontSize: 12 },
});

const ob = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card:      { backgroundColor: C.surface, borderRadius: 24, borderWidth: 1, borderColor: C.border, padding: 28, alignItems: 'center', gap: 12, width: '100%' },
  iconWrap:  { width: 80, height: 80, borderRadius: 24, backgroundColor: C.blue + '18', alignItems: 'center', justifyContent: 'center' },
  title:     { color: C.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  desc:      { color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  dots:      { flexDirection: 'row', gap: 6, marginVertical: 4 },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: C.border },
  dotActive: { backgroundColor: C.blue, width: 18 },
  btn:       { backgroundColor: C.blue, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, width: '100%', alignItems: 'center' },
  btnText:   { color: '#fff', fontWeight: '800', fontSize: 16 },
});

const cf = StyleSheet.create({
  root:             { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12, backgroundColor: C.bg },
  progress:         { flexDirection: 'row', gap: 8, marginBottom: 4 },
  progressDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  progressDotActive:{ backgroundColor: C.blue, width: 24 },
  title:            { color: C.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  sub:              { color: C.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  camWrap:          { width: 260, height: 340, borderRadius: 20, overflow: 'hidden', position: 'relative', borderWidth: 2, borderColor: C.border },
  cam:              { flex: 1 },
  faceGuide:        { position: 'absolute', top: '12%', left: '15%', right: '15%', bottom: '12%', borderWidth: 2, borderColor: C.blue + 'cc', borderRadius: 130 },
  faceGuideClose:   { top: '5%', left: '5%', right: '5%', bottom: '5%' },
  dica:             { color: C.muted, fontSize: 11, textAlign: 'center', paddingHorizontal: 16 },
  btn:              { backgroundColor: C.blue, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, width: '100%', marginTop: 4 },
  btnText:          { color: '#fff', fontWeight: '800', fontSize: 15 },
  voltarBtn:        { paddingVertical: 8 },
  voltarText:       { color: C.muted, fontSize: 13 },
});

const mo = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 8 },
  title:         { color: C.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  label:         { color: C.muted, fontSize: 12, fontWeight: '600', marginTop: 4 },
  input:         { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, color: C.text, fontSize: 14 },
  tipoRow:       { flexDirection: 'row', gap: 10 },
  tipoBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12 },
  tipoBtnActive: { backgroundColor: C.blue, borderColor: C.blue },
  tipoBtnText:   { color: C.muted, fontWeight: '600' },
  confirmBtn:    { backgroundColor: C.blue, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 8 },
  confirmBtnText:{ color: '#fff', fontWeight: '800', fontSize: 15 },
  cancelBtn:     { padding: 12, alignItems: 'center' },
  cancelBtnText: { color: C.muted, fontSize: 14 },
});
