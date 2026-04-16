import { supabase } from './supabase'

// ── USUÁRIOS ──
export const getUsuarios = async () => {
  const { data } = await supabase.from('usuarios').select('*')
  return data || []
}
export const saveUsuario = async (u: any) => {
  await supabase.from('usuarios').upsert(u)
}
export const deleteUsuario = async (id: string) => {
  await supabase.from('usuarios').delete().eq('id', id)
}

// ── CLIENTES ──
export const getClientes = async () => {
  const { data } = await supabase.from('clientes').select('*')
  return data || []
}
export const saveCliente = async (c: any) => {
  await supabase.from('clientes').upsert(c)
}

// ── ANOTAÇÕES ──
export const getAnotacoes = async () => {
  const { data } = await supabase.from('anotacoes').select('*')
  return data || []
}
export const saveAnotacao = async (a: any) => {
  await supabase.from('anotacoes').upsert(a)
}

// ── FASES ──
export const getFases = async () => {
  const { data } = await supabase.from('fases_implantacao').select('*')
  return data || []
}
export const saveFase = async (clienteId: string, dados: any) => {
  await supabase.from('fases_implantacao').upsert({ cliente_id: clienteId, dados })
}

// ── HISTÓRICO ──
export const getHistorico = async () => {
  const { data } = await supabase.from('historico_status').select('*')
  return data || []
}
export const saveHistorico = async (h: any) => {
  await supabase.from('historico_status').upsert(h)
}
