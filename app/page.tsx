"use client"
import { supabase } from '../lib/supabase'
import { getUsuarios, saveUsuario, deleteUsuario, getClientes, saveCliente, getAnotacoes, saveAnotacao, getFases, saveFase, getHistorico, saveHistorico } from '../lib/db'

import { useState, useRef, useMemo } from "react"
import {
  LayoutDashboard, Users, Search, AlertTriangle, CheckCircle2,
  ChevronRight, Send, ArrowLeft, DollarSign, ShoppingCart,
  Layers, Package, Shield, Zap, Eye,
  Plus, X, User, Copy, CheckCheck, ClipboardList, MessageCircle,
  Wrench, Play, Percent, Edit2, Save, CheckSquare, XSquare,
  HelpCircle, Trash2, UserPlus, Key, ToggleLeft, ToggleRight,
  FolderOpen, Bell, Upload, RefreshCw
} from "lucide-react"

const ALL_PAGES = [
  "dashboard","cadastros","clientes","projetos","alertas",
  "comercial","operacoes","atendimentos","colaboradores","produtos",
  "comissoes","permissoes","anotacoes","fila_execucao","qualidade","validacao","implantacao","conversoes"
]

const ROLE_META = {
  root:      { label:"Root",               color:"bg-red-100 text-red-700 border-red-200",              icon:"🔑", pages: ALL_PAGES },
  admin:     { label:"Administrador",      color:"bg-amber-100 text-amber-700 border-amber-200",        icon:"⚙️", pages: ALL_PAGES },
  diretor:   { label:"Diretor",            color:"bg-emerald-100 text-emerald-700 border-emerald-200",  icon:"👔", pages: ALL_PAGES },
  coord_com: { label:"Coord. Comercial",   color:"bg-purple-100 text-purple-700 border-purple-200",     icon:"📊", pages:["dashboard","clientes","comercial","validacao"] },
  coord_ops: { label:"Coord. Operações",   color:"bg-blue-100 text-blue-700 border-blue-200",           icon:"📋", pages:["dashboard","cadastros","clientes","projetos","alertas","operacoes","atendimentos","colaboradores","fila_execucao","anotacoes","validacao"] },
  coord_sup: { label:"Coord. Suporte",     color:"bg-cyan-100 text-cyan-700 border-cyan-200",           icon:"🎧", pages:["dashboard","cadastros","clientes","projetos","alertas","operacoes","colaboradores","fila_execucao","anotacoes"] },
  ops:       { label:"Ops/Implantação",    color:"bg-teal-100 text-teal-700 border-teal-200",           icon:"🔧", pages:["dashboard","clientes","alertas","operacoes","atendimentos","anotacoes","fila_execucao"] },
  vendedor:  { label:"Vendedor",           color:"bg-violet-100 text-violet-700 border-violet-200",     icon:"🛒", pages:["dashboard","cadastros","clientes","comercial"] },
}

const SEED_USERS = [
  { id:"root",      name:"Rodrigo Mesquita de Souza", email:"rodrigo@ops.com",   password:"root123",    role:"root",      ativo:true },
  { id:"diretor",   name:"Sr. Gilmar",                email:"gilmar@modulo.com", password:"diretor123", role:"diretor",   ativo:true },
  { id:"admin",     name:"Douglas Grohs",             email:"douglas@ops.com",   password:"admin123",   role:"admin",     ativo:true },
  { id:"klayton",   name:"Klayton Cruz Ribeiro",      email:"klayton@ops.com",   password:"sup123",     role:"coord_sup", ativo:true },
  { id:"coord_com", name:"Elier Fernandes",            email:"elier@ops.com",     password:"com123",     role:"coord_com", ativo:true },
  { id:"ops1",      name:"Dougllas Victorelle",        email:"dv@ops.com",        password:"ops123",     role:"ops",       ativo:true },
  { id:"ops2",      name:"Leonildo Sobrinho",          email:"leonildo@ops.com",  password:"ops123",     role:"ops",       ativo:true },
  { id:"ops3",      name:"Renato Jairo",               email:"renato@ops.com",    password:"ops123",     role:"ops",       ativo:true },
  { id:"ops4",      name:"Ericka Luzia",               email:"ericka@ops.com",    password:"ops123",     role:"ops",       ativo:true },
  { id:"ops5",      name:"Johnny Cristian",            email:"johnny@ops.com",    password:"ops123",     role:"ops",       ativo:true },
  { id:"ops6",      name:"Wanderley Cardoso",          email:"wanderley@ops.com", password:"ops123",     role:"ops",       ativo:true },
  { id:"vend1",     name:"Denis Nunes Brauna",         email:"denis@ops.com",     password:"vend123",    role:"vendedor",  ativo:true },
  { id:"vend2",     name:"Claudivan da Silva",         email:"claudivan@ops.com", password:"vend123",    role:"vendedor",  ativo:true },
  { id:"vend3",     name:"Marcelo Bezerra",            email:"marcelo@ops.com",   password:"vend123",    role:"vendedor",  ativo:true },
]

const EXEC_RESPONSAVEIS = [
  { id:"root",    nome:"Rodrigo Mesquita de Souza", iniciais:"RM" },
  { id:"klayton", nome:"Klayton Cruz Ribeiro",      iniciais:"KC" },
]

const SEED_CLIENTS = JSON.parse(`[{"id":"cli_109521","name":"E P A DOS SANTOS LTDA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops4","horasNum":0,"criadoEm":"18/03/26","codSGD":"109521"},{"id":"cli_110187","name":"G & F CONTABILIDADE LTDA","cidade":"GURUPI","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Nov25","responsavel":"ops3","horasNum":0,"criadoEm":"05/11/25","codSGD":"110187"},{"id":"cli_111272","name":"LIMA EMPREENDIMENTOS LTDA","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops4","horasNum":0,"criadoEm":"26/02/26","codSGD":"111272"},{"id":"cli_111734","name":"NOVA TENDENCIA SERVICOS CONTABEIS","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops5","horasNum":0,"criadoEm":"16/01/26","codSGD":"111734"},{"id":"cli_112469","name":"TBCONT SOLUCOES CONTABEIS LTDA","cidade":"CANAÃ DOS CARAJÁS","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops4","horasNum":0,"criadoEm":"26/03/26","codSGD":"112469"},{"id":"cli_114426","name":"AGROMINAS PRODUTOS AGROPECUARIOS LTDA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops4","horasNum":0,"criadoEm":"11/02/26","codSGD":"114426"},{"id":"cli_114491","name":"RONILDE MARCELINO DA SILVA","cidade":"SÃO DOMINGOS DO ARAGUAIA","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops6","horasNum":0,"criadoEm":"26/01/26","codSGD":"114491"},{"id":"cli_115318","name":"INSTITUTO ECONACIONAL DE DESENVOLVIMENTO - ECONACIONAL","cidade":"MACEIÓ","estado":"AL","pacote":"Domínio Empresarial","vendedor":"Denis Nunes Brauna","dataAssinatura":"27/01/2026","mes":"Jan26","responsavel":"ops1","horasNum":36,"criadoEm":"27/01/26","codSGD":"115318","horasRealizadas":2.3,"pctHoras":6.4},{"id":"cli_115460","name":"H&S CONTABILIDADE LTDA","cidade":"SAO BENTO DO TOCANTINS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops4","horasNum":0,"criadoEm":"11/03/26","codSGD":"115460"},{"id":"cli_11635","name":"JOAQUIM EMILIO PEREIRA DE OLIVEIRA","cidade":"GURUPI","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Dez25","responsavel":"ops3","horasNum":0,"criadoEm":"17/12/25","codSGD":"11635"},{"id":"cli_116402","name":"ATACADAO BARATAO LTDA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"root","horasNum":0,"criadoEm":"19/03/26","codSGD":"116402"},{"id":"cli_11735","name":"MARCOS AUGUSTO BARROS DE FREITAS","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"17/03/26","codSGD":"11735"},{"id":"cli_118435","name":"JUAN DIEGO HONORATO BORGO","cidade":"MARABÁ","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops6","horasNum":0,"criadoEm":"26/01/26","codSGD":"118435"},{"id":"cli_118754","name":"NEIDIANA DA SILVA OLIVEIRA","cidade":"NOVO REPARTIMENTO","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops4","horasNum":0,"criadoEm":"10/03/26","codSGD":"118754"},{"id":"cli_118887","name":"M & S EMPREENDIMENTOS LTDA","cidade":"REDENÇÃO","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops3","horasNum":0,"criadoEm":"12/01/26","codSGD":"118887"},{"id":"cli_120336","name":"R.C. CONTABILIDADE LTDA","cidade":"PARAGOMINAS","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops2","horasNum":0,"criadoEm":"23/02/26","codSGD":"120336"},{"id":"cli_121355","name":"NCONTI CONTABILIDADE & CONSULTORIA EMPRESARIAL LTDA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Out25","responsavel":"ops3","horasNum":0,"criadoEm":"27/10/25","codSGD":"121355"},{"id":"cli_121403","name":"JABES PEREIRA LIMA","cidade":"GURUPI","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"04/03/26","codSGD":"121403"},{"id":"cli_121877","name":"Z M P DA TRINDADE LTDA","cidade":"IGARAPÉ-MIRI","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops2","horasNum":0,"criadoEm":"05/01/26","codSGD":"121877"},{"id":"cli_122194","name":"FACULDADE PARA O DESENVOLVIMENTO SUSTENTAVEL DA AMAZONIA LTD","cidade":"PARAUAPEBAS","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops1","horasNum":0,"criadoEm":"24/03/26","codSGD":"122194"},{"id":"cli_125861","name":"EXATA ACESSORIA ADMINISTRATIVA LTDA","cidade":"PARAGOMINAS","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops2","horasNum":0,"criadoEm":"15/01/26","codSGD":"125861"},{"id":"cli_125867","name":"MGC CONTABILIDADE E ASSOCIADOS LTDA","cidade":"PALMEIRÓPOLIS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops3","horasNum":0,"criadoEm":"21/01/26","codSGD":"125867"},{"id":"cli_135149","name":"ANTONIEL PEREIRA PINTO","cidade":"GURUPI","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"28/03/2025","mes":"Mar25","responsavel":"ops2","horasNum":42,"criadoEm":"28/03/25","codSGD":"135149","horasRealizadas":46.4,"pctHoras":110.5},{"id":"cli_145041","name":"R. L. DA SILVA MARTINS CONTABILIDADE","cidade":"REDENÇÃO","estado":"PA","pacote":"Domínio Plus","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"23/06/2025","mes":"Jun25","responsavel":"ops6","horasNum":48,"criadoEm":"23/06/25","codSGD":"145041","horasRealizadas":64.5,"pctHoras":134.4},{"id":"cli_145499","name":"JANI GLEICI DE FREITAS SILVA","cidade":"MARABÁ","estado":"PA","pacote":"Personalizado","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"25/06/2025","mes":"Jan26","responsavel":"ops6","horasNum":0,"criadoEm":"28/01/26","codSGD":"145499","horasRealizadas":0.0,"pctHoras":0},{"id":"cli_146113","name":"E. COSTA LEAL CONTABILIDADE","cidade":"DIANÓPOLIS","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"30/06/2025","mes":"Mar26","responsavel":"ops1","horasNum":42,"criadoEm":"20/03/26","codSGD":"146113","horasRealizadas":63.5,"pctHoras":151.3},{"id":"cli_147610","name":"PA DIGITAL CONTABILIDADE LTDA","cidade":"PARAUAPEBAS","estado":"PA","pacote":"Domínio Plus","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"31/10/2025","mes":"Out25","responsavel":"ops2","horasNum":42,"criadoEm":"31/10/25","codSGD":"147610","horasRealizadas":31.1,"pctHoras":74.2},{"id":"cli_14850","name":"LUIS BORGES BARBOSA","cidade":"MARABÁ","estado":"PA","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Dez25","responsavel":"ops3","horasNum":0,"criadoEm":"04/12/25","codSGD":"14850"},{"id":"cli_149858","name":"OPEN7 CONTABILIDADE LTDA","cidade":"PARAUAPEBAS","estado":"PA","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"23/07/2025","mes":"Jul25","responsavel":"ops2","horasNum":36,"criadoEm":"23/07/25","codSGD":"149858","horasRealizadas":46.7,"pctHoras":129.8},{"id":"cli_15168","name":"KELLI CRISTINA PAULO","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops6","horasNum":0,"criadoEm":"26/01/26","codSGD":"15168"},{"id":"cli_154074","name":"LEX CONTABILIDADE E SOLUCOES LTDA","cidade":"ALTAMIRA","estado":"PA","pacote":"Personalizado","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"13/08/2025","mes":"Fev26","responsavel":"ops2","horasNum":48,"criadoEm":"18/02/26","codSGD":"154074","horasRealizadas":48.4,"pctHoras":100.8},{"id":"cli_154443","name":"ANTONIO EDNALDO AGUIAR SOUSA","cidade":"NOVA ESPERANÇA DO PIRIÁ","estado":"PA","pacote":"Domínio Plus","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"15/08/2025","mes":"Ago25","responsavel":"ops2","horasNum":30,"criadoEm":"15/08/25","codSGD":"154443","horasRealizadas":37.8,"pctHoras":126},{"id":"cli_158027","name":"LIVE SERVICOS DE ASSESSORIA E GESTAO INTELIGENTE LTDA","cidade":"SANTARÉM","estado":"PA","pacote":"Domínio Plus","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"29/08/2025","mes":"Mar26","responsavel":"ops1","horasNum":66,"criadoEm":"20/03/26","codSGD":"158027","horasRealizadas":84.9,"pctHoras":128.6},{"id":"cli_159926","name":"K M J CONTABILIDADE LTDA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Jul25","responsavel":"ops5","horasNum":0,"criadoEm":"29/07/25","codSGD":"159926"},{"id":"cli_160602","name":"GILSON SARAIVA CONTABILIDADE LTDA","cidade":"GURUPI","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops3","horasNum":0,"criadoEm":"26/02/26","codSGD":"160602"},{"id":"cli_161510","name":"ROSEIA MARIA DE PAULA AZEVEDO COSTA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"17/09/2025","mes":"Set25","responsavel":"ops6","horasNum":48,"criadoEm":"17/09/25","codSGD":"161510","horasRealizadas":35.4,"pctHoras":73.7},{"id":"cli_16672","name":"FARIAS & SCHIMITH LTDA ME","cidade":"BOM JESUS DO TOCANTINS","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops5","horasNum":0,"criadoEm":"04/03/26","codSGD":"16672"},{"id":"cli_167573","name":"MAXIMUS ASSESSORIA CONTABIL LTDA","cidade":"MARABÁ","estado":"PA","pacote":"Dom����nio Plus","vendedor":"","dataAssinatura":"","mes":"Nov25","responsavel":"ops5","horasNum":0,"criadoEm":"27/11/25","codSGD":"167573"},{"id":"cli_170401","name":"ESCRITORIO CONTABIL REAL LTDA","cidade":"PALMEIRÓPOLIS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Set25","responsavel":"ops3","horasNum":0,"criadoEm":"19/09/25","codSGD":"170401"},{"id":"cli_171549","name":"METTA CONTABILIDADE LTDA","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"29/10/2025","mes":"Out25","responsavel":"ops2","horasNum":30,"criadoEm":"29/10/25","codSGD":"171549","horasRealizadas":30.3,"pctHoras":101.1},{"id":"cli_171895","name":"ATIVUS SERVICOS CONTABEIS LTDA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"30/10/2025","mes":"Out25","responsavel":"ops2","horasNum":44,"criadoEm":"30/10/25","codSGD":"171895","horasRealizadas":27.5,"pctHoras":62.5},{"id":"cli_172105","name":"REGINALDO ALVES DE SOUSA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"31/10/2025","mes":"Out25","responsavel":"ops2","horasNum":36,"criadoEm":"31/10/25","codSGD":"172105","horasRealizadas":51.4,"pctHoras":142.8},{"id":"cli_172128","name":"ATIVOS CONTABILIDADE LTDA","cidade":"DARCINÓPOLIS","estado":"TO","pacote":"Domínio Start","vendedor":"Denis Nunes Brauna","dataAssinatura":"31/10/2025","mes":"Out25","responsavel":"ops4","horasNum":32,"criadoEm":"31/10/25","codSGD":"172128","horasRealizadas":31.1,"pctHoras":98.0},{"id":"cli_17305","name":"LAZARO RODRIGUES SANTIAGO","cidade":"ALVORADA","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops3","horasNum":0,"criadoEm":"04/02/26","codSGD":"17305"},{"id":"cli_17310","name":"NEISON DA SILVA BARROS","cidade":"GURUPI","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Nov25","responsavel":"ops5","horasNum":0,"criadoEm":"24/11/25","codSGD":"17310"},{"id":"cli_176005","name":"R DE SOUSA LIMA","cidade":"FORMOSO DO ARAGUAIA","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops5","horasNum":0,"criadoEm":"25/03/26","codSGD":"176005"},{"id":"cli_176619","name":"CONSULTHABIL CONSULTORIA CONTAB E PROC DE DADOS LTDA","cidade":"PORTO NACIONAL","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"24/11/2025","mes":"Nov25","responsavel":"ops6","horasNum":66,"criadoEm":"24/11/25","codSGD":"176619","horasRealizadas":80.5,"pctHoras":121.4},{"id":"cli_176822","name":"CLAUDIO G. DE CARVALHO","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"25/11/2025","mes":"Nov25","responsavel":"ops2","horasNum":36,"criadoEm":"25/11/25","codSGD":"176822","horasRealizadas":20.5,"pctHoras":56.9},{"id":"cli_176872","name":"GAGLIARDI CONTABILIDADE LTDA","cidade":"MARABÁ","estado":"PA","pacote":"Domínio Plus","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"25/11/2025","mes":"Nov25","responsavel":"ops6","horasNum":48,"criadoEm":"25/11/25","codSGD":"176872","horasRealizadas":49.5,"pctHoras":103.1},{"id":"cli_176928","name":"CASTRO CONTABILIDADE LTDA","cidade":"PORTO NACIONAL","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Out25","responsavel":"ops3","horasNum":0,"criadoEm":"27/10/25","codSGD":"176928"},{"id":"cli_177330","name":"RIBEIRO E SANTOS SERVICOS CONTABEIS LTDA","cidade":"GURUPI","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"27/11/2025","mes":"Nov25","responsavel":"ops1","horasNum":44,"criadoEm":"27/11/25","codSGD":"177330","horasRealizadas":23.4,"pctHoras":52.6},{"id":"cli_177504","name":"CICERO GERONIMO LABRE DA SILVA","cidade":"ANANÁS","estado":"TO","pacote":"Domínio Start","vendedor":"Denis Nunes Brauna","dataAssinatura":"28/11/2025","mes":"Nov25","responsavel":"ops2","horasNum":24,"criadoEm":"28/11/25","codSGD":"177504","horasRealizadas":24.6,"pctHoras":102.6},{"id":"cli_177683","name":"FRANCYELLE LIMA DA SILVA","cidade":"PORTO NACIONAL","estado":"TO","pacote":"Personalizado","vendedor":"Denis Nunes Brauna","dataAssinatura":"28/11/2025","mes":"Fev26","responsavel":"ops3","horasNum":16,"criadoEm":"03/02/26","codSGD":"177683","horasRealizadas":0.8,"pctHoras":4.9},{"id":"cli_177709","name":"D FERNANDES CAMPOS","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops5","horasNum":0,"criadoEm":"04/02/26","codSGD":"177709"},{"id":"cli_177901","name":"OSMAR SCARAMUSSA","cidade":"PARAGOMINAS","estado":"PA","pacote":"Personalizado","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"01/12/2025","mes":"Dez25","responsavel":"ops1","horasNum":20,"criadoEm":"01/12/25","codSGD":"177901","horasRealizadas":33.5,"pctHoras":167.7},{"id":"cli_181784","name":"CAROLAINE LIMA ALENCAR COSTA","cidade":"AUGUSTINÓPOLIS","estado":"TO","pacote":"Domínio Start","vendedor":"Denis Nunes Brauna","dataAssinatura":"06/01/2026","mes":"Jan26","responsavel":"ops4","horasNum":37,"criadoEm":"06/01/26","codSGD":"181784","horasRealizadas":30.4,"pctHoras":82.1},{"id":"cli_181860","name":"LIDER CONTABIL ASSESSORIA LTDA","cidade":"ELDORADO DOS CARAJÁS","estado":"PA","pacote":"Domínio Start","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"07/01/2026","mes":"Jan26","responsavel":"ops1","horasNum":31,"criadoEm":"07/01/26","codSGD":"181860","horasRealizadas":26.6,"pctHoras":85.7},{"id":"cli_182019","name":"LUIS LIMA DE ARAUJO","cidade":"DOM ELISEU","estado":"PA","pacote":"Domínio Start","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"07/01/2026","mes":"Jan26","responsavel":"ops1","horasNum":30,"criadoEm":"07/01/26","codSGD":"182019","horasRealizadas":45.0,"pctHoras":150.2},{"id":"cli_184248","name":"MENDES CONTABILIDADE LTDA","cidade":"MARABÁ","estado":"PA","pacote":"Domínio Premium","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"19/01/2026","mes":"Jan26","responsavel":"ops3","horasNum":48,"criadoEm":"19/01/26","codSGD":"184248","horasRealizadas":57.0,"pctHoras":118.7},{"id":"cli_185091","name":"FRANCINEI COELHO PINTO","cidade":"TUCURUÍ","estado":"PA","pacote":"Domínio Start","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"22/01/2026","mes":"Jan26","responsavel":"ops2","horasNum":30,"criadoEm":"22/01/26","codSGD":"185091","horasRealizadas":5.4,"pctHoras":18.0},{"id":"cli_185113","name":"LIGIA DIAS PINHEIRO","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"22/01/2026","mes":"Jan26","responsavel":"ops1","horasNum":43,"criadoEm":"22/01/26","codSGD":"185113","horasRealizadas":24.7,"pctHoras":57.4},{"id":"cli_18539","name":"INNOVA CONTABILIDADE EIRELI - ME","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops4","horasNum":0,"criadoEm":"03/03/26","codSGD":"18539"},{"id":"cli_185640","name":"60.231.259 ELIANE DE OLIVEIRA SALES","cidade":"ALTAMIRA","estado":"PA","pacote":"Domínio Start","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"26/01/2026","mes":"Jan26","responsavel":"ops2","horasNum":30,"criadoEm":"26/01/26","codSGD":"185640","horasRealizadas":26.3,"pctHoras":87.6},{"id":"cli_185823","name":"B R LIMA LTDA","cidade":"ALTAMIRA","estado":"PA","pacote":"Personalizado","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"26/01/2026","mes":"Jan26","responsavel":"ops1","horasNum":21,"criadoEm":"26/01/26","codSGD":"185823","horasRealizadas":13.2,"pctHoras":62.9},{"id":"cli_186172","name":"ELIOMAR CARLOS BONFIM SILVA","cidade":"JACUNDÁ","estado":"PA","pacote":"Domínio Start","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"28/01/2026","mes":"Jan26","responsavel":"ops6","horasNum":30,"criadoEm":"28/01/26","codSGD":"186172","horasRealizadas":24.4,"pctHoras":81.2},{"id":"cli_186455","name":"DALVAN EVANGELISTA VERAS TAVARES","cidade":"SANTARÉM","estado":"PA","pacote":"Domínio Plus","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"28/01/2026","mes":"Jan26","responsavel":"ops2","horasNum":36,"criadoEm":"28/01/26","codSGD":"186455","horasRealizadas":30.2,"pctHoras":83.9},{"id":"cli_186493","name":"T DOS SANTOS SILVA","cidade":"FLORESTA DO ARAGUAIA","estado":"PA","pacote":"Domínio Plus","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"29/01/2026","mes":"Jan26","responsavel":"ops2","horasNum":48,"criadoEm":"29/01/26","codSGD":"186493","horasRealizadas":34.3,"pctHoras":71.4},{"id":"cli_187728","name":"V. DE SOUSA MARQUES","cidade":"SANTARÉM","estado":"PA","pacote":"Domínio Plus","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"04/02/2026","mes":"Fev26","responsavel":"ops3","horasNum":42,"criadoEm":"04/02/26","codSGD":"187728","horasRealizadas":27.7,"pctHoras":65.6},{"id":"cli_190027","name":"IARA CARVALHO RODRIGUES COUTINHO","cidade":"MARABÁ","estado":"PA","pacote":"Domínio Start","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"13/02/2026","mes":"Fev26","responsavel":"root","horasNum":30,"criadoEm":"13/02/26","codSGD":"190027","horasRealizadas":24.4,"pctHoras":81.5},{"id":"cli_191426","name":"VANEILA MENDES DE OLIVEIRA MOREIRA","cidade":"GURUPI","estado":"TO","pacote":"Domínio Start","vendedor":"Denis Nunes Brauna","dataAssinatura":"24/02/2026","mes":"Fev26","responsavel":"root","horasNum":15,"criadoEm":"24/02/26","codSGD":"191426","horasRealizadas":0.7,"pctHoras":4.4},{"id":"cli_191599","name":"JOSE ILIO VIEIRA DE MELO JUNIOR","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"24/02/2026","mes":"Fev26","responsavel":"ops2","horasNum":37,"criadoEm":"24/02/26","codSGD":"191599","horasRealizadas":13.7,"pctHoras":37.1},{"id":"cli_192066","name":"FRANCISCA CHEILA MACIEL SOARES NEGRI","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"25/02/2026","mes":"Fev26","responsavel":"root","horasNum":15,"criadoEm":"25/02/26","codSGD":"192066","horasRealizadas":0.3,"pctHoras":2.1},{"id":"cli_192086","name":"C. C. VIEIRA &amp; MORAIS NETO LTDA","cidade":"CANAÃ DOS CARAJÁS","estado":"PA","pacote":"Domínio Empresarial","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"26/02/2026","mes":"Fev26","responsavel":"root","horasNum":30,"criadoEm":"26/02/26","codSGD":"192086","horasRealizadas":0.5,"pctHoras":1.6},{"id":"cli_192349","name":"MATEUS DA CONCEICAO COSTA","cidade":"ITAITUBA","estado":"PA","pacote":"Domínio Start","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"26/02/2026","mes":"Fev26","responsavel":"root","horasNum":16,"criadoEm":"26/02/26","codSGD":"192349","horasRealizadas":0.3,"pctHoras":1.9},{"id":"cli_194209","name":"L C DA SILVA CONTABILIDADE","cidade":"FORMOSO DO ARAGUAIA","estado":"TO","pacote":"Personalizado","vendedor":"Denis Nunes Brauna","dataAssinatura":"26/11/2025","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"30/03/26","codSGD":"194209","horasRealizadas":0.0,"pctHoras":0},{"id":"cli_194306","name":"ADEILTON.APP - LTDA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops5","horasNum":0,"criadoEm":"07/01/26","codSGD":"194306"},{"id":"cli_194604","name":"W. DA COSTA XAVIER","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"06/03/2026","mes":"Mar26","responsavel":"root","horasNum":49,"criadoEm":"06/03/26","codSGD":"194604","horasRealizadas":40.7,"pctHoras":83.1},{"id":"cli_195332","name":"2R SERVICOS E OBRAS LTDA","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"Denis Nunes Brauna","dataAssinatura":"10/03/2026","mes":"Mar26","responsavel":"root","horasNum":21,"criadoEm":"10/03/26","codSGD":"195332","horasRealizadas":6.6,"pctHoras":31.4},{"id":"cli_196517","name":"POLEN CONTABIL LTDA","cidade":"COLMÉIA","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"13/03/2026","mes":"Mar26","responsavel":"ops2","horasNum":51,"criadoEm":"13/03/26","codSGD":"196517","horasRealizadas":7.6,"pctHoras":14.9},{"id":"cli_196617","name":"WLLIMA SERVICO E COMERCIO LTDA","cidade":"PARAUAPEBAS","estado":"PA","pacote":"Domínio Plus","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"14/03/2026","mes":"Mar26","responsavel":"root","horasNum":38,"criadoEm":"14/03/26","codSGD":"196617","horasRealizadas":5.3,"pctHoras":14.1},{"id":"cli_196619","name":"L M M RIBEIRO CONTABILIDADE E GESTAO EMPRESARIAL","cidade":"GURUPI","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"14/03/2026","mes":"Mar26","responsavel":"root","horasNum":49,"criadoEm":"14/03/26","codSGD":"196619","horasRealizadas":6.5,"pctHoras":13.3},{"id":"cli_197469","name":"OLIVEIRA GESTAO CONTABIL E EMPRESARIAL LTDA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"25/03/26","codSGD":"197469"},{"id":"cli_200279","name":"THIAGO FERREIRA DA SILVA NASCIMENTO","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Start","vendedor":"Denis Nunes Brauna","dataAssinatura":"27/03/2026","mes":"Mar26","responsavel":"root","horasNum":24,"criadoEm":"27/03/26","codSGD":"200279","horasRealizadas":0.4,"pctHoras":1.6},{"id":"cli_200473","name":"EVOLUCAO CONTABILIDADE LTDA","cidade":"PARAGOMINAS","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"04/03/26","codSGD":"200473"},{"id":"cli_20049","name":"LUSIVANIA PEREIRA BARROS","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops5","horasNum":0,"criadoEm":"14/01/26","codSGD":"20049"},{"id":"cli_200890","name":"FABIO COSTA CUNHA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Abr26","responsavel":"root","horasNum":0,"criadoEm":"01/04/26","codSGD":"200890"},{"id":"cli_201121","name":"A. ALCOBASE S. ARAUJO CONSULTORIA CONTABIL","cidade":"ITAITUBA","estado":"PA","pacote":"Domínio Start","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"31/03/2026","mes":"Mar26","responsavel":"root","horasNum":16,"criadoEm":"31/03/26","codSGD":"201121","horasRealizadas":1.0,"pctHoras":5.9},{"id":"cli_201612","name":"LAMBERT CONTABILIDADE LTDA","cidade":"BRASIL NOVO","estado":"PA","pacote":"Domínio Plus","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"31/03/2026","mes":"Mar26","responsavel":"root","horasNum":42,"criadoEm":"31/03/26","codSGD":"201612","horasRealizadas":1.0,"pctHoras":2.4},{"id":"cli_201630","name":"RABELO ASSESSORIA E CONSULTORIA CONTABIL LIMITADA","cidade":"GURUPÁ","estado":"PA","pacote":"Domínio Start","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"31/03/2026","mes":"Mar26","responsavel":"root","horasNum":30,"criadoEm":"31/03/26","codSGD":"201630","horasRealizadas":0.2,"pctHoras":0.8},{"id":"cli_201669","name":"Q &amp; M ASSESSORIA E CONSULTORIA DE GESTAO CONTABIL LTDA","cidade":"ITAPIRATINS","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"31/03/2026","mes":"Mar26","responsavel":"root","horasNum":30,"criadoEm":"31/03/26","codSGD":"201669","horasRealizadas":0.2,"pctHoras":0.8},{"id":"cli_201818","name":"DILEIA TAVARES DA SILVA REIS","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Start","vendedor":"Denis Nunes Brauna","dataAssinatura":"01/04/2026","mes":"Abr26","responsavel":"root","horasNum":16,"criadoEm":"01/04/26","codSGD":"201818","horasRealizadas":0.7,"pctHoras":4.7},{"id":"cli_202645","name":"ARAUJO E CARVALHO CONTADORES LTDA","cidade":"PALMAS","estado":"TO","pacote":"Domínio Start","vendedor":"Denis Nunes Brauna","dataAssinatura":"06/04/2026","mes":"Abr26","responsavel":"root","horasNum":24,"criadoEm":"06/04/26","codSGD":"202645","horasRealizadas":7.3,"pctHoras":30.6},{"id":"cli_21009","name":"NC DA SILVA - ME","cidade":"GUARAÍ","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Ago25","responsavel":"ops3","horasNum":0,"criadoEm":"26/08/25","codSGD":"21009"},{"id":"cli_26206","name":"FERREIRA & TELES LTDA - ME","cidade":"REDENÇÃO","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops3","horasNum":0,"criadoEm":"12/02/26","codSGD":"26206"},{"id":"cli_26669","name":"AUTENTICA ASSESSORIA EIRELI - EPP","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Set25","responsavel":"ops5","horasNum":0,"criadoEm":"04/09/25","codSGD":"26669"},{"id":"cli_27339","name":"CLEBERSON JOSE DA FONSECA - ME","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops3","horasNum":0,"criadoEm":"03/02/26","codSGD":"27339"},{"id":"cli_27680","name":"E J DA SILVA & CIA LTDA - ME","cidade":"CONCEIÇÃO DO ARAGUAIA","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Dez25","responsavel":"ops5","horasNum":0,"criadoEm":"16/12/25","codSGD":"27680"},{"id":"cli_29216","name":"C D B DE OLIVEIRA CONTABILIDADE - ME","cidade":"XINGUARA","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops5","horasNum":0,"criadoEm":"27/01/26","codSGD":"29216"},{"id":"cli_29235","name":"P V LABRE","cidade":"TOCANTINÓPOLIS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops5","horasNum":0,"criadoEm":"12/03/26","codSGD":"29235"},{"id":"cli_31057","name":"REGIANE ANDREIA DA SILVA - ME","cidade":"ARAPOEMA","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops3","horasNum":0,"criadoEm":"15/01/26","codSGD":"31057"},{"id":"cli_31885","name":"ANASTAZILIA ROSA COELHO DE ALENCAR","cidade":"GURUPI","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops5","horasNum":0,"criadoEm":"13/03/26","codSGD":"31885"},{"id":"cli_31942","name":"FENIX ASSESSORIA &amp; GESTAO EMPRESARIAL LTDA","cidade":"PALMAS","estado":"TO","pacote":"Domínio Empresarial","vendedor":"Denis Nunes Brauna","dataAssinatura":"23/02/2026","mes":"Fev26","responsavel":"ops1","horasNum":48,"criadoEm":"23/02/26","codSGD":"31942","horasRealizadas":2.0,"pctHoras":4.2},{"id":"cli_33050","name":"GRACIELLY MARINHO COSTA","cidade":"TAGUATINGA","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops6","horasNum":0,"criadoEm":"23/02/26","codSGD":"33050"},{"id":"cli_36929","name":"SERGIO PAULO DA SILVA SOUZA","cidade":"MARABÁ","estado":"PA","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops3","horasNum":0,"criadoEm":"13/02/26","codSGD":"36929"},{"id":"cli_37260","name":"ROSILENE SANTOS DE OLIVEIRA","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Set25","responsavel":"ops4","horasNum":0,"criadoEm":"18/09/25","codSGD":"37260"},{"id":"cli_38120","name":"LUANA FERREIRA DO NASCIMENTO","cidade":"XINGUARA","estado":"PA","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops3","horasNum":0,"criadoEm":"24/02/26","codSGD":"38120"},{"id":"cli_38765","name":"ALDAY MACHADO DE OLIVEIRA","cidade":"ARAGUATINS","estado":"TO","pacote":"Domínio Start","vendedor":"Denis Nunes Brauna","dataAssinatura":"28/11/2025","mes":"Nov25","responsavel":"ops2","horasNum":31,"criadoEm":"28/11/25","codSGD":"38765","horasRealizadas":8.5,"pctHoras":27.5},{"id":"cli_41366","name":"CONTROLL CONTABILIDADE LTDA","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops4","horasNum":0,"criadoEm":"31/03/26","codSGD":"41366"},{"id":"cli_41588","name":"NARA RUBIA COSTA DE SOUSA","cidade":"SÃO FÉLIX DO XINGU","estado":"PA","pacote":"Domínio Start","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"17/03/2026","mes":"Mar26","responsavel":"root","horasNum":16,"criadoEm":"17/03/26","codSGD":"41588","horasRealizadas":0.7,"pctHoras":4.5},{"id":"cli_41664","name":"ALDECI DOS SANTOS DUTRA","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops4","horasNum":0,"criadoEm":"10/02/26","codSGD":"41664"},{"id":"cli_42823","name":"MOURA CONSULTORIA CONTABIL E EMPRESARIAL LTDA - ME","cidade":"CANAÃ DOS CARAJÁS","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops5","horasNum":0,"criadoEm":"30/03/26","codSGD":"42823"},{"id":"cli_43070","name":"CONTABILIDADE RAMBO LTDA","cidade":"LAGOA DA CONFUSÃO","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Abr26","responsavel":"ops5","horasNum":0,"criadoEm":"06/04/26","codSGD":"43070"},{"id":"cli_43083","name":"ELIMARCER FERNANDES COSTA","cidade":"REDENÇÃO","estado":"PA","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops3","horasNum":0,"criadoEm":"30/01/26","codSGD":"43083"},{"id":"cli_43283","name":"JANAINA DE SOUZA NUNES","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"Denis Nunes Brauna","dataAssinatura":"08/01/2026","mes":"Jan26","responsavel":"ops4","horasNum":15,"criadoEm":"28/01/26","codSGD":"43283","horasRealizadas":0.3,"pctHoras":1.9},{"id":"cli_44936","name":"MARIA ISABEL GALVAO MARQUES","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops3","horasNum":0,"criadoEm":"04/02/26","codSGD":"44936"},{"id":"cli_47562","name":"PLANEJ CONTABILIDADE S/S - EPP","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops5","horasNum":0,"criadoEm":"18/03/26","codSGD":"47562"},{"id":"cli_47644","name":"PATAUA FLORESTAL LTDA SPE","cidade":"ITAITUBA","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Abr26","responsavel":"ops4","horasNum":0,"criadoEm":"06/04/26","codSGD":"47644"},{"id":"cli_48298","name":"A MARTINS PEREIRA ME","cidade":"GUARAÍ","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops4","horasNum":0,"criadoEm":"18/02/26","codSGD":"48298"},{"id":"cli_50220","name":"BELLY THERESE JABLONSKI","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops5","horasNum":0,"criadoEm":"11/02/26","codSGD":"50220"},{"id":"cli_53333","name":"GABANA ASSESSORIA CONTABIL LTDA","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"06/03/26","codSGD":"53333"},{"id":"cli_53339","name":"NORMANDES FERREIRA CARVALHO","cidade":"DIANÓPOLIS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops5","horasNum":0,"criadoEm":"18/03/26","codSGD":"53339"},{"id":"cli_54302","name":"ANDRE LUIZ DE SOUZA FRANCA","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops1","horasNum":0,"criadoEm":"26/02/26","codSGD":"54302"},{"id":"cli_54639","name":"RICARDO NERY DA SILVA FERREIRA","cidade":"SÃO FÉLIX DO XINGU","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Abr26","responsavel":"ops5","horasNum":0,"criadoEm":"07/04/26","codSGD":"54639"},{"id":"cli_54801","name":"MOREIRA & PORTILHO SERVICOS CONTABEIS LTDA","cidade":"TUCURUÍ","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops6","horasNum":0,"criadoEm":"30/01/26","codSGD":"54801"},{"id":"cli_55151","name":"CONTABILIDADE RONDON LTDA","cidade":"RONDON DO PARÁ","estado":"PA","pacote":"Domínio Plus","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"02/04/2025","mes":"Fev26","responsavel":"ops3","horasNum":42,"criadoEm":"27/02/26","codSGD":"55151","horasRealizadas":62.6,"pctHoras":149.0},{"id":"cli_55981","name":"ISRAEL DIAS DE JESUS","cidade":"PRAINHA","estado":"PA","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"root","horasNum":0,"criadoEm":"04/03/26","codSGD":"55981"},{"id":"cli_57442","name":"DOZE AVOS ASSESSORIA CONTABIL LTDA","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Abr26","responsavel":"ops4","horasNum":0,"criadoEm":"02/04/26","codSGD":"57442"},{"id":"cli_58016","name":"MARREIRO CONSULTORIA CONTABIL LTDA","cidade":"CONCEIÇÃO DO ARAGUAIA","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Abr26","responsavel":"ops2","horasNum":0,"criadoEm":"06/04/26","codSGD":"58016"},{"id":"cli_60820","name":"PIRES CONTABILIDADE ASSESSORIA E CONSULTORIA LTDA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Nov25","responsavel":"ops3","horasNum":0,"criadoEm":"26/11/25","codSGD":"60820"},{"id":"cli_61279","name":"S MARTINELLI GESTAO CONTABIL LTDA","cidade":"TOMÉ-AÇU","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"31/03/26","codSGD":"61279"},{"id":"cli_61348","name":"APLICA CONTABILIDADE LTDA","cidade":"ALVORADA","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"03/03/26","codSGD":"61348"},{"id":"cli_61627","name":"MICHAEL HEBER SOUSA E SOUSA","cidade":"REDENÇÃO","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Abr26","responsavel":"ops3","horasNum":0,"criadoEm":"07/04/26","codSGD":"61627"},{"id":"cli_68386","name":"EUCILEIA DE LIMA SILVEIRA","cidade":"PARAUAPEBAS","estado":"PA","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"root","horasNum":0,"criadoEm":"13/02/26","codSGD":"68386"},{"id":"cli_71580","name":"VARG CONTABILIDADE E GESTAO LTDA","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops3","horasNum":0,"criadoEm":"30/01/26","codSGD":"71580"},{"id":"cli_71714","name":"VETOR INTELIGENCIA CONTABIL LTDA","cidade":"GURUPI","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops6","horasNum":0,"criadoEm":"12/02/26","codSGD":"71714"},{"id":"cli_72121","name":"VICENTE DE PAULO SILVEIRA JUNIOR","cidade":"MARABÁ","estado":"PA","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops5","horasNum":0,"criadoEm":"06/02/26","codSGD":"72121"},{"id":"cli_74302","name":"AZZ CONTABILIDADE E SERVICOS ADMINISTRATIVOS LTDA","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"18/03/26","codSGD":"74302"},{"id":"cli_74602","name":"JULIANA HONORIO DA SILVA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"13/03/26","codSGD":"74602"},{"id":"cli_75185","name":"RICARDO CONCEICAO NEVES","cidade":"GURUPI","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Nov25","responsavel":"ops3","horasNum":0,"criadoEm":"28/11/25","codSGD":"75185"},{"id":"cli_80782","name":"CITIUS CONTABILIDADE LTDA","cidade":"PALMEIRAS DO TOCANTINS","estado":"TO","pacote":"Domínio Start","vendedor":"Denis Nunes Brauna","dataAssinatura":"25/03/2026","mes":"Mar26","responsavel":"root","horasNum":0,"criadoEm":"25/03/26","codSGD":"80782","horasRealizadas":0.1,"pctHoras":0},{"id":"cli_80948","name":"WARLLEY ALENCAR SOARES","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Abr26","responsavel":"ops4","horasNum":0,"criadoEm":"06/04/26","codSGD":"80948"},{"id":"cli_81268","name":"ESSENCIAL CONTABILIDADE & ASSESSORIA EIRELI","cidade":"BREU BRANCO","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops6","horasNum":0,"criadoEm":"11/02/26","codSGD":"81268"},{"id":"cli_83015","name":"RESULT ASSESSORIA E CONSULTORIA CONTABIL LTDA","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Dez25","responsavel":"ops4","horasNum":0,"criadoEm":"09/12/25","codSGD":"83015"},{"id":"cli_83112","name":"COSTA GOMES ASSESSORIA CONTABIL EIRELI","cidade":"GURUPI","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops3","horasNum":0,"criadoEm":"20/02/26","codSGD":"83112"},{"id":"cli_84738","name":"MORETZ SOHN E MOURA LTDA","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops3","horasNum":0,"criadoEm":"06/02/26","codSGD":"84738"},{"id":"cli_85578","name":"NUCLEO CONTABIL LTDA","cidade":"PALMAS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Abr26","responsavel":"ops5","horasNum":0,"criadoEm":"06/04/26","codSGD":"85578"},{"id":"cli_86292","name":"CONNECT ASSESSORIA EMPRESARIAL LTDA","cidade":"PALMAS","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mai25","responsavel":"ops3","horasNum":0,"criadoEm":"29/05/25","codSGD":"86292"},{"id":"cli_86578","name":"TIMOTHEO CONTABILIDADE CONSULTIVA LTDA","cidade":"ITAITUBA","estado":"PA","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops1","horasNum":0,"criadoEm":"18/02/26","codSGD":"86578"},{"id":"cli_87856","name":"AGRO SERINGUEIRA TOCANTINS LTDA","cidade":"PALMEIRÓPOLIS","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops2","horasNum":0,"criadoEm":"20/02/26","codSGD":"87856"},{"id":"cli_90347","name":"ROSA MARIA PRUDENTE SOARES","cidade":"SENADOR JOSE PORFIRIO","estado":"PA","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"27/03/26","codSGD":"90347"},{"id":"cli_90910","name":"CARDOSO E PEREIRA GESTAO EMPRESARIAL E CONTABIL EIRELI","cidade":"ALTAMIRA","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops5","horasNum":0,"criadoEm":"14/01/26","codSGD":"90910"},{"id":"cli_91306","name":"NILZA ALVES DO NASCIMENTO","cidade":"GURUPI","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"09/03/26","codSGD":"91306"},{"id":"cli_91613","name":"R E DE A MARINHO","cidade":"GURUPI","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops3","horasNum":0,"criadoEm":"18/03/26","codSGD":"91613"},{"id":"cli_91632","name":"EVERGISTO SOUSA MARTINS JUNIOR","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops5","horasNum":0,"criadoEm":"19/02/26","codSGD":"91632"},{"id":"cli_91718","name":"NR GESTAO EMPRESARIAL LTDA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"root","horasNum":0,"criadoEm":"31/03/26","codSGD":"91718"},{"id":"cli_92233","name":"D & G CONTABILIDADE & CONSULTORIA EIRELI","cidade":"CANAÃ DOS CARAJÁS","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Mar26","responsavel":"ops2","horasNum":0,"criadoEm":"05/03/26","codSGD":"92233"},{"id":"cli_92303","name":"R. F. VALVERDE LTDA","cidade":"PARAGOMINAS","estado":"PA","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Nov25","responsavel":"ops3","horasNum":0,"criadoEm":"28/11/25","codSGD":"92303"},{"id":"cli_92688","name":"O. C. FONSECA","cidade":"MARABÁ","estado":"PA","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Fev24","responsavel":"ops5","horasNum":0,"criadoEm":"14/02/24","codSGD":"92688"},{"id":"cli_93406","name":"MARIA HELENA BATISTA DA SILVA LTDA","cidade":"PLACAS","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops2","horasNum":0,"criadoEm":"29/01/26","codSGD":"93406"},{"id":"cli_93513","name":"TIC'S GESTAO E CONSULTORIA TRIBUTARIA LTDA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Abr26","responsavel":"ops4","horasNum":0,"criadoEm":"06/04/26","codSGD":"93513"},{"id":"cli_94138","name":"I. RIBEIRO DE OLIVEIRA","cidade":"PARAUAPEBAS","estado":"PA","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Fev26","responsavel":"ops4","horasNum":0,"criadoEm":"27/02/26","codSGD":"94138"},{"id":"cli_94573","name":"R. R. DANTAS VIANA LTDA","cidade":"ARAGUAÍNA","estado":"TO","pacote":"Personalizado","vendedor":"","dataAssinatura":"","mes":"Jan26","responsavel":"ops5","horasNum":0,"criadoEm":"12/01/26","codSGD":"94573"},{"id":"cli_9586","name":"DIOGO ANDRADE COSTA","cidade":"PORTO NACIONAL","estado":"TO","pacote":"Domínio Plus","vendedor":"","dataAssinatura":"","mes":"Out25","responsavel":"ops3","horasNum":0,"criadoEm":"30/10/25","codSGD":"9586"},{"id":"cli_182984","name":"ALEXANDRE FILHO PEREIRA DE ABREU","cidade":"","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"13/01/2026","mes":"","responsavel":null,"horasNum":16,"horasRealizadas":1.9,"pctHoras":11.4,"criadoEm":"13/01/2026","codSGD":"182984"},{"id":"cli_182989","name":"ARTHUR PEDREIRA THOMAZ MAYA","cidade":"","estado":"TO","pacote":"Domínio Plus","vendedor":"Denis Nunes Brauna","dataAssinatura":"13/01/2026","mes":"","responsavel":null,"horasNum":16,"horasRealizadas":0.3,"pctHoras":1.8,"criadoEm":"13/01/2026","codSGD":"182989"},{"id":"cli_186649","name":"CERNECON SOLUCOES CONTABEIS LTDA","cidade":"","estado":"PA","pacote":"Domínio Start","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"29/01/2026","mes":"","responsavel":null,"horasNum":30,"horasRealizadas":0.3,"pctHoras":1.1,"criadoEm":"29/01/2026","codSGD":"186649"},{"id":"cli_186059","name":"ELANE ALVES SOUSA","cidade":"","estado":"TO","pacote":"Domínio Start","vendedor":"Denis Nunes Brauna","dataAssinatura":"27/01/2026","mes":"","responsavel":null,"horasNum":26,"horasRealizadas":0.1,"pctHoras":0.5,"criadoEm":"27/01/2026","codSGD":"186059"},{"id":"cli_178536","name":"F R ANDREACCI LTDA","cidade":"","estado":"PA","pacote":"Domínio Plus","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"06/01/2026","mes":"","responsavel":null,"horasNum":16,"horasRealizadas":1.1,"pctHoras":7.1,"criadoEm":"06/01/2026","codSGD":"178536"},{"id":"cli_181723","name":"MARILZA CAMILO DA SILVA","cidade":"","estado":"PA","pacote":"Domínio Start","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"06/01/2026","mes":"","responsavel":null,"horasNum":17,"horasRealizadas":1.7,"pctHoras":9.8,"criadoEm":"06/01/2026","codSGD":"181723"},{"id":"cli_190290","name":"ALARICE PEREIRA DOS SANTOS","cidade":"","estado":"PA","pacote":"Domínio Start","vendedor":"Marcelo da Rocha Bezerra","dataAssinatura":"18/02/2026","mes":"","responsavel":null,"horasNum":15,"horasRealizadas":2.5,"pctHoras":17,"criadoEm":"18/02/2026","codSGD":"190290"},{"id":"cli_204382","name":"E M DA CONCEICAO CONTABILIDADE E APOIO ADMINISTRATIVO","cidade":"","estado":"TO","pacote":"Domínio Start","vendedor":"Denis Nunes Brauna","dataAssinatura":"13/04/2026","mes":"","responsavel":null,"horasNum":24,"horasRealizadas":0.0,"pctHoras":0,"criadoEm":"13/04/2026","codSGD":"204382"},{"id":"cli_19175","name":"EDMILSON S. C. SALAME","cidade":"","estado":"TO","pacote":"Domínio Start","vendedor":"Denis Nunes Brauna","dataAssinatura":"10/04/2026","mes":"","responsavel":null,"horasNum":24,"horasRealizadas":0.0,"pctHoras":0,"criadoEm":"10/04/2026","codSGD":"19175"},{"id":"cli_204409","name":"OTIMIZA CONTABILIDADE E CONSULTORIA LTDA","cidade":"","estado":"PA","pacote":"Domínio Plus","vendedor":"Claudivan da Silva Sousa","dataAssinatura":"13/04/2026","mes":"","responsavel":null,"horasNum":42,"horasRealizadas":0.0,"pctHoras":0,"criadoEm":"13/04/2026","codSGD":"204409"}]`)
const SEED_PACKAGES = [
  { id:"start",        name:"Domínio Start",       horas:30, valorHora:0, descAtivo:false, descPct:0 },
  { id:"plus",         name:"Domínio Plus",        horas:42, valorHora:0, descAtivo:false, descPct:0 },
  { id:"premium",      name:"Domínio Premium",     horas:56, valorHora:0, descAtivo:false, descPct:0 },
  { id:"empresarial",  name:"Domínio Empresarial", horas:90, valorHora:0, descAtivo:false, descPct:0 },
  { id:"personalizado",name:"Personalizado",       horas:0,  valorHora:0, descAtivo:false, descPct:0 },
  { id:"adendodw",     name:"Adendo DW",           horas:0,  valorHora:0, descAtivo:false, descPct:0 },
]
const pkgPreco = (pkg) => {
  const bruto = pkg.horas * pkg.valorHora
  if (!pkg.descAtivo || pkg.descPct <= 0) return bruto
  return bruto * (1 - pkg.descPct / 100)
}

const SEED_TABELA_PRECOS = [
  {id:'tp1',  produto:'Domínio Plus',       usuarios:1,  valor:390.00, horasTreino:30, vlTreino:1050.00, limDesconto:5},
  {id:'tp2',  produto:'Domínio Plus',       usuarios:2,  valor:445.00, horasTreino:32, vlTreino:1120.00, limDesconto:5},
  {id:'tp3',  produto:'Domínio Plus',       usuarios:3,  valor:614.00, horasTreino:36, vlTreino:1260.00, limDesconto:5},
  {id:'tp4',  produto:'Domínio Plus',       usuarios:4,  valor:750.00, horasTreino:40, vlTreino:1400.00, limDesconto:5},
  {id:'tp5',  produto:'Domínio Plus',       usuarios:5,  valor:870.00, horasTreino:44, vlTreino:1540.00, limDesconto:5},
  {id:'ts1',  produto:'Domínio Start',      usuarios:1,  valor:290.00, horasTreino:20, vlTreino:700.00,  limDesconto:5},
  {id:'ts2',  produto:'Domínio Start',      usuarios:2,  valor:340.00, horasTreino:24, vlTreino:840.00,  limDesconto:5},
  {id:'ts3',  produto:'Domínio Start',      usuarios:3,  valor:480.00, horasTreino:28, vlTreino:980.00,  limDesconto:5},
  {id:'te1',  produto:'Domínio Empresarial',usuarios:1,  valor:590.00, horasTreino:40, vlTreino:1400.00, limDesconto:10},
  {id:'te2',  produto:'Domínio Empresarial',usuarios:2,  valor:720.00, horasTreino:44, vlTreino:1540.00, limDesconto:10},
  {id:'te3',  produto:'Domínio Empresarial',usuarios:3,  valor:890.00, horasTreino:50, vlTreino:1750.00, limDesconto:10},
  {id:'te4',  produto:'Domínio Empresarial',usuarios:4,  valor:1050.00,horasTreino:56, vlTreino:1960.00, limDesconto:10},
  {id:'te5',  produto:'Domínio Empresarial',usuarios:5,  valor:1200.00,horasTreino:60, vlTreino:2100.00, limDesconto:10},
  {id:'tpr1', produto:'Domínio Premium',    usuarios:1,  valor:480.00, horasTreino:36, vlTreino:1260.00, limDesconto:5},
  {id:'tpr2', produto:'Domínio Premium',    usuarios:2,  valor:580.00, horasTreino:40, vlTreino:1400.00, limDesconto:5},
  {id:'tpr3', produto:'Domínio Premium',    usuarios:3,  valor:720.00, horasTreino:44, vlTreino:1540.00, limDesconto:5},
  {id:'tpe1', produto:'Personalizado',      usuarios:0,  valor:0,      horasTreino:0,  vlTreino:0,       limDesconto:20},
]

const VAL_STATUS = {
  aguardando: { label:"Aguardando validação", color:"bg-amber-100 text-amber-700 border-amber-200",    icon:"⏳" },
  aprovado:   { label:"Aprovado",             color:"bg-emerald-100 text-emerald-700 border-emerald-200", icon:"✅" },
  reprovado:  { label:"Em observação",            color:"bg-red-100 text-red-700 border-red-200",           icon:"🔍" },
}

const SEED_STATUS_IMPLANTACAO = [
  { id:"si_1", nome:"Na fila",       tipo:"andamento", cor:"#7c3aed", ordem:1, ativo:true },
  { id:"si_2", nome:"Em andamento",  tipo:"andamento", cor:"#2563eb", ordem:2, ativo:true },
  { id:"si_3", nome:"Em risco",      tipo:"alerta",    cor:"#dc2626", ordem:3, ativo:true },
  { id:"si_4", nome:"Aguardando cliente", tipo:"alerta", cor:"#d97706", ordem:4, ativo:true },
  { id:"si_5", nome:"Realizado",     tipo:"concluido", cor:"#059669", ordem:5, ativo:true },
  { id:"si_6", nome:"Cancelado",     tipo:"concluido", cor:"#6b7280", ordem:6, ativo:true },
]

const ANOT_TIPOS = {
  "T&I":             { color:"bg-blue-100 text-blue-700 border-blue-200",    icon:"📘", sub:["Primeiro Contato","Checkpoint","Checkout","Treinamento","Go Live","Retrabalho","Entrevista Final","Desacordo","Treinamento Extra","Encerramento"] },
  "Feedback Técnico":{ color:"bg-purple-100 text-purple-700 border-purple-200",icon:"⭐", sub:["Bom","Regular","Ruim","Excelente","Crítico"] },
  "Ações":           { color:"bg-teal-100 text-teal-700 border-teal-200",    icon:"⚡", sub:["WhatsApp","E-mail","Ligação","Visita","Reunião Online","Ticket SGD"] },
  "Apoios":          { color:"bg-amber-100 text-amber-700 border-amber-200", icon:"🎧", sub:["CS","Comercial","Ops","Diretoria","Suporte N2"] },
  "Comercial":       { color:"bg-rose-100 text-rose-700 border-rose-200",    icon:"🛒", sub:["Adendo","Cancelamento","Renovação","Upsell","Reclamação"] },
}

const fmtR = (v) => (v || 0).toLocaleString("pt-BR", { minimumFractionDigits:2, maximumFractionDigits:2 })
const nowDate = () => new Date().toLocaleDateString("pt-BR")
const nowDT   = () => new Date().toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})
const safeText = (value, fallback = "-") => (value?.toString().trim() ? value : fallback)

// ══════════ FEATURE FLAGS ══════════
const FEATURES = {
  comissoes: false, // Desabilitado - funcionalidade em desenvolvimento
}

function NavBtn({ icon, label, active, onClick, locked, badge }) {
  if (locked) return null
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors
        ${active ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}>
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] text-center">{badge}</span>}
    </button>
  )
}

// ═════�����������════ PAGINA DE CLIENTES (COMPONENTE SEPARADO) ══════════
function PageClientes({ clients, showConcluidos, setShowConcluidos, isFinalizado, isTecnico, isExecMgr, user, search, setSearch, goPage, setCadTab, setModalAnot, setModalImpl, setImplForm, setSelClient, anotacoes, pBar, clientSitBadge }) {
  // Paginacao para performance em listas grandes
  const PAGE_SIZE = 50
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  
  // Helper para verificar se cliente esta concluido/finalizado
  const isConcluido = (clienteId) => {
    const result = isFinalizado(clienteId)
    if (typeof result === 'boolean') return result
    if (result?.isFinal) return result.isFinal
    return false
  }
  
  // Filtros diretos (sem useMemo excessivo para evitar render loops)
  const clientesAtivos = clients.filter(c => !isConcluido(c.id))
  const clientesConcluidos = clients.filter(c => isConcluido(c.id))
  
  // Lista base depende do toggle
  const listaBase = showConcluidos ? clients : clientesAtivos
  
  // Filtra por tecnico e busca
  const isTec = isTecnico()
  const userId = user?.id
  const term = (search || '').trim().toLowerCase()
  
  const clientesFiltrados = listaBase.filter(c => {
    if (isTec && c.responsavel !== userId) return false
    if (!term) return true
    return (
      (c.name || '').toLowerCase().includes(term) || 
      (c.codSGD || '').toLowerCase().includes(term) ||
      (c.id || '').toLowerCase().includes(term)
    )
  })

  // Paginacao: lista visivel limitada
  const clientesVisiveis = clientesFiltrados.slice(0, visibleCount)

  // Contadores
  const totalConcluidos = clientesConcluidos.length
  const totalExibidos = clientesFiltrados.length
  const hasMore = visibleCount < totalExibidos

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-gray-500">
            {totalExibidos} de {listaBase.length} {showConcluidos ? 'cliente(s)' : 'em andamento'}
            {!showConcluidos && totalConcluidos > 0 && (
              <span className="text-gray-400"> | {totalConcluidos} concluido(s)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showConcluidos} 
              onChange={e => setShowConcluidos(e.target.checked)} 
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Mostrar concluidos ({totalConcluidos})
          </label>
          {isExecMgr() && (
            <button onClick={() => { goPage("cadastros"); setCadTab("validacao") }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
              <Plus className="w-4 h-4"/> Novo
            </button>
          )}
        </div>
      </div>

      {clientesFiltrados.length === 0 ? (
        <div className="bg-white border rounded-xl p-14 text-center">
          <Users className="w-14 h-14 mx-auto text-gray-200 mb-4"/>
          <h2 className="font-semibold text-gray-500">
            {search ? 'Nenhum cliente encontrado' : showConcluidos ? 'Nenhum cliente cadastrado' : 'Nenhum cliente em andamento'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {search ? 'Tente buscar com outros termos.' : showConcluidos ? 'Va em Cadastros - Validacao de Contratos para adicionar.' : 'Todos os clientes foram finalizados ou marque "Mostrar concluidos".'}
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nome ou codigo..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {["ID", "Cliente", "Pacote", "Vendedor", "Progresso", "Situacao", "Notas", ""].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-[10px] uppercase text-gray-400 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientesVisiveis.map((c) => (
                  <tr key={`cli-${c.id}`} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-[10px] font-mono text-gray-500 whitespace-nowrap">{c.codSGD || c.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{c.name?.substring(0, 28)}</td>
                    <td className="px-4 py-3 text-xs">{c.pacote || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{c.vendedor || "—"}</td>
                    <td className="px-4 py-3">{pBar(c.pct)}</td>
                    <td className="px-4 py-3">{clientSitBadge(c.id)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setModalAnot(c.id)} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] hover:bg-blue-100">
                        <MessageCircle className="w-3 h-3"/>{(anotacoes[c.id] || []).length}
                      </button>
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <button onClick={() => { setModalImpl(c.id); setImplForm({ status: '', primeiroContato: '', checkout: '', comentario: '', tipo: 'Checkpoint' }) }} className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] hover:bg-emerald-100">
                        <Wrench className="w-3 h-3"/> Gestao
                      </button>
                      <button onClick={() => setSelClient(c)} className="p-1 hover:bg-gray-200 rounded">
                        <Eye className="w-4 h-4 text-gray-400"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Botao para carregar mais */}
          {hasMore && (
            <div className="p-4 border-t text-center">
              <button 
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Carregar mais ({totalExibidos - visibleCount} restantes)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function KPI({ label, value, c = "blue", sub, icon }) {
  const colors = {
    blue:   { border:"border-l-blue-500",    bg:"bg-blue-50",    text:"text-blue-600" },
    green:  { border:"border-l-emerald-500", bg:"bg-emerald-50", text:"text-emerald-600" },
    red:    { border:"border-l-red-500",     bg:"bg-red-50",     text:"text-red-600" },
    amber:  { border:"border-l-amber-500",   bg:"bg-amber-50",   text:"text-amber-600" },
    teal:   { border:"border-l-teal-500",    bg:"bg-teal-50",    text:"text-teal-600" },
    violet: { border:"border-l-violet-500",  bg:"bg-violet-50",  text:"text-violet-600" },
    gray:   { border:"border-l-gray-400",    bg:"bg-gray-50",    text:"text-gray-500" },
  }
  const color = colors[c] || colors.blue
  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color.border} p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
          {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
        </div>
        {icon && <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center ${color.text}`}>{icon}</div>}
      </div>
    </div>
  )
}

function Modal({ children, onClose, maxW = "max-w-2xl" }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl w-full ${maxW} max-h-[90vh] overflow-auto shadow-2xl`}>
        {children}
      </div>
    </div>
  )
}

function StatusImplantacaoPanel({ statusList, setStatusList, toast, clients, fasesImplantacao, setFaseCliente, getFaseCliente }) {
  const TIPO_OPTS_LOCAL = [
    { v:"andamento", l:"Andamento",  icon:"🔵" },
    { v:"alerta",    l:"Alerta",     icon:"🟡" },
    { v:"concluido", l:"Concluído",  icon:"🟢" },
  ]

  // Opcoes para os selects das fases
  const PB_OPTS = ["Em Andamento","Realizado","Pendente","Nao Realizada","Nao tem PB","Sem Resposta","ImplantacaoDW"]
  const CONTATO_OPTS = ["Em Andamento","Realizado","Pendente","Nao Realizada","Nao tem PB","Sem Resposta","AdendoDW"]
  const ONBOARDING_OPTS = ["Realizado","Nao Realizado","Pendente","Realizado/Dificuldades","Problematico","Com Reclamacoes","AdendoDW","Sem Treinamento"]
  const IMPLANTACAO_OPTS = ["Em Andamento","ProcessoDW","Realizada","Apoio","Sem Treinamento","Aguardando","Sem Resposta","Sem Data","Em Conversao"]
  const MODULOS_OPTS = ["Folha","Fiscal","Contabil","Acompanhamento","Messenger","Processos","Busca","NF-e","Kolossus","Portal Empregado","Portal Cliente","Outros"]
  const CHECK_OPTS = ["Realizado","Nao Realizado","Em Andamento","Pendente","Risco","Montar Acao","Sem Treinamento","Aguardo"]
  const RESPONSAVEL_OPTS = ["CS","OPS"]
  const PRODUTOS_OPTS = ["Dominio Start","Dominio Plus","Dominio Premium","Dominio Empresarial","Personalizado"]

  const [panelTab, setPanelTab] = useState("fases") // "fases" | "config"
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [faseTab, setFaseTab] = useState(1) // 1, 2, 3
  const [searchCliente, setSearchCliente] = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem,  setEditItem]  = useState(null)
  const emptyForm = { nome:"", tipo:"andamento", cor:"#2563eb", ordem:99, ativo:true }
  const [form, setForm] = useState(emptyForm)

  const openNew  = () => { setForm(emptyForm); setEditItem(null); setModalOpen(true) }
  const openEdit = (s) => { if (!s) return; setForm({...s}); setEditItem(s.id); setModalOpen(true) }

  const salvar = () => {
    if (!form.nome || !form.nome.trim()) { toast && toast("Informe o nome do status", "red"); return }
    if (editItem) {
      setStatusList(p => (Array.isArray(p) ? p : []).map(s => s.id===editItem ? {...form, id:editItem} : s))
      toast && toast("Status atualizado!", "green")
    } else {
      const newId = "si_" + Date.now()
      setStatusList(p => [...(Array.isArray(p) ? p : []), {...form, id:newId}])
      toast && toast("Status criado!", "green")
    }
    setModalOpen(false)
  }

  const toggleAtivo = (id) => {
    setStatusList(p => (Array.isArray(p) ? p : []).map(s => s.id===id ? {...s, ativo:!s.ativo} : s))
  }

  const safeList = Array.isArray(statusList) ? statusList : []
  const sorted   = [...safeList].sort((a,b) => (a.ordem||0) - (b.ordem||0))

  const tipoLabel = (t) => {
    if (!t) return "—"
    const match = TIPO_OPTS_LOCAL.find(o => o && o.v === t)
    return match ? match.l : String(t)
  }

  const tipoBadge = (t) => {
    const safe = t || ""
    const cls = safe === "concluido" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
               : safe === "alerta"   ? "bg-amber-100 text-amber-700 border-amber-200"
                                     : "bg-blue-100 text-blue-700 border-blue-200"
    return <span className={"px-2 py-0.5 rounded border text-[10px] font-semibold " + cls}>{tipoLabel(safe)}</span>
  }

  // Validacao de fases
  const fase1Completa = (cli) => {
    const f = getFaseCliente(cli)
    return f.dataEntrada && f.pbComercial && f.pbTecnico && f.primeiroContatoStatus && f.onboardingStatus && f.implantacaoStatus
  }
  const fase2Completa = (cli) => {
    const f = getFaseCliente(cli)
    return fase1Completa(cli) && f.check1Status === "Realizado" && f.check2Status === "Realizado" && f.dataFim
  }

  // Resumo de fases
  const clientesList = Array.isArray(clients) ? clients : []
  const filteredClientes = clientesList.filter(c => 
    !searchCliente || c.name?.toLowerCase().includes(searchCliente.toLowerCase()) || c.codSGD?.includes(searchCliente)
  )
  
  const resumoFases = {
    fase1: clientesList.filter(c => {
      const f = getFaseCliente(c.id)
      return f.dataEntrada && !fase1Completa(c.id)
    }).length,
    fase2: clientesList.filter(c => fase1Completa(c.id) && !fase2Completa(c.id)).length,
    fase3: clientesList.filter(c => fase2Completa(c.id)).length,
    concluidos: clientesList.filter(c => getFaseCliente(c.id).concluido).length,
  }

  const faseAtualCliente = (cli) => {
    const f = getFaseCliente(cli)
    if (f.concluido) return "Concluido"
    if (fase2Completa(cli)) return "Fase 3"
    if (fase1Completa(cli)) return "Fase 2"
    if (f.dataEntrada) return "Fase 1"
    return "Nao iniciado"
  }

  const faseColor = (fase) => {
    if (fase === "Concluido") return "bg-emerald-100 text-emerald-700"
    if (fase === "Fase 3") return "bg-violet-100 text-violet-700"
    if (fase === "Fase 2") return "bg-blue-100 text-blue-700"
    if (fase === "Fase 1") return "bg-amber-100 text-amber-700"
    return "bg-gray-100 text-gray-500"
  }

  const selectedFase = selectedCliente ? getFaseCliente(selectedCliente) : null
  const canEditFase2 = selectedCliente && fase1Completa(selectedCliente)
  const canEditFase3 = selectedCliente && fase2Completa(selectedCliente)

  const updateFase = (field, value) => {
    if (!selectedCliente) return
    setFaseCliente(selectedCliente, { [field]: value })
  }

  const toggleModulo = (mod) => {
    if (!selectedCliente) return
    const current = selectedFase?.modulos || []
    const updated = current.includes(mod) ? current.filter(m => m !== mod) : [...current, mod]
    setFaseCliente(selectedCliente, { modulos: updated })
  }

  const toggleProduto = (prod) => {
    if (!selectedCliente) return
    const current = selectedFase?.produtos || []
    const updated = current.includes(prod) ? current.filter(p => p !== prod) : [...current, prod]
    setFaseCliente(selectedCliente, { produtos: updated })
  }

  // Render Fase 1
  const renderFase1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Data de Entrada *</label>
          <input type="date" value={selectedFase?.dataEntrada || ""} onChange={e => updateFase("dataEntrada", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Horas Contratadas</label>
          <input type="number" min="0" value={selectedFase?.horasContratadas || 0} onChange={e => updateFase("horasContratadas", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Produtos</label>
        <div className="flex flex-wrap gap-2">
          {PRODUTOS_OPTS.map(p => (
            <button key={p} onClick={() => toggleProduto(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${(selectedFase?.produtos || []).includes(p) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">PB Comercial *</label>
          <select value={selectedFase?.pbComercial || ""} onChange={e => updateFase("pbComercial", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
            <option value="">Selecione...</option>
            {PB_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">PB Tecnico *</label>
          <select value={selectedFase?.pbTecnico || ""} onChange={e => updateFase("pbTecnico", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
            <option value="">Selecione...</option>
            {PB_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Primeiro Contato *</label>
          <select value={selectedFase?.primeiroContatoStatus || ""} onChange={e => updateFase("primeiroContatoStatus", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
            <option value="">Selecione...</option>
            {CONTATO_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Data Primeiro Contato</label>
          <input type="date" value={selectedFase?.dataPrimeiroContato || ""} onChange={e => updateFase("dataPrimeiroContato", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Onboarding *</label>
          <select value={selectedFase?.onboardingStatus || ""} onChange={e => updateFase("onboardingStatus", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
            <option value="">Selecione...</option>
            {ONBOARDING_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Data Onboarding</label>
          <input type="date" value={selectedFase?.dataOnboarding || ""} onChange={e => updateFase("dataOnboarding", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Status Implantacao *</label>
        <select value={selectedFase?.implantacaoStatus || ""} onChange={e => updateFase("implantacaoStatus", e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
          <option value="">Selecione...</option>
          {IMPLANTACAO_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  )

  // Render Fase 2
  const renderFase2 = () => (
    <div className="space-y-4">
      {!canEditFase2 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-700 font-medium">Complete a Fase 1 para desbloquear esta etapa.</p>
        </div>
      )}
      <div className={!canEditFase2 ? "opacity-50 pointer-events-none" : ""}>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Modulos</label>
          <div className="flex flex-wrap gap-2">
            {MODULOS_OPTS.map(m => (
              <button key={m} onClick={() => toggleModulo(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${(selectedFase?.modulos || []).includes(m) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Check 1 Status *</label>
            <select value={selectedFase?.check1Status || ""} onChange={e => updateFase("check1Status", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
              <option value="">Selecione...</option>
              {CHECK_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Data Check 1</label>
            <input type="date" value={selectedFase?.dataCheck1 || ""} onChange={e => updateFase("dataCheck1", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Check 2 Status *</label>
            <select value={selectedFase?.check2Status || ""} onChange={e => updateFase("check2Status", e.target.value)}
              disabled={selectedFase?.check1Status !== "Realizado"}
              className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500 ${selectedFase?.check1Status !== "Realizado" ? "opacity-50 cursor-not-allowed" : ""}`}>
              <option value="">Selecione...</option>
              {CHECK_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {selectedFase?.check1Status !== "Realizado" && (
              <p className="text-[10px] text-amber-600 mt-1">Check 1 deve estar Realizado</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Data Check 2</label>
            <input type="date" value={selectedFase?.dataCheck2 || ""} onChange={e => updateFase("dataCheck2", e.target.value)}
              disabled={selectedFase?.check1Status !== "Realizado"}
              className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500 ${selectedFase?.check1Status !== "Realizado" ? "opacity-50 cursor-not-allowed" : ""}`}/>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Data Fim *</label>
          <input type="date" value={selectedFase?.dataFim || ""} onChange={e => updateFase("dataFim", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
        </div>
      </div>
    </div>
  )

  // Render Fase 3
  const renderFase3 = () => (
    <div className="space-y-4">
      {!canEditFase3 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-700 font-medium">Complete a Fase 2 para desbloquear esta etapa.</p>
        </div>
      )}
      <div className={!canEditFase3 ? "opacity-50 pointer-events-none" : ""}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Data Contato Final</label>
            <input type="date" value={selectedFase?.dataContatoFinal || ""} onChange={e => updateFase("dataContatoFinal", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Responsavel</label>
            <select value={selectedFase?.responsavelFinal || ""} onChange={e => updateFase("responsavelFinal", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
              <option value="">Selecione...</option>
              {RESPONSAVEL_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Avaliacao</label>
          <textarea value={selectedFase?.avaliacao || ""} onChange={e => updateFase("avaliacao", e.target.value)}
            placeholder="Observacoes sobre a implantacao..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"/>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Horas Projeto Final</label>
          <input type="number" min="0" value={selectedFase?.horasProjetoFinal || 0} onChange={e => updateFase("horasProjetoFinal", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
        </div>
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Marcar como Concluido</p>
            <p className="text-xs text-emerald-600">Finaliza a implantacao deste cliente</p>
          </div>
          <button onClick={() => updateFase("concluido", !selectedFase?.concluido)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${selectedFase?.concluido ? "bg-emerald-500" : "bg-gray-300"}`}>
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5 ${selectedFase?.concluido ? "translate-x-5" : ""}`}/>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Tabs principais */}
      <div className="flex items-center gap-2 border-b">
        <button onClick={() => setPanelTab("fases")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${panelTab === "fases" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          Fases de Implantacao
        </button>
        <button onClick={() => setPanelTab("config")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${panelTab === "config" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          Configurar Status
        </button>
      </div>

      {panelTab === "fases" && (
        <div className="space-y-4">
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-amber-700">{resumoFases.fase1}</p>
              <p className="text-xs text-amber-600 font-medium">Em Fase 1 (Entrada)</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-blue-700">{resumoFases.fase2}</p>
              <p className="text-xs text-blue-600 font-medium">Em Fase 2 (Implantacao)</p>
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-violet-700">{resumoFases.fase3}</p>
              <p className="text-xs text-violet-600 font-medium">Em Fase 3 (Adocao)</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-emerald-700">{resumoFases.concluidos}</p>
              <p className="text-xs text-emerald-600 font-medium">Concluidos</p>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Lista de clientes */}
            <div className="w-80 flex-shrink-0 bg-white border rounded-xl overflow-hidden">
              <div className="p-3 border-b bg-gray-50">
                <input value={searchCliente} onChange={e => setSearchCliente(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
              </div>
              <div className="max-h-[500px] overflow-y-auto divide-y">
                {filteredClientes.slice(0, 50).map(c => (
                  <button key={`fase-${c.id}`} onClick={() => { setSelectedCliente(c.id); setFaseTab(1) }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedCliente === c.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}>
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400 font-mono">{c.codSGD}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${faseColor(faseAtualCliente(c.id))}`}>
                        {faseAtualCliente(c.id)}
                      </span>
                    </div>
                  </button>
                ))}
                {filteredClientes.length === 0 && (
                  <p className="text-center py-8 text-gray-400 text-sm">Nenhum cliente encontrado</p>
                )}
              </div>
            </div>

            {/* Painel de edicao */}
            <div className="flex-1 bg-white border rounded-xl overflow-hidden">
              {selectedCliente ? (
                <>
                  <div className="p-4 border-b bg-gray-50">
                    <p className="font-semibold text-gray-800">{clientesList.find(c => c.id === selectedCliente)?.name || "—"}</p>
                    <p className="text-xs text-gray-500">{clientesList.find(c => c.id === selectedCliente)?.codSGD || "—"}</p>
                  </div>
                  <div className="flex border-b">
                    <button onClick={() => setFaseTab(1)}
                      className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${faseTab === 1 ? "border-amber-500 text-amber-700 bg-amber-50/50" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                      Fase 1: Entrada
                    </button>
                    <button onClick={() => setFaseTab(2)}
                      className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${faseTab === 2 ? "border-blue-500 text-blue-700 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700"} ${!canEditFase2 ? "opacity-50" : ""}`}>
                      Fase 2: Implantacao
                    </button>
                    <button onClick={() => setFaseTab(3)}
                      className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${faseTab === 3 ? "border-violet-500 text-violet-700 bg-violet-50/50" : "border-transparent text-gray-500 hover:text-gray-700"} ${!canEditFase3 ? "opacity-50" : ""}`}>
                      Fase 3: Adocao
                    </button>
                  </div>
                  <div className="p-5">
                    {faseTab === 1 && renderFase1()}
                    {faseTab === 2 && renderFase2()}
                    {faseTab === 3 && renderFase3()}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  <p className="text-sm">Selecione um cliente para editar as fases</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {panelTab === "config" && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">Configurar Status</h2>
              <p className="text-xs text-gray-500 mt-0.5">Configure os status exibidos nos clientes. Apenas administradores podem gerenciar.</p>
            </div>
            <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
              <Plus className="w-4 h-4"/> Novo Status
            </button>
          </div>

          <div className="flex gap-3 flex-wrap">
            {TIPO_OPTS_LOCAL.map(o => (
              <div key={o.v} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>{o.icon}</span>
                <span className="font-medium">{o.l}</span>
                <span className="text-gray-400">
                  {o.v === "andamento" ? "— Em progresso normal" : o.v === "alerta" ? "— Requer atencao" : "— Finalizado"}
                </span>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white border rounded-xl overflow-hidden text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-[10px] uppercase text-gray-400 font-semibold">
                  <th className="px-4 py-3 text-left">Ordem</th>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Cor</th>
                  <th className="px-4 py-3 text-left">Previa</th>
                  <th className="px-4 py-3 text-center">Ativo</th>
                  <th className="px-4 py-3 text-center">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(s => {
                  if (!s || !s.id) return null
                  const cor = s.cor || "#6b7280"
                  return (
                    <tr key={s.id} className={"border-b hover:bg-gray-50 transition-colors " + (!s.ativo ? "opacity-40" : "")}>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{s.ordem || 0}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{s.nome || "—"}</td>
                      <td className="px-4 py-3">{tipoBadge(s.tipo)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded border flex-shrink-0" style={{background: cor}}/>
                          <span className="text-xs font-mono text-gray-400">{cor}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] border"
                          style={{color: cor, borderColor: cor + "66", background: cor + "11"}}>
                          {s.nome || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleAtivo(s.id)}
                          className={"relative inline-flex h-5 w-9 rounded-full transition-colors " + (s.ativo ? "bg-emerald-500" : "bg-gray-300")}>
                          <span className={"inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5 " + (s.ativo ? "translate-x-4" : "")}/>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                          <Edit2 className="w-3.5 h-3.5"/>
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                      Nenhum status cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600"/>
                {editItem ? "Editar Status" : "Novo Status"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4"/>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Nome do Status *</label>
                <input
                  value={form.nome || ""}
                  onChange={e => setForm(p => ({...p, nome: e.target.value}))}
                  placeholder="Ex: Aguardando cliente, Em teste..."
                  className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Tipo *</label>
                <select
                  value={form.tipo || "andamento"}
                  onChange={e => setForm(p => ({...p, tipo: e.target.value}))}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
                  {TIPO_OPTS_LOCAL.map(o => (
                    <option key={o.v} value={o.v}>
                      {o.icon} {o.l} — {o.v === "andamento" ? "em progresso" : o.v === "alerta" ? "requer atencao" : "finalizado"}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Define o comportamento visual e agrupamento nos relatorios.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Cor</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.cor || "#2563eb"}
                      onChange={e => setForm(p => ({...p, cor: e.target.value}))}
                      className="h-9 w-14 rounded border cursor-pointer bg-gray-50"
                    />
                    <input
                      value={form.cor || ""}
                      onChange={e => setForm(p => ({...p, cor: e.target.value}))}
                      placeholder="#000000"
                      className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Ordem</label>
                  <input
                    type="number" min="1" max="999"
                    value={form.ordem || 99}
                    onChange={e => setForm(p => ({...p, ordem: parseInt(e.target.value) || 1}))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-xl">
                <div>
                  <p className="text-sm font-medium">Status ativo</p>
                  <p className="text-xs text-gray-400">Inativo oculta o status das selecoes</p>
                </div>
                <button
                  onClick={() => setForm(p => ({...p, ativo: !p.ativo}))}
                  className={"relative inline-flex h-6 w-11 rounded-full transition-colors " + (form.ativo ? "bg-emerald-500" : "bg-gray-300")}>
                  <span className={"inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5 " + (form.ativo ? "translate-x-5" : "")}/>
                </button>
              </div>
              <div className="p-3 bg-gray-50 border rounded-xl">
                <p className="text-[10px] text-gray-400 mb-2 font-semibold uppercase tracking-wide">Previa do badge</p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] border font-medium"
                  style={{
                    color: form.cor || "#6b7280",
                    borderColor: (form.cor || "#6b7280") + "66",
                    background: (form.cor || "#6b7280") + "11"
                  }}>
                  {form.nome || "Nome do status"}
                </span>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border rounded-lg text-sm hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={salvar} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                {editItem ? "Salvar Alteracoes" : "Criar Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const SEED_ANOTACOES = JSON.parse(`{"cli_109521":[{"id":"sgd_1757334","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1757334] Acompanhamento — 00h 30min.","autor":"ops4","data":"24/03/26 15:00","sgd":true}],"cli_110187":[{"id":"sgd_1746169","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1746169] Acompanhamento — 01h 00min.","autor":"ops3","data":"09/03/26 16:00","sgd":true}],"cli_111272":[{"id":"sgd_1741023","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1741023] Geral - Portal do Cliente I — 01h 42min.","autor":"ops4","data":"16/03/26 08:00","sgd":true}],"cli_111734":[{"id":"sgd_1691660","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1691660] Acompanhamento — 01h 00min.","autor":"ops4","data":"06/02/26 09:00","sgd":true}],"cli_112469":[{"id":"sgd_1771798","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1771798] Busca NF-e - Busca NF-e - Instalação Busca NF-e — 01h 00min.","autor":"ops4","data":"08/04/26 14:00","sgd":true}],"cli_114426":[{"id":"sgd_1718406","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1718406] Folha - Folha I — 02h 04min.","autor":"ops4","data":"19/02/26 08:10","sgd":true}],"cli_114491":[{"id":"sgd_1700862","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1700862] Contabilidade - Contábil - Acompanh. de Configurações — 02h 02min.","autor":"ops6","data":"28/01/26 16:00","sgd":true}],"cli_115318":[{"id":"sgd_1708422","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1708422] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 22min.","autor":"root","data":"03/02/26 09:30","sgd":true}],"cli_115460":[{"id":"sgd_1767385","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1767385] Busca NF-e - Busca Nf-e — 00h 48min.","autor":"ops4","data":"31/03/26 16:00","sgd":true}],"cli_11635":[{"id":"sgd_1681456","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1681456] Domínio Conta Digital - Geral - Dominio Conta PJ (Pessoa Júridica) — 01h 10min.","autor":"ops3","data":"12/01/26 08:20","sgd":true}],"cli_116402":[{"id":"sgd_1771784","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1771784] Portal do Empregado - Onvio Portal do Empregado - Portal do Empregado  — 00h 25min.","autor":"ops4","data":"08/04/26 10:00","sgd":true}],"cli_11735":[{"id":"sgd_1721896","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1721896] Acompanhamento — 02h 00min.","autor":"ops3","data":"20/02/26 10:00","sgd":true}],"cli_118435":[{"id":"sgd_1701184","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1701184] Escrita - Escrita I — 01h 52min.","autor":"ops6","data":"29/01/26 10:00","sgd":true}],"cli_118754":[{"id":"sgd_1748906","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1748906] Folha - Folha - Acompanhamento em geral — 01h 48min.","autor":"ops4","data":"31/03/26 14:00","sgd":true}],"cli_118887":[{"id":"sgd_1686239","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1686239] Escrita - Escrita - Acompanhamento de configurações — 02h 14min.","autor":"ops2","data":"12/01/26 14:00","sgd":true}],"cli_120336":[{"id":"sgd_1729395","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1729395] Escrita - Escrita - Acompanhamento de configurações — 01h 08min.","autor":"ops2","data":"25/02/26 16:00","sgd":true}],"cli_121355":[{"id":"sgd_1682163","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1682163] Acompanhamento — 01h 00min.","autor":"ops3","data":"15/01/26 08:20","sgd":true}],"cli_121403":[{"id":"sgd_1769301","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1769301] Geral - Domínio Contabilidade Digital — 01h 40min.","autor":"ops3","data":"10/04/26 16:00","sgd":true}],"cli_121877":[{"id":"sgd_1687237","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1687237] Contabilidade - Acompanhamento de Contabilidade — 01h 30min.","autor":"ops4","data":"20/01/26 14:00","sgd":true}],"cli_122194":[{"id":"sgd_1732257","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1732257] Folha - Folha - Acompanhamento em geral — 01h 00min.","autor":"ops4","data":"26/02/26 08:00","sgd":true}],"cli_125861":[{"id":"sgd_1690450","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1690450] Escrita - Escrita - Acompanhamento em geral — 02h 42min.","autor":"ops2","data":"19/01/26 08:10","sgd":true}],"cli_125867":[{"id":"sgd_1767211","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1767211] Geral - Domínio Contabilidade Digital — 01h 28min.","autor":"ops3","data":"31/03/26 08:00","sgd":true}],"cli_135149":[{"id":"sgd_1747483","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1747483] Contabilidade - Contabilidade - II — 01h 49min.","autor":"ops2","data":"13/03/26 10:00","sgd":true}],"cli_145041":[{"id":"sgd_1709783","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1709783] Escrita - Escrita - Acompanhamento de apurações — 02h 05min.","autor":"ops6","data":"05/02/26 16:00","sgd":true}],"cli_145499":[{"id":"sgd_1705213","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1705213] Acompanhamento — 01h 55min.","autor":"ops6","data":"30/01/26 16:00","sgd":true}],"cli_146113":[{"id":"sgd_1696983","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1696983] Contabilidade - Contabilidade - II — 01h 18min.","autor":"ops2","data":"23/01/26 14:10","sgd":true}],"cli_147610":[{"id":"sgd_1699995","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1699995] Folha - Folha I — 02h 00min.","autor":"ops1","data":"27/01/26 14:00","sgd":true}],"cli_14850":[{"id":"sgd_1756131","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1756131] Geral - Domínio Contabilidade Digital — 01h 00min.","autor":"ops3","data":"25/03/26 16:00","sgd":true}],"cli_149858":[{"id":"sgd_1684946","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1684946] Acompanhamento — 01h 34min.","autor":"ops2","data":"22/01/26 09:00","sgd":true}],"cli_15168":[{"id":"sgd_1708794","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1708794] Comercial - Acompanhamento — 01h 54min.","autor":"ops6","data":"23/02/26 16:00","sgd":true}],"cli_154074":[{"id":"sgd_1723600","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1723600] Acompanhamento — 03h 20min.","autor":"ops2","data":"27/02/26 14:00","sgd":true}],"cli_158027":[{"id":"sgd_1686512","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1686512] Escrita - Escrita - Acompanhamento em geral — 02h 04min.","autor":"ops6","data":"14/01/26 14:00","sgd":true}],"cli_159926":[{"id":"sgd_1708946","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1708946] Apoio Técnico — 01h 00min.","autor":"ops5","data":"04/02/26 09:00","sgd":true}],"cli_160602":[{"id":"sgd_1759479","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1759479] Comercial - Acompanhamento — 01h 43min.","autor":"ops3","data":"26/03/26 10:00","sgd":true}],"cli_161510":[{"id":"sgd_1704186","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1704186] Contabilidade - Contabilidade I — 02h 07min.","autor":"ops6","data":"02/03/26 14:00","sgd":true}],"cli_16672":[{"id":"sgd_1759451","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1759451] Apoio Técnico — 01h 30min.","autor":"ops5","data":"20/03/26 16:30","sgd":true}],"cli_167573":[{"id":"sgd_1675171","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1675171] Domínio Processos - Geral - DP – Trein. USO — 02h 00min.","autor":"ops5","data":"05/01/26 08:00","sgd":true}],"cli_170401":[{"id":"sgd_1764074","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1764074] Domínio Contabilidade Digital — 01h 43min.","autor":"ops3","data":"10/04/26 08:00","sgd":true}],"cli_171549":[{"id":"sgd_1765078","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1765078] Acompanhamento de Implantação 1 — 03h 07min.","autor":"ops4","data":"30/03/26 08:30","sgd":true}],"cli_171895":[{"id":"sgd_1737070","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1737070] Escrita - Escrita II — 02h 04min.","autor":"ops4","data":"03/03/26 14:00","sgd":true}],"cli_172105":[{"id":"sgd_1770547","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1770547] Escrita - Escrita - Acompanhamento em geral — 03h 16min.","autor":"ops2","data":"06/04/26 14:10","sgd":true}],"cli_17305":[{"id":"sgd_1717196","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1717196] Acompanhamento — 01h 00min.","autor":"ops3","data":"18/02/26 10:00","sgd":true}],"cli_17310":[{"id":"sgd_1682760","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1682760] Geral - Recuperação de Crédito - KOL — 01h 30min.","autor":"ops5","data":"14/01/26 08:15","sgd":true}],"cli_176005":[{"id":"sgd_1771491","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1771491] Kolossus Auditor - Geral - Kolossus Auditor — 02h 00min.","autor":"ops5","data":"06/04/26 10:00","sgd":true}],"cli_176619":[{"id":"sgd_1736740","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1736740] Domínio Plus - Contabilidade - Contabilidade I — 02h 26min.","autor":"ops2","data":"13/03/26 14:00","sgd":true}],"cli_176822":[{"id":"sgd_1713727","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1713727] Domínio Plus - Folha - Folha III — 01h 53min.","autor":"ops1","data":"11/02/26 10:00","sgd":true}],"cli_176872":[{"id":"sgd_1768151","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1768151] Escrita - Escrita - Acompanhamento em geral — 02h 06min.","autor":"ops2","data":"31/03/26 14:00","sgd":true}],"cli_176928":[{"id":"sgd_1710309","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1710309] Acompanhamento — 01h 30min.","autor":"ops3","data":"12/02/26 08:20","sgd":true}],"cli_177330":[{"id":"sgd_1740335","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1740335] Domínio Plus - Escrita - Escrita II — 02h 01min.","autor":"ops4","data":"12/03/26 14:00","sgd":true}],"cli_177504":[{"id":"sgd_1748779","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1748779] Acompanhamento — 01h 14min.","autor":"ops1","data":"18/03/26 16:00","sgd":true}],"cli_177683":[{"id":"sgd_1709545","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1709545] Geral - Domínio Contabilidade Digital — 01h 00min.","autor":"ops3","data":"06/02/26 16:00","sgd":true}],"cli_177709":[{"id":"sgd_1711018","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1711018] Apoio Técnico — 02h 00min.","autor":"ops5","data":"13/02/26 14:00","sgd":true}],"cli_177901":[{"id":"sgd_1750918","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1750918] Acompanhamento — 01h 37min.","autor":"ops1","data":"16/03/26 08:00","sgd":true}],"cli_181784":[{"id":"sgd_1748326","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1748326] Contabilidade - Acompanhamento de Contabilidade — 01h 54min.","autor":"ops4","data":"16/03/26 14:00","sgd":true}],"cli_181860":[{"id":"sgd_1776701","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1776701] Folha - Folha - Acompanhamento em geral — 01h 33min.","autor":"ops1","data":"08/04/26 10:00","sgd":true}],"cli_182019":[{"id":"sgd_1726144","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1726144] Domínio Start - Contabilidade - Contabilidade I — 01h 32min.","autor":"ops4","data":"25/03/26 08:30","sgd":true}],"cli_184248":[{"id":"sgd_1759461","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1759461] Folha - Folha - Acompanhamento em geral — 02h 01min.","autor":"ops1","data":"23/03/26 10:00","sgd":true}],"cli_185091":[{"id":"sgd_1703055","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1703055] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 05min.","autor":"root","data":"28/01/26 11:00","sgd":true}],"cli_185113":[{"id":"sgd_1764648","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1764648] Escrita - Escrita - Acompanhamento de importações — 01h 47min.","autor":"ops4","data":"27/03/26 08:00","sgd":true}],"cli_18539":[{"id":"sgd_1740907","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1740907] Busca NF-e - Busca NF-e - Instalação Busca NF-e — 00h 30min.","autor":"ops4","data":"06/03/26 10:00","sgd":true}],"cli_185640":[{"id":"sgd_1748976","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1748976] Folha - Folha - Acompanhamento em geral — 01h 55min.","autor":"ops4","data":"16/03/26 10:00","sgd":true}],"cli_185823":[{"id":"sgd_1702585","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1702585] Domínio Personalizado - Folha - Folha III — 02h 19min.","autor":"ops4","data":"30/01/26 15:31","sgd":true}],"cli_186172":[{"id":"sgd_1703887","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1703887] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 20min.","autor":"root","data":"28/01/26 16:30","sgd":true}],"cli_186455":[{"id":"sgd_1772270","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1772270] Folha - Folha II — 01h 39min.","autor":"ops1","data":"02/04/26 16:00","sgd":true}],"cli_186493":[{"id":"sgd_1771187","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1771187] Folha - Folha II — 01h 34min.","autor":"ops1","data":"06/04/26 14:00","sgd":true}],"cli_187728":[{"id":"sgd_1755671","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1755671] Escrita - Escrita - Acompanhamentos gerais — 02h 02min.","autor":"ops4","data":"20/03/26 16:00","sgd":true}],"cli_190027":[{"id":"sgd_1765370","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1765370] Domínio Start - Contabilidade - Contabilidade I — 02h 02min.","autor":"ops4","data":"31/03/26 08:30","sgd":true}],"cli_191426":[{"id":"sgd_1744621","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1744621] Domínio Start - Instalação Contábil Mono — 00h 40min.","autor":"root","data":"06/03/26 10:00","sgd":true}],"cli_191599":[{"id":"sgd_1759421","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1759421] Escrita - Escrita III — 02h 47min.","autor":"ops2","data":"23/03/26 08:30","sgd":true}],"cli_192066":[{"id":"sgd_1742593","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1742593] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 05min.","autor":"root","data":"05/03/26 08:31","sgd":true}],"cli_192086":[{"id":"sgd_1745744","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1745744] Domínio Empresarial - Instalação Contábil Plus/Emp/Pers Mono — 00h 29min.","autor":"root","data":"06/03/26 17:00","sgd":true}],"cli_192349":[{"id":"sgd_1743725","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1743725] Domínio WEB 2.0 - Geral - Contato Inicial — 00h 02min.","autor":"root","data":"05/03/26 16:00","sgd":true}],"cli_194209":[{"id":"sgd_1775598","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1775598] Acompanhamento — 01h 00min.","autor":"ops3","data":"09/04/26 08:10","sgd":true}],"cli_194306":[{"id":"sgd_1711764","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1711764] Domínio Conta Digital - Geral - Checkout Usabilidade Conta PJ — 00h 45min.","autor":"ops3","data":"20/02/26 16:00","sgd":true}],"cli_194604":[{"id":"sgd_1772751","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1772751] Folha - Folha - Acompanhamento em geral — 01h 48min.","autor":"ops1","data":"07/04/26 08:00","sgd":true}],"cli_195332":[{"id":"sgd_1751684","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1751684] Domínio Personalizado - Folha - Folha III — 01h 30min.","autor":"ops1","data":"23/03/26 14:00","sgd":true}],"cli_196517":[{"id":"sgd_1754608","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1754608] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 08min.","autor":"root","data":"16/03/26 17:00","sgd":true}],"cli_196617":[{"id":"sgd_1755599","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1755599] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 04min.","autor":"root","data":"17/03/26 14:00","sgd":true}],"cli_196619":[{"id":"sgd_1761888","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1761888] Domínio Plus - Escrita - Escrita III — 02h 32min.","autor":"ops4","data":"09/04/26 15:00","sgd":true}],"cli_197469":[{"id":"sgd_1771631","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1771631] Domínio Contabilidade Digital - Geral - Domínio Contabilidade Digital — 01h 45min.","autor":"ops3","data":"07/04/26 16:00","sgd":true}],"cli_200279":[{"id":"sgd_1775109","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1775109] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 05min.","autor":"root","data":"06/04/26 14:51","sgd":true}],"cli_200473":[{"id":"sgd_1753031","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1753031] Comercial - Acompanhamento — 00h 30min.","autor":"ops3","data":"13/03/26 18:00","sgd":true}],"cli_20049":[{"id":"sgd_1699797","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1699797] Problemas com produto — 01h 00min.","autor":"ops5","data":"26/01/26 11:00","sgd":true}],"cli_200890":[{"id":"sgd_1777293","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1777293] Geral - Disponibilizar Banco — 00h 13min.","autor":"root","data":"08/04/26 15:30","sgd":true}],"cli_201121":[{"id":"sgd_1774670","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1774670] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 28min.","autor":"root","data":"06/04/26 10:56","sgd":true}],"cli_201630":[{"id":"sgd_1775070","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1775070] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 01min.","autor":"root","data":"06/04/26 14:50","sgd":true}],"cli_201669":[{"id":"sgd_1775017","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1775017] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 02min.","autor":"root","data":"06/04/26 14:30","sgd":true}],"cli_201818":[{"id":"sgd_1777151","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1777151] Domínio WEB 2.0 - Geral - Contato Inicial — 00h 40min.","autor":"ops4","data":"08/04/26 09:00","sgd":true}],"cli_202645":[{"id":"sgd_1780238","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1780238] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 26min.","autor":"root","data":"10/04/26 10:00","sgd":true}],"cli_21009":[{"id":"sgd_1685235","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1685235] Honorários - Honorários I ��� 02h 00min.","autor":"ops3","data":"13/01/26 14:10","sgd":true}],"cli_26206":[{"id":"sgd_1720573","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1720573] Honorários - Honorários III — 00h 01min.","autor":"ops3","data":"25/02/26 16:00","sgd":true}],"cli_27339":[{"id":"sgd_1709556","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1709556] Honorários - Honorários I — 01h 30min.","autor":"ops3","data":"10/02/26 14:00","sgd":true}],"cli_27680":[{"id":"sgd_1728978","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1728978] Geral - Configuração Inicial - KOL — 02h 00min.","autor":"ops5","data":"24/02/26 08:00","sgd":true}],"cli_29216":[{"id":"sgd_1701561","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1701561] Acompanhamento — 02h 00min.","autor":"ops5","data":"09/02/26 14:30","sgd":true}],"cli_29235":[{"id":"sgd_1764737","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1764737] Geral - Gerais - Acompanhamentos — 02h 00min.","autor":"ops5","data":"26/03/26 16:00","sgd":true}],"cli_31057":[{"id":"sgd_1690555","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1690555] Acompanhamento — 01h 00min.","autor":"ops6","data":"26/01/26 16:00","sgd":true}],"cli_31885":[{"id":"sgd_1762483","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1762483] Acompanhamento — 01h 37min.","autor":"ops3","data":"01/04/26 08:10","sgd":true}],"cli_33050":[{"id":"sgd_1728881","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1728881] Acompanhamento — 01h 55min.","autor":"ops6","data":"26/02/26 10:00","sgd":true}],"cli_36929":[{"id":"sgd_1724403","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1724403] Domínio Messenger - Dominio Messenger - Implantação — 01h 18min.","autor":"ops4","data":"26/02/26 16:30","sgd":true}],"cli_37260":[{"id":"sgd_1751115","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1751115] Busca NF-e - Instalação Busca NF-e — 00h 52min.","autor":"ops4","data":"17/03/26 10:30","sgd":true}],"cli_38120":[{"id":"sgd_1736821","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1736821] Acompanhamento — 00h 52min.","autor":"ops3","data":"11/03/26 08:10","sgd":true}],"cli_38765":[{"id":"sgd_1735648","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1735648] Escrita - Escrita III — 01h 23min.","autor":"ops2","data":"04/03/26 14:00","sgd":true}],"cli_41588":[{"id":"sgd_1761299","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1761299] Domínio WEB 2.0 - Geral - Contato Inicial — 00h 35min.","autor":"ops4","data":"24/03/26 10:00","sgd":true}],"cli_41664":[{"id":"sgd_1716460","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1716460] Geral - Portal do Cliente I — 01h 49min.","autor":"ops4","data":"20/02/26 08:10","sgd":true}],"cli_43083":[{"id":"sgd_1769317","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1769317] Geral - Domínio Contabilidade Digital — 01h 52min.","autor":"ops3","data":"31/03/26 16:00","sgd":true}],"cli_44936":[{"id":"sgd_1711760","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1711760] Domínio Conta Digital - Geral - Checkout Usabilidade Conta PJ — 00h 30min.","autor":"ops3","data":"27/02/26 14:00","sgd":true}],"cli_47562":[{"id":"sgd_1778995","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1778995] Domínio Processos - Geral - Validação de Dados - Pré-Migração — 00h 23min.","autor":"root","data":"09/04/26 11:00","sgd":true}],"cli_47644":[{"id":"sgd_1693280","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1693280] Folha - Folha - Acompanhamento em geral — 02h 02min.","autor":"ops1","data":"21/01/26 16:00","sgd":true}],"cli_48298":[{"id":"sgd_1725043","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1725043] Busca NF-e - Busca NF-e - Instalação Busca NF-e — 01h 00min.","autor":"ops4","data":"23/02/26 10:00","sgd":true}],"cli_50220":[{"id":"sgd_1723611","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1723611] Domínio Processos - Geral - DP – Boas-Vindas — 02h 30min.","autor":"ops5","data":"11/03/26 14:00","sgd":true}],"cli_53333":[{"id":"sgd_1756001","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1756001] Domínio Messenger - Geral - Dominio Messenger - Implantação — 01h 20min.","autor":"ops4","data":"24/03/26 08:00","sgd":true}],"cli_53339":[{"id":"sgd_1757179","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1757179] Geral - DP – Acomp. ADM 2 — 02h 00min.","autor":"ops5","data":"24/03/26 14:00","sgd":true}],"cli_54302":[{"id":"sgd_1744179","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1744179] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 20min.","autor":"root","data":"06/03/26 15:00","sgd":true}],"cli_54639":[{"id":"sgd_1776109","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1776109] Comercial - Acompanhamento — 02h 00min.","autor":"ops5","data":"08/04/26 08:00","sgd":true}],"cli_54801":[{"id":"sgd_1728219","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1728219] Comercial - Acompanhamento — 01h 58min.","autor":"ops6","data":"24/02/26 10:00","sgd":true}],"cli_55151":[{"id":"sgd_1769846","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1769846] Geral - Domínio Contabilidade Digital — 01h 30min.","autor":"ops3","data":"02/04/26 10:10","sgd":true}],"cli_55981":[{"id":"sgd_1745371","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1745371] A-Instalação Contábil — 00h 14min.","autor":"root","data":"06/03/26 14:45","sgd":true}],"cli_58016":[{"id":"sgd_1774688","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1774688] Contabilidade - Acompanhamento de Contabilidade — 01h 43min.","autor":"ops2","data":"08/04/26 16:00","sgd":true}],"cli_60820":[{"id":"sgd_1773541","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1773541] Geral - Domínio Contabilidade Digital — 01h 00min.","autor":"ops3","data":"10/04/26 14:00","sgd":true}],"cli_61279":[{"id":"sgd_1769999","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1769999] Geral - Domínio Contabilidade Digital — 01h 27min.","autor":"ops3","data":"06/04/26 14:00","sgd":true}],"cli_61348":[{"id":"sgd_1758197","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1758197] Domínio Conta Digital - Geral - Dominio Conta PJ (Pessoa Júridica) — 01h 36min.","autor":"ops3","data":"25/03/26 10:00","sgd":true}],"cli_61627":[{"id":"sgd_1775963","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1775963] Geral - Checkout Usabilidade Contabilidade Digit — 01h 34min.","autor":"ops3","data":"08/04/26 16:00","sgd":true}],"cli_68386":[{"id":"sgd_1723477","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1723477] A-Instalação Contábil — 00h 03min.","autor":"root","data":"18/02/26 09:30","sgd":true}],"cli_71580":[{"id":"sgd_1754175","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1754175] Geral - Domínio Contabilidade Digital — 01h 00min.","autor":"ops3","data":"18/03/26 17:00","sgd":true}],"cli_71714":[{"id":"sgd_1720594","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1720594] Acompanhamento — 01h 56min.","autor":"ops6","data":"23/02/26 14:00","sgd":true}],"cli_72121":[{"id":"sgd_1733046","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1733046] Acompanhamento — 01h 20min.","autor":"ops3","data":"26/02/26 10:01","sgd":true}],"cli_74302":[{"id":"sgd_1771743","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1771743] Domínio Conta Digital - Geral - Dominio Conta PJ (Pessoa Júridica) — 01h 35min.","autor":"ops3","data":"09/04/26 14:00","sgd":true}],"cli_74602":[{"id":"sgd_1756381","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1756381] Domínio Contabilidade Digital - Geral - Domínio Contabilidade Digital — 02h 00min.","autor":"ops3","data":"24/03/26 16:00","sgd":true}],"cli_75185":[{"id":"sgd_1695742","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1695742] Geral - Domínio Contabilidade Digital — 01h 50min.","autor":"ops3","data":"23/01/26 10:10","sgd":true}],"cli_80782":[{"id":"sgd_1775125","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1775125] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 05min.","autor":"root","data":"06/04/26 15:05","sgd":true}],"cli_81268":[{"id":"sgd_1723567","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1723567] Portal do Empregado - Onvio Portal do Empregado - Portal do Empregado  — 01h 00min.","autor":"ops4","data":"23/02/26 15:30","sgd":true}],"cli_83015":[{"id":"sgd_1736321","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1736321] Geral - Domino Processos - Acompanhamento — 02h 00min.","autor":"ops5","data":"13/03/26 10:00","sgd":true}],"cli_83112":[{"id":"sgd_1744882","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1744882] Comercial - Acompanhamento — 00h 52min.","autor":"ops3","data":"13/03/26 08:10","sgd":true}],"cli_84738":[{"id":"sgd_1726140","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1726140] Comercial - Acompanhamento — 01h 45min.","autor":"ops3","data":"23/02/26 10:15","sgd":true}],"cli_86292":[{"id":"sgd_1732595","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1732595] Geral - Domínio Contabilidade Digital — 00h 50min.","autor":"ops3","data":"02/03/26 08:20","sgd":true}],"cli_86578":[{"id":"sgd_1733279","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1733279] Domínio WEB 2.0 - Geral - Disponibilizar Banco — 00h 01min.","autor":"root","data":"26/02/26 15:00","sgd":true}],"cli_87856":[{"id":"sgd_1727446","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1727446] Folha - Folha - Acompanhamento em geral — 00h 45min.","autor":"ops1","data":"24/02/26 10:00","sgd":true}],"cli_91306":[{"id":"sgd_1701524","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1701524] Acompanhamento — 01h 50min.","autor":"ops3","data":"27/01/26 10:10","sgd":true}],"cli_91613":[{"id":"sgd_1771734","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1771734] Domínio Conta Digital - Geral - Dominio Conta PJ (Pessoa Júridica) — 01h 47min.","autor":"ops3","data":"08/04/26 10:00","sgd":true}],"cli_91632":[{"id":"sgd_1735821","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1735821] Acompanhamento — 01h 30min.","autor":"ops5","data":"11/03/26 09:00","sgd":true}],"cli_91718":[{"id":"sgd_1777327","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1777327] Domínio WEB 2.0 - Geral - Inclusão Banco — 01h 01min.","autor":"root","data":"10/04/26 08:30","sgd":true}],"cli_92233":[{"id":"sgd_1742718","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1742718] Contabilidade - Acompanhamento de Contabilidade — 02h 37min.","autor":"ops2","data":"06/03/26 14:20","sgd":true}],"cli_92303":[{"id":"sgd_1728241","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1728241] Domínio Processos - Geral - DP – Trein. USO — 02h 00min.","autor":"ops5","data":"27/02/26 14:30","sgd":true}],"cli_92688":[{"id":"sgd_1717666","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1717666] Domínio Processos - Geral - DP – Acomp. ADM 1 — 00h 18min.","autor":"ops5","data":"13/02/26 09:00","sgd":true}],"cli_93406":[{"id":"sgd_1705527","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1705527] Comercial - Acompanhamento — 01h 54min.","autor":"ops2","data":"30/01/26 16:00","sgd":true}],"cli_93513":[{"id":"sgd_1774334","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1774334] Busca NF-e - Busca Nf-e — 01h 00min.","autor":"ops4","data":"08/04/26 15:00","sgd":true}],"cli_94138":[{"id":"sgd_1738389","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1738389] Busca NF-e - Busca NF-e - Instalação Busca NF-e — 00h 45min.","autor":"ops4","data":"03/03/26 10:00","sgd":true}],"cli_94573":[{"id":"sgd_1717200","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1717200] Apoio Técnico — 01h 30min.","autor":"ops5","data":"18/02/26 10:00","sgd":true}],"cli_9586":[{"id":"sgd_1716472","tipo":"T&I","subtipo":"Checkpoint","texto":"[SGD #1716472] Geral - Domínio Contabilidade Digital — 01h 45min.","autor":"ops3","data":"10/02/26 10:01","sgd":true}]}`)

const SEED_FILA = JSON.parse(`[{"id":"cli_197469","name":"OLIVEIRA GESTAO CONTABIL E EMPRESARIAL LTDA","pacote":"Domínio Plus","pct":25,"sit":"Em andamento","inicio":"07/04/26","mes":"Mar26","responsavel":"ops3","criadoEm":"25/03/26","codSGD":"197469"},{"id":"cli_201612","name":"LAMBERT CONTABILIDADE LTDA","pacote":"Domínio Plus","pct":0,"sit":"Em andamento","inicio":"10/04/26","mes":"Mar26","responsavel":"root","criadoEm":"31/03/26","codSGD":"201612"},{"id":"cli_202645","name":"ARAUJO E CARVALHO CONTADORES LTDA","pacote":"Domínio Start","pct":33,"sit":"Em andamento","inicio":"10/04/26","mes":"Abr26","responsavel":"root","criadoEm":"06/04/26","codSGD":"202645"},{"id":"cli_41366","name":"CONTROLL CONTABILIDADE LTDA","pacote":"Personalizado","pct":0,"sit":"Em andamento","inicio":"16/04/26","mes":"Mar26","responsavel":"ops4","criadoEm":"31/03/26","codSGD":"41366"},{"id":"cli_42823","name":"MOURA CONSULTORIA CONTABIL E EMPRESARIAL LTDA - ME","pacote":"Personalizado","pct":0,"sit":"Em andamento","inicio":"07/04/26","mes":"Mar26","responsavel":"ops5","criadoEm":"30/03/26","codSGD":"42823"},{"id":"cli_43070","name":"CONTABILIDADE RAMBO LTDA","pacote":"Personalizado","pct":0,"sit":"Em andamento","inicio":"08/04/26","mes":"Abr26","responsavel":"ops5","criadoEm":"06/04/26","codSGD":"43070"},{"id":"cli_57442","name":"DOZE AVOS ASSESSORIA CONTABIL LTDA","pacote":"Personalizado","pct":0,"sit":"Em andamento","inicio":"13/04/26","mes":"Abr26","responsavel":"ops4","criadoEm":"02/04/26","codSGD":"57442"},{"id":"cli_80948","name":"WARLLEY ALENCAR SOARES","pacote":"Personalizado","pct":0,"sit":"Em andamento","inicio":"14/04/26","mes":"Abr26","responsavel":"ops4","criadoEm":"06/04/26","codSGD":"80948"},{"id":"cli_85578","name":"NUCLEO CONTABIL LTDA","pacote":"Personalizado","pct":0,"sit":"Em andamento","inicio":"07/04/26","mes":"Abr26","responsavel":"ops5","criadoEm":"06/04/26","codSGD":"85578"},{"id":"cli_90347","name":"ROSA MARIA PRUDENTE SOARES","pacote":"Domínio Plus","pct":0,"sit":"Em andamento","inicio":"14/04/26","mes":"Mar26","responsavel":"ops3","criadoEm":"27/03/26","codSGD":"90347"},{"id":"cli_91718","name":"NR GESTAO EMPRESARIAL LTDA","pacote":"Domínio Plus","pct":33,"sit":"Em andamento","inicio":"09/04/26","mes":"Mar26","responsavel":"root","criadoEm":"31/03/26","codSGD":"91718"},{"id":"cli_186649","name":"CERNECON SOLUCOES CONTABEIS LTDA","pacote":"Domínio Start","pct":1,"sit":"Em andamento","inicio":"","mes":"","responsavel":null,"criadoEm":"29/01/2026","codSGD":"186649"},{"id":"cli_190290","name":"ALARICE PEREIRA DOS SANTOS","pacote":"Domínio Start","pct":17,"sit":"Em andamento","inicio":"","mes":"","responsavel":null,"criadoEm":"18/02/2026","codSGD":"190290"},{"id":"cli_186649","name":"CERNECON SOLUCOES CONTABEIS LTDA","pacote":"Domínio Start","pct":1,"sit":"Em andamento","inicio":"","mes":"","responsavel":null,"criadoEm":"29/01/2026","codSGD":"186649"},{"id":"cli_190290","name":"ALARICE PEREIRA DOS SANTOS","pacote":"Domínio Start","pct":17,"sit":"Em andamento","inicio":"","mes":"","responsavel":null,"criadoEm":"18/02/2026","codSGD":"190290"},{"id":"cli_186649","name":"CERNECON SOLUCOES CONTABEIS LTDA","pacote":"Domínio Start","pct":1,"sit":"Em andamento","inicio":"","mes":"","responsavel":null,"criadoEm":"29/01/2026","codSGD":"186649"},{"id":"cli_190290","name":"ALARICE PEREIRA DOS SANTOS","pacote":"Domínio Start","pct":17,"sit":"Em andamento","inicio":"","mes":"","responsavel":null,"criadoEm":"18/02/2026","codSGD":"190290"},{"id":"cli_186649","name":"CERNECON SOLUCOES CONTABEIS LTDA","pacote":"Domínio Start","pct":1,"sit":"Em andamento","inicio":"","mes":"","responsavel":null,"criadoEm":"29/01/2026","codSGD":"186649"},{"id":"cli_204382","name":"E M DA CONCEICAO CONTABILIDADE E APOIO ADMINISTRATIVO","pacote":"Domínio Start","pct":0,"sit":"Em andamento","inicio":"","mes":"","responsavel":null,"criadoEm":"13/04/2026","codSGD":"204382"},{"id":"cli_19175","name":"EDMILSON S. C. SALAME","pacote":"Domínio Start","pct":0,"sit":"Em andamento","inicio":"","mes":"","responsavel":null,"criadoEm":"10/04/2026","codSGD":"19175"},{"id":"cli_204409","name":"OTIMIZA CONTABILIDADE E CONSULTORIA LTDA","pacote":"Domínio Plus","pct":0,"sit":"Em andamento","inicio":"","mes":"","responsavel":null,"criadoEm":"13/04/2026","codSGD":"204409"}]`)

const SEED_HISTORICO = JSON.parse(`[{"id":"h_seed_cli_109521","clienteId":"cli_109521","statusId":5,"data":"18/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_110187","clienteId":"cli_110187","statusId":5,"data":"05/11/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_111272","clienteId":"cli_111272","statusId":5,"data":"26/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_111734","clienteId":"cli_111734","statusId":5,"data":"16/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_112469","clienteId":"cli_112469","statusId":5,"data":"26/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_114426","clienteId":"cli_114426","statusId":5,"data":"11/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_114491","clienteId":"cli_114491","statusId":5,"data":"26/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_115318","clienteId":"cli_115318","statusId":5,"data":"27/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_115460","clienteId":"cli_115460","statusId":5,"data":"11/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Cancelado)"},{"id":"h_seed_cli_11635","clienteId":"cli_11635","statusId":5,"data":"17/12/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_116402","clienteId":"cli_116402","statusId":5,"data":"19/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_11735","clienteId":"cli_11735","statusId":5,"data":"17/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_118435","clienteId":"cli_118435","statusId":5,"data":"26/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Cancelado)"},{"id":"h_seed_cli_118754","clienteId":"cli_118754","statusId":5,"data":"10/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_118887","clienteId":"cli_118887","statusId":5,"data":"12/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_120336","clienteId":"cli_120336","statusId":5,"data":"23/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_121355","clienteId":"cli_121355","statusId":5,"data":"27/10/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_121403","clienteId":"cli_121403","statusId":5,"data":"04/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_121877","clienteId":"cli_121877","statusId":5,"data":"05/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_122194","clienteId":"cli_122194","statusId":5,"data":"24/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_125861","clienteId":"cli_125861","statusId":5,"data":"15/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_125867","clienteId":"cli_125867","statusId":5,"data":"21/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_135149","clienteId":"cli_135149","statusId":5,"data":"28/03/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_145041","clienteId":"cli_145041","statusId":5,"data":"23/06/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_145499","clienteId":"cli_145499","statusId":5,"data":"28/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_146113","clienteId":"cli_146113","statusId":5,"data":"20/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_147610","clienteId":"cli_147610","statusId":5,"data":"31/10/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_14850","clienteId":"cli_14850","statusId":5,"data":"04/12/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_149858","clienteId":"cli_149858","statusId":5,"data":"23/07/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_15168","clienteId":"cli_15168","statusId":5,"data":"26/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_154074","clienteId":"cli_154074","statusId":5,"data":"18/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_154443","clienteId":"cli_154443","statusId":5,"data":"15/08/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_158027","clienteId":"cli_158027","statusId":5,"data":"20/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_159926","clienteId":"cli_159926","statusId":5,"data":"29/07/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_160602","clienteId":"cli_160602","statusId":5,"data":"26/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_161510","clienteId":"cli_161510","statusId":5,"data":"17/09/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_16672","clienteId":"cli_16672","statusId":5,"data":"04/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_167573","clienteId":"cli_167573","statusId":5,"data":"27/11/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Cancelado)"},{"id":"h_seed_cli_170401","clienteId":"cli_170401","statusId":5,"data":"19/09/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_171549","clienteId":"cli_171549","statusId":5,"data":"29/10/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_171895","clienteId":"cli_171895","statusId":5,"data":"30/10/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_172105","clienteId":"cli_172105","statusId":5,"data":"31/10/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_172128","clienteId":"cli_172128","statusId":5,"data":"31/10/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Cancelado)"},{"id":"h_seed_cli_17305","clienteId":"cli_17305","statusId":5,"data":"04/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_17310","clienteId":"cli_17310","statusId":5,"data":"24/11/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_176005","clienteId":"cli_176005","statusId":5,"data":"25/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_176619","clienteId":"cli_176619","statusId":5,"data":"24/11/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_176822","clienteId":"cli_176822","statusId":5,"data":"25/11/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_176872","clienteId":"cli_176872","statusId":5,"data":"25/11/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_176928","clienteId":"cli_176928","statusId":5,"data":"27/10/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_177330","clienteId":"cli_177330","statusId":5,"data":"27/11/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_177504","clienteId":"cli_177504","statusId":5,"data":"28/11/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_177683","clienteId":"cli_177683","statusId":5,"data":"03/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_177709","clienteId":"cli_177709","statusId":5,"data":"04/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_177901","clienteId":"cli_177901","statusId":5,"data":"01/12/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_181784","clienteId":"cli_181784","statusId":5,"data":"06/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_181860","clienteId":"cli_181860","statusId":5,"data":"07/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_182019","clienteId":"cli_182019","statusId":5,"data":"07/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_184248","clienteId":"cli_184248","statusId":5,"data":"19/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_185091","clienteId":"cli_185091","statusId":5,"data":"22/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_185113","clienteId":"cli_185113","statusId":5,"data":"22/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_18539","clienteId":"cli_18539","statusId":5,"data":"03/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_185640","clienteId":"cli_185640","statusId":5,"data":"26/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_185823","clienteId":"cli_185823","statusId":5,"data":"26/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_186172","clienteId":"cli_186172","statusId":5,"data":"28/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_186455","clienteId":"cli_186455","statusId":5,"data":"28/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_186493","clienteId":"cli_186493","statusId":5,"data":"29/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_187728","clienteId":"cli_187728","statusId":5,"data":"04/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_190027","clienteId":"cli_190027","statusId":5,"data":"13/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_191426","clienteId":"cli_191426","statusId":5,"data":"24/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_191599","clienteId":"cli_191599","statusId":5,"data":"24/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_192066","clienteId":"cli_192066","statusId":5,"data":"25/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_192086","clienteId":"cli_192086","statusId":5,"data":"26/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_192349","clienteId":"cli_192349","statusId":5,"data":"26/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_194209","clienteId":"cli_194209","statusId":5,"data":"30/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_194306","clienteId":"cli_194306","statusId":5,"data":"07/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_194604","clienteId":"cli_194604","statusId":5,"data":"06/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_195332","clienteId":"cli_195332","statusId":5,"data":"10/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_196517","clienteId":"cli_196517","statusId":5,"data":"13/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_196617","clienteId":"cli_196617","statusId":5,"data":"14/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_196619","clienteId":"cli_196619","statusId":5,"data":"14/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_197469","clienteId":"cli_197469","statusId":4,"data":"25/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_200279","clienteId":"cli_200279","statusId":5,"data":"27/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_200473","clienteId":"cli_200473","statusId":5,"data":"04/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_20049","clienteId":"cli_20049","statusId":5,"data":"14/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_200890","clienteId":"cli_200890","statusId":5,"data":"01/04/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Cancelado)"},{"id":"h_seed_cli_201121","clienteId":"cli_201121","statusId":5,"data":"31/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_201612","clienteId":"cli_201612","statusId":4,"data":"31/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_201630","clienteId":"cli_201630","statusId":5,"data":"31/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_201669","clienteId":"cli_201669","statusId":5,"data":"31/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_201818","clienteId":"cli_201818","statusId":5,"data":"01/04/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_202645","clienteId":"cli_202645","statusId":4,"data":"06/04/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_21009","clienteId":"cli_21009","statusId":5,"data":"26/08/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_26206","clienteId":"cli_26206","statusId":5,"data":"12/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_26669","clienteId":"cli_26669","statusId":5,"data":"04/09/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Cancelado)"},{"id":"h_seed_cli_27339","clienteId":"cli_27339","statusId":5,"data":"03/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_27680","clienteId":"cli_27680","statusId":5,"data":"16/12/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Cancelado)"},{"id":"h_seed_cli_29216","clienteId":"cli_29216","statusId":5,"data":"27/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Cancelado)"},{"id":"h_seed_cli_29235","clienteId":"cli_29235","statusId":5,"data":"12/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_31057","clienteId":"cli_31057","statusId":5,"data":"15/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_31885","clienteId":"cli_31885","statusId":5,"data":"13/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_31942","clienteId":"cli_31942","statusId":5,"data":"23/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Cancelado)"},{"id":"h_seed_cli_33050","clienteId":"cli_33050","statusId":5,"data":"23/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_36929","clienteId":"cli_36929","statusId":5,"data":"13/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_37260","clienteId":"cli_37260","statusId":5,"data":"18/09/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_38120","clienteId":"cli_38120","statusId":5,"data":"24/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_38765","clienteId":"cli_38765","statusId":5,"data":"28/11/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Cancelado)"},{"id":"h_seed_cli_41366","clienteId":"cli_41366","statusId":4,"data":"31/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_41588","clienteId":"cli_41588","statusId":5,"data":"17/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_41664","clienteId":"cli_41664","statusId":5,"data":"10/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_42823","clienteId":"cli_42823","statusId":4,"data":"30/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_43070","clienteId":"cli_43070","statusId":4,"data":"06/04/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_43083","clienteId":"cli_43083","statusId":5,"data":"30/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_43283","clienteId":"cli_43283","statusId":5,"data":"28/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_44936","clienteId":"cli_44936","statusId":5,"data":"04/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_47562","clienteId":"cli_47562","statusId":5,"data":"18/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_47644","clienteId":"cli_47644","statusId":5,"data":"06/04/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_48298","clienteId":"cli_48298","statusId":5,"data":"18/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_50220","clienteId":"cli_50220","statusId":5,"data":"11/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Cancelado)"},{"id":"h_seed_cli_53333","clienteId":"cli_53333","statusId":5,"data":"06/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_53339","clienteId":"cli_53339","statusId":5,"data":"18/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_54302","clienteId":"cli_54302","statusId":5,"data":"26/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_54639","clienteId":"cli_54639","statusId":5,"data":"07/04/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_54801","clienteId":"cli_54801","statusId":5,"data":"30/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_55151","clienteId":"cli_55151","statusId":5,"data":"27/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_55981","clienteId":"cli_55981","statusId":5,"data":"04/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_57442","clienteId":"cli_57442","statusId":4,"data":"02/04/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_58016","clienteId":"cli_58016","statusId":5,"data":"06/04/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_60820","clienteId":"cli_60820","statusId":5,"data":"26/11/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_61279","clienteId":"cli_61279","statusId":5,"data":"31/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_61348","clienteId":"cli_61348","statusId":5,"data":"03/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_61627","clienteId":"cli_61627","statusId":5,"data":"07/04/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_68386","clienteId":"cli_68386","statusId":5,"data":"13/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_71580","clienteId":"cli_71580","statusId":5,"data":"30/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_71714","clienteId":"cli_71714","statusId":5,"data":"12/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_72121","clienteId":"cli_72121","statusId":5,"data":"06/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_74302","clienteId":"cli_74302","statusId":5,"data":"18/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_74602","clienteId":"cli_74602","statusId":5,"data":"13/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_75185","clienteId":"cli_75185","statusId":5,"data":"28/11/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_80782","clienteId":"cli_80782","statusId":5,"data":"25/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_80948","clienteId":"cli_80948","statusId":4,"data":"06/04/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_81268","clienteId":"cli_81268","statusId":5,"data":"11/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_83015","clienteId":"cli_83015","statusId":5,"data":"09/12/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_83112","clienteId":"cli_83112","statusId":5,"data":"20/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_84738","clienteId":"cli_84738","statusId":5,"data":"06/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_85578","clienteId":"cli_85578","statusId":4,"data":"06/04/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_86292","clienteId":"cli_86292","statusId":5,"data":"29/05/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_86578","clienteId":"cli_86578","statusId":5,"data":"18/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_87856","clienteId":"cli_87856","statusId":5,"data":"20/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_90347","clienteId":"cli_90347","statusId":4,"data":"27/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_90910","clienteId":"cli_90910","statusId":5,"data":"14/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Cancelado)"},{"id":"h_seed_cli_91306","clienteId":"cli_91306","statusId":5,"data":"09/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_91613","clienteId":"cli_91613","statusId":5,"data":"18/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_91632","clienteId":"cli_91632","statusId":5,"data":"19/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_91718","clienteId":"cli_91718","statusId":4,"data":"31/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_92233","clienteId":"cli_92233","statusId":5,"data":"05/03/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_92303","clienteId":"cli_92303","statusId":5,"data":"28/11/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_92688","clienteId":"cli_92688","statusId":5,"data":"14/02/24","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_93406","clienteId":"cli_93406","statusId":5,"data":"29/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_93513","clienteId":"cli_93513","statusId":5,"data":"06/04/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_94138","clienteId":"cli_94138","statusId":5,"data":"27/02/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_94573","clienteId":"cli_94573","statusId":5,"data":"12/01/26","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_9586","clienteId":"cli_9586","statusId":5,"data":"30/10/25","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_182984","clienteId":"cli_182984","statusId":5,"data":"13/01/2026","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_182989","clienteId":"cli_182989","statusId":5,"data":"13/01/2026","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_186649","clienteId":"cli_186649","statusId":4,"data":"29/01/2026","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_186059","clienteId":"cli_186059","statusId":5,"data":"27/01/2026","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_178536","clienteId":"cli_178536","statusId":5,"data":"06/01/2026","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_181723","clienteId":"cli_181723","statusId":5,"data":"06/01/2026","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Realizado)"},{"id":"h_seed_cli_190290","clienteId":"cli_190290","statusId":4,"data":"18/02/2026","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_204382","clienteId":"cli_204382","statusId":4,"data":"13/04/2026","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_19175","clienteId":"cli_19175","statusId":4,"data":"10/04/2026","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"},{"id":"h_seed_cli_204409","clienteId":"cli_204409","statusId":4,"data":"13/04/2026","usuario":"sistema","observacao":"Migrado automaticamente (status anterior: Em andamento)"}]`)


// ══════════ NOVA ESTRUTURA: LISTA DE STATUS ══════════
const STATUS_LIST = [
  { id: 1, nome: "Pré-boarding Comercial" },
  { id: 2, nome: "Pré-boarding Técnico" },
  { id: 3, nome: "Contato" },
  { id: 4, nome: "Onboarding" },
  { id: 5, nome: "Finalizado" },
]

const statusColor = (id) => {
  const map = {
    1: { bg:"bg-purple-100", text:"text-purple-700", border:"border-purple-200" },
    2: { bg:"bg-blue-100",   text:"text-blue-700",   border:"border-blue-200" },
    3: { bg:"bg-amber-100",  text:"text-amber-700",  border:"border-amber-200" },
    4: { bg:"bg-teal-100",   text:"text-teal-700",   border:"border-teal-200" },
    5: { bg:"bg-emerald-100",text:"text-emerald-700",border:"border-emerald-200" },
  }
  return map[id] || { bg:"bg-gray-100", text:"text-gray-600", border:"border-gray-200" }
}


export default function OpsDash() {
  const [user,       setUser]       = useState(null)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPass,  setLoginPass]  = useState("")
  const [loginErr,   setLoginErr]   = useState(false)

  const [users,    setUsers]    = useState(SEED_USERS)    // Carregar dados do Supabase   useEffect(() => {     const loadData = async () => {       const [dbUsers, dbClientes, dbAnotacoes, dbFases, dbHistorico] = await Promise.all([         getUsuarios(), getClientes(), getAnotacoes(), getFases(), getHistorico()       ])       if (dbUsers.length > 0) setUsers(dbUsers)       if (dbClientes.length > 0) setClients(dbClientes.map((c:any) => ({         ...c, id: c.id, name: c.name, horasNum: c.horas_num, horasRealizadas: c.horas_realizadas,         pctHoras: c.pct_horas, criadoEm: c.criado_em, codSGD: c.cod_sgd, dataAssinatura: c.data_assinatura       })))       if (dbAnotacoes.length > 0) {         const anotObj: any = {}         dbAnotacoes.forEach((a:any) => {           if (!anotObj[a.cliente_id]) anotObj[a.cliente_id] = []           anotObj[a.cliente_id].push({...a, id: a.id, autorId: a.autor_id, horasDecimal: a.horas_decimal})         })         setAnotacoes(anotObj)       }       if (dbFases.length > 0) {         const fasesObj: any = {}         dbFases.forEach((f:any) => { fasesObj[f.cliente_id] = f.dados })         setFasesImplantacao(fasesObj)       }       if (dbHistorico.length > 0) setHistorico(dbHistorico.map((h:any) => ({         ...h, clienteId: h.cliente_id, statusId: h.status_id       })))     }     loadData()   }, [])
  // ══════════ HISTÓRICO DE STATUS (novo modelo central) ══════════
  const [historico, setHistorico] = useState(SEED_HISTORICO)

  // Retorna o statusId atual do cliente (último registro do histórico)
  const statusAtual = (clienteId) => {
    const lista = historico.filter(h => h.clienteId === clienteId)
    if (!lista.length) return null
    return lista[lista.length - 1].statusId
  }

  // Retorna o nome do status atual do cliente
  const statusAtualNome = (clienteId) => {
    const sid = statusAtual(clienteId)
    if (!sid) return "Sem status"
    return STATUS_LIST.find(s => s.id === sid)?.nome ?? "Sem status"
  }

  // Adiciona registro no histórico
  const registrarStatus = (clienteId, statusId, observacao, usuarioNome) => {
    const reg = {
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      clienteId, statusId,
      data: new Date().toLocaleString("pt-BR", {day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}),
      usuario: usuarioNome,
      observacao,
    }
    setHistorico(p => [...p, reg])
    return reg
  }

  // Estado do painel de implantação (seleção de cliente e form)
  const [implClienteId, setImplClienteId] = useState("")
  const [implStatusSel, setImplStatusSel] = useState(0)
  const [implObs,       setImplObs]       = useState("")
  const [implSearch,    setImplSearch]    = useState("")

  // helpers legados para manter compatibilidade com código existente
  const resolveStatusId = (nome) => {
    const s = SEED_STATUS_IMPLANTACAO.find(x => x.nome.toLowerCase() === (nome||'').toLowerCase())
    return s?.id ?? null
  }
  const buildHistoricoEntry = (statusNome, responsavelId, obs) => ({
    statusId:   resolveStatusId(statusNome),
    statusNome,
    data:       new Date().toLocaleDateString("pt-BR"),
    responsavel: responsavelId,
    observacao: obs,
  })

  const [packages, setPackages] = useState(SEED_PACKAGES)
  const [tabelaPrecos, setTabelaPrecos] = useState(SEED_TABELA_PRECOS)
  const [statusImplantacao, setStatusImplantacao] = useState(SEED_STATUS_IMPLANTACAO)
  // enrichSeedClients: limpa campos legados de status fixo
  const enrichSeedClients = (raw) => raw.map(c => ({
    id: c.id,
    name: c.name,
    cidade: c.cidade || '',
    estado: c.estado || '',
    pacote: c.pacote || '',
    responsavel: c.responsavel || null,
    pct: c.pct ?? 0,
    inicio: c.inicio || '',
    mes: c.mes || '',
    criadoEm: c.criadoEm || '',
    codSGD: c.codSGD || '',
    vendedor: c.vendedor || '',
    dataAssinatura: c.dataAssinatura || '',
    horasNum: c.horasNum ?? 0,
    horasRealizadas: c.horasRealizadas ?? 0,
    pctHoras: c.pctHoras ?? 0,
    criadoPor: c.criadoPor || '',
    origem: c.origem || 'sistema',
    observacoesIniciais: c.observacoesIniciais || '',
    dataPrimeiroContato: c.dataPrimeiroContato || c.criadoEm || '',
    responsavelPrimeiroContato: c.responsavelPrimeiroContato || c.responsavel || 'sistema',
  }))
  const [clients,  setClients]  = useState(() => enrichSeedClients(SEED_CLIENTS))
  const [filaExec, setFilaExec] = useState(() => enrichSeedClients(SEED_FILA))
  const [validacoes, setValidacoes] = useState([])
  const [reprovados, setReprovados] = useState([])
  const [anotacoes,  setAnotacoes]  = useState(SEED_ANOTACOES)
  const [messages,   setMessages]   = useState({})
  const [toasts,     setToasts]     = useState([])

  const [page,      setPage]      = useState("dashboard")
  const [selClient, setSelClient] = useState(null)
  const [cadTab,    setCadTab]    = useState("clientes")  // aba dentro de Cadastros
  const [search,    setSearch]    = useState("")  // busca global de clientes

  const [modalAnot,      setModalAnot]      = useState(null)
  const [modalExec,      setModalExec]      = useState(null)
  const [modalVal,       setModalVal]       = useState(false)
  const [modalValItem,   setModalValItem]   = useState(null)
  const [valStep,        setValStep]        = useState(1)
  const [valForm,        setValForm]        = useState({ razaoSocial: '', cnpj: '', email: '', telefone: '', cidade: '', estado: '', vendedor: '', pacote: '', valorContrato: '', dataAssinatura: '', obs: '' })
  const [valMotivoRep,   setValMotivoRep]   = useState('')
  const [modalReprovar,  setModalReprovar]  = useState(null)
  const [modalNewUser,   setModalNewUser]   = useState(false)
  const [modalEditUser,  setModalEditUser]  = useState(null)
  const [modalImpl,      setModalImpl]      = useState(null)
  const [modalImportProd, setModalImportProd] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [importPreview, setImportPreview] = useState(null) // {rows: [], headers: [], errors: []}
  const [showConcluidos, setShowConcluidos] = useState(false) // Toggle para mostrar clientes finalizados
  const [implForm,       setImplForm]       = useState({status:'',primeiroContato:'',checkout:'',comentario:'',tipo:'Checkpoint'})
  const [analises,       setAnalises]       = useState([])
  const [editingPkg,     setEditingPkg]     = useState(null) // ID do pacote sendo editado
  const [editPkgForm,    setEditPkgForm]    = useState({id:'',name:'',horas:0,valorHora:0,descAtivo:false,descPct:0})
  const [motivoRep,      setMotivoRep]      = useState('') // Motivo da reprovacao
  const [execResp,       setExecResp]       = useState('') // Responsavel selecionado na fila de execucao
  const [copied,         setCopied]         = useState(null) // ID do cliente cujo texto foi copiado (para feedback visual)
  const [novaAnot,       setNovaAnot]       = useState({ tipo: 'Geral', sub: '', texto: '' }) // Formulario de nova anotacao
  
  // ════��═════ GESTAO DE CONVERSAO (KLAYTON) ══════════
  const [conversoes, setConversoes] = useState({})
  const SISTEMAS_ANTERIORES = ["Tron","SCI","Fortes","Prosoft","Contmatic","Alterdata","Nasajon","Questor","WK Radar","Senior","Calima","Conta Azul","Protheus","Outro"]
  const STATUS_CONVERSAO = ["Fila","Em Andamento","Aguardando Cliente","Aguardando Dados","Convertendo","Validando","Finalizado","Erro"]
  const PRIORIDADE_CONVERSAO = ["Normal","Alta","Urgente"]
  const TIPO_CONVERSAO = ["Folha","Fiscal","Contabil","Completa"]
  const BLOQUEIO_OPTS = ["Cliente","Dados","Sistema","Interno","Nenhum"]
  
  const getConversao = (clienteId) => conversoes[clienteId] || {
    sistemaAnterior: '',
    statusConversao: 'Fila',
    prioridade: 'Normal',
    responsavel: 'Klayton',
    dataInicio: '',
    dataPrevista: '',
    dataConclusao: '',
    tipoConversao: '',
    bloqueio: 'Nenhum',
    observacoes: '',
  }
  const setConversao = (clienteId, updates) => {
    setConversoes(prev => ({
      ...prev,
      [clienteId]: { ...getConversao(clienteId), ...updates }
    }))
  }
  
  const isAtrasado = (clienteId) => {
    const c = getConversao(clienteId)
    if (!c.dataPrevista || c.statusConversao === 'Finalizado') return false
    return new Date(c.dataPrevista) < new Date()
  }
  
  // ══════════ FUNCAO CENTRAL DE STATUS (UNICA FONTE DE VERDADE) ═══════��══
  const getStatusImplantacao = (clienteId) => {
    if (!clienteId) return { status: 'Nao iniciado', cor: 'bg-gray-100 text-gray-500 border-gray-200', ordem: 0, isFinal: false }
    const fase = fasesImplantacao?.[clienteId] || {}
    
    // FINALIZADO ou CANCELADO
    if (fase.concluido === true) {
      return { status: 'Finalizado', cor: 'bg-emerald-100 text-emerald-700 border-emerald-200', ordem: 99, isFinal: true }
    }
    if (fase.cancelado === true) {
      return { status: 'Cancelado', cor: 'bg-red-100 text-red-600 border-red-200', ordem: 98, isFinal: true }
    }
    
    // EM IMPLANTACAO (check1 ou check2 em andamento)
    if (fase.check1Status === 'Realizado' && fase.check2Status !== 'Realizado') {
      return { status: 'Em implantacao', cor: 'bg-indigo-100 text-indigo-700 border-indigo-200', ordem: 4, isFinal: false }
    }
    
    // ONBOARDING (check2 realizado, aguardando conclusao)
    if (fase.check2Status === 'Realizado') {
      return { status: 'Onboarding', cor: 'bg-violet-100 text-violet-700 border-violet-200', ordem: 5, isFinal: false }
    }
    
    // CONTATO REALIZADO
    if (fase.primeiroContatoStatus === 'Realizado') {
      return { status: 'Contato realizado', cor: 'bg-blue-100 text-blue-700 border-blue-200', ordem: 3, isFinal: false }
    }
    
    // PRE-BOARDING (tecnico ou comercial iniciado)
    if (fase.pbTecnico) {
      return { status: 'Pre-boarding tecnico', cor: 'bg-cyan-100 text-cyan-700 border-cyan-200', ordem: 2, isFinal: false }
    }
    if (fase.pbComercial) {
      return { status: 'Pre-boarding comercial', cor: 'bg-amber-100 text-amber-700 border-amber-200', ordem: 1, isFinal: false }
    }
    
    return { status: 'Nao iniciado', cor: 'bg-gray-100 text-gray-500 border-gray-200', ordem: 0, isFinal: false }
  }
  
  // Helpers para uso simplificado
  const isFinalizado = (clienteId) => getStatusImplantacao(clienteId).isFinal
  const getStatusNome = (clienteId) => getStatusImplantacao(clienteId).status
  const getStatusCor = (clienteId) => getStatusImplantacao(clienteId).cor
  
  // Resumo calculado automaticamente
  const getResumoImplantacao = () => {
    const totais = { preBoarding: 0, contato: 0, emImplantacao: 0, onboarding: 0, finalizado: 0, cancelado: 0, naoIniciado: 0 }
    clients.forEach(c => {
      const { status } = getStatusImplantacao(c.id)
      if (status.includes('Pre-boarding')) totais.preBoarding++
      else if (status === 'Contato realizado') totais.contato++
      else if (status === 'Em implantacao') totais.emImplantacao++
      else if (status === 'Onboarding') totais.onboarding++
      else if (status === 'Finalizado') totais.finalizado++
      else if (status === 'Cancelado') totais.cancelado++
      else totais.naoIniciado++
    })
    return totais
  }
  
  // ══════════ FASES DE IMPLANTACAO POR CLIENTE ══════════
  const [fasesImplantacao, setFasesImplantacao] = useState({})
  const getFaseCliente = (clienteId) => {
    if (!clienteId) return {
      dataEntrada: '', horasContratadas: 0, pbComercial: '', pbTecnico: '',
      primeiroContatoStatus: '', dataPrimeiroContato: '', onboardingStatus: '',
      dataOnboarding: '', implantacaoStatus: '', dataImplantacao: '', modulos: [],
      check1Status: '', dataCheck1: '', check2Status: '', dataCheck2: '',
      responsavelChecks: '', dataFim: '', produtos: [], dataContatoFinal: '', concluido: false, cancelado: false,
    }
    return fasesImplantacao?.[clienteId] || {
    // FASE 1: ENTRADA
    dataEntrada: '',
    produtos: [],
    pbComercial: '',
    pbTecnico: '',
    primeiroContatoStatus: '',
    dataPrimeiroContato: '',
    onboardingStatus: '',
    dataOnboarding: '',
    implantacaoStatus: '',
    horasContratadas: 0,
    // FASE 2: IMPLANTACAO EM ANDAMENTO
    modulos: [],
    check1Status: '',
    dataCheck1: '',
    check2Status: '',
    dataCheck2: '',
    dataFim: '',
    // FASE 3: CONCLUSAO / ADOCAO
    dataContatoFinal: '',
    responsavelFinal: '',
    avaliacao: '',
    concluido: false,
    horasProjetoFinal: 0,
  }}
  const setFaseCliente = (clienteId, updates) => {
    setFasesImplantacao((p) => ({ ...p, [clienteId]: { ...(p[clienteId] || {}), ...updates } }))
  }
  
  // ══════════ HELPERS DE ROLE ══════════
  const isTecnico = () => user?.role === 'tecnico' || user?.role === 'coord_tec'
  const isAdmin   = () => user?.role === 'admin' || user?.role === 'diretor' || user?.role === 'root'
  const isExecMgr = () => ['admin', 'diretor', 'root', 'coord_com', 'coord_tec'].includes(user?.role)
  const canAccess = (pg) => {
    if (isAdmin()) return true
    const rules = {
      dashboard: true,
      clientes: true,
      alertas: true,
      cadastros: ['admin','diretor','root','coord_com','coord_tec','vendedor'].includes(user?.role),
      comercial: ['admin','diretor','root','coord_com','vendedor'].includes(user?.role),
      operacoes: ['admin','diretor','root','coord_tec','tecnico'].includes(user?.role),
      atendimentos: ['admin','diretor','root','coord_tec','tecnico'].includes(user?.role),
      colaboradores: ['admin','diretor','root','coord_com','coord_tec'].includes(user?.role),
      produtos: true,
      comissoes: ['admin','diretor','root','coord_com','vendedor'].includes(user?.role),
      qualidade_ia: ['admin','diretor','root','coord_tec','tecnico'].includes(user?.role),
      fila_execucao: ['admin','diretor','root','coord_tec','tecnico'].includes(user?.role),
      anotacoes: true,
      conversoes: ['admin','diretor','root'].includes(user?.role),
      implantacao: ['admin','diretor','root','coord_tec','tecnico'].includes(user?.role),
    }
    return rules[pg] ?? false
  }
  
  // ══════════ FUNCOES UTILITARIAS ══════════
  const syncSupabase = async (tabela: string, dados: any) => {     try { await supabase.from(tabela).upsert(dados) } catch(e) { console.error(e) }   }    const toast = (msg, color = "blue") => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, color }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }
  
  const goPage = (pg) => {
    if (!canAccess(pg)) { toast("Sem permissao para acessar esta pagina", "red"); return }
    setPage(pg)
    setSelClient(null)
  }
  
  // alertCliAll: clientes em risco (baseado nas fases)
  const alertCliAll  = clients.filter(c => { const fase = getFaseCliente(c.id); return fase.check1Status === 'Risco' || fase.check2Status === 'Risco' })
  const alertCli     = isTecnico() ? alertCliAll.filter(c => c.responsavel === user?.id) : alertCliAll
  const pendVal     = validacoes.filter(v => v.status === "aguardando")

  const doLogin = () => {
    const u = users.find(x => x.email.toLowerCase() === loginEmail.toLowerCase() && x.password === loginPass && x.ativo !== false)
    if (!u) { setLoginErr(true); return }
    setLoginErr(false); setUser(u)
    toast(`Bem-vindo, ${u.name.split(" ")[0]}!`, "green")
  }
  const doLogout = () => { setUser(null); setLoginPass(""); setPage("dashboard") }

  const addCliente = (data) => {
    const codSGDdado = data.codSGD || data.cliente_id || ''
    const nomeNorm   = (data.razaoSocial || '').trim().toUpperCase()
    const jaExiste   = clients.some(c =>
      (codSGDdado && (c.codSGD === codSGDdado || c.id === `cli_${codSGDdado}`)) ||
      (nomeNorm && c.name?.trim().toUpperCase() === nomeNorm)
    )
    if (jaExiste) {
      toast(`Cliente "${data.razaoSocial?.split(' ')[0]}" já existe na base.`, 'amber')
      return
    }

    const origem = data._origem || "comercial"
    const nc = {
      id: `CLI-${Date.now()}`,
      name: data.razaoSocial.toUpperCase(),
      cnpj: data.cnpj, email: data.email, telefone: data.telefone,
      cidade: data.cidade, estado: data.estado,
      vendedor: data.vendedor, pacote: data.pacote,
      valorContrato: data.valorContrato,
      dataAssinatura: data.dataAssinatura,
      dataPrimeiroContato: nowDate(),
      responsavelPrimeiroContato: user.id,
      origem,
      observacoesIniciais: data.obs || "",
      mes: mesAtual(),
      responsavel, horasNum: packages.find(p=>p.name===data.pacote)?.horas||0,
      criadoEm: nowDate(), criadoPor: user.name,
    }
    setClients(p => [nc, ...p])
    setFilaExec(p => [...p, { ...nc, execEm: nowDate() }])
    // Registra status inicial no histórico (Pré-boarding Comercial = 1)
    setTimeout(() => registrarStatus(nc.id, 1, "Cadastro inicial", user.name), 0)
    toast(`${data.razaoSocial.split(" ")[0]} adicionado à fila!`, "green")
  }

  const mesAtual = () => {
    const d = new Date(); const m = d.getMonth()+1; const y = d.getFullYear()%100
    const names = ["","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
    return `${names[m]}${String(y).padStart(2,"0")}`
  }

  const submeterVal = () => {
    if (!valForm.razaoSocial || !valForm.pacote) { toast("Preencha os campos obrigatórios","red"); return }
    setValidacoes(p => [{ id:`VAL-${Date.now()}`, ...valForm, status:"aguardando", criadoEm:nowDate(), criadoPor:user.name }, ...p])
    setModalVal(false)
    setValForm({ razaoSocial:"", cnpj:"", email:"", telefone:"", cidade:"", estado:"", vendedor:"", pacote:"", valorContrato:"", dataAssinatura:"", obs:"" })
    setValStep(1)
    toast("Contrato enviado para validação!", "amber")
  }
  const aprovarVal = (v) => {
    setValidacoes(p => p.map(x => x.id===v.id ? {...x, status:"aprovado", validadoEm:nowDate(), validadoPor:user.name} : x))
    addCliente({...v, _origem: "comercial"})
    toast(`${v.razaoSocial.split(" ")[0]} aprovado — na fila de execução!`, "green")
  }
  const reprovarVal = () => {
    if (!motivoRep.trim()) { toast("Informe a observação","red"); return }
    setReprovados(p => [{ ...modalReprovar, status:"em_observacao", reprovadoEm:nowDate(), reprovadoPor:user.name, observacao: motivoRep }, ...p])
    setValidacoes(p => p.filter(x => x.id !== modalReprovar.id))
    setModalReprovar(null); setMotivoRep("")
    toast("Solicitação de observação registrada.", "red")
  }

  const atribuirExec = () => {
    if (!execResp) { toast("Selecione um responsável","red"); return }
    const resp = EXEC_RESPONSAVEIS.find(r => r.id === execResp)
    setFilaExec(p => p.filter(c => c.id !== modalExec.id))
    // Registra no novo histórico de status
    registrarStatus(modalExec.id, 2, `Atribuído para ${resp?.nome || execResp}`, user.name)
    setClients(p => p.map(c => {
      if (c.id !== modalExec.id) return c
      return { ...c, responsavel: execResp }
    }))
    setModalExec(null); setExecResp("")
    toast(`Atribuído para ${resp.nome.split(" ")[0]}!`, "green")
  }

  const addAnot = (cid) => {
    if (!novaAnot.texto.trim()) { toast("Escreva algo","red"); return }
    const a = { id:Date.now(), tipo:novaAnot.tipo, subtipo:novaAnot.sub, texto:novaAnot.texto, autor:user.name.split(" ")[0], data:nowDT(), sgd:false }
    setAnotacoes(p => ({ ...p, [cid]: [...(p[cid]||[]), a] }))
    setNovaAnot(p => ({...p, texto:""}))
    toast("Anotação salva!", "green")
  }
  const toggleSGD = (cid, id) =>
    setAnotacoes(p => ({ ...p, [cid]: (p[cid]||[]).map(a => a.id===id ? {...a, sgd:!a.sgd} : a) }))
  const copiarSGD = (cid) => {
    const lista = (anotacoes[cid]||[]).filter(a => a.sgd)
    if (!lista.length) { toast("Marque ao menos uma","red"); return }
    const c = clients.find(x => x.id===cid)
    navigator.clipboard.writeText(`CONTRATO: ${c?.name||cid}\n${"─".repeat(40)}\n`+lista.map(a=>`[${a.data}] ${a.tipo} › ${a.subtipo} — ${a.texto}`).join("\n"))
      .then(() => { setCopied(cid); setTimeout(()=>setCopied(null),2000); toast("Copiado!","green") })
  }

  const criarUsuario = () => {
    const { name, email, password, role } = newUserForm
    if (!name||!email||!password) { toast("Preencha todos os campos","red"); return }
    if (users.find(u=>u.email.toLowerCase()===email.toLowerCase())) { toast("E-mail já cadastrado","red"); return }
    const nu = { id:`USR-${Date.now()}`, name, email, password, role, ativo:true }
    setUsers(p => [...p, nu])
    setModalNewUser(false)
    setNewUserForm({ name:"", email:"", password:"", role:"ops" })
    toast(`Usuário ${name.split(" ")[0]} criado!`, "green")
  }
  const toggleUserAtivo = (id) =>
    setUsers(p => p.map(u => u.id===id ? {...u, ativo:!u.ativo} : u))
  const salvarEdicaoUser = () => {
    setUsers(p => p.map(u => u.id===modalEditUser.id ? {...modalEditUser} : u))
    setModalEditUser(null); toast("Usuário atualizado!", "green")
  }
  const excluirUser = (id) => {
    if (id === user.id) { toast("Não é possível excluir o próprio usuário","red"); return }
    setUsers(p => p.filter(u => u.id !== id))
    toast("Usuário removido.", "amber")
  }

  const savePkg = () => {
    setPackages(p => p.map(x => x.id===editingPkg ? {...editPkgForm} : x))
    setEditingPkg(null); toast("Pacote salvo!", "green")
  }

  const sitBadge = (sit) => {
    if (!sit) return <span className="px-2 py-0.5 rounded-full text-[10px] border bg-gray-100 text-gray-400">—</span>
    const stObj = statusImplantacao.find(s =>
      s.nome.toLowerCase() === sit.toLowerCase() || s.id === sit
    )
    if (stObj) {
      const typeClasses = stObj.tipo === 'concluido'
        ? 'bg-emerald-50 border-emerald-300'
        : stObj.tipo === 'alerta'
        ? 'bg-amber-50 border-amber-300'
        : 'bg-blue-50 border-blue-300'
      return <span className={`px-2 py-0.5 rounded-full text-[10px] border ${typeClasses}`} style={{color: stObj.cor, borderColor: stObj.cor+'66'}}>{stObj.nome}</span>
    }
    const s = sit.toLowerCase()
    if (s.includes("conclu")||s.includes("finaliz")) return <span className="px-2 py-0.5 rounded-full text-[10px] border bg-emerald-100 text-emerald-700 border-emerald-200">{sit}</span>
    if (s.includes("risco"))     return <span className="px-2 py-0.5 rounded-full text-[10px] border bg-red-100 text-red-700 border-red-200">{sit}</span>
    if (s.includes("andamento")) return <span className="px-2 py-0.5 rounded-full text-[10px] border bg-blue-100 text-blue-700 border-blue-200">{sit}</span>
    if (s.includes("fila"))      return <span className="px-2 py-0.5 rounded-full text-[10px] border bg-violet-100 text-violet-700 border-violet-200">{sit}</span>
    return <span className="px-2 py-0.5 rounded-full text-[10px] border bg-gray-100 text-gray-500">{sit}</span>
  }

  // Novo: badge baseado no histórico do cliente
  const clientSitBadge = (clienteId) => {
    const sid = statusAtual(clienteId)
    if (!sid) return <span className="px-2 py-0.5 rounded-full text-[10px] border bg-gray-100 text-gray-400">Sem status</span>
    const s = STATUS_LIST.find(x => x.id === sid)
    const c = statusColor(sid)
    return <span className={`px-2 py-0.5 rounded-full text-[10px] border ${c.bg} ${c.text} ${c.border}`}>{s?.nome ?? '—'}</span>
  }

  const pBar = (pct) => (
    <div className="w-20">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${pct>=70?"bg-emerald-500":pct>=30?"bg-amber-500":"bg-red-500"}`} style={{width:`${pct}%`}}/>
      </div>
      <div className={`text-[10px] text-right mt-0.5 font-mono ${pct>=70?"text-emerald-600":pct>=30?"text-amber-600":"text-red-500"}`}>{pct}%</div>
    </div>
  )

  const stepBadge = (v) => {
    if (!v) return <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] bg-gray-100 text-gray-400">—</span>
    const l = v.toLowerCase()
    if (l.includes("realiz") && !l.includes("não")) return <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] bg-emerald-100 text-emerald-700">✓</span>
    if (l.includes("pend")) return <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] bg-amber-100 text-amber-700">?</span>
    if (l.includes("risco")) return <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] bg-red-100 text-red-600">!</span>
    return <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] bg-gray-100 text-gray-400">{v.slice(0,2)}</span>
  }


  const PageDashboard = () => {
    const TODAY = new Date('2026-04-14')
    const RESP = {
      ops1:'Dougllas', ops2:'Leonildo', ops3:'Renato', ops4:'Ericka',
      ops5:'Johnny',   ops6:'Wanderley', root:'Rodrigo',
    }
    const HORAS_MES = {
      ops1:[84,81,73,28], ops2:[64,86,90,4],  ops3:[77,86,129,11],
      ops4:[54,51,82,4],  ops5:[69,38,58,0],  ops6:[50,99,21,0],
    }
    const META = {
      ops1:1200, ops2:1200, ops3:1400, ops4:1100, ops5:1100, ops6:1000,
    }
    const VENDEDORES = [
      {id:'Denis Nunes Brauna',      short:'Denis N.'},
      {id:'Claudivan da Silva Sousa', short:'Claudivan'},
      {id:'Marcelo da Rocha Bezerra', short:'Marcelo B.'},
    ]
    const diasDesde = (dataStr) => {
      if (!dataStr) return 9999
      try {
        const clean = dataStr.split(' ')[0]
        const [dd,mm,yy] = clean.includes('/') ? clean.split('/') : [clean.slice(0,2),clean.slice(2,4),clean.slice(4)]
        return Math.floor((TODAY.getTime() - new Date(`20${yy}-${mm}-${dd}`).getTime()) / 86400000)
      } catch { return 9999 }
    }
    const ultMov = (id) => {
      const list = anotacoes[id] || []
      if (!list.length) return {dias:9999, txt:'Sem registro'}
      const sorted = [...list].sort((a,b) => (b.data||'').localeCompare(a.data||''))
      const d = sorted[0]?.data || ''
      const dias = diasDesde(d)
      return {dias, txt: dias===9999 ? 'Sem registro' : `${dias}d atrás`}
    }
    const calcRisk = (c) => {
      const sNome = statusAtualNome(c.id).toLowerCase()
      if (sNome.includes('finaliz') || sNome.includes('cancel')) return 0
      const {dias} = ultMov(c.id)
      let sc = 0
      if (dias>3) sc++
      if (dias>10) sc+=3
      try {
        const age = diasDesde(c.criadoEm||'')
        if (age>45 && statusAtual(c.id) === null) sc+=2
      } catch {}
      return sc
    }
    const uniq = (arr) => {
      const seen = new Set()
      return arr.filter(x => seen.has(x.id) ? false : seen.add(x.id))
    }
    const allC = uniq(clients)
    const myClients = isTecnico()
      ? allC.filter((c) => c.responsavel === user.id)
      : allC
              const andamento  = myClients.filter((c) => !isFinalizado(c.id))
              const realizados = myClients.filter((c) => getStatusNome(c.id) === 'Finalizado')
              const cancelados = myClients.filter((c) => getStatusNome(c.id) === 'Cancelado')
    const comVendedor= allC.filter((c) => c.vendedor && c.vendedor.trim())
    
    const semMovList = andamento
      .map((c) => ({...c, ...ultMov(c.id)}))
      .filter((c) => c.dias > 7)
      .sort((a,b) => b.dias - a.dias)
    
    const riscoList = andamento
      .map((c) => ({...c, rk: calcRisk(c), ...ultMov(c.id)}))
      .filter((c) => c.rk >= 3 && c.rk < 6)
      .sort((a,b) => b.rk - a.rk)
    
    const criticos = andamento.filter((c) => calcRisk(c) >= 6)
    const vendStats = VENDEDORES.map(v => {
      const vendidos = comVendedor.filter((c) => c.vendedor===v.id)
              const concluidos = vendidos.filter((c) => getStatusNome(c.id) === 'Finalizado').length
              const canc = vendidos.filter((c) => getStatusNome(c.id) === 'Cancelado').length
      const conv = vendidos.length > 0 ? Math.round(concluidos/vendidos.length*100) : 0
      const emRisco = vendidos.filter((c) => {
        const rk = calcRisk(c)
        return rk >= 3
      }).length
      return {...v, total:vendidos.length, concluidos, canc, conv, emRisco}
    }).sort((a,b) => b.total - a.total)
    const maxVend = Math.max(...vendStats.map(v=>v.total), 1)
    const opsStats = Object.entries(HORAS_MES).map(([id,meses]:[string,number[]]) => {
      const exe = (meses).reduce((a,b)=>a+b, 0)
      const meta = META[id] || 1000
      const pct = Math.round(exe/meta*100)
      return {id, nome: RESP[id]||id, exe, meta, pct}
    }).sort((a,b) => b.exe - a.exe)
    const totalVendidos = comVendedor.length
    const totalRisco = comVendedor.filter((c) => calcRisk(c) >= 3).length
    const pctRisco = totalVendidos > 0 ? Math.round(totalRisco/totalVendidos*100) : 0
    if (!window.__dsh) window.__dsh = {sm:true, at:false}
    const tog = (k) => {
      window.__dsh[k] = !window.__dsh[k]
      setAnotacoes((p) => ({...p}))
    }
    
    const _render1066 = () => {
      const insightBg = pctRisco>=20?'bg-red-50 border-red-200':pctRisco>=10?'bg-amber-50 border-amber-200':'bg-emerald-50 border-emerald-200'
      const insightIcon = pctRisco>=20?'bg-red-100 text-red-600':pctRisco>=10?'bg-amber-100 text-amber-600':'bg-emerald-100 text-emerald-600'
      const insightTitle = pctRisco>=20?'text-red-800':pctRisco>=10?'text-amber-800':'text-emerald-800'
      const insightSub = pctRisco>=20?'text-red-600':pctRisco>=10?'text-amber-600':'text-emerald-600'
      const insightMsg = pctRisco===0?'Todos os contratos estão saudáveis na operação'
        :pctRisco<10?'Baixo risco operacional — acompanhamento padrão'
        :pctRisco<20?'Atenção: parte dos contratos vendidos precisa de acompanhamento'
        :'Alto risco operacional — contratos da equipe comercial em alerta'
      const insightEmoji = pctRisco>=20?'⚠':pctRisco>=10?'!':'✓'
      return (
      <div className={`flex items-center gap-4 px-5 py-4 rounded-xl border ${insightBg}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold ${insightIcon}`}>
          {insightEmoji}
        </div>
        <div>
          <p className={`text-sm font-bold ${insightTitle}`}>
            {totalVendidos} contratos vendidos — {totalRisco} com risco na operação ({pctRisco}%)
          </p>
          <p className={`text-xs mt-0.5 ${insightSub}`}>{insightMsg}</p>
        </div>
      </div>
      )
    }
    const _render995 = () => {
      const baseC = isTecnico() ? myClients : allC
      return [
        {l: isTecnico()?'Meus Contratos':'Total de Contratos', v:baseC.length,         sub:`${andamento.length} em andamento`,           bt:'border-t-blue-500'},
        {l:'Concluídos',            v:realizados.length,   sub:`${baseC.length>0?Math.round(realizados.length/baseC.length*100):0}% de conclusão`, bt:'border-t-emerald-500'},
        {l:'Em Andamento',          v:andamento.length,    sub:`${semMovList.length} sem movimentação`,       bt:`border-t-${semMovList.length>0?'red-400':'blue-300'}`},
        {l:'Críticos / Cancelados', v:`${criticos.length} / ${cancelados.length}`, sub:'score≥6 / cancelados', bt:`border-t-${criticos.length>0?'red-500':'gray-300'}`},
      ].map((k,i) => (
        <div key={i} className={`bg-white rounded-2xl shadow-sm p-4 border-l-4 ${k.bt.replace('border-t-','border-l-')}`}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{k.l}</p>
          <p className="text-3xl font-bold text-gray-900 leading-none">{k.v}</p>
          <p className="text-[10px] text-gray-400 mt-2">{k.sub}</p>
        </div>
      ))
    }

    return (
    <div className="min-h-screen bg-gray-100 -m-6 p-6 space-y-6">
    
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white"/>
          </div>
          {isTecnico() ? 'Meu Dashboard' : 'Dashboard Operacional'}
        </h1>
        <p className="text-sm text-gray-500 mt-1 ml-13">{isTecnico() ? `Visao dos seus contratos` : 'Visao atual da operacao'}</p>
      </div>
    
      {/* KPI Cards - Grid 4 colunas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {_render995()}
      </div>

      {/* Alertas */}
      <div className="rounded-2xl overflow-hidden shadow-sm">
        <button onClick={()=>tog('sm')}
          className="w-full flex items-center justify-between px-5 py-4 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse flex-shrink-0"/>
            <span className="font-bold text-base">{semMovList.length} contrato{semMovList.length!==1?'s':''} sem movimentação</span>
            <span className="text-red-200 text-sm font-normal">há mais de 7 dias</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">{semMovList.length}</span>
            <span className="text-red-200 text-xs">{window.__dsh.sm?'▲':'▼ Ver contratos'}</span>
          </div>
        </button>
        {window.__dsh.sm && (
          <>
            <div className="grid px-4 py-1.5 bg-red-50 border-b border-red-100 text-[10px] font-bold text-red-600 uppercase tracking-widest gap-3"
              style={{gridTemplateColumns:'1fr 110px 120px'}}>
              <span>Cliente</span><span>Responsável</span><span>Sem movimentação</span>
            </div>
            <div className="max-h-72 overflow-y-auto bg-white divide-y divide-red-50">
              {semMovList.map((c) => {
                const isCoordCom = user?.role==='coord_com'
                const comentKey = `sm_${c.id}`
                if (!window.__dashComent) window.__dashComent = {}
                return (
                <div key={`smov-${c.id}`} className="px-4 py-2.5">
                  <div className="grid gap-3 items-center"
                    style={{gridTemplateColumns:'1fr 110px 120px'}}
                    onClick={!isCoordCom?()=>{setModalImpl(c.id);setImplForm({status:'',primeiroContato:'',checkout:'',comentario:'',tipo:'Checkpoint'})}:undefined}
                    className={`grid gap-3 items-center ${!isCoordCom?'cursor-pointer hover:bg-red-50 rounded-lg transition-colors':''}`}>
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.codSGD||''}</p>
                    </div>
                    <p className="text-sm text-gray-600 self-center truncate">{RESP[c.responsavel]||c.responsavel||'—'}</p>
                    <span className={`self-center text-sm font-bold ${c.dias===9999?'text-red-600':'text-red-500'}`}>
                      {c.dias===9999 ? '⚠ Sem registro' : `${c.dias} dias`}
                    </span>
                  </div>
                  {isCoordCom && (
                    <div className="mt-2 flex gap-2 items-center">
                      <input
                        value={window.__dashComent[comentKey]||''}
                        onChange={e=>{window.__dashComent[comentKey]=e.target.value; setAnotacoes((p)=>({...p}))}}
                        placeholder="Por que não há movimentação neste contrato?"
                        className="flex-1 px-3 py-1.5 border border-red-200 rounded-lg text-xs focus:outline-none focus:border-red-400 bg-red-50 placeholder-red-300"/>
                      <button
                        onClick={()=>{
                          const txt = window.__dashComent[comentKey]?.trim()
                          if (!txt) return
                          const nova = {id:`coment_${Date.now()}`,tipo:'Comercial',subtipo:'Questionamento',texto:`[Coord. Comercial] ${txt}`,autor:user.name,data:new Date().toLocaleString('pt-BR')}
                          setAnotacoes((p)=>({...p,[c.id]:[nova,...(p[c.id]||[])]}))
                          window.__dashComent[comentKey]=''
                          toast('Comentário registrado','green')
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 whitespace-nowrap">
                        Enviar
                      </button>
                    </div>
                  )}
                </div>
                )
              })}
              {semMovList.length===0 && <p className="text-center py-6 text-gray-400 text-sm">Nenhum contrato</p>}
            </div>
            <p className="px-4 py-1.5 text-[10px] text-red-500 bg-red-50 border-t border-red-100">
              {user?.role==='coord_com' ? 'Questione o motivo da ausência de movimentação' : 'Clique em um contrato para registrar ação'}
            </p>
          </>
        )}
      </div>
    
      {/* — Atenção: risco — */}
      <div className="rounded-xl overflow-hidden border border-amber-200">
        <button onClick={()=>tog('at')}
          className="w-full flex items-center justify-between px-5 py-4 bg-amber-500 hover:bg-amber-600 transition-colors text-white">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0"/>
            <span className="font-bold text-base">{riscoList.length} contrato{riscoList.length!==1?'s':''} com atraso</span>
            <span className="text-amber-100 text-sm font-normal">score de risco elevado</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">{riscoList.length}</span>
            <span className="text-amber-100 text-xs">{window.__dsh.at?'▲':'▼ Ver contratos'}</span>
          </div>
        </button>
        {window.__dsh.at && (
          <>
            <div className="grid px-4 py-1.5 bg-amber-50 border-b border-amber-100 text-[10px] font-bold text-amber-600 uppercase tracking-widest gap-3"
              style={{gridTemplateColumns:'1fr 110px 120px'}}>
              <span>Cliente</span><span>Responsável</span><span>Dias de atraso</span>
            </div>
            <div className="max-h-72 overflow-y-auto bg-white divide-y divide-amber-50">
              {riscoList.map((c) => {
                const isCoordCom = user?.role==='coord_com'
                const comentKey = `at_${c.id}`
                if (!window.__dashComent) window.__dashComent = {}
                return (
                <div key={`risco-${c.id}`} className="px-4 py-2.5">
                  <div
                    style={{gridTemplateColumns:'1fr 110px 120px'}}
                    onClick={!isCoordCom?()=>{setModalImpl(c.id);setImplForm({status:'',primeiroContato:'',checkout:'',comentario:'',tipo:'Checkpoint'})}:undefined}
                    className={`grid gap-3 items-center ${!isCoordCom?'cursor-pointer hover:bg-amber-50 rounded-lg transition-colors':''}`}>
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.codSGD||''}</p>
                    </div>
                    <p className="text-sm text-gray-600 self-center truncate">{RESP[c.responsavel]||c.responsavel||'—'}</p>
                    <span className="self-center text-sm font-bold text-amber-600">
                      {c.dias===9999?'—':`${c.dias}d`}
                    </span>
                  </div>
                  {isCoordCom && (
                    <div className="mt-2 flex gap-2 items-center">
                      <input
                        value={window.__dashComent[comentKey]||''}
                        onChange={e=>{window.__dashComent[comentKey]=e.target.value; setAnotacoes((p)=>({...p}))}}
                        placeholder="Qual o motivo do risco neste contrato?"
                        className="flex-1 px-3 py-1.5 border border-amber-200 rounded-lg text-xs focus:outline-none focus:border-amber-400 bg-amber-50 placeholder-amber-300"/>
                      <button
                        onClick={()=>{
                          const txt = window.__dashComent[comentKey]?.trim()
                          if (!txt) return
                          const nova = {id:`coment_${Date.now()}`,tipo:'Comercial',subtipo:'Questionamento',texto:`[Coord. Comercial] ${txt}`,autor:user.name,data:new Date().toLocaleString('pt-BR')}
                          setAnotacoes((p)=>({...p,[c.id]:[nova,...(p[c.id]||[])]}))
                          window.__dashComent[comentKey]=''
                          toast('Comentário registrado','green')
                        }}
                        className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 whitespace-nowrap">
                        Enviar
                      </button>
                    </div>
                  )}
                </div>
                )
              })}
              {riscoList.length===0 && <p className="text-center py-6 text-gray-400 text-sm">Nenhum contrato</p>}
            </div>
            <p className="px-4 py-1.5 text-[10px] text-amber-500 bg-amber-50 border-t border-amber-100">
              {user?.role==='coord_com' ? 'Questione o motivo do risco de atraso' : 'Clique em um contrato para registrar ação'}
            </p>
          </>
        )}
      </div>
    
      {semMovList.length===0 && riscoList.length===0 && (
        <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0"/>
          <span className="text-emerald-700 font-semibold">Nenhum alerta ativo — operação saudável</span>
        </div>
      )}
    
      {/* 3 ── CARDS DE RESUMO */}
      <div className="grid grid-cols-4 gap-3">
        {_render995()}
      </div>
    
      {/* 4 ── RANKING COMERCIAL — apenas gestão */}
      {!isTecnico() && (
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Ranking Comercial — Conversões</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Contratos vendidos · taxa de conversão</p>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
            {comVendedor.length} com vendedor
          </span>
        </div>
        <div>
          {vendStats.map((v, i) => {
            const pctBar = Math.round(v.total/maxVend*100)
            const cor = v.conv>=80?'#10b981':v.conv>=60?'#f59e0b':'#ef4444'
            const corTxt = v.conv>=80?'text-emerald-600':v.conv>=60?'text-amber-500':'text-red-500'
            const medal = i===0?'🥇':i===1?'🥈':'🥉'
            return (
              <div key={`vend-${v.id}`} className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 ${i===0?'bg-blue-50/30':''}`}>
                <div className="w-8 text-center flex-shrink-0">
                  <span className="text-lg">{medal}</span>
                </div>
                <div className="w-28 flex-shrink-0">
                  <p className="text-sm font-semibold leading-tight">{v.short}</p>
                  <p className="text-[10px] text-gray-400">#{i+1} geral</p>
                </div>
                <div className="w-16 flex-shrink-0 text-center">
                  <p className="text-xl font-bold leading-none">{v.total}</p>
                  <p className="text-[10px] text-gray-400">contratos</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-400">{v.concluidos} concluídos · {v.canc} cancelados</span>
                    <span className={`text-xs font-bold ${corTxt}`}>{v.conv}% conv.</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${pctBar}%`, background:cor}}/>
                  </div>
                </div>
                <div className="w-16 flex-shrink-0 text-right">
                  {v.emRisco > 0
                    ? <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">{v.emRisco} em risco</span>
                    : <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-semibold">sem risco</span>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>
      )} {/* fim !isTecnico ranking comercial */}
    
      {/* 5 ── INSIGHT CONEXÃO COMERCIAL ↔ OPERAÇÃO — apenas gestão */}
      {(!isTecnico()) && _render1066()}
    
      {/* 6 ── RANKING OPERACIONAL */}
      {user?.role!=='coord_com' && (
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{isTecnico() ? 'Meu Desempenho — Execução' : 'Ranking Operacional ��� Execução'}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Horas realizadas · meta anual 2026</p>
          </div>
          <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
            {isTecnico()
              ? `${(HORAS_MES[user.id]||[]).reduce((a,b)=>a+b,0)}h acumuladas`
              : `${opsStats.reduce((a,r)=>a+r.exe,0)}h acumuladas`}
          </span>
        </div>
        <div>
          {opsStats
            .filter((r) => isTecnico() ? r.id === user.id : true)
            .map((r,i) => {
            const rMedal = i===0?'🥇':i===1?'🥈':i===2?'🥉':null
            const rCor = r.pct>=70?'#10b981':r.pct>=40?'#f59e0b':'#ef4444'
            const rTxt = r.pct>=70?'text-emerald-600':r.pct>=40?'text-amber-500':'text-red-500'
            return (
            <div key={r.id} className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 ${i===0?'bg-amber-50/30':''}`}>
              <div className="w-8 text-center flex-shrink-0">
                {rMedal ? <span className="text-lg">{rMedal}</span>
                         : <span className="text-xs font-bold text-gray-400">#{i+1}</span>}
              </div>
              <div className="w-24 flex-shrink-0">
                <p className="text-sm font-semibold leading-tight">{r.nome}</p>
                <p className="text-[10px] text-gray-400">#{i+1} no ano</p>
              </div>
              <div className="w-20 flex-shrink-0 text-right">
                <p className="text-sm font-bold">{r.exe}<span className="text-[10px] font-normal text-gray-400 ml-0.5">h</span></p>
                <p className="text-[10px] text-gray-400">/{r.meta}h</p>
              </div>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{width:`${Math.min(100,r.pct)}%`, background:rCor}}/>
                </div>
                <span className={`text-xs font-bold w-9 text-right flex-shrink-0 ${rTxt}`}>{r.pct}%</span>
              </div>
            </div>
            )
          })}
        </div>
      </div>
      )}
    
    </div>
    )
  }

  const PageAlertas = () => {
    const ETAPAS_IMPL = [
      "Cadastro inicial","Configuração do sistema","Importação de dados",
      "Validação","Treinamento","Go-live","Acompanhamento inicial"
    ]
    const STATUS_ETAPA = ["pendente","em andamento","concluído"]
    const corEtapa = (s) => s==="concluído"?"bg-emerald-100 text-emerald-700":s==="em andamento"?"bg-blue-100 text-blue-700":"bg-gray-100 text-gray-500"
    
    if (!window.__alertDet) window.__alertDet = null
    if (!window.__alertEtapas) window.__alertEtapas = {}
    const rerender = () => setAnotacoes((p)=>({...p}))
    
    const getEtapas = (cid) => {
      if (!window.__alertEtapas[cid]) {
        window.__alertEtapas[cid] = ETAPAS_IMPL.map(nome=>({nome, status:"pendente", data:"", responsavel:""}))
      }
      return window.__alertEtapas[cid]
    }
    const setEtapaField = (cid, idx, k, v) => {
      getEtapas(cid)[idx][k] = v
      rerender()
    }
    
    const alertFiltrado = isTecnico()
      ? alertCli.filter((c) => c.responsavel === user.id)
      : alertCli
    
    const detCli = window.__alertDet ? clients.find((c)=>c.id===window.__alertDet) : null
    
    return (
    <div className="space-y-5">
      {/* Botão voltar se estiver em detalhe */}
      {detCli && (
        <button onClick={()=>{window.__alertDet=null;rerender()}} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4"/> Voltar para alertas
        </button>
      )}
      {detCli ? (
        <div className="space-y-5">
          <div className="bg-white border border-red-200 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0"/>
              <div>
                <h2 className="font-bold text-lg">{detCli.name}</h2>
                <p className="text-xs text-gray-400">{detCli.codSGD||detCli.id} · {detCli.pacote}</p>
              </div>
              {clientSitBadge(detCli.id)}
            </div>
            {/* Motivo do alerta */}
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs font-semibold text-red-700 mb-1">Motivo do alerta</p>
              <p className="text-sm text-red-800">
                {!isFinalizado(detCli.id) && getFaseCliente(detCli.id).check1Status === 'Risco' && "Progresso abaixo do esperado — implantação em risco."}
                {getFaseCliente(detCli.id).check1Status === 'Risco' && "Cliente classificado como risco."}
                {getStatusNome(detCli.id) === 'Cancelado' && "Contrato cancelado."}
              </p>
            </div>
            {/* Dados do contrato */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div><span className="text-gray-400 text-xs uppercase tracking-wide">Pacote</span><p className="font-medium">{detCli.pacote||"—"}</p></div>
              <div><span className="text-gray-400 text-xs uppercase tracking-wide">Segmento</span><p className="font-medium">{detCli.segmento||"—"}</p></div>
              <div><span className="text-gray-400 text-xs uppercase tracking-wide">Responsável</span><p className="font-medium">{users.find((u)=>u.id===detCli.responsavel)?.name||detCli.responsavel||"—"}</p></div>
              <div><span className="text-gray-400 text-xs uppercase tracking-wide">Início</span><p className="font-medium">{detCli.inicio||"—"}</p></div>
              {detCli.codContrato && <div><span className="text-gray-400 text-xs uppercase tracking-wide">Contrato</span><p className="font-medium">{detCli.codContrato}</p></div>}
              {detCli.horasNum>0 && <div><span className="text-gray-400 text-xs uppercase tracking-wide">Horas contratadas</span><p className="font-medium">{detCli.horasNum}h</p></div>}
            </div>
            {/* Progresso */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progresso da implantação</span><span className="font-bold">{detCli.pct||0}%</span></div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${(detCli.pct||0)>=70?"bg-emerald-500":(detCli.pct||0)>=30?"bg-amber-500":"bg-red-500"}`} style={{width:`${detCli.pct||0}%`}}/>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-3 text-xs">
                {STATUS_LIST.map(s => {
                  const sid = statusAtual(detCli.id)
                  const passado = sid !== null && s.id <= sid
                  const c2 = statusColor(s.id)
                  return (
                    <div key={s.id} className="text-center">
                      <p className="text-gray-400 text-[9px] mb-0.5 leading-tight">{s.nome.replace('Pré-boarding ','PB-')}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${passado?`${c2.bg} ${c2.text}`:"bg-gray-100 text-gray-500"}`}>
                        {passado ? "✓" : "—"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
    
          {/* Etapas da implantação — Etapa 3 */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b"><p className="font-semibold text-sm">Etapas da Implantação</p></div>
            <div className="divide-y">
              {getEtapas(detCli.id).map((et, i)=>(
                <div key={i} className="p-4 flex flex-wrap items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">{i+1}</div>
                  <p className="text-sm font-medium flex-1 min-w-32">{et.nome}</p>
                  <select value={et.status} onChange={e=>setEtapaField(detCli.id,i,"status",e.target.value)}
                    className={`text-xs px-2 py-1 rounded-lg border-0 font-medium ${corEtapa(et.status)}`}>
                    {STATUS_ETAPA.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <input type="text" value={et.data} onChange={e=>setEtapaField(detCli.id,i,"data",e.target.value)}
                    placeholder="Data" className="text-xs px-2 py-1 border rounded w-24 focus:outline-none focus:border-blue-400"/>
                  <input type="text" value={et.responsavel} onChange={e=>setEtapaField(detCli.id,i,"responsavel",e.target.value)}
                    placeholder="Responsável" className="text-xs px-2 py-1 border rounded w-28 focus:outline-none focus:border-blue-400"/>
                </div>
              ))}
            </div>
          </div>
    
          {/* Botão anotar */}
          <button onClick={()=>setModalAnot(detCli.id)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <MessageCircle className="w-4 h-4"/> Adicionar anotação
          </button>
        </div>
      ) : (
        /* LISTA DE ALERTAS */
        <>
          <h1 className="text-2xl font-bold">Central de Alertas</h1>
          {isAdmin() && pendVal.length>0 && (
            <div className="bg-white border border-amber-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-amber-600"/><span className="font-semibold text-sm text-amber-800">Contratos aguardando validação ({pendVal.length})</span></div>
              {pendVal.map((v)=>(
                <div key={v.id} className="flex items-center gap-3 p-4 border-b last:border-0 hover:bg-amber-50">
                  <div className="flex-1 min-w-0"><p className="font-medium text-sm">{v.razaoSocial}</p><p className="text-xs text-gray-400">Pacote: {v.pacote} · Vendedor: {v.vendedor||"—"} · {v.criadoEm}</p></div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={()=>aprovarVal(v)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"><CheckSquare className="w-3.5 h-3.5"/> Aprovar</button>
                    <button onClick={()=>setModalReprovar(v)} className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700"><XSquare className="w-3.5 h-3.5"/> Observação</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {alertFiltrado.length===0 && pendVal.length===0 ? (
            <div className="text-center py-14 bg-white border rounded-xl"><CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-3"/><h3 className="font-semibold text-gray-600">Tudo certo! Nenhum alerta ativo.</h3></div>
          ) : alertFiltrado.map((c)=>(
            <div key={`alert-${c.id}`} className="bg-white border rounded-xl flex items-center gap-3 p-4 cursor-pointer hover:border-red-300 hover:shadow-sm transition-all"
              onClick={()=>{window.__alertDet=c.id;rerender()}}>
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-red-500"/>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-gray-400">{c.codSGD||c.id} · {c.pacote} · {c.pct||0}% concluído</p>
              </div>
              {clientSitBadge(c.id)}
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0"/>
            </div>
          ))}
        </>
      )}
    </div>
    )
  }

  const PageValidacao = () => {
    const [valTab, setValTab] = useState('aguardando')
    
    const aguardando = validacoes.filter((v) => v.status === 'aguardando')
    const aprovados  = validacoes.filter((v) => v.status === 'aprovado')
    const todos      = [...validacoes, ...reprovados]
    const totalRep   = reprovados.length
    
    const aprovarItem = (v) => {
      setValidacoes((p) => p.map((x) => x.id===v.id ? {...x, status:'aprovado', validadoEm:nowDate(), validadoPor:user.name} : x))
      addCliente(v)
      setModalValItem(null)
      toast(`${v.razaoSocial?.split(' ')[0]} aprovado — adicionado à fila!`, 'green')
    }
    
    const reprovarItem = (v) => {
      if (!valMotivoRep.trim()) { toast('Informe a observação da reprovação', 'red'); return }
      setReprovados((p) => [{
        ...v,
        status: 'em_observacao',
        reprovadoEm: nowDate(),
        reprovadoPor: user.name,
        observacao: valMotivoRep,
      }, ...p])
      setValidacoes((p) => p.filter((x) => x.id !== v.id))
      setModalValItem(null)
      setValMotivoRep('')
      toast('Solicitação de observação registrada.', 'red')
    }
    
    const listaAtiva = valTab==='aguardando' ? aguardando : valTab==='aprovados' ? aprovados : reprovados
    
    const statusCfg = {
      aguardando: {bg:'#fffbeb',txt:'#92400e',bdr:'#fde68a',label:'Aguardando',icon:'⏳'},
      aprovado:   {bg:'#ecfdf5',txt:'#065f46',bdr:'#6ee7b7',label:'Aprovado',  icon:'✅'},
      reprovado:  {bg:'#fef2f2',txt:'#991b1b',bdr:'#fca5a5',label:'Reprovado', icon:'❌'},
    }
    
    const sBadge = (s) => {
      const c = statusCfg[s] || statusCfg.aguardando
      return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{background:c.bg,color:c.txt,borderColor:c.bdr}}>{c.icon} {c.label}</span>
    }
    
    const fmtVal = (v) => `R$ ${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`
    
    return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Validação de Contratos</h1>
          <p className="text-sm text-gray-400">Prospects enviados para validação · aprovar ou reprovar com motivo</p>
        </div>
        {canAccess('cadastros') && (
          <button onClick={()=>{setModalVal(true);setValStep(1)}}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
            <Plus className="w-4 h-4"/> Novo Contrato
          </button>
        )}
      </div>
    
      {/* Contadores */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {label:'Aguardando',  count:aguardando.length,  c:'border-t-amber-400',   bg:'bg-amber-50',  txt:'text-amber-700',  icon:'⏳', tab:'aguardando'},
          {label:'Aprovados',   count:aprovados.length,   c:'border-t-emerald-500', bg:'bg-emerald-50',txt:'text-emerald-700',icon:'✅', tab:'aprovados'},
          {label:'Observações',  count:totalRep,           c:'border-t-violet-400',     bg:'bg-red-50',    txt:'text-red-700',    icon:'❌', tab:'em_observacao'},
        ].map((k)=>(
          <button key={k.tab} onClick={()=>setValTab(k.tab)}
            className={`bg-white border rounded-xl p-5 border-t-2 ${k.c} text-left transition-all hover:shadow-sm ${valTab===k.tab?'ring-2 ring-offset-1 ring-blue-400':''}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{k.label}</p>
              <span className="text-lg">{k.icon}</span>
            </div>
            <p className="text-3xl font-bold">{k.count}</p>
            <p className="text-xs text-gray-400 mt-1">contrato{k.count!==1?'s':''}</p>
          </button>
        ))}
      </div>
    
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['aguardando','aprovados','reprovados']).map(t=>(
          <button key={t} onClick={()=>setValTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${valTab===t?'bg-white shadow text-gray-800':'text-gray-500 hover:text-gray-700'}`}>
            {t==='aguardando'?`⏳ Aguardando (${aguardando.length})`:t==='aprovados'?`✅ Aprovados (${aprovados.length})`:`🔍 Observações (${totalRep})`}
          </button>
        ))}
      </div>
    
      {/* Lista */}
      {listaAtiva.length === 0 ? (
        <div className="bg-white border rounded-2xl p-16 text-center">
          <div className="text-4xl mb-3">{valTab==='aguardando'?'⏳':valTab==='aprovados'?'✅':'❌'}</div>
          <h2 className="font-semibold text-gray-500 mb-1">Nenhum contrato {valTab}</h2>
          {valTab==='aguardando' && (
            <button onClick={()=>{setModalVal(true);setValStep(1)}}
              className="mt-4 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
              Criar agora
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {listaAtiva.map((v)=>(
            <div key={v.id}
              className="bg-white border rounded-xl overflow-hidden hover:shadow-sm transition-shadow cursor-pointer"
              onClick={()=>{setModalValItem(v);setValMotivoRep('')}}>
    
              {/* Card header */}
              <div className={`flex items-center justify-between px-5 py-3.5 border-b ${
                v.status==='aguardando'?'bg-amber-50 border-amber-100':
                v.status==='aprovado'?'bg-emerald-50 border-emerald-100':'bg-red-50 border-red-100'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${v.status==='aguardando'?'bg-amber-400 animate-pulse':v.status==='aprovado'?'bg-emerald-500':'bg-red-500'}`}/>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{v.razaoSocial}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{v.id}</p>
                  </div>
                  {sBadge(v.status)}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm font-bold text-gray-700">{fmtVal(v.valorContrato)}</span>
                  {v.status==='aguardando' && isAdmin() && (
                    <div className="flex gap-1.5" onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>aprovarItem(v)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                        <CheckSquare className="w-3.5 h-3.5"/> Aprovar
                      </button>
                      <button onClick={()=>{setModalValItem(v);setValMotivoRep('')}}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600">
                        <XSquare className="w-3.5 h-3.5"/> Observação
                      </button>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400"/>
                </div>
              </div>
    
              {/* Card body */}
              <div className="px-5 py-3 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div><p className="text-gray-400 mb-0.5">Pacote</p><p className="font-medium">{v.pacote||'—'}</p></div>
                <div><p className="text-gray-400 mb-0.5">Vendedor</p><p className="font-medium">{v.vendedor||'—'}</p></div>
                <div><p className="text-gray-400 mb-0.5">Cidade/UF</p><p className="font-medium">{v.cidade?`${v.cidade}/${v.estado}`:'—'}</p></div>
                <div><p className="text-gray-400 mb-0.5">Assinatura</p><p className="font-medium">{v.dataAssinatura||'—'}</p></div>
                <div><p className="text-gray-400 mb-0.5">Enviado por</p><p className="font-medium">{v.criadoPor} · {v.criadoEm}</p></div>
              </div>
    
              {/* Motivo reprovação */}
              {v.status==='em_observacao' && v.observacao && (
                <div className="mx-5 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs">
                  <span className="font-semibold text-red-600">Motivo: </span>
                  <span className="text-red-700">{v.observacao}</span>
                  <span className="text-gray-400 ml-2">· por {v.reprovadoPor} em {v.reprovadoEm}</span>
                </div>
              )}
              {v.status==='aprovado' && (
                <div className="mx-5 mb-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
                  ✅ Aprovado por <b>{v.validadoPor}</b> em {v.validadoEm} · Adicionado à fila de execução
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    )
  }

  const PageQualidade = () => {
    const [qaFiltro, setQaFiltro] = useState('')
    
    const RESP_MAP = {
      ops1:'Dougllas',ops2:'Leonildo',ops3:'Renato',ops4:'Ericka',
      ops5:'Johnny',ops6:'Wanderley',root:'Rodrigo',admin:'Douglas G.',
    }
    const calcularScore = (q) => q==='boa'?3:q==='media'?2:1
    
    const rankMap = {}
    analises.forEach((r) => {
      const k = r.tecnico || 'desconhecido'
      if (!rankMap[k]) rankMap[k] = {total:0,soma:0,pendencias:0,ruim:0,boa:0,media:0,resolucoes:0}
      rankMap[k].total++
      rankMap[k].soma += r.score || calcularScore(r.qualidade)
      if (r.tem_pendencia) rankMap[k].pendencias++
      if (r.qualidade==='boa')   rankMap[k].boa++
      if (r.qualidade==='media') rankMap[k].media++
      if (r.qualidade==='ruim')  rankMap[k].ruim++
      if (r.expectativa_atendida==='sim') rankMap[k].resolucoes++
    })
    
    const ranking = Object.entries(rankMap)
      .map(([id,v]:any) => ({
        id,
        nome: RESP_MAP[id] || id,
        total: v.total,
        media: v.total>0 ? Math.round((v.soma/v.total)*10)/10 : 0,
        pendPct: v.total>0 ? Math.round(v.pendencias/v.total*100) : 0,
        resolPct: v.total>0 ? Math.round(v.resolucoes/v.total*100) : 0,
        boa: v.boa, media_q: v.media, ruim: v.ruim,
      }))
      .sort((a,b) => b.media - a.media)
    
    const medalha = (i) => i===0?'🥇':i===1?'🥈':i===2?'🥉':'  '
    const starBar = (score) => {
      const pct = Math.round((score/3)*100)
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{width:`${pct}%`, background: score>=2.5?'#10b981':score>=1.8?'#f59e0b':'#ef4444'}}/>
          </div>
          <span className="text-xs font-bold w-6 text-right" style={{color:score>=2.5?'#059669':score>=1.8?'#d97706':'#dc2626'}}>{score.toFixed(1)}</span>
        </div>
      )
    }
    
    const analisesVis = analises
      .filter((r) => !qaFiltro || r.tecnico?.includes(qaFiltro) || r.cliente_id?.toString().includes(qaFiltro) || r.cliente_nome?.toLowerCase().includes(qaFiltro.toLowerCase()))
      .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    
    const totalAnals = analises.length
    const mediaGeral = totalAnals>0 ? Math.round(analises.reduce((s,r)=>s+(r.score||1),0)/totalAnals*10)/10 : 0
    const comPend    = analises.filter((r)=>r.tem_pendencia).length
    const resolv     = analises.filter((r)=>r.expectativa_atendida==='sim').length
    
    return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Qualidade IA</h1>
          <p className="text-sm text-gray-400">Análises de anotações · ranking de técnicos · tabela analises_anotacoes</p>
        </div>
        {analises.length > 0 && (
          <button onClick={()=>{
            const csv = ['id,cliente_id,cliente_nome,tecnico,data,qualidade,score,tem_pendencia,expectativa_atendida,acao_realizada,pendencias,problemas']
            analises.forEach((r) => csv.push([r.id,r.cliente_id,`"${r.cliente_nome}"`,r.tecnico,r.data,r.qualidade,r.score,r.tem_pendencia,r.expectativa_atendida,`"${r.acao_realizada}"`,`"${r.pendencias}"`,`"${r.problemas}"`].join(',')))
            const blob = new Blob([csv.join('\n')],{type:'text/csv'})
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href=url; a.download='analises_anotacoes.csv'; a.click()
            URL.revokeObjectURL(url)
          }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">
            ⬇ Exportar CSV
          </button>
        )}
      </div>
    
      {analises.length === 0 ? (
        <div className="bg-white border rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma análise ainda</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">Abra o modal de gestão de qualquer cliente, clique em <b>Analisar com IA</b> em uma anotação, e os resultados aparecerão aqui.</p>
        </div>
      ) : (<>
    
      {/* ── KPIs globais ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {l:'Análises realizadas', v:totalAnals,               c:'border-t-violet-500', sub:'anotações avaliadas'},
          {l:'Média geral score',   v:`${mediaGeral}/3`,         c:`border-t-${mediaGeral>=2.5?'emerald':mediaGeral>=1.8?'amber':'red'}-500`, sub:'qualidade média do time'},
          {l:'Com pendências',      v:`${comPend} (${totalAnals>0?Math.round(comPend/totalAnals*100):0}%)`, c:'border-t-amber-400', sub:'anotações com algo aberto'},
          {l:'Expectativa atingida',v:`${resolv} (${totalAnals>0?Math.round(resolv/totalAnals*100):0}%)`, c:'border-t-emerald-400', sub:'cliente atendido plenamente'},
        ].map((k,i)=>(
          <div key={i} className={`bg-white border rounded-xl p-4 border-t-2 ${k.c}`}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{k.l}</p>
            <p className="text-2xl font-bold">{k.v}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>
    
      {/* ── Ranking de técnicos ── */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
          <p className="font-semibold text-sm">🏆 Ranking de Técnicos — Qualidade de Anotações</p>
          <p className="text-xs text-gray-400">Score: 1=ruim · 2=média · 3=boa</p>
        </div>
        <div className="divide-y">
          {ranking.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Sem dados suficientes para ranking.</p>
          ) : ranking.map((r,i) => (
            <div key={r.id} className={`flex items-center gap-4 px-5 py-4 ${i===0?'bg-amber-50':''}`}>
              {/* Posição e nome */}
              <div className="w-8 text-xl text-center flex-shrink-0">{medalha(i)}</div>
              <div className="w-28 flex-shrink-0">
                <p className="font-semibold text-sm">{r.nome}</p>
                <p className="text-[10px] text-gray-400">{r.total} análise{r.total!==1?'s':''}</p>
              </div>
    
              {/* Score bar */}
              <div className="flex-1">{starBar(r.media)}</div>
    
              {/* Breakdown qualidade */}
              <div className="flex gap-2 text-[11px]">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">✓ {r.boa} boa{r.boa!==1?'s':''}</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">~ {r.media_q} média</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">✗ {r.ruim} ruim{r.ruim!==1?'s':''}</span>
              </div>
    
              {/* Pendência % */}
              <div className="w-24 text-right flex-shrink-0">
                <p className={`text-sm font-bold ${r.pendPct>50?'text-red-500':r.pendPct>25?'text-amber-500':'text-emerald-600'}`}>{r.pendPct}%</p>
                <p className="text-[10px] text-gray-400">pendências</p>
              </div>
    
              {/* Resolução % */}
              <div className="w-24 text-right flex-shrink-0">
                <p className={`text-sm font-bold ${r.resolPct>=70?'text-emerald-600':r.resolPct>=40?'text-amber-500':'text-red-500'}`}>{r.resolPct}%</p>
                <p className="text-[10px] text-gray-400">resolveu</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    
      {/* ── Tabela analises_anotacoes ── */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
          <p className="font-semibold text-sm">📋 Tabela: analises_anotacoes</p>
          <input value={qaFiltro} onChange={e=>setQaFiltro(e.target.value)}
            placeholder="Filtrar por técnico, cliente..."
            className="px-3 py-1.5 border rounded-lg text-xs w-52 focus:outline-none focus:border-violet-500"/>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-gray-50 border-b">
              {['Data','Cliente','Técnico','Score','Qualidade','Expectativa','Pendência','Ação realizada','Feedback IA'].map(h=>(
                <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {analisesVis.length===0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">Nenhum resultado para o filtro.</td></tr>
              ) : analisesVis.map((r,i)=>(
                <tr key={r.id||i} className="border-b last:border-0 hover:bg-gray-50">
                  {/* Data */}
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                    {new Date(r.data).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
                  </td>
                  {/* Cliente */}
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-gray-700 max-w-[140px] truncate">{r.cliente_nome||r.cliente_id}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{r.cliente_id}</p>
                  </td>
                  {/* Técnico */}
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                      {RESP_MAP[r.tecnico]||r.tecnico||'—'}
                    </span>
                  </td>
                  {/* Score */}
                  <td className="px-3 py-2.5">
                    <span className={`text-sm font-bold ${r.score===3?'text-emerald-600':r.score===2?'text-amber-500':'text-red-500'}`}>
                      {r.score===3?'⭐⭐⭐':r.score===2?'⭐⭐':'⭐'} {r.score}
                    </span>
                  </td>
                  {/* Qualidade */}
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${r.qualidade==='boa'?'bg-emerald-100 text-emerald-700':r.qualidade==='media'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>
                      {r.qualidade==='boa'?'✓ Boa':r.qualidade==='media'?'~ Média':'✗ Fraca'}
                    </span>
                  </td>
                  {/* Expectativa */}
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${r.expectativa_atendida==='sim'?'bg-emerald-100 text-emerald-700':r.expectativa_atendida==='parcial'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>
                      {r.expectativa_atendida}
                    </span>
                  </td>
                  {/* Pendência */}
                  <td className="px-3 py-2.5">
                    {r.tem_pendencia
                      ? <span className="text-amber-600 font-medium">⚠ {r.pendencias?.substring(0,40)||'sim'}</span>
                      : <span className="text-emerald-600">✓ Não</span>}
                  </td>
                  {/* Ação realizada */}
                  <td className="px-3 py-2.5 text-gray-600 max-w-[180px]">
                    <p className="truncate" title={r.acao_realizada}>{r.acao_realizada||'—'}</p>
                  </td>
                  {/* Feedback IA */}
                  <td className="px-3 py-2.5 text-blue-600 max-w-[200px]">
                    <p className="truncate text-[10px]" title={r.feedback||''}>{r.feedback||'—'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {analisesVis.length > 0 && (
          <div className="px-5 py-2 border-t bg-gray-50 text-[10px] text-gray-400">
            {analisesVis.length} registros · schema: id · cliente_id · tecnico · data · acao_realizada · tem_pendencia · pendencias · expectativa_atendida · problemas · qualidade · score
          </div>
        )}
      </div>
    
      </>)}
    </div>
    )
  }

  const PageComercial = () => {
    if (!window.__vc) window.__vc = {
      tab:'lista',        // 'lista' | 'novo'
      form: {
        codContrato:'', codSGD:'', razaoSocial:'', contato:'', telefone:'',
        linkSGD:'', tipoSGD:'', codigoSGD:'',
        tipo:'contabilidade',  // 'contabilidade' | 'contador'
        cidade:'', uf:'',
        foiCliente:'nao', tempoSaida:'', migracao:'nao', origemMigCod:'', origemMigNome:'', sistemaConversao:'',
        exportacao:'nao', origemBancoCod:'', origemBancoNome:'',
        sistemaAnterior:[], sistemaOutros:'',
        qtdUsuarios:'', pacote:'',
        vlPlus:'', vlWeb:'', vlReforma:'', vlTotal:'',
        implantacao:'sim', implHoras:'', implValor:'',
        implForaPadrao:false, implVlHoraManual:'', implAutorizadoPor:'',
        qtdClientes:'', lucroReal:'', simplesNac:'', lucroPres:'', agro:'',
        ramos:'',
        desconto:'nao', descontoTipo:'percentual', descontoValor:'', descontoMotivo:'',
      },
      search:'', filterStatus:'todos',
    }
    const vc = window.__vc
    const rerender = () => setAnotacoes((p)=>({...p}))
    
    const SISTEMAS = [
      'Domínio','IOB Contábil','Questor','Alterdata','Sage','Fortes','Prosoft',
      'Ábaco','Nasajon','Senior','TOTVS','Benner','Outros'
    ]
    const PACOTES = ['Domínio Start','Domínio Plus','Domínio Premium','Domínio Empresarial','Personalizado']
    const UFS = ['PA','TO']
    
    const getStatus = (v) => v.status||'aguardando'
    const statusColor = (s) => s==='aprovado'?'bg-emerald-100 text-emerald-700':s==='aguardando'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'
    const statusLabel = (s) => s==='aprovado'?'Aprovado':s==='aguardando'?'Pendente':'Em Observação'
    
    const todasSolic = [...validacoes, ...reprovados]
    const filtered = todasSolic.filter((v) => {
      const q = vc.search.toLowerCase()
      const matchSearch = !q || (v.razaoSocial||'').toLowerCase().includes(q) || (v.codSGD||'').includes(q)
      const matchStatus = vc.filterStatus==='todos' || getStatus(v)===vc.filterStatus
      return matchSearch && matchStatus
    })
    
    const enviarSolicitacao = () => {
      const f = vc.form
      if (!f.razaoSocial.trim()) { toast('Informe a Razão Social','red'); return }
      if (!f.pacote) { toast('Selecione o Pacote','red'); return }
      if (!f.telefone.trim()) { toast('Informe o Telefone','red'); return }
      if (f.implForaPadrao && !f.implAutorizadoPor?.trim()) {
        toast('Valor fora do padrão — informe o ADM autorizador','red'); return
      }
      if (f.foiCliente==='sim' && !f.tempoSaida?.trim()) {
        toast('Informe há quanto tempo o cliente saiu','red'); return
      }
      if (f.desconto==='sim' && !f.descontoValor?.trim()) {
        toast('Informe o valor do desconto solicitado','red'); return
      }
      if (f.desconto==='sim' && !f.descontoMotivo?.trim()) {
        toast('Informe o motivo do desconto','red'); return
      }
      const nova = {
        id: `VAL-${Date.now()}`,
        ...f,
        status: 'aguardando',
        criadoEm: nowDate(),
        criadoPor: user.name,
      }
      setValidacoes((p) => [nova, ...p])
      window.__vc.tab = 'lista'
      window.__vc.form = {
        codContrato:'', codSGD:'', razaoSocial:'', contato:'', telefone:'',
        tipo:'contabilidade', cidade:'', uf:'', foiCliente:'nao',
        migracao:'nao', origemMigCod:'', origemMigNome:'', sistemaConversao:'',
        exportacao:'nao', origemBancoCod:'', origemBancoNome:'',
        sistemaAnterior:[], sistemaOutros:'', qtdUsuarios:'', pacote:'',
        vlPlus:'', vlWeb:'', vlReforma:'', vlTotal:'',
        implantacao:'sim', implHoras:'', implValor:'',
        implForaPadrao:false, implVlHoraManual:'', implAutorizadoPor:'',
        qtdClientes:'', lucroReal:'', simplesNac:'', lucroPres:'', agro:'', ramos:'',
        desconto:'nao', descontoTipo:'percentual', descontoValor:'', descontoMotivo:'',
        linkSGD:'', tipoSGD:'', codigoSGD:'',
      }
      toast(`Solicitação enviada — aguardando aprovação`, 'green')
      rerender()
    }
    
    const F = vc.form
    
    const extrairDadosSGD = (url) => {
      if (!url || !url.trim()) return null
      try {
        const parsed = new URL(url.trim())
        const params = parsed.searchParams
        const clienteID = params.get("clienteID")
        const externo   = params.get("externo")
        if (clienteID) return { tipo: "CLIENTE",     codigo: clienteID }
        if (externo)   return { tipo: "IMPLANTACAO", codigo: externo   }
        return null
      } catch {
        return null
      }
    }
    
    const handleLinkSGD = (url) => {
      window.__vc.form.linkSGD = url
      const dados = extrairDadosSGD(url)
      if (!dados) {
        window.__vc.form.tipoSGD   = ''
        window.__vc.form.codigoSGD = ''
        rerender()
        return
      }
      window.__vc.form.tipoSGD   = dados.tipo
      window.__vc.form.codigoSGD = dados.codigo
      if (dados.tipo === 'CLIENTE' && !window.__vc.form.codSGD) {
        window.__vc.form.codSGD = dados.codigo
      }
      rerender()
    }
    const setF = (k, v) => { window.__vc.form = {...window.__vc.form, [k]:v}; rerender() }
    
    const pkgAtual = packages.find((p) => p.name === F.pacote)
    const vlHoraPadrao = pkgAtual?.valorHora || 0
    const horasPadrao = pkgAtual?.horas     || 0
    
    const lookupTabela = (produto, usuarios) =>
      tabelaPrecos.find((r) => r.produto===produto && r.usuarios===usuarios) || null
    
    const tabelaRow = lookupTabela(F.pacote, Number(F.qtdUsuarios)||0)
    
    const setPacote = (nome) => {
      const pkg = packages.find((p) => p.name===nome)
      const vh = pkg?.valorHora||0
      const hh = pkg?.horas||0
      const vlImpl = vh>0&&hh>0 ? (vh*hh).toFixed(2) : ''
      const tb = lookupTabela(nome, Number(window.__vc.form.qtdUsuarios)||0)
      window.__vc.form = {
        ...window.__vc.form,
        pacote: nome,
        implHoras: tb ? String(tb.horasTreino) : (hh>0?String(hh):''),
        implValor: tb ? String(tb.vlTreino) : vlImpl,
        vlPlus: tb && tb.valor>0 ? String(tb.valor) : window.__vc.form.vlPlus,
        implVlHoraManual: '',
        implAutorizadoPor: '',
        implForaPadrao: false,
      }
      window.__vc.form.vlTotal = calcTotal(window.__vc.form)
      rerender()
    }
    
    const setQtdUsuarios = (n) => {
      const tb = lookupTabela(window.__vc.form.pacote, Number(n)||0)
      window.__vc.form = {
        ...window.__vc.form,
        qtdUsuarios: n,
        implHoras: tb ? String(tb.horasTreino) : window.__vc.form.implHoras,
        implValor: tb ? String(tb.vlTreino) : window.__vc.form.implValor,
        vlPlus: tb && tb.valor>0 ? String(tb.valor) : window.__vc.form.vlPlus,
      }
      window.__vc.form.vlTotal = calcTotal(window.__vc.form)
      rerender()
    }
    
    const setImplHoras = (hStr) => {
      const h = Number(hStr)||0
      const vh = vlHoraPadrao
      if (vh>0) {
        const vlCalc = (h*vh).toFixed(2)
        window.__vc.form = {...window.__vc.form, implHoras:hStr, implValor:vlCalc, implForaPadrao:false, implVlHoraManual:'', implAutorizadoPor:''}
      } else {
        window.__vc.form = {...window.__vc.form, implHoras:hStr}
      }
      window.__vc.form.vlTotal = calcTotal(window.__vc.form)
      rerender()
    }
    
    const setImplValorManual = (v) => {
      const horas = Number(F.implHoras)||0
      const esperado = vlHoraPadrao>0&&horas>0 ? vlHoraPadrao*horas : null
      const digitado = Number(v.replace(',','.'))||0
      const foraPadrao = esperado!==null && Math.abs(digitado-esperado)>0.01
      window.__vc.form = {...window.__vc.form, implValor:v, implForaPadrao:foraPadrao}
      window.__vc.form.vlTotal = calcTotal(window.__vc.form)
      rerender()
    }
    
    const calcTotal = (f) => {
      const nums = [f.vlPlus,f.vlWeb,f.vlReforma,f.implValor].map(x=>Number((x||'').toString().replace(',','.'))||0)
      const total = nums.reduce((a,b)=>a+b,0)
      return total>0 ? total.toFixed(2) : ''
    }
    
    const setVlField = (k, v) => {
      window.__vc.form = {...window.__vc.form,[k]:v}
      window.__vc.form.vlTotal = calcTotal(window.__vc.form)
      rerender()
    }
    
    const toggleSistema = (s) => {
      const arr = [...(F.sistemaAnterior)]
      const idx = arr.indexOf(s)
      if (idx>=0) arr.splice(idx,1); else arr.push(s)
      setF('sistemaAnterior', arr)
    }
    
    const FL = ({label, req, children}:any) => (
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {label}{req && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
      </div>
    )
    const TI = ({k, placeholder, type='text'}:any) => (
      <input type={type} value={(F)[k]||''} onChange={e=>setF(k,e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"/>
    )
    const Radio = ({k, val, label}:any) => (
      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
        <input type="radio" checked={(F)[k]===val} onChange={()=>setF(k,val)} className="accent-blue-600"/>
        {label}
      </label>
    )
    
    const _render2040 = () => {
      const dados = extrairDadosSGD(F.linkSGD)
      if (!dados) {
        return (
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-600">
            <span>⚠️</span>
            <span>Link não reconhecido. Verifique se contém <code className="font-mono">?clienteID=</code> ou <code className="font-mono">?externo=</code></span>
          </div>
        )
      }
      return (
        <div className="mt-1.5 flex items-center gap-2 text-[11px]">
          <span className={`px-2 py-0.5 rounded-full font-semibold border ` + (dados.tipo === 'CLIENTE' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200')}>
            {dados.tipo === 'CLIENTE' ? '👤 Cliente' : '🔧 Implantação'}
          </span>
          <span className="text-gray-500">Código extraído:</span>
          <code className="font-mono font-semibold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">{dados.codigo}</code>
          {dados.tipo === 'CLIENTE' && (
            <span className="text-blue-500 text-[10px]">→ Código SGD preenchido automaticamente</span>
          )}
        </div>
      )
    }

    return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comercial</h1>
          <p className="text-sm text-gray-400 mt-0.5">Cadastro e envio de novos contratos para aprovação</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>{vc.tab='lista';rerender()}}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${vc.tab==='lista'?'bg-gray-900 text-white border-gray-900':'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
            Lista
          </button>
          {(user.role==='vendedor'||user.role==='coord_com'||isAdmin()) && (
            <button onClick={()=>{vc.tab='novo';rerender()}}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${vc.tab==='novo'?'bg-blue-600 text-white border-blue-600':'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
              + Nova Solicitação
            </button>
          )}
        </div>
      </div>
      {vc.tab==='lista' && (
        <div className="space-y-3">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {l:'Pendentes',    v:validacoes.filter((v)=>v.status==='aguardando').length, c:'amber'},
              {l:'Aprovados',    v:validacoes.filter((v)=>v.status==='aprovado').length,  c:'green'},
              {l:'Observações',  v:reprovados.length, c:'red'},
            ].map((k,i)=><KPI key={i} label={k.l} value={k.v} c={k.c}/>)}
          </div>
          {/* Filtros */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input value={vc.search} onChange={e=>{vc.search=e.target.value;rerender()}}
                placeholder="Buscar por razão social ou código SGD..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"/>
            </div>
            <select value={vc.filterStatus} onChange={e=>{vc.filterStatus=e.target.value;rerender()}}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none bg-white">
              <option value="todos">Todos</option>
              <option value="aguardando">Pendentes</option>
              <option value="aprovado">Aprovados</option>
              <option value="em_observacao">Observação</option>
            </select>
          </div>
          {/* Tabela */}
          <div className="bg-white border rounded-xl overflow-hidden">
            {filtered.length===0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">Nenhuma solicitação encontrada</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {['Código SGD','Razão Social','Tipo','Pacote','Vendedor','Status','Data'].map(h=>
                      <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold uppercase text-gray-400">{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v,i)=>(
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-[10px] font-mono text-gray-500">
                        <div>{v.codSGD||'—'}</div>
                        {v.tipoSGD && (
                          <span className={"mt-0.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold " + (v.tipoSGD==='CLIENTE' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600')}>
                            {v.tipoSGD === 'CLIENTE' ? '👤' : '🔧'} {v.tipoSGD}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <p className="truncate max-w-[180px]">{v.razaoSocial||'—'}</p>
                        {(v.codigoSGD || v.codSGD) && <p className="text-[10px] text-gray-400 font-mono">{v.codigoSGD || v.codSGD}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs capitalize">{v.tipo==='contabilidade'?'Escritório':'Contador'}</td>
                      <td className="px-4 py-3 text-xs">{v.pacote||'—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{v.criadoPor||'—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(getStatus(v))}`}>
                          {statusLabel(getStatus(v))}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-gray-400">{v.criadoEm||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      {vc.tab==='novo' && (
        <div className="space-y-4">
          <div className="bg-white border rounded-xl divide-y">
    
            {/* BLOCO 1 — Identificação */}
            <div className="p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">1. Identificação</p>
    
              {/* ── Campo de link SGD inteligente ── */}
              <div className="mb-4">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Link do SGD <span className="text-gray-400 normal-case font-normal">(cole o link do cliente ou implantação — preenchimento automático)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={F.linkSGD || ''}
                    onChange={e => handleLinkSGD(e.target.value)}
                    placeholder="https://sgd.exemplo.com/...?clienteID=12345 ou ?externo=67890"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white font-mono text-xs"
                  />
                  {F.linkSGD && (
                    <button
                      onClick={() => handleLinkSGD('')}
                      className="px-3 py-2 border rounded-lg text-sm text-gray-400 hover:bg-gray-50 flex-shrink-0"
                      title="Limpar link">
                      <X className="w-4 h-4"/>
                    </button>
                  )}
                </div>
                {/* Feedback do parsing */}
                {_render2040()}
              </div>
    
              <div className="grid grid-cols-2 gap-4">
                <FL label="Código do Contrato Origem"><TI k="codContrato" placeholder="ex: 756834"/></FL>
                <FL label="Código Prospect SGD"><TI k="codSGD" placeholder="ex: 19183"/></FL>
                <FL label="Razão Social / Nome" req>
                  <TI k="razaoSocial" placeholder="E & D SERVIÇOS CONTÁBEIS LTDA"/>
                </FL>
                <FL label="Tipo" req>
                  <div className="flex gap-4 pt-2">
                    <Radio k="tipo" val="contabilidade" label="Empresa de Contabilidade"/>
                    <Radio k="tipo" val="contador" label="Contador"/>
                  </div>
                </FL>
                <FL label="Contato (Nome)"><TI k="contato" placeholder="Nome do responsável"/></FL>
                <FL label="Telefone" req><TI k="telefone" placeholder="(00) 00000-0000"/></FL>
                <FL label="Cidade"><TI k="cidade" placeholder="Cidade"/></FL>
                <FL label="UF">
                  <select value={F.uf} onChange={e=>setF('uf',e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                    <option value="">—</option>
                    {UFS.map(u=><option key={u} value={u}>{u}</option>)}
                  </select>
                </FL>
              </div>
              <div className="flex gap-6 mt-4">
                <FL label="Já foi cliente?">
                  <div className="flex gap-4 pt-2"><Radio k="foiCliente" val="sim" label="Sim"/><Radio k="foiCliente" val="nao" label="Não"/></div>
                </FL>
                {F.foiCliente==='sim' && (
                  <FL label="Há quanto tempo saiu?">
                    <TI k="tempoSaida" placeholder="Ex: 6 meses, 2 anos"/>
                  </FL>
                )}
              </div>
            </div>
    
            {/* BLOCO 2 — Migração e Exportação */}
            <div className="p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">2. Conversão e Exportação/Importação</p>
              <div className="space-y-4">
    
                {/* Conversão */}
                <div>
                  <FL label="Haverá conversão de dados?">
                    <div className="flex gap-4 pt-2">
                      <Radio k="migracao" val="sim" label="Sim"/>
                      <Radio k="migracao" val="nao" label="Não"/>
                    </div>
                  </FL>
                  {F.migracao==='sim' && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <FL label="Sistema utilizado para conversão"><TI k="sistemaConversao" placeholder="Nome do sistema atual do cliente"/></FL>
                    </div>
                  )}
                </div>
    
                {/* Exporta & Importa */}
                <div>
                  <FL label="Exporta & Importa?">
                    <div className="flex gap-4 pt-2">
                      <Radio k="exportacao" val="sim" label="Sim"/>
                      <Radio k="exportacao" val="nao" label="Não"/>
                    </div>
                  </FL>
                  {F.exportacao==='sim' && (
                    <div className="grid grid-cols-2 gap-4 mt-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                      <FL label="Banco origem (ID)"><TI k="origemBancoCod" placeholder="ID do banco"/></FL>
                      <FL label="Nome cliente banco"><TI k="origemBancoNome" placeholder="Nome cliente no banco"/></FL>
                    </div>
                  )}
                </div>
    
              </div>
            </div>
    
            {/* BLOCO 3 — Sistema Anterior */}
            <div className="p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">3. Sistema Anterior</p>
              <div className="flex flex-wrap gap-2">
                {SISTEMAS.map(s=>{
                  const sel = (F.sistemaAnterior).includes(s)
                  return (
                    <button key={s} onClick={()=>toggleSistema(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${sel?'bg-blue-600 text-white border-blue-600':'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                      {s}
                    </button>
                  )
                })}
              </div>
              {(F.sistemaAnterior).includes('Outros') && (
                <div className="mt-3">
                  <FL label="Especifique outros sistemas">
                    <TI k="sistemaOutros" placeholder="Descreva outros sistemas utilizados"/>
                  </FL>
                </div>
              )}
            </div>
    
            {/* BLOCO 4 — Pacote e Valores */}
            <div className="p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">4. Pacote e Valores</p>
              <div className="grid grid-cols-2 gap-4">
                <FL label="Quantidade de Usuários">
                  <input type="number" min={1} value={F.qtdUsuarios||''}
                    onChange={e=>setQtdUsuarios(e.target.value)}
                    placeholder="ex: 3"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"/>
                </FL>
                <FL label="Pacote Negociado" req>
                  <select value={F.pacote} onChange={e=>setPacote(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                    <option value="">— selecione —</option>
                    {PACOTES.map((o)=><option key={o} value={o}>{o}</option>)}
                  </select>
                </FL>
              </div>
    
              {/* Resultado tabela de preços */}
              {F.pacote && F.qtdUsuarios && (
                tabelaRow ? (
                  <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600"/>
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Tabela de preços — valor autom��tico</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Valor mensal</p>
                        <p className="font-bold text-emerald-700 text-lg">R$ {fmtR(tabelaRow.valor)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Horas treinamento</p>
                        <p className="font-bold text-gray-700">{tabelaRow.horasTreino}h</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Valor treinamento</p>
                        <p className="font-bold text-gray-700">R$ {fmtR(tabelaRow.vlTreino)}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-600 mt-2">Limite de desconto: {tabelaRow.limDesconto}% — acima disso exige aprovação ADM</p>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0"/>
                    Combinação {F.pacote} + {F.qtdUsuarios} usuário(s) não encontrada na tabela de preços. Preencha os valores manualmente — sujeito a aprovação.
                  </div>
                )
              )}
              <div className="grid grid-cols-4 gap-3 mt-4">
                <FL label="Valor PLUS (R$)">
                  <input type="text" value={F.vlPlus||''} onChange={e=>setVlField('vlPlus',e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"/>
                </FL>
                <FL label="Valor WEB (R$)">
                  <input type="text" value={F.vlWeb||''} onChange={e=>setVlField('vlWeb',e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"/>
                </FL>
                <FL label="Valor Reforma (R$)">
                  <input type="text" value={F.vlReforma||''} onChange={e=>setVlField('vlReforma',e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"/>
                </FL>
                <FL label="Valor Total (R$)">
                  <input type="text" value={F.vlTotal||''} readOnly
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 text-gray-600 cursor-not-allowed font-semibold"/>
                </FL>
              </div>
            </div>
    
            {/* BLOCO 5 — Implantação */}
            <div className="p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">5. Implantação / Treinamento</p>
              <div className="flex gap-4 mb-4">
                <Radio k="implantacao" val="sim" label="Sim"/>
                <Radio k="implantacao" val="nao" label="Não"/>
              </div>
              {F.implantacao==='sim' && (
                <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <FL label="Quantidade de Horas">
                      <input type="number" value={F.implHoras||''} onChange={e=>setImplHoras(e.target.value)}
                        placeholder="ex: 40"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-violet-400 bg-white"/>
                    </FL>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Valor/Hora</p>
                      <div className={`px-3 py-2 rounded-lg text-sm font-semibold border ${vlHoraPadrao>0?'bg-white border-gray-200 text-gray-700':'bg-amber-50 border-amber-200 text-amber-700'}`}>
                        {vlHoraPadrao>0 ? `R$ ${vlHoraPadrao.toFixed(2)}/h (padrão)` : 'Não configurado'}
                      </div>
                    </div>
                    <FL label="Valor Total (R$)">
                      <input type="text"
                        value={F.implValor||''}
                        onChange={e=>setImplValorManual(e.target.value)}
                        placeholder="calculado automaticamente"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none font-semibold ${
                          F.implForaPadrao
                            ? 'border-red-400 bg-red-50 text-red-700 focus:border-red-500'
                            : vlHoraPadrao>0
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'focus:border-violet-400 bg-white'
                        }`}/>
                    </FL>
                  </div>
    
                  {/* C��lculo automático info */}
                  {vlHoraPadrao>0 && F.implHoras && Number(F.implHoras)>0 && !F.implForaPadrao && (
                    <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0"/>
                      {Number(F.implHoras)}h × R$ {vlHoraPadrao.toFixed(2)}/h = <span className="font-bold">R$ {(Number(F.implHoras)*vlHoraPadrao).toFixed(2)}</span> — valor dentro do padrão
                    </div>
                  )}
    
                  {/* Divergência — exige autorização */}
                  {F.implForaPadrao && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-300 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"/>
                        <div>
                          <p className="text-xs font-bold text-red-700">Valor fora do padrão</p>
                          <p className="text-[10px] text-red-600">
                            Esperado: R$ {(Number(F.implHoras)*vlHoraPadrao).toFixed(2)}
                            {' '}({Number(F.implHoras)}h × R$ {vlHoraPadrao.toFixed(2)}/h).
                            Informe o ADM autorizador.
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-red-600 uppercase tracking-wide mb-1">Autorizado por (ADM) *</label>
                        <input type="text" value={F.implAutorizadoPor||''} onChange={e=>setF('implAutorizadoPor',e.target.value)}
                          placeholder="Nome do administrador que autorizou..."
                          className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:border-red-500 bg-white"/>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
    
            {/* BLOCO 6 — Estrutura da Carteira */}
            <div className="p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">6. Estrutura da Carteira</p>
              <div className="grid grid-cols-3 gap-4">
                <FL label="Total de Clientes"><TI k="qtdClientes" placeholder="0" type="number"/></FL>
                <FL label="Lucro Real"><TI k="lucroReal" placeholder="0" type="number"/></FL>
                <FL label="Simples Nacional"><TI k="simplesNac" placeholder="0" type="number"/></FL>
                <FL label="Lucro Presumido"><TI k="lucroPres" placeholder="0" type="number"/></FL>
                <FL label="Agronegócio / Outros"><TI k="agro" placeholder="0" type="number"/></FL>
              </div>
              <div className="mt-4">
                <FL label="Ramos de Atividade (texto livre)">
                  <textarea value={F.ramos} onChange={e=>setF('ramos',e.target.value)}
                    placeholder="Descreva os principais ramos de atividade dos clientes..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white resize-none"/>
                </FL>
              </div>
            </div>
    
            {/* BLOCO 7 — Desconto */}
            <div className="p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">7. Desconto</p>
              <FL label="Solicitar desconto?">
                <div className="flex gap-4 pt-2">
                  <Radio k="desconto" val="sim" label="Sim"/>
                  <Radio k="desconto" val="nao" label="Não"/>
                </div>
              </FL>
              {F.desconto==='sim' && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-100 border border-orange-200 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0"/>
                    Desconto não será aplicado automaticamente — requer aprovação do administrador.
                  </div>
                  <FL label="Tipo de desconto" req>
                    <div className="flex gap-4 pt-2">
                      <Radio k="descontoTipo" val="percentual" label="Percentual (%)"/>
                      <Radio k="descontoTipo" val="valor" label="Valor (R$)"/>
                    </div>
                  </FL>
                  <FL label={`Valor do desconto ${F.descontoTipo==='percentual'?'(%)':'(R$)'}`} req>
                    <TI k="descontoValor" placeholder={F.descontoTipo==='percentual'?'ex: 10':'ex: 500,00'}/>
                  </FL>
                  <FL label="Motivo do desconto" req>
                    <textarea value={F.descontoMotivo||''} onChange={e=>setF('descontoMotivo',e.target.value)}
                      placeholder="Descreva o motivo que justifica o desconto solicitado..."
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-400 bg-white resize-none"/>
                  </FL>
                </div>
              )}
            </div>
    
          </div>
    
          {/* Botão de envio */}
          <div className="flex justify-end gap-3 pb-6">
            <button onClick={()=>{vc.tab='lista';rerender()}}
              className="px-5 py-2.5 border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={enviarSolicitacao}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center gap-2">
              <Send className="w-4 h-4"/> Enviar para Aprovação
            </button>
          </div>
        </div>
      )}
    
    </div>
    )
  }

  const PageOperacoes = () => {
    const [opsTecSel, setOpsTecSel] = useState(0)
    const [opsMonthExp, setOpsMonthExp] = useState(null)
    const [opsTab2b, setOpsTab2b] = useState(0)
    const [opsTab2, setOpsTab2] = useState(0)
    
    const MESES_OPS = [
      {label:'Jan/26', disp:1008, ag:508, re:399, ef:79},
      {label:'Fev/26', disp:960,  ag:525, re:440, ef:84},
      {label:'Mar/26', disp:880,  ag:571, re:454, ef:80},
      {label:'Abr/26', disp:840,  ag:109, re:47,  ef:43},
    ]
    const TECH = [
      {nome:'Dougllas Victorelle', full:'Dougllas Victorelle Pereira', ini:'DV', cor:'#0ea5e9',
       contratos:[14,14,12,6], ag:[96,103,94,42], re:[84,81,73,28],
       com:[1280,1220,1081,364], faixa:['81h+=R$20/h','81h+=R$20/h','51-80h=R$17/h','0-30h=R$13/h']},
      {nome:'Ericka Luzia', full:'Ericka Luzia Silva da Costa', ini:'EL', cor:'#8b5cf6',
       contratos:[18,11,16,3], ag:[81,64,112,18], re:[54,51,82,4],
       com:[758,707,1240,52], faixa:['51-80h=R$17/h','51-80h=R$17/h','81h+=R$20/h','0-30h=R$13/h']},
      {nome:'Johnny Cristian', full:'Johnny Cristian Cabral Santos', ini:'JC', cor:'#f97316',
       contratos:[14,11,12,3], ag:[96,49,64,27], re:[69,38,58,0],
       com:[1013,510,826,0], faixa:['51-80h=R$17/h','31-50h=R$15/h','51-80h=R$17/h','—']},
      {nome:'Leonildo Sobrinho', full:'Leonildo Sobrinho Rego', ini:'LS', cor:'#10b981',
       contratos:[13,14,16,2], ag:[76,100,117,8], re:[64,86,90,4],
       com:[928,1320,1400,52], faixa:['51-80h=R$17/h','81h+=R$20/h','81h+=R$20/h','0-30h=R$13/h']},
      {nome:'Renato Jairo', full:'Renato Jairo Rodrigues Lima', ini:'RJ', cor:'#ec4899',
       contratos:[20,19,25,3], ag:[99,109,156,14], re:[77,86,129,11],
       com:[1149,1320,2180,143], faixa:['51-80h=R$17/h','81h+=R$20/h','81h+=R$20/h','0-30h=R$13/h']},
      {nome:'Wanderley Cardoso', full:'Wanderley Cardoso Silva', ini:'WC', cor:'#14b8a6',
       contratos:[11,12,5,0], ag:[60,100,28,0], re:[50,99,21,0],
       com:[690,1580,273,0], faixa:['31-50h=R$15/h','81h+=R$20/h','0-30h=R$13/h','—']},
    ]
    const efv = (ag,re) => ag>0?Math.round(re/ag*100):0
    const efColor = (v) => v>=70?'#1CC88A':v>=50?'#f0ad4e':'#e74c3c'
    const efBg = (v) => v>=70?'#d4edda':v>=50?'#fff3cd':'#f8d7da'
    const efTxt = (v) => v>=70?'#155724':v>=50?'#856404':'#721c24'
    const fmtCom = (n) => 'R$ '+n.toLocaleString('pt-BR')
    const m = MESES_OPS[opsTab2b]
    const opsTabLabels = ['Visão Geral','Por Técnico','Histórico 12 meses','Regras & Alertas']
    const TECH_ID_MAP = {ops1:0, ops2:3, ops3:4, ops4:1, ops5:2, ops6:5}
    const myTechIdx = isTecnico() ? (TECH_ID_MAP[user.id] ?? -1) : -1
    const myTech = myTechIdx >= 0 ? TECH[myTechIdx] : null
    
    const _render3163 = () => {
        const t = TECH[myTechIdx]
        if (!t) return null
        const alertas = []
        const abr = t.ag[3]>0 ? Math.round(t.re[3]/t.ag[3]*100) : 0
        const totalRe = t.re.reduce((s,v)=>s+v,0)
        const totalAg = t.ag.reduce((s,v)=>s+v,0)
        const efGeral = efv(totalAg, totalRe)
        if (t.ag[3]===0) alertas.push({cor:'🟡', msg:`Sem agendamentos em Abril`})
        else if (abr < 50) alertas.push({cor:'🔴', msg:`Abril: ${t.re[3]}h realizadas de ${t.ag[3]}h agendadas (${abr}%)`})
        else if (abr < 70) alertas.push({cor:'🟡', msg:`Abril parcial: ${t.re[3]}h realizadas de ${t.ag[3]}h agendadas (${abr}%)`})
        else alertas.push({cor:'🟢', msg:`Abril: ${t.re[3]}h realizadas de ${t.ag[3]}h agendadas — meta atingida (${abr}%)`})
        const melhorMes = t.re.indexOf(Math.max(...t.re))
        const mLabels = ['Janeiro','Fevereiro','Março','Abril']
        alertas.push({cor: efGeral>=70?'🟢':'🟡', msg:`Eficiência geral 2026: ${efGeral}% (${totalRe}h realizadas de ${totalAg}h agendadas)`})
        alertas.push({cor:'🔵', msg:`Melhor mês: ${mLabels[melhorMes]} com ${t.re[melhorMes]}h realizadas (${efv(t.ag[melhorMes],t.re[melhorMes])}% de eficiência)`})
        const faixaAtual = t.faixa[3]||t.faixa[t.faixa.length-1]
        alertas.push({cor:'💰', msg:`Comissão Abril: ${faixaAtual} — R$ ${t.com[3].toLocaleString('pt-BR')} projetado`})
        return myTechIdx >= 0 ? (
          <div className="space-y-2 text-sm text-gray-700">
            {alertas.map((a,i)=>(
              <p key={i}>{a.cor} {a.msg}</p>
            ))}
          </div>
        ) : (
          <div className="space-y-2 text-sm text-gray-600">
            <p>🟡 <b>Ericka Luzia</b> — Abril parcial: 4h realizadas de 18h agendadas (22%)</p>
            <p>🔴 <b>Johnny Cristian</b> — Abril: 0h realizadas de 27h agendadas</p>
            <p>🟡 <b>Wanderley Cardoso</b> �� Sem agendamentos em Abril</p>
            <p>🟢 <b>Renato Jairo</b> — Melhor desempenho: 129h em Março (83% de eficiência)</p>
          </div>
        )
    }
    const _render2808 = () => {
      const CLI_DATA = {
        'DV': {
          'Jan/26':[{nome:'Dougllas Victorelle — Janeiro',ag:96,re:84,cancel:12}],
          'Fev/26':[{nome:'Dougllas Victorelle — Fevereiro',ag:103,re:81,cancel:22}],
          'Mar/26':[
            {nome:'2R SERVICOS E OBRAS LTDA',ag:5,re:5,cancel:0},
            {nome:'M & S EMPREENDIMENTOS',ag:8,re:7,cancel:1},
            {nome:'MENDES CONTABILIDADE',ag:10,re:8,cancel:2},
            {nome:'OSMAR SCARAMUSSA',ag:9,re:7,cancel:2},
            {nome:'T DOS SANTOS SILVA',ag:10,re:9,cancel:1},
            {nome:'E. COSTA LEAL CONTABILIDADE',ag:12,re:10,cancel:2},
            {nome:'FACULDADE PARA O DESENV. AMAZ.',ag:5,re:4,cancel:1},
            {nome:'LIVE SERVICOS DE ASSESSORIA',ag:6,re:5,cancel:1},
            {nome:'DALVAN EVANGELISTA VERAS',ag:6,re:5,cancel:1},
            {nome:'CICERO GERONIMO LABRE',ag:5,re:4,cancel:1},
            {nome:'LIDER CONTABIL ASSESSORIA',ag:8,re:7,cancel:1},
            {nome:'POLEN CONTABIL LTDA',ag:6,re:3,cancel:3},
          ],
          'Abr/26':[{nome:'Dougllas Victorelle — Abril',ag:42,re:28,cancel:14}],
        },
        'EL': {
          'Jan/26':[{nome:'Ericka Luzia — Janeiro',ag:81,re:54,cancel:27}],
          'Fev/26':[{nome:'Ericka Luzia — Fevereiro',ag:64,re:51,cancel:13}],
          'Mar/26':[
            {nome:'60.231.259 ELIANE DE OLIVEIRA',ag:8,re:8,cancel:0},
            {nome:'ATIVOS CONTABILIDADE LTDA',ag:6,re:0,cancel:6},
            {nome:'ATIVUS SERVICOS CONTABEIS',ag:8,re:0,cancel:8},
            {nome:'CAROLAINE LIMA ALENCAR COSTA',ag:12,re:10,cancel:2},
            {nome:'GABANA ASSESSORIA CONTABIL',ag:5,re:4,cancel:1},
            {nome:'IARA CARVALHO RODRIGUES',ag:10,re:8,cancel:2},
            {nome:'METTA CONTABILIDADE',ag:14,re:12,cancel:2},
            {nome:'NARA RUBIA COSTA DE SOUSA',ag:8,re:7,cancel:1},
            {nome:'PA DIGITAL CONTABILIDADE',ag:8,re:8,cancel:0},
            {nome:'Z M P DA TRINDADE LTDA',ag:8,re:7,cancel:1},
            {nome:'LALUR - LALUR',ag:6,re:5,cancel:1},
            {nome:'MORETZ SOHN E MOURA LTDA',ag:7,re:5,cancel:2},
          ],
          'Abr/26':[{nome:'Ericka Luzia — Abril',ag:18,re:4,cancel:14}],
        },
        'JC': {
          'Jan/26':[{nome:'Johnny Cristian — Janeiro',ag:96,re:69,cancel:27}],
          'Fev/26':[{nome:'Johnny Cristian — Fevereiro',ag:49,re:38,cancel:11}],
          'Mar/26':[
            {nome:'ADEILTON.APP LTDA',ag:6,re:5,cancel:1},
            {nome:'D FERNANDES CAMPOS',ag:8,re:7,cancel:1},
            {nome:'FARIAS & SCHIMITH LTDA',ag:10,re:8,cancel:2},
            {nome:'FRANCINEI COELHO PINTO',ag:4,re:4,cancel:0},
            {nome:'K M J CONTABILIDADE LTDA',ag:3,re:3,cancel:0},
            {nome:'KELLI CRISTINA PAULO',ag:5,re:4,cancel:1},
            {nome:'LIMA EMPREENDIMENTOS LTDA',ag:10,re:9,cancel:1},
            {nome:'LUSIVANIA PEREIRA BARROS',ag:5,re:4,cancel:1},
            {nome:'NOVA TENDENCIA SERV CONTABEIS',ag:6,re:5,cancel:1},
            {nome:'O. C. FONSECA',ag:5,re:5,cancel:0},
            {nome:'R. R. DANTAS VIANA LTDA',ag:6,re:4,cancel:2},
          ],
          'Abr/26':[{nome:'Johnny Cristian — Abril',ag:27,re:0,cancel:27}],
        },
        'LS': {
          'Jan/26':[{nome:'Leonildo Sobrinho — Janeiro',ag:76,re:64,cancel:12}],
          'Fev/26':[{nome:'Leonildo Sobrinho — Fevereiro',ag:100,re:86,cancel:14}],
          'Mar/26':[
            {nome:'AGRO SERINGUEIRA TOCANTINS',ag:3,re:3,cancel:0},
            {nome:'ANTONIEL PEREIRA PINTO',ag:8,re:7,cancel:1},
            {nome:'CONSULTHABIL CONTAB',ag:12,re:10,cancel:2},
            {nome:'EXATA ACESSORIA ADMIN',ag:8,re:7,cancel:1},
            {nome:'LEX CONTABILIDADE',ag:6,re:6,cancel:0},
            {nome:'M & S EMPREENDIMENTOS — Escrita',ag:12,re:9,cancel:3},
            {nome:'OPEN7 CONTABILIDADE',ag:8,re:8,cancel:0},
            {nome:'PA DIGITAL CONTABILIDADE',ag:14,re:13,cancel:1},
            {nome:'PATAUA FLORESTAL LTDA',ag:6,re:5,cancel:1},
            {nome:'R.C. CONTABILIDADE',ag:8,re:7,cancel:1},
            {nome:'T DOS SANTOS SILVA — Escrita',ag:12,re:9,cancel:3},
            {nome:'Z M P DA TRINDADE — Escrita',ag:10,re:9,cancel:1},
          ],
          'Abr/26':[{nome:'Leonildo Sobrinho — Abril',ag:8,re:4,cancel:4}],
        },
        'RJ': {
          'Jan/26':[{nome:'Renato Jairo — Janeiro',ag:99,re:77,cancel:22}],
          'Fev/26':[{nome:'Renato Jairo — Fevereiro',ag:109,re:86,cancel:23}],
          'Mar/26':[
            {nome:'ATIVUS SERVICOS CONTABEIS — Escrita',ag:12,re:10,cancel:2},
            {nome:'CASTRO CONTABILIDADE',ag:5,re:4,cancel:1},
            {nome:'CONNECT ASSESSORIA EMPRESARIAL',ag:4,re:4,cancel:0},
            {nome:'E. COSTA LEAL — Folha',ag:16,re:14,cancel:2},
            {nome:'ESCRITORIO CONTABIL REAL',ag:10,re:8,cancel:2},
            {nome:'GAGLIARDI CONTABILIDADE',ag:14,re:12,cancel:2},
            {nome:'LIVE SERVICOS — Escrita',ag:8,re:7,cancel:1},
            {nome:'MENDES CONTABILIDADE — Folha',ag:16,re:14,cancel:2},
            {nome:'METTA CONTABILIDADE — Escrita',ag:14,re:13,cancel:1},
            {nome:'MORETZ SOHN — Escrita',ag:4,re:4,cancel:0},
            {nome:'RIBEIRO E SANTOS SERV CONT',ag:12,re:10,cancel:2},
            {nome:'REGINALDO ALVES DE SOUSA',ag:10,re:9,cancel:1},
            {nome:'TIMOTHEO CONTABILIDADE',ag:4,re:4,cancel:0},
            {nome:'V. DE SOUSA MARQUES',ag:8,re:7,cancel:1},
            {nome:'WRIGHT CONTABILIDADE',ag:5,re:4,cancel:1},
          ],
          'Abr/26':[{nome:'Renato Jairo — Abril',ag:14,re:11,cancel:3}],
        },
        'WC': {
          'Jan/26':[{nome:'Wanderley Cardoso — Janeiro',ag:60,re:50,cancel:10}],
          'Fev/26':[{nome:'Wanderley Cardoso — Fevereiro',ag:100,re:99,cancel:1}],
          'Mar/26':[
            {nome:'ANTONIEL PEREIRA PINTO — Cont',ag:8,re:6,cancel:2},
            {nome:'CONSULTHABIL — Escrita',ag:8,re:7,cancel:1},
            {nome:'ESSENCIAL CONTABILIDADE',ag:6,re:5,cancel:1},
            {nome:'GRACIELLY MARINHO COSTA',ag:3,re:3,cancel:0},
            {nome:'R. L. DA SILVA MARTINS',ag:7,re:6,cancel:1},
            {nome:'VETOR INTELIGENCIA CONTABIL',ag:3,re:3,cancel:0},
          ],
          'Abr/26':[],
        },
      }
          
      const a = TECH[isTecnico() ? (TECH_ID_MAP[user.id] ?? 0) : opsTecSel]
      const totalRe = a.re.reduce((s,v)=>s+v,0)
      const totalAg = a.ag.reduce((s,v)=>s+v,0)
      const efAnual = efv(totalAg,totalRe)
      const totalContratos = a.contratos.reduce((s,v)=>s+v,0)
      const ranks = [...TECH].map((t,idx)=>({idx, ef:efv(t.ag.reduce((s,v)=>s+v,0),t.re.reduce((s,v)=>s+v,0))}))
        .sort((x,y)=>y.ef-x.ef)
      const rank = ranks.findIndex((r)=>r.idx===opsTecSel)+1
          
      return (
      <div className="space-y-4">
        {/* Dropdown seletor — oculto para técnico (vê apenas seus dados) */}
        {!isTecnico() && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-500">Técnico:</label>
          <div className="relative">
            <select
              value={opsTecSel}
              onChange={(e)=>setOpsTecSel(Number(e.target.value))}
              className="appearance-none pl-10 pr-8 py-2 border rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-blue-500 cursor-pointer">
              {TECH.map((t,i)=>(
                <option key={i} value={i}>{t.full}</option>
              ))}
            </select>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium pointer-events-none" style={{background:a.cor+'20',color:a.cor}}>{a.ini}</div>
            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 rotate-90 pointer-events-none"/>
          </div>
        </div>
        )}
          
        {/* Perfil */}
        <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-medium flex-shrink-0" style={{background:a.cor+'20',color:a.cor}}>{a.ini}</div>
          <div className="flex-1">
            <p className="font-bold text-base">{a.full}</p>
            <p className="text-xs text-gray-400">{a.ini.toLowerCase()}@ops.com · {totalContratos} contratos ativos</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">Rank de produtividade</p>
            <p className="text-2xl font-bold" style={{color:a.cor}}>#{rank}<span className="text-sm font-normal text-gray-400"> / {TECH.length}</span></p>
          </div>
        </div>
          
        {/* KPIs — só números, sem comissão */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border rounded-xl p-4 border-t-2 border-t-blue-500">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Realizado Anual</p>
            <p className="text-3xl font-medium">{totalRe}h</p>
            <p className="text-xs text-gray-400 mt-1">de {totalAg}h agendadas</p>
          </div>
          <div className="bg-white border rounded-xl p-4 border-t-2 border-t-emerald-500">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Taxa Anual</p>
            <p className="text-3xl font-medium" style={{color:efColor(efAnual)}}>{efAnual}%</p>
            <p className="text-xs text-gray-400 mt-1">meta: 70%</p>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Posição no Ranking</p>
            <p className="text-3xl font-medium" style={{color:a.cor}}>#{rank}</p>
            <p className="text-xs text-gray-400 mt-1">entre {TECH.length} técnicos</p>
          </div>
        </div>
          
        {/* Tabela de meses — clique expande clientes */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Meses — clique para ver clientes atendidos</p>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              {['','Mês','Agendado','Realizado','Cancelado','Taxa','Meta 70%','Saldo'].map((h,i)=>(
                <th key={i} className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-left">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {MESES_OPS.map((mes,i)=>{
                const ag=a.ag[i], re=a.re[i]
                if(ag===0) return null
                const cancelado = ag-re
                const e=efv(ag,re), meta70=Math.round(ag*0.7), saldo=re-meta70
                const expanded = opsMonthExp===`${opsTecSel}-${i}`
                const clientes = CLI_DATA[a.ini]?.[mes.label] || []
                const totalCliAg = clientes.reduce((s,c)=>s+c.ag,0)
                const totalCliRe = clientes.reduce((s,c)=>s+c.re,0)
                const totalCliCanc = clientes.reduce((s,c)=>s+c.cancel,0)
                return (
                  <>
                    <tr key={`row-${i}`}
                      className="border-b hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={()=>setOpsMonthExp(expanded?null:`${opsTecSel}-${i}`)}>
                      <td className="px-4 py-2.5 w-8 text-gray-400 text-xs">{expanded?'▼':'▶'}</td>
                      <td className="px-4 py-2.5 font-medium">{mes.label}</td>
                      <td className="px-4 py-2.5">{ag}h</td>
                      <td className="px-4 py-2.5 font-medium" style={{color:efColor(e)}}>{re}h</td>
                      <td className="px-4 py-2.5 text-red-400">{cancelado}h</td>
                      <td className="px-4 py-2.5">
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{background:efBg(e),color:efTxt(e)}}>{e}%</span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-400">{meta70}h</td>
                      <td className="px-4 py-2.5 font-medium" style={{color:saldo>=0?'#1CC88A':'#e74c3c'}}>{saldo>=0?'+':''}{saldo}h</td>
                    </tr>
                    {expanded && (
                      <tr key={`exp-${i}`} className="border-b bg-blue-50">
                        <td colSpan={8} className="px-0 py-0">
                          <div className="mx-4 my-3 border rounded-lg overflow-hidden bg-white">
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
                              <p className="text-xs font-semibold text-gray-600">{mes.label} — {clientes.length > 1 ? `${clientes.length} clientes atendidos` : 'Detalhe'}</p>
                              <div className="flex gap-4 text-xs text-gray-500">
                                <span>Ag: <b className="text-gray-700">{totalCliAg || ag}h</b></span>
                                <span>Re: <b style={{color:efColor(e)}}>{totalCliRe || re}h</b></span>
                                <span>Canc: <b className="text-red-400">{totalCliCanc || cancelado}h</b></span>
                              </div>
                            </div>
                            <table className="w-full text-xs">
                              <thead><tr className="border-b bg-gray-50">
                                <th className="px-4 py-2 text-left text-gray-400 font-semibold uppercase tracking-wide">Cliente</th>
                                <th className="px-4 py-2 text-center text-gray-400 font-semibold uppercase tracking-wide">Agendado</th>
                                <th className="px-4 py-2 text-center text-gray-400 font-semibold uppercase tracking-wide">Realizado</th>
                                <th className="px-4 py-2 text-center text-gray-400 font-semibold uppercase tracking-wide">Cancelado</th>
                                <th className="px-4 py-2 text-center text-gray-400 font-semibold uppercase tracking-wide">Taxa</th>
                              </tr></thead>
                              <tbody>
                                {clientes.length > 1 ? clientes.map((c,ci)=>{
                                  const ce = efv(c.ag,c.re)
                                  return (
                                    <tr key={ci} className="border-b last:border-0 hover:bg-gray-50">
                                      <td className="px-4 py-2 font-medium text-gray-700">{c.nome}</td>
                                      <td className="px-4 py-2 text-center">{c.ag}h</td>
                                      <td className="px-4 py-2 text-center font-medium" style={{color:efColor(ce)}}>{c.re}h</td>
                                      <td className="px-4 py-2 text-center text-red-400">{c.cancel}h</td>
                                      <td className="px-4 py-2 text-center">
                                        <span className="px-2 py-0.5 rounded-full font-medium" style={{background:efBg(ce),color:efTxt(ce)}}>{ce}%</span>
                                      </td>
                                    </tr>
                                  )
                                }) : (
                                  <tr><td colSpan={5} className="px-4 py-3 text-center text-gray-400">Dado agregado — detalhe por cliente disponível a partir de Mar/26</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      )
    }
    const _render2505 = () => {
        const kpiAg = isTecnico() && myTech ? (myTech.ag[mi]||0) : m.ag
        const kpiRe = isTecnico() && myTech ? (myTech.re[mi]||0) : m.re
        const kpiEf = kpiAg>0 ? Math.round(kpiRe/kpiAg*100) : (isTecnico()&&myTech?0:m.ef)
        return (
      <div className="bg-white border rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-sm">Taxa de Realização — {m.label}</span>
          <span className="font-semibold text-sm" style={{color:efColor(kpiEf)}}>{kpiEf}%</span>
        </div>
        <div className="relative h-3 bg-gray-100 rounded-full overflow-visible">
          <div className="h-full rounded-full transition-all" style={{width:`${Math.min(100,kpiEf)}%`,background:efColor(kpiEf)}}/>
          <div className="absolute top-[-3px] h-[18px] w-[2px] bg-blue-500" style={{left:'70%'}}/>
          <span className="absolute text-[10px] text-blue-500 top-4" style={{left:'70%',transform:'translateX(-50%)'}}>Meta 70%</span>
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-5">
          <span>0%</span><span>100%</span>
        </div>
      </div>
        )
    }
    const _render2484 = () => {
      const kpiAg  = isTecnico() && myTech ? (myTech.ag[mi]||0) : m.ag
      const kpiRe  = isTecnico() && myTech ? (myTech.re[mi]||0) : m.re
      const kpiEf  = kpiAg>0 ? Math.round(kpiRe/kpiAg*100) : (isTecnico()&&myTech?0:m.ef)
      const kpiDisp= isTecnico() && myTech ? Math.round(m.disp/TECH.length) : m.disp
      return [
        {lbl:'CAPACIDADE', val:`${kpiDisp}h`, sub:'dispon��vel no mês', accent:'border-t-2 border-t-blue-500'},
        {lbl:'AGENDADO',   val:`${kpiAg}h`,   sub:'sessões agendadas', accent:''},
        {lbl:'REALIZADO',  val:`${kpiRe}h`,   sub:'horas executadas',  accent:'border-t-2 border-t-emerald-500'},
        {lbl:'TAXA',       val:`${kpiEf}%`,   sub:kpiEf>=70?'Meta: 70% · ✓ Atingida':'Meta: 70% · ✗ Abaixo', accent:'', valColor:efColor(kpiEf)},
      ].map((k,i)=>(
        <div key={i} className={`bg-white border rounded-xl p-4 ${k.accent}`}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">{k.lbl}</p>
          <p className="text-3xl font-medium" style={(k).valColor?{color:(k).valColor}:{}}>{k.val}</p>
          <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
        </div>
      ))
    }
    const _render2436 = () => {
      const H2025_TEAM = [292,344,349,277,267,266,295,349,435,442,296,251]
      const H2026_TEAM = [399,440,454,47,0,0,0,0,0,0,0,0]
      const HAG26_TEAM = [508,525,571,109,0,0,0,0,0,0,0,0]
      const NREAL_TEAM = [109,85,117,62,0,0,0,0,0,0,0,0]
      const H2025 = isTecnico() && myTech
        ? new Array(12).fill(0)  // 2025 sem dado individual por técnico
        : H2025_TEAM
      const H2026 = isTecnico() && myTech
        ? [...myTech.re, ...new Array(8).fill(0)]
        : H2026_TEAM
      const HAG26 = isTecnico() && myTech
        ? [...myTech.ag, ...new Array(8).fill(0)]
        : HAG26_TEAM
      const NREAL = isTecnico() && myTech
        ? [...myTech.ag.map((ag,i)=>Math.max(0,ag-myTech.re[i])), ...new Array(8).fill(0)]
        : NREAL_TEAM
      const LABELS12 = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
      const SEMS = [
        [2,50,97,120,130],
        [118,108,74,140,0],
        [84,113,98,114,45],
        [28,19,0,0,0],
        [0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],
        [0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],
      ]
      const SEM_CORES = ['#4472C4','#ED7D31','#A5A5A5','#FFC000','#5B9BD5']
      const media2025 = isTecnico() ? 0 : Math.round(H2025_TEAM.reduce((a,b)=>a+b,0)/H2025_TEAM.length)
      const bh = (v,max,px) => v>0?Math.max(4,Math.round(v/max*px)):0
      const maxAll = 600
          
      const mi = opsTab2b
          
      return (
      <div className="space-y-5">
          
        {/* ── Seletor de mês ── */}
        <div className="flex gap-2 flex-wrap">
          {MESES_OPS.map((mes,i)=>(
            <button key={i} onClick={()=>setOpsTab2b(i)}
              className={`px-4 py-1.5 rounded-full text-xs border transition-colors ${mi===i?'bg-blue-600 text-white border-blue-600':'border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
              {mes.label}
            </button>
          ))}
        </div>
          
        {/* ── KPIs do mês selecionado ── */}
        <div className="grid grid-cols-2 gap-3">
          {_render2484()}
        </div>
          
        {/* ── Barra taxa ── */}
        {_render2505()}
          
        {/* ═════════════════════════════════��════
            GRÁFICO 1 — 2025 x 2026
            Mês selecionado fica destacado
        ════════════════════════════��═════════ */}
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm font-semibold text-center text-gray-700 mb-4">{isTecnico() ? "Meu Realizado 2026" : "2025 x 2026"}</p>
          <div className="flex gap-0 items-end" style={{height:'200px'}}>
            {LABELS12.map((lbl,i)=>{
              const v25 = H2025[i], v26 = H2026[i]
              const h25 = bh(v25,500,160), h26 = bh(v26,500,160)
              const selected = i===mi
              const hasDados26 = v26>0
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                  {/* valores no topo das barras */}
                  <div className="flex gap-px items-end justify-center w-full" style={{height:'168px',position:'relative'}}>
                    {/* Barra 2025 */}
                    <div className="flex flex-col items-center justify-end" style={{width:'44%'}}>
                      {selected && <span className="text-[9px] font-bold text-blue-600 mb-0.5">{v25}</span>}
                      <div style={{
                        width:'100%', height:`${h25}px`,
                        background: selected?'#1D6FD8':'#4472C4',
                        borderRadius:'2px 2px 0 0',
                        opacity: selected?1:0.6
                      }}/>
                    </div>
                    {/* Barra 2026 */}
                    <div className="flex flex-col items-center justify-end" style={{width:'44%'}}>
                      {selected && hasDados26 && <span className="text-[9px] font-bold text-orange-500 mb-0.5">{v26}</span>}
                      {hasDados26?(
                        <div style={{
                          width:'100%', height:`${h26}px`,
                          background: selected?'#f97316':'#ED7D31',
                          borderRadius:'2px 2px 0 0',
                          opacity: selected?1:0.7
                        }}/>
                      ):(
                        <div style={{width:'100%',height:'3px',background:'#e5e7eb',borderRadius:'2px'}}/>
                      )}
                    </div>
                  </div>
                  {/* Label mês */}
                  <span className={`text-[9px] mt-0.5 ${selected?'font-bold text-blue-600':'text-gray-400'}`}>{lbl}</span>
                </div>
              )
            })}
          </div>
          {/* Linha de média 2025 — apenas para gestão */}
          {!isTecnico() && (
          <div className="flex items-center gap-2 mt-3 justify-center">
            <div className="h-px flex-1 max-w-xs" style={{background:`repeating-linear-gradient(90deg,#ef4444 0,#ef4444 6px,transparent 6px,transparent 12px)`}}/>
            <span className="text-[10px] text-red-400 font-medium">Média 2025: {media2025}h</span>
            <div className="h-px flex-1 max-w-xs" style={{background:`repeating-linear-gradient(90deg,#ef4444 0,#ef4444 6px,transparent 6px,transparent 12px)`}}/>
          </div>
          )}
          {/* Legenda */}
          <div className="flex gap-4 justify-center mt-2 text-[11px] text-gray-500">
            {!isTecnico() && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block bg-blue-500 opacity-70"/>2025</span>}
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block bg-orange-400 opacity-80"/>{isTecnico() ? "Realizado" : "2026"}</span>
          </div>
          {/* Mini tabela numérica */}
          <div className="mt-4 overflow-x-auto border rounded-lg">
            <table className="w-full text-[11px]">
              <thead><tr className="bg-gray-50 border-b">
                <th className="px-3 py-1.5 text-left text-gray-500 font-semibold w-12">Mês</th>
                {LABELS12.map((l,i)=>(
                  <th key={i} className={`px-1 py-1.5 text-center font-semibold ${i===mi?'bg-blue-50 text-blue-600':'text-gray-400'}`}>{l}</th>
                ))}
              </tr></thead>
              <tbody>
                {!isTecnico() && (
                <tr className="border-b">
                  <td className="px-3 py-1.5 text-blue-500 font-semibold">2025</td>
                  {H2025.map((v,i)=>(
                    <td key={i} className={`px-1 py-1.5 text-center font-medium ${i===mi?'bg-blue-50 text-blue-700 font-bold':'text-blue-400'}`}>{v}</td>
                  ))}
                </tr>
                )}
                <tr>
                  <td className="px-3 py-1.5 text-orange-500 font-semibold">{isTecnico() ? "Re" : "2026"}</td>
                  {H2026.map((v,i)=>(
                    <td key={i} className={`px-1 py-1.5 text-center font-medium ${i===mi?'bg-blue-50 font-bold':''}  ${v>0?'text-orange-500':'text-gray-300'}`}>{v||'—'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
          
        {/* ══════════════════════════════════════
            GRÁFICO 2 — Realizado por Semana 12M
            M��s selecionado destacado
        ═══════════════════════════════════��══ */}
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm font-semibold text-center text-gray-700 mb-4">Realizado por Semana — 12M/2026</p>
          <div className="flex gap-0 items-end" style={{height:'180px'}}>
            {LABELS12.map((_,mi2)=>{
              const sems = SEMS[mi2]
              const hasData = sems.some((v)=>v>0)
              const selected = mi2===mi
              const maxS = 160
              return (
                <div key={mi2} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                  <div className="flex gap-px items-end justify-center w-full" style={{height:'160px'}}>
                    {sems.map((v,si)=>(
                      v>0?(
                        <div key={si} className="flex flex-col items-center justify-end" style={{width:'17%'}}>
                          {selected && <span className="text-[8px] font-bold mb-0.5" style={{color:SEM_CORES[si]}}>{v}</span>}
                          <div style={{
                            width:'100%',
                            height:`${Math.max(3,Math.round(v/160*150))}px`,
                            background:SEM_CORES[si],
                            borderRadius:'2px 2px 0 0',
                            opacity:selected?1:0.65
                          }}/>
                        </div>
                      ):(
                        <div key={si} style={{width:'17%',height:'2px',background:'#f3f4f6',alignSelf:'flex-end'}}/>
                      )
                    ))}
                  </div>
                  <span className={`text-[9px] mt-0.5 ${selected?'font-bold text-blue-600':'text-gray-400'}`}>{mi2+1}</span>
                </div>
              )
            })}
          </div>
          {/* Legenda semanas */}
          <div className="flex gap-3 justify-center mt-2 flex-wrap text-[10px] text-gray-500">
            {['Sem01','Sem02','Sem03','Sem04','Sem05'].map((s,i)=>(
              <span key={i} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm inline-block" style={{background:SEM_CORES[i]}}/>
                {s}
              </span>
            ))}
          </div>
          {/* Tabela semanas do mês selecionado */}
          <div className="mt-3 border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-1.5 border-b">
              <span className="text-[11px] font-semibold text-gray-600">Detalhe semanas — {MESES_OPS[mi]?.label}</span>
            </div>
            <div className="grid grid-cols-5 divide-x">
              {SEMS[mi].map((v,si)=>(
                <div key={si} className="p-3 text-center">
                  <p className="text-[10px] text-gray-400 mb-1">Sem0{si+1}</p>
                  <p className="text-base font-bold" style={{color:v>0?SEM_CORES[si]:'#d1d5db'}}>{v>0?`${v}h`:'—'}</p>
                </div>
              ))}
            </div>
            <div className="px-3 py-1.5 border-t bg-gray-50 text-right">
              <span className="text-[11px] font-semibold text-gray-600">
                Total: <span className="text-blue-600">{SEMS[mi].reduce((a,b)=>a+b,0)}h</span>
              </span>
            </div>
          </div>
          {/* Tabela completa 12 meses */}
          <div className="mt-3 overflow-x-auto border rounded-lg">
            <table className="w-full text-[10px]">
              <thead><tr className="bg-gray-50 border-b">
                <th className="px-2 py-1.5 text-left text-gray-500 w-8">Sem</th>
                {LABELS12.map((l,i)=>(
                  <th key={i} className={`px-1 py-1.5 text-center font-semibold ${i===mi?'bg-blue-50 text-blue-600':'text-gray-400'}`}>{l}</th>
                ))}
              </tr></thead>
              <tbody>
                {[0,1,2,3,4].map(si=>(
                  <tr key={si} className="border-b last:border-0">
                    <td className="px-2 py-1.5 font-semibold" style={{color:SEM_CORES[si]}}>S{si+1}</td>
                    {SEMS.map((ms,mi3)=>(
                      <td key={mi3} className={`px-1 py-1.5 text-center font-medium ${mi3===mi?'bg-blue-50':''} ${ms[si]>0?'':'text-gray-300'}`}
                        style={{color:ms[si]>0?SEM_CORES[si]:''}}>
                        {ms[si]||'—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          
        {/* ══════════════════════════════════════
            GRÁFICO 3 — Agendado x Realizado 2026
            Mês selecionado destacado + números
        ══════════════════════════════════════ */}
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm font-semibold text-center text-gray-700 mb-4">Agendado x Realizado 2026</p>
          <div className="flex gap-0 items-end" style={{height:'200px'}}>
            {LABELS12.map((_,i)=>{
              const ag = HAG26[i], re = H2026[i], nr = NREAL[i]
              const hAg = bh(ag,600,168), hRe = bh(re,600,168)
              const selected = i===mi
              const hasData = ag>0
              const e = ag>0?Math.round(re/ag*100):0
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                  <div className="flex gap-px items-end justify-center w-full" style={{height:'172px'}}>
                    {/* Agendado */}
                    <div className="flex flex-col items-center justify-end" style={{width:'44%'}}>
                      {selected && hasData && <span className="text-[9px] font-bold text-blue-600 mb-0.5">{ag}</span>}
                      {hasData?(
                        <div style={{width:'100%',height:`${hAg}px`,background:selected?'#1D6FD8':'#4472C4',borderRadius:'2px 2px 0 0',opacity:selected?1:0.6}}/>
                      ):(
                        <div style={{width:'100%',height:'3px',background:'#e5e7eb',borderRadius:'2px'}}/>
                      )}
                    </div>
                    {/* Realizado */}
                    <div className="flex flex-col items-center justify-end" style={{width:'44%'}}>
                      {selected && re>0 && <span className="text-[9px] font-bold text-orange-500 mb-0.5">{re}</span>}
                      {re>0?(
                        <div style={{width:'100%',height:`${hRe}px`,background:selected?'#f97316':'#ED7D31',borderRadius:'2px 2px 0 0',opacity:selected?1:0.7}}/>
                      ):(
                        <div style={{width:'100%',height:'3px',background:'#e5e7eb',borderRadius:'2px'}}/>
                      )}
                    </div>
                  </div>
                  <span className={`text-[9px] mt-0.5 ${selected?'font-bold text-blue-600':'text-gray-400'}`}>{LABELS12[i]}</span>
                  {selected && hasData && (
                    <span className="text-[9px] font-bold mt-0.5" style={{color:efColor(e)}}>{e}%</span>
                  )}
                </div>
              )
            })}
          </div>
          {/* Legenda */}
          <div className="flex gap-4 justify-center mt-2 text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block bg-blue-500 opacity-70"/>Agendado</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block bg-orange-400 opacity-80"/>Realizado</span>
          </div>
          {/* Detalhe mês selecionado */}
          {HAG26[mi]>0 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {[
                {lbl:'Agendado',  val:`${HAG26[mi]}h`, color:'#4472C4'},
                {lbl:'Realizado', val:`${H2026[mi]}h`, color:efColor(Math.round(H2026[mi]/HAG26[mi]*100))},
                {lbl:'N/Realizado',val:`${NREAL[mi]}h`, color:'#e74c3c'},
                {lbl:'Eficiência', val:`${Math.round(H2026[mi]/HAG26[mi]*100)}%`, color:efColor(Math.round(H2026[mi]/HAG26[mi]*100))},
              ].map((k,i)=>(
                <div key={i} className="text-center border rounded-xl py-3 bg-gray-50">
                  <p className="text-[10px] text-gray-400 mb-1">{k.lbl}</p>
                  <p className="text-xl font-bold" style={{color:k.color}}>{k.val}</p>
                </div>
              ))}
            </div>
          )}
          {/* Tabela numérica completa */}
          <div className="mt-4 overflow-x-auto border rounded-lg">
            <table className="w-full text-[11px]">
              <thead><tr className="bg-gray-50 border-b">
                <th className="px-3 py-1.5 text-left text-gray-500 font-semibold w-8"/>
                {LABELS12.map((l,i)=>(
                  <th key={i} className={`px-1 py-1.5 text-center font-semibold ${i===mi?'bg-blue-50 text-blue-600':'text-gray-400'}`}>{l}</th>
                ))}
              </tr></thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-3 py-1.5 text-blue-500 font-semibold">Ag</td>
                  {HAG26.map((v,i)=>(
                    <td key={i} className={`px-1 py-1.5 text-center font-medium ${i===mi?'bg-blue-50 font-bold text-blue-700':''} ${v>0?'text-blue-400':'text-gray-300'}`}>{v||'—'}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="px-3 py-1.5 text-orange-500 font-semibold">Re</td>
                  {H2026.map((v,i)=>(
                    <td key={i} className={`px-1 py-1.5 text-center font-medium ${i===mi?'bg-blue-50 font-bold':''} ${v>0?'text-orange-500':'text-gray-300'}`}>{v||'—'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-gray-500 font-semibold">Ef%</td>
                  {HAG26.map((ag,i)=>{
                    const re=H2026[i], e=ag>0?Math.round(re/ag*100):0
                    return <td key={i} className={`px-1 py-1.5 text-center font-bold ${i===mi?'bg-blue-50':''} ${ag>0?e>=70?'text-emerald-600':'text-amber-500':'text-gray-300'}`}>{ag>0?e+'%':'—'}</td>
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
          
      </div>
      )
    }

    return (
    <div className="space-y-0">
      {/* Título */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Operações</h1>
        <p className="text-sm text-gray-400 mt-0.5">Produtividade · horas · meta 70% · histórico 12 meses</p>
      </div>
    
      {/* Abas */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {opsTabLabels.map((lbl,i)=>(
          <button key={i} onClick={()=>setOpsTab2(i)}
            className={`px-4 py-2 text-sm rounded-t-lg border-none transition-colors ${opsTab2===i?'bg-blue-600 text-white font-medium':'text-gray-500 hover:bg-gray-100'}`}>
            {lbl}
          </button>
        ))}
      </div>
    
      {/* ── VISÃO GERAL ── */}
      {(opsTab2===0) && _render2436()}
      {(opsTab2===1) && _render2808()}
    
      {/* ── HISTÓRICO 12M ── */}
      {opsTab2===2 && (
        <div className="space-y-4">
          <div>
            <p className="font-medium text-base">{isTecnico() ? "Meu Histórico — 12 meses" : "Consolidado do Time — 12 meses (Jan/26 → Abr/26)"}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total geral de horas agendadas vs realizadas por mês</p>
          </div>
          <div className="bg-white border rounded-xl p-4 space-y-1">
            {MESES_OPS.map((mes,i)=>(
              <div key={i} className="flex items-center gap-3 py-1 rounded-lg hover:bg-gray-50 px-2">
                <span className="text-xs text-gray-500 w-14">{mes.label}</span>
                <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden">
                  <div className="h-full rounded-md flex items-center justify-end pr-2 text-[11px] font-medium text-white transition-all"
                    style={{width:`${mes.ef}%`,background:efColor(mes.ef)}}>
                    {mes.ef>=15?mes.ef+'%':''}
                  </div>
                </div>
                <span className="text-sm font-medium w-10 text-right" style={{color:efColor(mes.ef)}}>{mes.ef}%</span>
              </div>
            ))}
            <div className="flex gap-4 pt-2 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block bg-emerald-400"/> ≥70%</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block bg-amber-400"/> 50–69%</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block bg-red-400"/> &lt;50%</span>
            </div>
          </div>
          {!isTecnico() && <p className="font-medium text-base">Ranking de Performance — Média 4 meses</p>}
          <div className="space-y-2">
            {[...TECH]
              .map(a=>({...a, efMedio:efv(a.ag.reduce((s,v)=>s+v,0),a.re.reduce((s,v)=>s+v,0)), totalRe:a.re.reduce((s,v)=>s+v,0)}))
              .sort((a,b)=>b.efMedio-a.efMedio)
              .filter((a)=> {
                if (!isTecnico()) return true
                const myIdx = TECH_ID_MAP[user.id] ?? -1
                return myIdx >= 0 && a.ini === TECH[myIdx].ini
              })
              .map((a,i)=>{
                const maxTot = 320
                const rankColors = ['#f0ad4e','#adb5bd','#cd7f32','#6c757d','#6c757d','#6c757d']
                const rankBgs = ['#fff8e1','#f5f5f5','#fdf0e6','#f8f9fa','#f8f9fa','#f8f9fa']
                return (
                  <div key={i} className="bg-white border rounded-xl flex items-center gap-3 px-4 py-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{background:rankBgs[i],color:rankColors[i]}}>{i+1}</div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0" style={{background:a.cor+'20',color:a.cor}}>{a.ini}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{a.full}</p>
                      <p className="text-xs text-gray-400">{a.totalRe}h realizadas no período</p>
                    </div>
                    <div className="w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${Math.round(a.totalRe/maxTot*100)}%`,background:efColor(a.efMedio)}}/>
                    </div>
                    <span className="text-sm font-medium w-10 text-right" style={{color:efColor(a.efMedio)}}>{a.efMedio}%</span>
                  </div>
                )
              })
            }
          </div>
        </div>
      )}
    
      {/* ��─ REGRAS & ALERTAS ��─ */}
      {opsTab2===3 && (
        <div className="space-y-4">
          <div className="bg-white border rounded-xl overflow-hidden">
            <p className="font-medium px-4 py-3 border-b text-sm">Regras de comissão ativas</p>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b">
                {['Faixa','Horas','R$/hora','Máx faixa'].map(h=><th key={h} className="px-4 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{h}</th>)}
              </tr></thead>
              <tbody>
                {[
                  {nome:'Faixa 1 — Básica',        h:'0 – 30h',  vph:'R$ 13/h', max:'R$ 390',   bg:''},
                  {nome:'Faixa 2 — Intermediária',  h:'31 – 50h', vph:'R$ 15/h', max:'R$ 690',   bg:''},
                  {nome:'Faixa 3 — Meta atingida ✓',h:'51 – 80h', vph:'R$ 17/h', max:'R$ 1.200', bg:'bg-green-50'},
                  {nome:'Faixa 4 — Acima da meta ★',h:'81h+',     vph:'R$ 20/h', max:'ilimitado', bg:'bg-blue-50'},
                ].map((f,i)=>(
                  <tr key={i} className={`border-b last:border-0 ${f.bg}`}>
                    <td className="px-4 py-2.5">{f.nome}</td>
                    <td className="px-4 py-2.5 text-center">{f.h}</td>
                    <td className={`px-4 py-2.5 font-medium ${i>=2?'text-emerald-700':''}`}>{f.vph}</td>
                    <td className="px-4 py-2.5">{f.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <p className="font-medium mb-3 text-sm">Alertas ativos</p>
            {_render3163()}
          </div>
        </div>
      )}
    
      {/* Fila rápida — apenas para gestão */}
      {!isTecnico() && (
      <div className="bg-white border rounded-xl p-4 flex items-center justify-between mt-4">
        <div><p className="font-medium text-sm">Fila de Execução</p><p className="text-xs text-gray-400 mt-0.5">{filaExec.length} contrato(s) aguardando atribuição</p></div>
        <button onClick={()=>goPage("fila_execucao")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"><Play className="w-4 h-4"/> Gerenciar fila</button>
      </div>
      )}
    </div>
    )
  }

  const PageAtendimentos = () => {
              const TODAY = new Date('2026-04-14')
    
              const TECNICOS = [
                {id:'ops1', nome:'Dougllas Victorelle', ini:'DV', cor:'bg-blue-500',    corTxt:'text-blue-600'},
                {id:'ops2', nome:'Leonildo Sobrinho',   ini:'LS', cor:'bg-emerald-500', corTxt:'text-emerald-600'},
                {id:'ops3', nome:'Renato Jairo',        ini:'RJ', cor:'bg-violet-500',  corTxt:'text-violet-600'},
                {id:'ops4', nome:'Ericka Luzia',        ini:'EL', cor:'bg-pink-500',    corTxt:'text-pink-600'},
                {id:'ops5', nome:'Johnny Ferreira',     ini:'JF', cor:'bg-amber-500',   corTxt:'text-amber-600'},
                {id:'ops6', nome:'Wanderley Lira',      ini:'WL', cor:'bg-teal-500',    corTxt:'text-teal-600'},
              ]
    
              if (!window.__at || (isTecnico() && window.__at.tec && window.__at.tec !== user.id)) {
                window.__at = { tec: null, cli: null, resumoOpen: null }
              }
              if (!window.__at) window.__at = { tec: null, cli: null, resumoOpen: null }
              const AT = window.__at
              const rerender = () => setAnotacoes((p)=>({...p}))
    
              const diasDesde = (ds) => {
                if (!ds) return 9999
                try {
                  const p = ds.split(' ')[0]
                  const [dd,mm,yy] = p.split('/')
                  return Math.floor((TODAY.getTime()-new Date(`20${yy}-${mm}-${dd}`).getTime())/86400000)
                } catch { return 9999 }
              }
    
              const ultMov = (id) => {
                const list = (anotacoes[id]||[])
                if (!list.length) return {dias:9999, data:'—'}
                const s = [...list].sort((a,b)=>(b.data||'').localeCompare(a.data||''))
                const d = s[0]?.data||''
                return {dias:diasDesde(d), data:d.split(' ')[0]||'—'}
              }
    
              const getStatusCli = (c) => {
                // Usa getStatusImplantacao para verificar status real baseado nas fases
                const statusImpl = getStatusImplantacao(c.id)
                if (statusImpl.status === 'Finalizado') return {label:'Finalizado', color:'bg-emerald-100 text-emerald-700', ordem:99}
                
                // Calcula dias sem movimentacao baseado no historico real de anotacoes
                const {dias} = ultMov(c.id)
                if (dias === 9999 || dias > 10) return {label:'Sem agenda',  color:'bg-red-100 text-red-700',         ordem:0}
                if (dias > 5)                   return {label:'Atrasado',     color:'bg-amber-100 text-amber-700',     ordem:1}
                return                                 {label:'Em andamento', color:'bg-blue-100 text-blue-700',       ordem:2}
              }
    
              if (!window.__resWk) window.__resWk = {}
              const getResumos = (id) => window.__resWk[id]||[]
              const addResumo  = (cliId, r) => {
                window.__resWk[cliId] = [{...r, data:new Date().toLocaleDateString('pt-BR'), id:Date.now()}, ...(window.__resWk[cliId]||[])]
                rerender()
              }
    
              const analisarResumo = async (cliId, resumo) => {
                if (!resumo?.feito?.trim()) { toast('Preencha o resumo antes de analisar','red'); return }
                toast('Analisando com IA...','blue')
                try {
                  const res = await fetch('https://api.anthropic.com/v1/messages', {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({
                      model:'claude-sonnet-4-20250514',
                      max_tokens:500,
                      messages:[{role:'user', content:`Analise este resumo semanal de atendimento de implantação de software contábil.
    Retorne APENAS JSON com esta estrutura (sem markdown):
    {"status":"Saudável"|"Atenção"|"Crítico","alertas":["string"],"qualidade":"baixa"|"média"|"alta","coerencia":"ok"|"inconsistente","obs":"string em português"}
    
    Resumo:
    O que foi feito: ${resumo.feito}
    Problemas: ${resumo.problemas||'nenhum'}
    Próximos passos: ${resumo.proximos||'não informado'}`}]
                    })
                  })
                  const d = await res.json()
                  const txt = (d.content||[]).map((x)=>x.text||'').join('')
                  try {
                    const j = JSON.parse(txt)
                    window.__resWk[cliId] = (window.__resWk[cliId]||[]).map((r)=>r.id===resumo.id?{...r,ia:j}:r)
                    rerender()
                  } catch { toast('Resposta IA inválida','red') }
                } catch { toast('Erro ao chamar IA','red') }
              }
    
              if (!window.__rfForm) window.__rfForm = {}
              const getForm = (id) => window.__rfForm[id]||{feito:'',problemas:'',proximos:''}
              const setForm = (id, k, v) => {
                window.__rfForm[id] = {...getForm(id),[k]:v}
                rerender()
              }
              const enviarResumo = (id) => {
                const f = getForm(id)
                if (!f.feito?.trim()) { toast('Campo "O que foi feito" obrigatório','red'); return }
                addResumo(id, f)
                window.__rfForm[id] = {feito:'',problemas:'',proximos:''}
                window.__at.resumoOpen = null
                toast('Resumo registrado','green')
              }

              const _render3481 = () => {
                if (!cliDet) return null
                const st = getStatusCli(cliDet)
                const {dias, data} = ultMov(cliDet.id)
                const anots = (anotacoes[cliDet.id]||[])
                const resumos = getResumos(cliDet.id)
                const form = getForm(cliDet.id)
                const rfOpen = AT.resumoOpen===cliDet.id
                    
                const agend = anots.filter((a)=>a.subtipo?.toLowerCase().includes('agenda')||a.texto?.toLowerCase().includes('agendad')).length
                const realiz = anots.filter((a)=>a.subtipo==='Checkpoint'||a.subtipo?.toLowerCase().includes('realiz')).length
                const cancel = anots.filter((a)=>a.texto?.toLowerCase().includes('cancel')).length
                const pctConc = agend>0?Math.round(realiz/agend*100):null
                    
                const iaBadge = (status) =>
                  status==='Saudável'?'bg-emerald-100 text-emerald-700':
                  status==='Atenção'?'bg-amber-100 text-amber-700':
                  'bg-red-100 text-red-700'
                    
                return (
                <div className="space-y-4">
                  {/* Header cliente */}
                  <div className="bg-white border rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-mono mb-1">{cliDet.codSGD||cliDet.id}</p>
                        <h2 className="text-xl font-bold leading-tight">{cliDet.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">{cliDet.pacote||'—'} · {cliDet.cidade||'—'}/{cliDet.estado||'—'}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Última movimentação</p>
                        <p className="text-sm font-semibold">{dias===9999?'Nenhuma':`${dias} dias atrás (${data})`}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Progresso</p>
                        <p className="text-sm font-semibold">{cliDet.pct||0}% concluído</p>
                      </div>
                    </div>
                  </div>
                    
                  {/* Status de atendimentos */}
                  <div className="bg-white border rounded-xl p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Status de Atendimentos</p>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{agend||anots.length}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Agendados</p>
                      </div>
                      <div className="w-px h-10 bg-gray-100"/>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-600">{realiz||anots.filter((a)=>a.subtipo==='Checkpoint').length}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Realizados</p>
                      </div>
                      <div className="w-px h-10 bg-gray-100"/>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-500">{cancel}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Cancelados</p>
                      </div>
                      {pctConc!==null && (
                        <>
                          <div className="w-px h-10 bg-gray-100"/>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-violet-600">{pctConc}%</p>
                            <p className="text-[10px] text-gray-400 font-medium">Conclusão</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                    
                  {/* Resumo Semanal */}
                  <div className="bg-white border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
                      <p className="text-sm font-semibold">Resumo Semanal</p>
                      <button onClick={()=>{window.__at.resumoOpen=rfOpen?null:cliDet.id;rerender()}}
                        className="text-xs text-blue-600 hover:underline font-medium">
                        {rfOpen?'Cancelar':'+ Novo Resumo'}
                      </button>
                    </div>
                    
                    {rfOpen && (
                      <div className="p-5 space-y-3 border-b bg-blue-50/30">
                        {[
                          {k:'feito',    l:'O que foi feito *', pl:'Descreva as atividades da semana...'},
                          {k:'problemas',l:'Problemas encontrados', pl:'Problemas, bloqueios ou pendências...'},
                          {k:'proximos', l:'Próximos passos', pl:'Ações planejadas para a próxima semana...'},
                        ].map(f=>(
                          <div key={f.k}>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.l}</label>
                            <textarea value={(form)[f.k]||''} onChange={e=>setForm(cliDet.id,f.k,e.target.value)}
                              placeholder={f.pl} rows={2}
                              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white resize-none"/>
                          </div>
                        ))}
                        <button onClick={()=>enviarResumo(cliDet.id)}
                          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                          Salvar Resumo
                        </button>
                      </div>
                    )}
                    
                    <div className="divide-y max-h-64 overflow-y-auto">
                      {resumos.length===0 && <p className="text-center py-8 text-gray-400 text-sm">Nenhum resumo registrado</p>}
                      {resumos.map((r)=>(
                        <div key={r.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] text-gray-400">{r.data}</p>
                            <div className="flex items-center gap-2">
                              {r.ia && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${iaBadge(r.ia.status)}`}>{r.ia.status}</span>}
                              {!r.ia && (
                                <button onClick={()=>analisarResumo(cliDet.id,r)}
                                  className="text-[10px] text-violet-600 hover:underline font-medium">Analisar IA</button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700"><span className="font-medium">Feito:</span> {r.feito}</p>
                          {r.problemas && <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Problemas:</span> {r.problemas}</p>}
                          {r.proximos  && <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Próximos:</span> {r.proximos}</p>}
                          {r.ia && (
                            <div className="mt-2 p-3 bg-violet-50 rounded-lg space-y-1">
                              <p className="text-[10px] font-bold text-violet-600 uppercase">Análise IA</p>
                              <p className="text-xs text-gray-600">Qualidade: <span className="font-semibold">{r.ia.qualidade}</span> · Coerência: <span className="font-semibold">{r.ia.coerencia}</span></p>
                              {r.ia.alertas?.length>0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {r.ia.alertas.map((a,i)=>(
                                    <span key={i} className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded">{a}</span>
                                  ))}
                                </div>
                              )}
                              {r.ia.obs && <p className="text-xs text-gray-500 italic mt-1">{r.ia.obs}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                    
                  {/* Histórico de anotações */}
                  <div className="bg-white border rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b bg-gray-50">
                      <p className="text-sm font-semibold">Histórico de Movimentações</p>
                      <p className="text-[10px] text-gray-400">{anots.length} registros</p>
                    </div>
                    <div className="divide-y max-h-72 overflow-y-auto">
                      {anots.length===0 && <p className="text-center py-8 text-gray-400 text-sm">Nenhuma anotação</p>}
                      {[...anots].sort((a,b)=>(b.data||'').localeCompare(a.data||'')).map((a,i)=>(
                        <div key={i} className="px-5 py-3">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-semibold text-gray-500">{a.subtipo||a.tipo||'—'}</span>
                            <span className="text-[10px] text-gray-400">{a.data||'—'}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-snug">{a.texto}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                )
              }
    
              const getResumoTecnico = (techId) => {
                const clientes = clients.filter((c) => c.responsavel === techId)
                let andamento = 0, atrasados = 0, semAgenda = 0
                let somaHoras = 0, countHoras = 0
    
                clientes.forEach((c) => {
                  const ph = Number(c.pctHoras || 0)
                  if (c.horasNum > 0) { somaHoras += ph; countHoras++ }
    
                  // Usa getStatusImplantacao para verificar status real
                  const statusImpl = getStatusImplantacao(c.id)
                  if (statusImpl.status === 'Finalizado') return
                  
                  // Calcula dias sem movimentacao baseado no historico real
                  const {dias} = ultMov(c.id)
                  
                  // Regras baseadas em diasSemMovimentacao
                  if (dias > 10 || dias === 9999) {
                    semAgenda++
                  } else if (dias > 5) {
                    atrasados++
                  } else {
                    andamento++
                  }
                })
    
                const media = countHoras > 0 ? Math.round(somaHoras / countHoras) : 0
    
                const getNivel = (pct) => {
                  if (pct <= 29) return { label: 'Crítico',             cor: 'bg-red-100 text-red-600' }
                  if (pct <= 50) return { label: 'Baixo',               cor: 'bg-orange-100 text-orange-600' }
                  if (pct <= 59) return { label: 'Insuficiente',        cor: 'bg-yellow-100 text-yellow-700' }
                  if (pct <= 69) return { label: 'Abaixo do esperado',  cor: 'bg-yellow-200 text-yellow-800' }
                  if (pct <= 84) return { label: 'Dentro da meta',      cor: 'bg-green-100 text-green-700' }
                  if (pct <= 99) return { label: 'Acima da meta',       cor: 'bg-green-200 text-green-800' }
                  return                 { label: 'Excelente',           cor: 'bg-emerald-200 text-emerald-900' }
                }
    
                return { total: clientes.length, andamento, atrasados, semAgenda, media, nivel: getNivel(media) }
              }
    
              const tecStats = TECNICOS.map((t) => {
                const r = getResumoTecnico(t.id)
                return { ...t, total: r.total, andamento: r.andamento, atrasado: r.atrasados, semAg: r.semAgenda }
              })
    
              const tecSel = AT.tec ? TECNICOS.find(t=>t.id===AT.tec) : null
              const clisTec = tecSel
                ? [...clients.filter((c)=>c.responsavel===AT.tec)]
                    .map((c)=>({...c, _st:getStatusCli(c)}))
                    .sort((a,b)=>a._st.ordem-b._st.ordem)
                : []
    
              const cliDet = AT.cli ? clients.find((c)=>c.id===AT.cli) : null
    
              // Filtra clientes nao finalizados usando getStatusImplantacao
              const allAndamento = clients.filter((c)=>{
                const statusImpl = getStatusImplantacao(c.id)
                const naoFinalizado = statusImpl.status !== 'Finalizado'
                return isTecnico() ? naoFinalizado && c.responsavel === user.id : naoFinalizado
              })
              const alertSemAg   = allAndamento.filter((c)=>getStatusCli(c).label==='Sem agenda')
              const alertAtras   = allAndamento.filter((c)=>getStatusCli(c).label==='Atrasado')
    
              if (isTecnico() && !window.__at.tec) {
                const myTec = TECNICOS.find((t) => t.id === user.id)
                if (myTec) { window.__at.tec = myTec.id }
              }
    
              return (
              <div className="space-y-4 max-w-4xl">
    
                {/* Breadcrumb — grade oculta para técnico */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {tecSel && !isTecnico() && <button onClick={()=>{window.__at.tec=null;window.__at.cli=null;rerender()}} className="hover:text-blue-600">Atendimentos</button>}
                  {tecSel && !isTecnico() && <ChevronRight className="w-3 h-3"/>}
                  {tecSel && !cliDet && <span className="font-medium text-gray-800">{isTecnico() ? "Meus Atendimentos" : tecSel.nome}</span>}
                  {cliDet && !isTecnico() && <button onClick={()=>{window.__at.cli=null;rerender()}} className="hover:text-blue-600">{tecSel?.nome}</button>}
                  {cliDet && isTecnico() && <button onClick={()=>{window.__at.cli=null;rerender()}} className="hover:text-blue-600">Meus Atendimentos</button>}
                  {cliDet && <ChevronRight className="w-3 h-3"/>}
                  {cliDet && <span className="font-medium text-gray-800 truncate max-w-xs">{cliDet.codSGD} — {cliDet.name}</span>}
                  {!tecSel && <span className="font-semibold text-gray-800">Atendimentos / Implantações</span>}
                </div>
    
                {/* ══ TELA 1: DASH POR TÉCNICO ══ */}
                {!tecSel && (
                  <div className="space-y-4">
                    {/* alertas globais */}
                    {(alertSemAg.length>0||alertAtras.length>0) && (
                      <div className="space-y-2">
                        {alertSemAg.length>0 && (
                          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0"/>
                            <span className="text-sm font-semibold text-red-700">{alertSemAg.length} clientes sem agenda (sem movimentação {'>'} 10 dias)</span>
                          </div>
                        )}
                        {alertAtras.length>0 && (
                          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0"/>
                            <span className="text-sm font-semibold text-amber-700">{alertAtras.length} clientes com atraso (5–10 dias sem movimentação)</span>
                          </div>
                        )}
                      </div>
                    )}
    
                    {/* grid técnicos */}
                    <div className="grid grid-cols-3 gap-3">
                      {tecStats.map(t=>(
                        <button key={t.id} onClick={()=>{window.__at.tec=t.id;rerender()}}
                          className="bg-white border rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all text-left">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-9 h-9 rounded-full ${t.cor} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>{t.ini}</div>
                            <div>
                              <p className="text-sm font-semibold leading-tight">{t.nome}</p>
                              <p className="text-[10px] text-gray-400">{t.total} contratos total</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-center">
                            <div className="bg-blue-50 rounded-lg p-1.5">
                              <p className="text-lg font-bold text-blue-700">{t.andamento}</p>
                              <p className="text-[9px] text-blue-500 font-medium">andamento</p>
                            </div>
                            <div className={`rounded-lg p-1.5 ${t.atrasado>0?'bg-amber-50':'bg-gray-50'}`}>
                              <p className={`text-lg font-bold ${t.atrasado>0?'text-amber-600':'text-gray-400'}`}>{t.atrasado}</p>
                              <p className={`text-[9px] font-medium ${t.atrasado>0?'text-amber-500':'text-gray-400'}`}>atrasados</p>
                            </div>
                            <div className={`rounded-lg p-1.5 ${t.semAg>0?'bg-red-50':'bg-gray-50'}`}>
                              <p className={`text-lg font-bold ${t.semAg>0?'text-red-600':'text-gray-400'}`}>{t.semAg}</p>
                              <p className={`text-[9px] font-medium ${t.semAg>0?'text-red-500':'text-gray-400'}`}>sem agenda</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
    
                {/* ══ TELA 2: LISTA CLIENTES DO TÉCNICO ═��� */}
                {tecSel && !cliDet && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-lg">{tecSel.nome}</h2>
                      <span className="text-sm text-gray-400">{clisTec.filter((c)=>!isFinalizado(c.id)).length} em andamento</span>
                    </div>
                    <div className="bg-white border rounded-xl overflow-hidden divide-y">
                      {clisTec.length===0 && (
                        <p className="text-center py-10 text-gray-400 text-sm">Nenhum cliente atribuído</p>
                      )}
                      {clisTec.map((c)=>{
                        const {label, color} = c._st
                        const {dias, data} = ultMov(c.id)
                        const resumos = getResumos(c.id)
                        const semResumoSemanal = resumos.length===0 || diasDesde(resumos[0]?.data)>7
                        return (
                          <div key={`atend-${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                            onClick={()=>{window.__at.cli=c.id;rerender()}}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold truncate">
                                  {c.codSGD ? `${c.codSGD} — ${c.name}` : c.name}
                                </p>
                                {semResumoSemanal && !isFinalizado(c.id) && (
                                  <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">SEM RESUMO</span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {c.pacote||'—'} · Última mov.: {dias===9999?'nunca':`${dias}d atrás (${data})`}
                              </p>
                            </div>
                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${color}`}>{label}</span>
                            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0"/>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
    
                {/* ══ TELA 3: DETALHE CLIENTE ══ */}
                {cliDet && _render3481()}
    
              </div>
              )
  }

  const PageColaboradores = () => {
    const [colabSel, setColabSel] = useState(null)
    const [colabTab, setColabTab] = useState("geral")
    
    const OPS_TEAM = [
      {id:"ops1", nome:"Dougllas Victorelle Pereira Aires", iniciais:"DV", cor:"bg-blue-500",   corText:"text-blue-600",   corBg:"bg-blue-50",   meta:15},
      {id:"ops2", nome:"Leonildo Sobrinho Rego",            iniciais:"LS", cor:"bg-emerald-500", corText:"text-emerald-600", corBg:"bg-emerald-50", meta:15},
      {id:"ops3", nome:"Renato Jairo Rodrigues Lima",       iniciais:"RJ", cor:"bg-violet-500",  corText:"text-violet-600",  corBg:"bg-violet-50",  meta:20},
      {id:"ops4", nome:"Ericka Luzia Silva da Costa",       iniciais:"EL", cor:"bg-pink-500",    corText:"text-pink-600",    corBg:"bg-pink-50",    meta:15},
      {id:"ops5", nome:"Johnny Cristian Cabral Santos",     iniciais:"JC", cor:"bg-amber-500",   corText:"text-amber-600",   corBg:"bg-amber-50",   meta:15},
      {id:"ops6", nome:"Wanderley Cardoso Silva",           iniciais:"WC", cor:"bg-cyan-500",    corText:"text-cyan-600",    corBg:"bg-cyan-50",    meta:12},
    ]
    const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
              const concluidos = clients.filter(c=>isFinalizado(c.id) && getStatusNome(c.id) === 'Finalizado')
    const getMesCounts = (id) => {
      const counts = Array(12).fill(0)
      concluidos.filter(c=>c.responsavel===id).forEach(c=>{
        const dt = c.criadoEm||c.dataAssinatura||""
        const m = dt.match(/\d+\/(\d+)\/\d+/)
        if(m){ const mes=parseInt(m[1])-1; if(mes>=0&&mes<12) counts[mes]++ }
      })
      return counts
    }
    const getCliCliente = (id) => clients.filter(c=>c.responsavel===id)
    const getConclCliente = (id) => concluidos.filter(c=>c.responsavel===id)
    
    if(colabSel) {
      const op = OPS_TEAM.find(o=>o.id===colabSel)!
    
      const HORAS_MES = {
        ops1: [84,81,73,28,0,0,0,0,0,0,0,0],
        ops2: [64,86,90,4,0,0,0,0,0,0,0,0],
        ops3: [77,86,129,11,0,0,0,0,0,0,0,0],
        ops4: [54,51,82,4,0,0,0,0,0,0,0,0],
        ops5: [69,38,58,0,0,0,0,0,0,0,0,0],
        ops6: [50,99,21,0,0,0,0,0,0,0,0,0],
      }
      const MESES_LABELS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
    
      const horasMes = HORAS_MES[colabSel] || Array(12).fill(0)
      const horasExecutadas = horasMes.reduce((a,b)=>a+b,0)
      const maxH = Math.max(...horasMes,1)
    
      const mesesComDados = horasMes.filter((h)=>h>0).length
      const mediaMensal = mesesComDados>0 ? Math.round(horasExecutadas/mesesComDados) : 0
      const mesesRestantes = 12 - mesesComDados
      const projecaoAnual = horasExecutadas + (mediaMensal * mesesRestantes)
    
      const META_HORAS_ANUAL = {
        ops1:1200, ops2:1200, ops3:1400, ops4:1100, ops5:1100, ops6:1000
      }
      const metaAnual = META_HORAS_ANUAL[colabSel] || 1000
      const pctExecutado = Math.round((horasExecutadas/metaAnual)*100)
      const pctProjetado  = Math.round((projecaoAnual/metaAnual)*100)
    
      const meusCli   = getCliCliente(colabSel)
      const meusConc  = getConclCliente(colabSel)
    
      return (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button onClick={()=>setColabSel(null)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-4 h-4"/></button>
            <div className={`w-12 h-12 rounded-full ${op.cor} flex items-center justify-center text-base font-bold text-white`}>{op.iniciais}</div>
            <div><h1 className="text-xl font-bold">{op.nome}</h1><p className="text-sm text-gray-400">{ROLE_META[users.find(u=>u.id===op.id)?.role||"ops"]?.label}</p></div>
          </div>
    
          {/* KPIs — todos em HORAS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border rounded-xl p-4 border-t-2 border-t-blue-500">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Horas Executadas</p>
              <p className="text-3xl font-bold">{horasExecutadas}<span className="text-sm font-normal text-gray-400">h</span></p>
              <p className="text-xs text-gray-400 mt-1">{mesesComDados} mês(es) realizados</p>
            </div>
            <div className="bg-white border rounded-xl p-4 border-t-2 border-t-emerald-500">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Média Mensal</p>
              <p className="text-3xl font-bold">{mediaMensal}<span className="text-sm font-normal text-gray-400">h</span></p>
              <p className="text-xs text-gray-400 mt-1">por m��s realizado</p>
            </div>
            <div className="bg-white border rounded-xl p-4 border-t-2 border-t-violet-500">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Projeção Anual</p>
              <p className="text-3xl font-bold">{projecaoAnual}<span className="text-sm font-normal text-gray-400">h</span></p>
              <p className="text-xs text-gray-400 mt-1">executado + média × {mesesRestantes} meses</p>
            </div>
            <div className={`${op.corBg} rounded-xl p-4 border`}>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Meta Anual</p>
              <p className={`text-2xl font-bold ${op.corText}`}>
                {horasExecutadas}h<span className="text-sm text-gray-400 font-normal">/{metaAnual}h</span>
              </p>
              <div className="mt-2 h-2 bg-white/60 rounded-full overflow-hidden relative">
                {/* Barra executado */}
                <div className={`h-2 rounded-full ${op.cor} transition-all`}
                  style={{width:`${Math.min(100,pctExecutado)}%`}}/>
              </div>
              {/* Barra projeção */}
              <div className="mt-1 h-1.5 bg-white/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full opacity-40 transition-all"
                  style={{width:`${Math.min(100,pctProjetado)}%`, background: pctProjetado>=100?'#10b981':'#8b5cf6'}}/>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-[10px] text-gray-500">{pctExecutado}% executado</p>
                <p className={`text-[10px] font-medium ${pctProjetado>=100?'text-emerald-600':'text-violet-600'}`}>
                  {pctProjetado}% projetado
                </p>
              </div>
            </div>
          </div>
    
          {/* Gráfico de horas mensais */}
          <div className="bg-white border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm">Horas Realizadas — Mensal 2026</h2>
              <div className="flex gap-3 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-sm inline-block ${op.cor}`}/>
                  Realizado
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm inline-block bg-violet-200"/>
                  Projeção (média {mediaMensal}h)
                </span>
              </div>
            </div>
            <div className="flex gap-1.5 items-end" style={{height:"100px"}}>
              {horasMes.map((v,i)=>{
                const isProj = v===0 && i>=mesesComDados && i<12
                const barH = isProj
                  ? Math.max(3, Math.round((mediaMensal/maxH)*88))
                  : Math.max(v>0?4:0, Math.round((v/maxH)*88))
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                    {(v>0) && <span className="text-[10px] font-bold text-gray-700">{v}h</span>}
                    {isProj && <span className="text-[10px] text-violet-400">~{mediaMensal}h</span>}
                    <div className={`w-full rounded-t transition-all ${
                      v>0 ? op.cor : isProj ? 'bg-violet-200' : 'bg-gray-100'
                    }`} style={{height:`${barH}px`}}/>
                    <span className={`text-[9px] ${v>0?'text-gray-600 font-medium':'text-gray-400'}`}>
                      {MESES_LABELS[i]}
                    </span>
                  </div>
                )
              })}
            </div>
            {/* Linha de média */}
            {mediaMensal>0 && (
              <div className="mt-3 pt-3 border-t flex gap-4 text-[11px] text-gray-500">
                <span>Média mensal: <b className={op.corText}>{mediaMensal}h</b></span>
                <span>Meses restantes: <b>{mesesRestantes}</b></span>
                <span>Projeção final: <b className={pctProjetado>=100?'text-emerald-600':'text-violet-600'}>{projecaoAnual}h</b></span>
                <span className={`font-medium ${pctProjetado>=100?'text-emerald-600':'text-gray-500'}`}>
                  {pctProjetado>=100?'✓ Meta atingida na projeção':'Meta: '+metaAnual+'h'}
                </span>
              </div>
            )}
          </div>
    
          {/* Lista de clientes */}
          <div className="bg-white border rounded-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-sm">Clientes Atribuídos ({meusCli.length})</h2>
              <div className="flex gap-3 text-xs text-gray-400">
                <span className="text-emerald-600 font-medium">{meusConc.length} concluídos</span>
                <span className="text-amber-600 font-medium">{meusCli.filter(c=>!isFinalizado(c.id)).length} em andamento</span>
              </div>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {meusCli.map(c=>(
                <div key={`meuscli-${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.name.substring(0,32)}</p>
                    <p className="text-xs text-gray-400">{c.pacote} · {c.cidade||c.estado}</p>
                  </div>
                  {c.horasRealizadas!=null && (
                    <span className="text-xs font-medium text-emerald-600">{c.horasRealizadas}h</span>
                  )}
                  {pBar(c.pct)}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatusCor(c.id)}`}>{getStatusNome(c.id)}</span>
                </div>
              ))}
              {meusCli.length===0 && <div className="text-center py-8 text-gray-400 text-sm">Nenhum cliente atribuído</div>}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Colaboradores</h1>
          <div className="flex gap-2">
            {["geral","ranking"].map(t=>(
              <button key={t} onClick={()=>setColabTab(t)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${colabTab===t?"bg-blue-600 text-white":"bg-white border hover:bg-gray-50"}`}>
                {t==="geral"?"Visão Geral":"Ranking"}
              </button>
            ))}
          </div>
        </div>
    
        {colabTab==="geral" && (
          <div className="grid grid-cols-2 gap-4">
            {OPS_TEAM.map(op=>{
              const meses = getMesCounts(op.id)
              const total = meses.reduce((a,b)=>a+b,0)
              const emAnd = clients.filter(c=>c.responsavel===op.id&&!isFinalizado(c.id)).length
              const pctMeta = Math.round((total/op.meta)*100)
              const maxV = Math.max(...meses,1)
              return (
                <div key={op.id} className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={()=>setColabSel(op.id)}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full ${op.cor} flex items-center justify-center text-sm font-bold text-white`}>{op.iniciais}</div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{op.nome}</p>
                      <p className="text-xs text-gray-400">{ROLE_META[users.find(u=>u.id===op.id)?.role||"ops"]?.label}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300"/>
                  </div>
                  {/* Mini gráfico */}
                  <div className="flex gap-0.5 items-end mb-3" style={{height:"36px"}}>
                    {meses.map((v,i)=>(
                      <div key={i} className="flex-1 flex flex-col items-center justify-end">
                        <div className={`w-full rounded-sm ${op.cor} opacity-70`} style={{height:`${maxV>0?Math.max(1,(v/maxV)*32):1}px`}}/>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div><span className="text-gray-400">Concluídos </span><span className="font-bold text-gray-800">{total}</span></div>
                    <div><span className="text-gray-400">Em andamento </span><span className="font-bold text-amber-600">{emAnd}</span></div>
                    <div className="flex-1"/>
                    <div className="text-right">
                      <span className="text-gray-400">Meta </span>
                      <span className={`font-bold ${pctMeta>=100?"text-emerald-600":pctMeta>=70?"text-amber-600":"text-red-500"}`}>{pctMeta}%</span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-1.5 rounded-full ${op.cor} transition-all`} style={{width:`${Math.min(100,pctMeta)}%`}}/>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Meta: {op.meta} implantações anuais</p>
                </div>
              )
            })}
          </div>
        )}
    
        {colabTab==="ranking" && (
          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="font-bold">Ranking de Produção 2026</h2>
              <p className="text-xs text-gray-400 mt-0.5">Baseado em implantações concluídas + % de meta atingida</p>
            </div>
            <div className="divide-y">
              {[...OPS_TEAM].sort((a,b)=>{
                const ta = getMesCounts(a.id).reduce((x,y)=>x+y,0)
                const tb = getMesCounts(b.id).reduce((x,y)=>x+y,0)
                return tb-ta
              }).map((op,idx)=>{
                const meses = getMesCounts(op.id)
                const total = meses.reduce((a,b)=>a+b,0)
                const pctMeta = Math.round((total/op.meta)*100)
                const maxTotal = Math.max(...OPS_TEAM.map(o=>getMesCounts(o.id).reduce((a,b)=>a+b,0)),1)
                return (
                  <div key={op.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer" onClick={()=>setColabSel(op.id)}>
                    <div className={`text-xl font-black w-8 text-center ${idx===0?"text-amber-400":idx===1?"text-gray-400":idx===2?"text-orange-500":"text-gray-200"}`}>
                      {idx===0?"🥇":idx===1?"🥈":idx===2?"🥉":`${idx+1}°`}
                    </div>
                    <div className={`w-10 h-10 rounded-full ${op.cor} flex items-center justify-center text-sm font-bold text-white`}>{op.iniciais}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{op.nome}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${op.cor}`} style={{width:`${(total/maxTotal)*100}%`}}/>
                        </div>
                        <span className="text-xs text-gray-500">{total} implant.</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-800">{pctMeta}%</p>
                      <p className="text-[10px] text-gray-400">da meta ({op.meta})</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  const PageComissoes = () => {
    // Feature flag protection
    if (!FEATURES.comissoes) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <DollarSign className="w-16 h-16 text-gray-200 mb-4"/>
          <h2 className="text-xl font-semibold text-gray-500">Funcionalidade em Desenvolvimento</h2>
          <p className="text-sm text-gray-400 mt-2">O modulo de Comissoes estara disponivel em breve.</p>
        </div>
      )
    }
    
    const COM_CONFIG = {
      "Domínio Start":        {vendedor: 150, ops: 80},
      "Domínio Plus":         {vendedor: 200, ops: 100},
      "Domínio Premium":      {vendedor: 280, ops: 120},
      "Domínio Empresarial":  {vendedor: 350, ops: 150},
      "Personalizado":        {vendedor: 120, ops: 60},
      "Adendo DW":            {vendedor: 100, ops: 50},
    }
    const VENDEDORES = [
      {id:"vend1", nome:"Denis Nunes Brauna",       iniciais:"DN"},
      {id:"vend2", nome:"Claudivan da Silva Sousa",  iniciais:"CS"},
      {id:"vend3", nome:"Marcelo da Rocha Bezerra",  iniciais:"MB"},
    ]
    const OPS_TEAM = [
      {id:"ops1", nome:"Dougllas Victorelle", iniciais:"DV"},
      {id:"ops2", nome:"Leonildo Sobrinho",   iniciais:"LS"},
      {id:"ops3", nome:"Renato Jairo",         iniciais:"RJ"},
      {id:"ops4", nome:"Ericka Luzia",         iniciais:"EL"},
      {id:"ops5", nome:"Johnny Cristian",      iniciais:"JC"},
      {id:"ops6", nome:"Wanderley Cardoso",    iniciais:"WC"},
    ]
    const cliAtivos = clients.filter(c=>c.dataAssinatura&&c.dataAssinatura.includes("2026"))
    const getComVend = (vendNome) =>
      cliAtivos.filter(c=>c.vendedor&&c.vendedor.toLowerCase().includes(vendNome.toLowerCase().split(" ")[0].toLowerCase()))
        .reduce((sum,c)=>sum+(COM_CONFIG[c.pacote]?.vendedor||0),0)
    const getComOps = (opsId) =>
              cliAtivos.filter(c=>c.responsavel===opsId&&isFinalizado(c.id)&&getStatusNome(c.id)==='Finalizado')
        .reduce((sum,c)=>sum+(COM_CONFIG[c.pacote]?.ops||0),0)
    const totalComVend = VENDEDORES.reduce((s,v)=>s+getComVend(v.nome),0)
    const totalComOps  = OPS_TEAM.reduce((s,o)=>s+getComOps(o.id),0)
    
    return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Comissões</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
        ⚠️ Valores calculados com base nos pacotes dos contratos de 2026. Configure os valores por pacote no módulo de Produtos.
      </div>
      <div className="grid grid-cols-2 gap-4">
        <KPI label="Total Comissões Vendedores" value={`R$ ${fmtR(totalComVend)}`} c="violet"/>
        <KPI label="Total Comissões Ops" value={`R$ ${fmtR(totalComOps)}`} c="blue"/>
      </div>
    
      {/* Tabela de comissões por pacote */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-5 border-b bg-gray-50">
          <h2 className="font-bold text-sm">Tabela de Comissões por Pacote</h2>
          <p className="text-xs text-gray-400 mt-0.5">Valores de referência utilizados no cálculo</p>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50">
            <th className="text-left px-5 py-3 font-semibold text-gray-500">Pacote</th>
            <th className="px-5 py-3 text-center font-semibold text-gray-500">Comissão Vendedor</th>
            <th className="px-5 py-3 text-center font-semibold text-gray-500">Comissão Ops</th>
            <th className="px-5 py-3 text-right font-semibold text-gray-500">Total</th>
          </tr></thead>
          <tbody>
            {Object.entries(COM_CONFIG).map(([pac,v])=>(
              <tr key={pac} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{pac}</td>
                <td className="px-5 py-3 text-center text-violet-600 font-semibold">R$ {fmtR(v.vendedor)}</td>
                <td className="px-5 py-3 text-center text-blue-600 font-semibold">R$ {fmtR(v.ops)}</td>
                <td className="px-5 py-3 text-right font-bold text-gray-700">R$ {fmtR(v.vendedor+v.ops)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
      {/* Comissões por vendedor */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-bold text-sm">Comissões — Vendedores (contratos ativos 2026)</h2>
        </div>
        <div className="divide-y">
          {VENDEDORES.map(v=>{
            const meusCli = cliAtivos.filter(c=>c.vendedor&&c.vendedor.toLowerCase().includes(v.nome.toLowerCase().split(" ")[0].toLowerCase()))
            const total = getComVend(v.nome)
            return (
              <div key={v.id} className="px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700">{v.iniciais}</div>
                  <div className="flex-1"><p className="font-semibold text-sm">{v.nome}</p><p className="text-xs text-gray-400">{meusCli.length} contratos</p></div>
                  <div className="text-right"><p className="text-xl font-black text-violet-600">R$ {fmtR(total)}</p><p className="text-[10px] text-gray-400">total estimado</p></div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(COM_CONFIG).map(([pac])=>{
                    const qtd = meusCli.filter(c=>c.pacote===pac).length
                    if(!qtd) return null
                    return <span key={pac} className="text-[10px] px-2 py-0.5 bg-violet-50 border border-violet-200 rounded-full text-violet-600 font-medium">{pac}: {qtd}×</span>
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    
      {/* Comissões por ops */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-bold text-sm">Comissões — Equipe Ops (implantações concluídas 2026)</h2>
        </div>
        <div className="divide-y">
          {[...OPS_TEAM].sort((a,b)=>getComOps(b.id)-getComOps(a.id)).map(op=>{
              const meusCli = cliAtivos.filter(c=>c.responsavel===op.id&&isFinalizado(c.id)&&getStatusNome(c.id)==='Finalizado')
            const total = getComOps(op.id)
            if(total===0&&meusCli.length===0) return null
            return (
              <div key={op.id} className="px-5 py-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">{op.iniciais}</div>
                  <div className="flex-1"><p className="font-semibold text-sm">{op.nome}</p><p className="text-xs text-gray-400">{meusCli.length} implantações concluídas</p></div>
                  <div className="text-right"><p className="text-xl font-black text-blue-600">R$ {fmtR(total)}</p><p className="text-[10px] text-gray-400">total estimado</p></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-500"
                    style={{width:`${Math.min(100,(total/Math.max(...OPS_TEAM.map(o=>getComOps(o.id)),1))*100)}%`}}/>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
    )
  }

  // ══════════ PAGINA CONVERSOES ══════════
  const PageConversao = () => {
    const [convSearch, setConvSearch] = useState('')
    const [convModalId, setConvModalId] = useState(null)
    
    const clientesFiltrados = clients.filter(c => {
      if (!convSearch) return true
      const q = convSearch.toLowerCase()
      return c.name?.toLowerCase().includes(q) || c.codSGD?.includes(q)
    })

    const convModalCli = clients.find(c => c.id === convModalId)
    const convModalData = convModalId ? getConversao(convModalId) : null

    return (
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestao de Conversao</h1>
            <p className="text-sm text-gray-500">Painel operacional de conversao de sistemas - Responsavel: Klayton</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-gray-50 border rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-700">{clients.filter(c => getConversao(c.id).statusConversao === 'Fila').length}</p>
            <p className="text-xs text-gray-500 font-medium">Na Fila</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-700">{clients.filter(c => getConversao(c.id).statusConversao === 'Em Andamento').length}</p>
            <p className="text-xs text-blue-600 font-medium">Em Andamento</p>
          </div>
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-violet-700">{clients.filter(c => ['Convertendo','Validando'].includes(getConversao(c.id).statusConversao)).length}</p>
            <p className="text-xs text-violet-600 font-medium">Convertendo</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-amber-700">{clients.filter(c => ['Aguardando Cliente','Aguardando Dados'].includes(getConversao(c.id).statusConversao)).length}</p>
            <p className="text-xs text-amber-600 font-medium">Aguardando</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-700">{clients.filter(c => getConversao(c.id).statusConversao === 'Finalizado').length}</p>
            <p className="text-xs text-emerald-600 font-medium">Finalizados</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-700">{clients.filter(c => getConversao(c.id).statusConversao === 'Erro').length}</p>
            <p className="text-xs text-red-600 font-medium">Com Erro</p>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Coluna FILA */}
          <div className="bg-gray-100 rounded-xl p-3 min-h-[500px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Fila</h3>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                {clients.filter(c => getConversao(c.id).statusConversao === 'Fila').length}
              </span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {clients.filter(c => getConversao(c.id).statusConversao === 'Fila').map(c => {
                const conv = getConversao(c.id)
                const atraso = isAtrasado(c.id)
                const urgente = conv.prioridade === 'Urgente'
                const alta = conv.prioridade === 'Alta'
                return (
                  <div key={`conv-fila-${c.id}`} 
                    className={`bg-white rounded-lg p-3 border-2 cursor-pointer hover:shadow-md transition-all ${urgente ? 'border-orange-400 bg-orange-50' : alta ? 'border-amber-300 bg-amber-50' : atraso ? 'border-yellow-400 bg-yellow-50' : 'border-transparent'}`}
                    onClick={() => setConvModalId(c.id)}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800 leading-tight">{c.name}</p>
                      {urgente && <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold flex-shrink-0">URGENTE</span>}
                      {alta && !urgente && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold flex-shrink-0">ALTA</span>}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{c.codSGD}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {conv.sistemaAnterior && <span className="text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">{conv.sistemaAnterior}</span>}
                      {conv.tipoConversao && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{conv.tipoConversao}</span>}
                    </div>
                    {conv.bloqueio !== 'Nenhum' && (
                      <div className="mt-2 text-[9px] text-red-600 font-medium bg-red-50 px-2 py-1 rounded">Bloqueio: {conv.bloqueio}</div>
                    )}
                  </div>
                )
              })}
              {clients.filter(c => getConversao(c.id).statusConversao === 'Fila').length === 0 && (
                <p className="text-center text-gray-400 text-xs py-8">Nenhum cliente na fila</p>
              )}
            </div>
          </div>

          {/* Coluna EM ANDAMENTO */}
          <div className="bg-blue-50 rounded-xl p-3 min-h-[500px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide">Em Andamento</h3>
              <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {clients.filter(c => getConversao(c.id).statusConversao === 'Em Andamento').length}
              </span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {clients.filter(c => getConversao(c.id).statusConversao === 'Em Andamento').map(c => {
                const conv = getConversao(c.id)
                const atraso = isAtrasado(c.id)
                const urgente = conv.prioridade === 'Urgente'
                const alta = conv.prioridade === 'Alta'
                return (
                  <div key={`conv-and-${c.id}`} 
                    className={`bg-white rounded-lg p-3 border-2 cursor-pointer hover:shadow-md transition-all ${urgente ? 'border-orange-400 bg-orange-50' : alta ? 'border-amber-300 bg-amber-50' : atraso ? 'border-yellow-400 bg-yellow-50' : 'border-transparent'}`}
                    onClick={() => setConvModalId(c.id)}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800 leading-tight">{c.name}</p>
                      {urgente && <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold flex-shrink-0">URGENTE</span>}
                      {alta && !urgente && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold flex-shrink-0">ALTA</span>}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{c.codSGD}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {conv.sistemaAnterior && <span className="text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">{conv.sistemaAnterior}</span>}
                      {conv.tipoConversao && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{conv.tipoConversao}</span>}
                    </div>
                    {atraso && conv.dataPrevista && (
                      <div className="mt-2 text-[9px] text-yellow-700 font-medium bg-yellow-100 px-2 py-1 rounded">
                        Atrasado - Prev: {conv.dataPrevista}
                      </div>
                    )}
                    {conv.bloqueio !== 'Nenhum' && (
                      <div className="mt-2 text-[9px] text-red-600 font-medium bg-red-50 px-2 py-1 rounded">Bloqueio: {conv.bloqueio}</div>
                    )}
                  </div>
                )
              })}
              {clients.filter(c => getConversao(c.id).statusConversao === 'Em Andamento').length === 0 && (
                <p className="text-center text-gray-400 text-xs py-8">Nenhuma conversao em andamento</p>
              )}
            </div>
          </div>

          {/* Coluna AGUARDANDO / CONVERTENDO */}
          <div className="bg-amber-50 rounded-xl p-3 min-h-[500px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wide">Aguardando / Convertendo</h3>
              <span className="text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {clients.filter(c => ['Aguardando Cliente','Aguardando Dados','Convertendo','Validando'].includes(getConversao(c.id).statusConversao)).length}
              </span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {clients.filter(c => ['Aguardando Cliente','Aguardando Dados','Convertendo','Validando'].includes(getConversao(c.id).statusConversao)).map(c => {
                const conv = getConversao(c.id)
                const atraso = isAtrasado(c.id)
                const statusColor = conv.statusConversao === 'Convertendo' ? 'bg-violet-100 text-violet-700' :
                                   conv.statusConversao === 'Validando' ? 'bg-emerald-100 text-emerald-700' :
                                   'bg-amber-100 text-amber-700'
                return (
                  <div key={`conv-aguard-${c.id}`} 
                    className={`bg-white rounded-lg p-3 border-2 cursor-pointer hover:shadow-md transition-all ${atraso ? 'border-yellow-400 bg-yellow-50' : 'border-transparent'}`}
                    onClick={() => setConvModalId(c.id)}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800 leading-tight">{c.name}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${statusColor}`}>{conv.statusConversao}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{c.codSGD}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {conv.sistemaAnterior && <span className="text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">{conv.sistemaAnterior}</span>}
                      {conv.tipoConversao && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{conv.tipoConversao}</span>}
                    </div>
                    {atraso && conv.dataPrevista && (
                      <div className="mt-2 text-[9px] text-yellow-700 font-medium bg-yellow-100 px-2 py-1 rounded">
                        Atrasado - Prev: {conv.dataPrevista}
                      </div>
                    )}
                    {conv.bloqueio !== 'Nenhum' && (
                      <div className="mt-2 text-[9px] text-red-600 font-medium bg-red-50 px-2 py-1 rounded">Bloqueio: {conv.bloqueio}</div>
                    )}
                  </div>
                )
              })}
              {clients.filter(c => ['Aguardando Cliente','Aguardando Dados','Convertendo','Validando'].includes(getConversao(c.id).statusConversao)).length === 0 && (
                <p className="text-center text-gray-400 text-xs py-8">Nenhum aguardando</p>
              )}
            </div>
          </div>

          {/* Coluna FINALIZADO / ERRO */}
          <div className="bg-gray-100 rounded-xl p-3 min-h-[500px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Finalizado / Erro</h3>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                {clients.filter(c => ['Finalizado','Erro'].includes(getConversao(c.id).statusConversao)).length}
              </span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {clients.filter(c => ['Finalizado','Erro'].includes(getConversao(c.id).statusConversao)).map(c => {
                const conv = getConversao(c.id)
                const isErro = conv.statusConversao === 'Erro'
                return (
                  <div key={`conv-fin-${c.id}`} 
                    className={`bg-white rounded-lg p-3 border-2 cursor-pointer hover:shadow-md transition-all ${isErro ? 'border-red-400 bg-red-50' : 'border-emerald-300 bg-emerald-50'}`}
                    onClick={() => setConvModalId(c.id)}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800 leading-tight">{c.name}</p>
                      {isErro ? (
                        <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">ERRO</span>
                      ) : (
                        <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">OK</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{c.codSGD}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {conv.sistemaAnterior && <span className="text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">{conv.sistemaAnterior}</span>}
                      {conv.tipoConversao && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{conv.tipoConversao}</span>}
                    </div>
                    {conv.dataConclusao && (
                      <div className="mt-2 text-[9px] text-gray-500">Concluido: {conv.dataConclusao}</div>
                    )}
                    {isErro && conv.observacoes && (
                      <div className="mt-2 text-[9px] text-red-600 font-medium">{conv.observacoes}</div>
                    )}
                  </div>
                )
              })}
              {clients.filter(c => ['Finalizado','Erro'].includes(getConversao(c.id).statusConversao)).length === 0 && (
                <p className="text-center text-gray-400 text-xs py-8">Nenhuma conversao finalizada</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal de edicao */}
        {convModalId && convModalCli && convModalData && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                <div>
                  <h2 className="font-bold">{convModalCli.name}</h2>
                  <p className="text-xs text-gray-500">{convModalCli.codSGD}</p>
                </div>
                <button onClick={() => setConvModalId(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4"/>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Sistema Anterior</label>
                    <select value={convModalData.sistemaAnterior} onChange={e => setConversao(convModalId, { sistemaAnterior: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
                      <option value="">Selecione...</option>
                      {SISTEMAS_ANTERIORES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Status</label>
                    <select value={convModalData.statusConversao} onChange={e => {
                      const newStatus = e.target.value
                      const updates = { statusConversao: newStatus }
                      if (newStatus === 'Finalizado' && !convModalData.dataConclusao) {
                        updates.dataConclusao = new Date().toISOString().split('T')[0]
                      }
                      setConversao(convModalId, updates)
                    }}
                      className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
                      {STATUS_CONVERSAO.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Prioridade</label>
                    <select value={convModalData.prioridade} onChange={e => setConversao(convModalId, { prioridade: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
                      {PRIORIDADE_CONVERSAO.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Tipo Conversao</label>
                    <select value={convModalData.tipoConversao} onChange={e => setConversao(convModalId, { tipoConversao: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
                      <option value="">Selecione...</option>
                      {TIPO_CONVERSAO.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Data Inicio</label>
                    <input type="date" value={convModalData.dataInicio} onChange={e => setConversao(convModalId, { dataInicio: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Data Prevista</label>
                    <input type="date" value={convModalData.dataPrevista} onChange={e => setConversao(convModalId, { dataPrevista: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Data Conclusao</label>
                    <input type="date" value={convModalData.dataConclusao} onChange={e => setConversao(convModalId, { dataConclusao: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Bloqueio</label>
                  <select value={convModalData.bloqueio} onChange={e => setConversao(convModalId, { bloqueio: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
                    {BLOQUEIO_OPTS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Observacoes</label>
                  <textarea value={convModalData.observacoes} onChange={e => setConversao(convModalId, { observacoes: e.target.value })}
                    placeholder="Anotacoes sobre a conversao..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"/>
                </div>
                <div className="p-3 bg-gray-50 border rounded-xl">
                  <p className="text-xs text-gray-500"><span className="font-semibold">Responsavel:</span> {convModalData.responsavel}</p>
                </div>
              </div>
              <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white">
                <button onClick={() => setConvModalId(null)} className="flex-1 py-2.5 border rounded-lg text-sm hover:bg-gray-50">
                  Fechar
                </button>
                <button onClick={() => { toast('Dados salvos!', 'green'); setConvModalId(null) }} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const PageImplantacao = () => {
    // ─── Helpers ────────────────────────────────────────────────
    const clientesFiltrados = (() => {
      const q = implSearch.trim().toLowerCase()
      const lista = isTecnico()
        ? clients.filter(c => c.responsavel === user?.id)
        : clients
      if (!q) return lista
      return lista.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.codSGD||'').toLowerCase().includes(q) ||
        (c.responsavel||'').toLowerCase().includes(q)
      )
    })()
    
    const clienteSel = clients.find(c => c.id === implClienteId) || null
    const histCliente = historico.filter(h => h.clienteId === implClienteId)
      .slice().reverse()
    
    const handleSalvarStatus = () => {
      if (!implClienteId) { toast("Selecione um cliente", "red"); return }
      if (!implStatusSel)  { toast("Selecione um status", "red"); return }
      if (!implObs.trim()) { toast("Escreva uma observação", "red"); return }
      registrarStatus(implClienteId, implStatusSel, implObs, user.name)
      setImplObs("")
      setImplStatusSel(0)
      toast("Status registrado com sucesso!", "green")
    }
    
    const statusBadge = (sid) => {
      const s = STATUS_LIST.find(x => x.id === sid)
      if (!s) return <span className="px-2 py-0.5 rounded-full text-[10px] border bg-gray-100 text-gray-400">—</span>
      const c = statusColor(sid)
      return <span className={`px-2 py-0.5 rounded-full text-[10px] border ${c.bg} ${c.text} ${c.border}`}>{s.nome}</span>
    }
    
    return (
    <div className="min-h-screen bg-gray-100 -m-6 p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white"/>
          </div>
          Implantacao
        </h1>
        <p className="text-sm text-gray-500 mt-1 ml-13">Registre o status de implantacao de cada cliente e acompanhe o historico.</p>
      </div>
    
      {/* KPI Cards - 5 colunas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STATUS_LIST.map(s => {
          const count = (() => {
            let n = 0
            clients.forEach(c => { if (statusAtual(c.id) === s.id) n++ })
            return n
          })()
          const c = statusColor(s.id)
          return (
            <div key={s.id} className={`bg-white rounded-2xl shadow-sm p-4 border-l-4 ${c.border.replace('border-','border-l-')}`}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{s.nome}</p>
              <p className="text-3xl font-bold text-gray-900">{count}</p>
              <p className="text-[10px] text-gray-400 mt-1">clientes</p>
            </div>
          )
        })}
      </div>
    
      {/* Grid responsivo: Lista + Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ── Painel esquerdo: Lista de clientes ── */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-bold text-gray-900 mb-1">Selecionar Cliente</h2>
            <p className="text-xs text-gray-500 mb-3">Escolha um cliente para registrar status</p>
            <input
              value={implSearch}
              onChange={e => setImplSearch(e.target.value)}
              placeholder="Buscar cliente por nome ou código..."
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
    
          {/* Lista de clientes */}
          <div className="max-h-64 overflow-y-auto">
            {clientesFiltrados.slice(0,30).map(c => {
              const sid = statusAtual(c.id)
              const isSelected = c.id === implClienteId
              return (
                <button
                  key={`impl-${c.id}`}
                  onClick={() => { setImplClienteId(c.id); setImplStatusSel(sid || 0); setImplObs("") }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left border-b transition-colors hover:bg-blue-50
                    ${isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}
                >
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">{c.name}</p>
                    <p className="text-[10px] text-gray-400">{c.codSGD || c.id} · {c.responsavel || "—"}</p>
                  </div>
                  {sid ? statusBadge(sid) : <span className="text-[10px] text-gray-400">Sem status</span>}
                </button>
              )
            })}
            {clientesFiltrados.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">Nenhum cliente encontrado.</p>
            )}
          </div>
    
          {/* Form de registro */}
          {clienteSel && (
            <div className="p-4 border-t space-y-3 bg-blue-50/40">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                {clienteSel.name}
              </p>
    
              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Novo Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_LIST.map(s => {
                    const c = statusColor(s.id)
                    const sel = implStatusSel === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => setImplStatusSel(s.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                          ${sel
                            ? `${c.bg} ${c.text} ${c.border} ring-2 ring-offset-1 ring-blue-400`
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        {s.id}. {s.nome}
                      </button>
                    )
                  })}
                </div>
              </div>
    
              {/* Observação */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Observação *</label>
                <textarea
                  value={implObs}
                  onChange={e => setImplObs(e.target.value)}
                  placeholder="Descreva o que aconteceu, próximos passos..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
    
              <button
                onClick={handleSalvarStatus}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4"/> Salvar Registro
              </button>
            </div>
          )}
        </div>
    
        {/* ── Painel direito: Detalhes e historico ── */}
        <div className="col-span-1 lg:col-span-8 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-blue-600"/>
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  {clienteSel ? clienteSel.name.split(' ').slice(0,3).join(' ') : "Historico de Status"}
                </h2>
                <p className="text-xs text-gray-500">{clienteSel ? clienteSel.codSGD : "Selecione um cliente"}</p>
              </div>
            </div>
            {histCliente.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                {histCliente.length} registros
              </span>
            )}
          </div>
    
          {!clienteSel && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users className="w-10 h-10 mb-3 opacity-30"/>
              <p className="text-sm">Selecione um cliente para ver o histórico</p>
            </div>
          )}
    
          {clienteSel && histCliente.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ClipboardList className="w-10 h-10 mb-3 opacity-30"/>
              <p className="text-sm">Nenhum registro ainda.</p>
              <p className="text-xs mt-1">Use o painel ao lado para registrar o primeiro status.</p>
            </div>
          )}
    
          {clienteSel && histCliente.length > 0 && (
            <div className="overflow-y-auto max-h-[500px]">
              {histCliente.map((h, i) => {
                const isFirst = i === 0
                const c = statusColor(h.statusId)
                const sNome = STATUS_LIST.find(s => s.id === h.statusId)?.nome ?? "—"
                return (
                  <div key={h.id} className={`px-4 py-3 border-b ${isFirst ? "bg-blue-50/40" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${c.bg} ${c.text} ${c.border}`}>
                        {sNome}
                      </span>
                      {isFirst && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">ATUAL</span>}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{h.observacao}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                      <span>📅 {h.data}</span>
                      <span>👤 {h.usuario}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    
      {/* ── Tabela geral de todos os clientes com status ── */}
      {!isTecnico() && (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600"/>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Todos os Clientes</h2>
              <p className="text-xs text-gray-500">Status atual de implantacao</p>
            </div>
          </div>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">{clients.length} clientes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Pacote</th>
                <th className="px-4 py-3 text-left">Responsável</th>
                <th className="px-4 py-3 text-left">Status Atual</th>
                <th className="px-4 py-3 text-left">Último Registro</th>
                <th className="px-4 py-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 50).map(c => {
                const sid = statusAtual(c.id)
                const ultHist = historico.filter(h => h.clienteId === c.id).slice(-1)[0]
                return (
                  <tr key={`tabimpl-${c.id}`} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium truncate max-w-[220px]">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.codSGD || c.id}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{c.pacote || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{c.responsavel || "—"}</td>
                    <td className="px-4 py-3">
                      {sid ? statusBadge(sid) : <span className="text-[10px] text-gray-400">Sem status</span>}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-400">
                      {ultHist ? <span>{ultHist.data}</span> : "��"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setImplClienteId(c.id); setImplSearch(""); setImplStatusSel(sid || 0); setImplObs(""); window.scrollTo({top:0,behavior:"smooth"}) }}
                        className="px-2.5 py-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Atualizar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}
    
    </div>
    )
  }

  const ModalImpl = () => {
            const cli = clients.find(c=>c.id===modalImpl)
            if (!cli) return null
    
            const listaAnot = (anotacoes[modalImpl]||[]).slice().reverse()
    
            const lastStatus   = listaAnot.find((a)=>a.statusAlterado)
            const firstContato = (anotacoes[modalImpl]||[]).find((a)=>a.subtipo==='Primeiro Contato')
            const lastCheckout = (anotacoes[modalImpl]||[]).find((a)=>a.subtipo==='Checkout')
    
            const STATUS_OPTS = statusImplantacao.filter(s=>s.ativo).sort((a,b)=>a.ordem-b.ordem).map(s=>s.nome)
            const TIPO_OPTS   = ['Checkpoint','Primeiro Contato','Checkout','Treinamento','Go Live','Reunião','Retrabalho','Observação','Outro']
    
            const sc = (s) => {
              const stObj = statusImplantacao.find(st=>st.nome.toLowerCase()===s.toLowerCase())
              if (stObj) {
                const type = stObj.tipo
                return type==='concluido' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                     : type==='alerta'   ? 'bg-amber-100 text-amber-700 border-amber-200'
                                         : 'bg-blue-100 text-blue-700 border-blue-200'
              }
              const m = {
                'Realizado':'bg-emerald-100 text-emerald-700 border-emerald-200',
                'Em andamento':'bg-blue-100 text-blue-700 border-blue-200',
                'Cancelado':'bg-red-100 text-red-700 border-red-200',
                'Aguardando Cliente':'bg-amber-100 text-amber-700 border-amber-200',
                'Risco':'bg-orange-100 text-orange-700 border-orange-200',
              }
              return m[s]||'bg-gray-100 text-gray-600 border-gray-200'
            }
    
            const tipoIcon = {
              'Checkpoint':'📋','Primeiro Contato':'📞','Checkout':'✅','Treinamento':'📚',
              'Go Live':'🚀','Reunião':'��','Retrabalho':'🔄','Observação':'📝','Outro':'💬',
              'T&I':'📘','Feedback Técnico':'⭐','Ações':'⚡','Apoios':'🎧','Comercial':'🛒',
            }
    
            const handleSalvar = () => {
              const f = implForm
              if (!f.comentario.trim() && !f.status) {
                toast('Preencha ao menos um campo','red'); return
              }
              // Salva anotação
              const novaAnot = {
                id: `impl_${Date.now()}`,
                tipo: 'T&I',
                subtipo: f.tipo || 'Checkpoint',
                texto: f.comentario || `[Status: ${f.status}]`,
                autor: user.name,
                autorId: user.id,
                data: nowDT(),
                sgd: false,
              }
              setAnotacoes((p) => ({...p, [modalImpl]: [...(p[modalImpl]||[]), novaAnot]}))
              
              // ══════════ INTEGRACAO ACAO → FASES ══════════
              const subtipo = f.tipo || 'Checkpoint'
              const hoje = new Date().toISOString().split('T')[0]
              const faseAtual = getFaseCliente(modalImpl)
              let faseUpdates = {}
              let faseLog = ''
              
              // Mapeamento de acoes para fases
              if (subtipo === 'Primeiro Contato' || subtipo.toLowerCase().includes('primeiro contato')) {
                faseUpdates = { primeiroContatoStatus: 'Realizado', dataPrimeiroContato: hoje }
                faseLog = 'Fase 1: Primeiro Contato realizado'
              }
              else if (subtipo === 'Checkpoint' || subtipo.toLowerCase().includes('checkpoint')) {
                if (faseAtual.check1Status !== 'Realizado') {
                  faseUpdates = { check1Status: 'Realizado', dataCheck1: hoje }
                  faseLog = 'Fase 2: Check 1 realizado'
                } else if (faseAtual.check2Status !== 'Realizado') {
                  faseUpdates = { check2Status: 'Realizado', dataCheck2: hoje }
                  faseLog = 'Fase 2: Check 2 realizado'
                }
              }
              else if (subtipo === 'Checkout' || subtipo.toLowerCase().includes('checkout')) {
                faseUpdates = { check2Status: 'Realizado', dataCheck2: hoje }
                faseLog = 'Fase 2: Checkout realizado'
              }
              else if (subtipo === 'Treinamento' || subtipo.toLowerCase().includes('treinamento') || subtipo.toLowerCase().includes('onboarding')) {
                faseUpdates = { onboardingStatus: 'Realizado', dataOnboarding: hoje }
                faseLog = 'Fase 1: Treinamento/Onboarding realizado'
              }
              else if (subtipo === 'Go Live' || subtipo.toLowerCase().includes('go live')) {
                faseUpdates = { concluido: true, dataContatoFinal: hoje }
                faseLog = 'Fase 3: Go Live - Implantacao concluida'
              }
              else if (subtipo === 'Retrabalho' || subtipo.toLowerCase().includes('retrabalho')) {
                faseUpdates = { check1Status: 'Risco' }
                faseLog = 'Fase 2: Retrabalho identificado - Status Risco'
              }
              
              // Aplica atualizacao de fase se houver
              if (Object.keys(faseUpdates).length > 0) {
                setFaseCliente(modalImpl, faseUpdates)
                // Log automatico da atualizacao de fase
                const logAnot = {
                  id: `fase_${Date.now()}`,
                  tipo: 'T&I',
                  subtipo: 'Sistema',
                  texto: `[Auto] ${faseLog}`,
                  autor: 'Sistema',
                  autorId: 'system',
                  data: nowDT(),
                  sgd: false,
                }
                setAnotacoes((p) => ({...p, [modalImpl]: [...(p[modalImpl]||[]), logAnot]}))
              }
              
              // Registra no novo histórico de status se houve mudança
              if (f.status) {
                // Mapeia nome do status legado para ID do STATUS_LIST
                const statusNomeLower = f.status.toLowerCase()
                const statusMap = {
                  'pré-boarding comercial': 1, 'pre-boarding comercial': 1,
                  'pré-boarding técnico': 2,   'pre-boarding tecnico': 2,
                  'contato': 3,
                  'onboarding': 4,
                  'finalizado': 5, 'realizado': 5, 'cancelado': 5,
                }
                let sid = 1
                for (const [k, v] of Object.entries(statusMap)) {
                  if (statusNomeLower.includes(k)) { sid = v; break }
                }
                // Também aceita id numérico direto
                const asNum = Number(f.status)
                if (!isNaN(asNum) && asNum >= 1 && asNum <= 5) sid = asNum
                registrarStatus(modalImpl, sid, f.comentario || `Status: ${f.status}`, user.name)
              }
              // Atualiza campos de data no cliente
              if (f.primeiroContato || f.checkout) {
                setClients((p) => p.map(c => {
                  if (c.id !== modalImpl) return c
                  return {
                    ...c,
                    ...(f.primeiroContato ? { dataPrimeiroContato: f.primeiroContato } : {}),
                    ...(f.checkout ? { dataCheckout: f.checkout } : {}),
                  }
                }))
              }
              setImplForm({status:'',primeiroContato:'',checkout:'',comentario:'',tipo:'Checkpoint'})
              toast('Salvo com sucesso!','green')
            }
    
            const calcularScore = (q) => q==='boa'?3:q==='media'?2:1
    
            if (!window.__aiAnot) window.__aiAnot = {}
            const aiKey = (id) => `ai_${id}`
    
            const analisarAnotacao = async (a) => {
              const key = aiKey(a.id)
              window.__aiAnot[key] = {loading:true, result:null, error:null}
              setAnalises((p)=>[...p]) // trigger re-render to show loading
    
              try {
                const res = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [{
                      role: 'user',
                      content: `Analise esta anotação de atendimento de implantação de software contábil.
    Retorne APENAS JSON válido (sem markdown, sem texto extra) com esta estrutura:
    {"acao_realizada":"string","tem_pendencia":boolean,"pendencias":"string","expectativa_atendida":"sim"|"parcial"|"nao","problemas":"string","qualidade":"boa"|"media"|"ruim","feedback":"string"}
    
    Cliente: ${cli.codSGD || cli.id} — ${cli.name}
    Técnico: ${cli.responsavel || a.autor || ''}
    Anotação: ${a.texto}`
                    }]
                  })
                })
    
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
    
                const data = await res.json()
                const txt = (data.content||[]).map((x)=>x.text||'').join('').replace(/```json|```/g,'').trim()
                const parsed = JSON.parse(txt)
    
                parsed.acao_realizada       = parsed.acao_realizada       || ''
                parsed.empresas             = Array.isArray(parsed.empresas) ? parsed.empresas : []
                parsed.tem_pendencia        = !!parsed.tem_pendencia
                parsed.pendencias           = parsed.pendencias           || ''
                parsed.expectativa_atendida = parsed.expectativa_atendida || 'parcial'
                parsed.problemas            = parsed.problemas            || ''
                parsed.qualidade            = parsed.qualidade            || 'media'
                parsed.feedback             = parsed.feedback             || ''
    
                const score = calcularScore(parsed.qualidade)
    
                const registro = {
                  id:                  `${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
                  cliente_id:          cli.codSGD || cli.id,
                  cliente_nome:        cli.name,
                  tecnico:             cli.responsavel || a.autorId || a.autor || '',
                  data:                new Date().toISOString(),
                  anotacao_id:         a.id,
                  anotacao_texto:      a.texto,
                  acao_realizada:      parsed.acao_realizada,
                  tem_pendencia:       parsed.tem_pendencia,
                  pendencias:          parsed.pendencias,
                  expectativa_atendida: parsed.expectativa_atendida,
                  problemas:           parsed.problemas,
                  qualidade:           parsed.qualidade,
                  score,
                }
                setAnalises((prev) => {
                  const sem = prev.filter((r) => r.anotacao_id !== a.id)
                  return [...sem, registro]
                })
    
                window.__aiAnot[key] = {loading:false, result:{...parsed, score}, error:null}
              } catch(e) {
                window.__aiAnot[key] = {loading:false, result, error:`Erro: ${e?.message||'falha na requisição'}`}
              }
              setAnalises((p)=>[...p]) // trigger re-render to show result
            }
    
            const qualBadge = (q) => {
              if (q==='boa')   return 'bg-emerald-100 text-emerald-700'
              if (q==='media') return 'bg-amber-100 text-amber-700'
              return 'bg-red-100 text-red-700'
            }
            const expectBadge = (e) => {
              if (e==='sim')     return 'bg-emerald-100 text-emerald-700'
              if (e==='parcial') return 'bg-amber-100 text-amber-700'
              return 'bg-red-100 text-red-700'
            }

            const _render4667 = () => {
              const r = aiState?.result
              if (!r) return null
              return (
              <div className="mx-3.5 mb-3.5 border border-violet-200 rounded-xl overflow-hidden bg-violet-50">
                <div className="flex items-center justify-between px-3.5 py-2 bg-violet-100 border-b border-violet-200">
                  <span className="text-[10px] font-semibold text-violet-700 uppercase tracking-wide">Analise IA</span>
                  <div className="flex gap-1.5 items-center">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${r.score===3?'bg-emerald-100 text-emerald-700 border-emerald-300':r.score===2?'bg-amber-100 text-amber-700 border-amber-300':'bg-red-100 text-red-700 border-red-300'}`}>
                      {r.score===3?'3/3':r.score===2?'2/3':'1/3'} {r.score}/3
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${qualBadge(r.qualidade)}`}>
                      {r.qualidade==='boa'?'Boa':r.qualidade==='media'?'Media':'Fraca'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${expectBadge(r.expectativa_atendida)}`}>
                      Expectativa: {r.expectativa_atendida}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2.5">
                  {r.acao_realizada && (
                    <div>
                      <p className="text-[9px] font-semibold text-violet-600 uppercase tracking-wide mb-0.5">Acao realizada</p>
                      <p className="text-[11px] text-gray-700">{r.acao_realizada}</p>
                    </div>
                  )}
                  {r.empresas?.length > 0 && (
                    <div>
                      <p className="text-[9px] font-semibold text-violet-600 uppercase tracking-wide mb-0.5">Empresas citadas</p>
                      <div className="flex flex-wrap gap-1">
                        {r.empresas.map((e,ei)=>(
                          <span key={ei} className="text-[10px] bg-white border border-violet-200 text-violet-700 px-2 py-0.5 rounded-full">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.tem_pendencia && r.pendencias && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <p className="text-[9px] font-semibold text-amber-600 uppercase tracking-wide mb-0.5">Pendencia identificada</p>
                      <p className="text-[11px] text-amber-800">{r.pendencias}</p>
                    </div>
                  )}
                  {r.problemas && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <p className="text-[9px] font-semibold text-red-600 uppercase tracking-wide mb-0.5">Problemas / Dificuldades</p>
                      <p className="text-[11px] text-red-800">{r.problemas}</p>
                    </div>
                  )}
                  {r.feedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Como melhorar</p>
                      <p className="text-[11px] text-blue-800">{r.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
              )
            }
    
            return (
            <Modal onClose={()=>setModalImpl(null)} maxW="max-w-4xl">
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b bg-gray-50 rounded-t-2xl">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold truncate">{cli.name}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 font-mono">{cli.codSGD||cli.id}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500">{cli.pacote||'—'}</span>
                    <span className="text-gray-300">·</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusCor(cli.id)}`}>{getStatusNome(cli.id)}</span>
                  </div>
                </div>
                <button onClick={()=>setModalImpl(null)} className="p-2 hover:bg-gray-200 rounded-lg ml-3 flex-shrink-0"><X className="w-4 h-4"/></button>
              </div>
    
              <div className="flex" style={{height:'560px'}}>
    
                {/* ── Coluna esquerda — formulário ── */}
                <div className="w-72 flex-shrink-0 border-r flex flex-col">
                  <div className="px-4 py-3 border-b bg-blue-50">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Nova Ação</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Tipo da ação</label>
                      <select value={implForm.tipo} onChange={e=>setImplForm(p=>({...p,tipo:e.target.value}))}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white">
                        {TIPO_OPTS.map(t=><option key={t} value={t}>{tipoIcon[t]||'💬'} {t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Alterar situação</label>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTS.map(s=>(
                          <button key={s} onClick={()=>setImplForm(p=>({...p,status:p.status===s?'':s}))}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${implForm.status===s?sc(s):'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                      {implForm.status && <p className="text-[10px] text-blue-600 mt-1">→ <b>{implForm.status}</b></p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                        Primeiro Contato {(cli.dataPrimeiroContato||cli.primeiroContato) && <span className="text-emerald-600 normal-case font-normal">atual: {cli.dataPrimeiroContato||cli.primeiroContato}</span>}
                      </label>
                      <input type="date" value={implForm.primeiroContato} onChange={e=>setImplForm(p=>({...p,primeiroContato:e.target.value}))}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500"/>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                        Checkout {cli.dataCheckout && <span className="text-emerald-600 normal-case font-normal">atual: {cli.dataCheckout}</span>}
                      </label>
                      <input type="date" value={implForm.checkout} onChange={e=>setImplForm(p=>({...p,checkout:e.target.value}))}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500"/>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Comentário</label>
                      <textarea value={implForm.comentario} onChange={e=>setImplForm(p=>({...p,comentario:e.target.value}))}
                        placeholder="Descreva a ação realizada..." rows={3}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none"/>
                    </div>
                    <button onClick={handleSalvar}
                      className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                      Salvar &amp; Registrar
                    </button>
                  </div>
                  {/* Info do cliente */}
                  <div className="p-4 border-t bg-gray-50 text-xs space-y-1 text-gray-500">
                    <div className="flex justify-between"><span>Técnico</span><span className="font-medium text-gray-700">{(SEED_USERS.find(u=>u.id===cli.responsavel)?.name||cli.responsavel||'—').split(' ')[0]}</span></div>
                    <div className="flex justify-between"><span>Horas</span><span className="font-medium text-gray-700">{cli.horasRealizadas||cli.horasNum||0}h</span></div>
                    <div className="flex justify-between"><span>1° Contato</span><span className="font-medium text-emerald-600">{cli.primeiroContato||'—'}</span></div>
                    <div className="flex justify-between"><span>Checkout</span><span className="font-medium text-emerald-600">{cli.dataCheckout||'—'}</span></div>
                    <div className="flex justify-between"><span>Início</span><span className="font-medium text-gray-700">{cli.inicio||'—'}</span></div>
                  </div>
                </div>
    
                {/* ── Coluna direita — histórico ── */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Histórico</p>
                    <span className="text-[10px] text-gray-400">{listaAnot.length} registros · ✨ clique em Analisar para avaliar com IA</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {listaAnot.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                        <p className="text-sm">Nenhuma anotação ainda.</p>
                      </div>
                    ) : listaAnot.map((a,i) => {
                      const aiState = window.__aiAnot?.[aiKey(a.id)]
                      return (
                      <div key={a.id||i} className={`rounded-xl border ${a.statusAlterado?'border-blue-200 bg-blue-50':a.sgd?'border-teal-200 bg-teal-50':'border-gray-100 bg-white'}`}>
    
                        {/* Card header */}
                        <div className="p-3.5 pb-2">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm">{tipoIcon[a.subtipo]||tipoIcon[a.tipo]||'💬'}</span>
                              <span className="text-[11px] font-semibold text-gray-700">{a.subtipo||a.tipo}</span>
                              {a.statusAlterado && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc(a.statusAlterado)}`}>→ {a.statusAlterado}</span>
                              )}
                              {a.sgd && <span className="text-[9px] px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded font-medium">SGD</span>}
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{a.data}</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{a.texto}</p>
                          {(a.primeiroContato||a.dataCheckout) && (
                            <div className="mt-2 flex gap-2 text-[10px] flex-wrap">
                              {a.primeiroContato && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">📞 1° Contato: {a.primeiroContato}</span>}
                              {a.dataCheckout && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">✅ Checkout: {a.dataCheckout}</span>}
                            </div>
                          )}
                          {/* Footer + botão analisar */}
                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-600">
                                {(a.autor||a.autorId||'?').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-[10px] text-gray-400">{a.autor||a.autorId}</span>
                            </div>
                            {/* Botão analisar IA */}
                            {a.texto && a.texto.length > 10 && (
                              <button
                                onClick={()=>analisarAnotacao(a)}
                                disabled={aiState?.loading}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                                  aiState?.result ? 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200'
                                  : aiState?.loading ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-wait'
                                  : 'bg-white text-gray-500 border-gray-200 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200'
                                }`}>
                                {aiState?.loading ? (
                                  <><span className="inline-block w-2.5 h-2.5 border border-violet-400 border-t-transparent rounded-full animate-spin"/>Analisando...</>
                                ) : aiState?.result ? (
                                  <>✨ Reanalisar</>
                                ) : (
                                  <>✨ Analisar com IA</>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
    
                        {/* ── Painel de resultado IA ── */}
                        {aiState?.error && (
                          <div className="mx-3.5 mb-3.5 p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-600">
                            {aiState.error}
                          </div>
                        )}
                        {aiState?.result && _render4667()}
                      </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Modal>
            )
  }

  const _render5353 = () => {
    if (!window.__tpFiltro) window.__tpFiltro = {produto:'', search:''}
    const rerender = () => setEditingPkg((p)=>p)
    const tp = window.__tpFiltro
    const PRODS_VALIDOS = ['Domínio Start','Domínio Plus','Domínio Premium','Domínio Empresarial','Personalizado']
    
    const rows = tabelaPrecos.filter((r)=>{
      const q = tp.search.toLowerCase()
      return (!tp.produto || r.produto===tp.produto) &&
             (!q || r.produto.toLowerCase().includes(q) || String(r.usuarios).includes(q))
    }).sort((a,b)=>a.produto.localeCompare(b.produto)||a.usuarios-b.usuarios)
    
    const handleCSV = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const lines = (ev.target.result as string).split('\n').filter(Boolean)
          const header = lines[0].toLowerCase()
          const isProdIdx   = header.split(',').findIndex((h)=>h.includes('produto'))
          const isUserIdx   = header.split(',').findIndex((h)=>h.includes('usuario')||h.includes('user'))
          const isValIdx    = header.split(',').findIndex((h)=>h.includes('valor')&&!h.includes('treino')&&!h.includes('train'))
          const isHorasIdx  = header.split(',').findIndex((h)=>h.includes('hora'))
          const isVlTreino  = header.split(',').findIndex((h)=>h.includes('treino')||h.includes('train'))
          const novos = lines.slice(1).map((l,i) => {
            const cols = l.split(',').map((x)=>x.trim().replace(/"/g,''))
            return {
              id: `imp_${Date.now()}_${i}`,
              produto: cols[isProdIdx]||'',
              usuarios: Number(cols[isUserIdx])||0,
              valor: Number((cols[isValIdx]||'0').replace(/[^\d.]/g,''))||0,
              horasTreino: Number(cols[isHorasIdx])||0,
              vlTreino: Number((cols[isVlTreino]||'0').replace(/[^\d.]/g,''))||0,
              limDesconto: 5,
            }
          }).filter((r)=>r.produto && PRODS_VALIDOS.includes(r.produto))
          if (!novos.length) { alert('Nenhuma linha válida importada. Verifique os produtos e o formato.'); return }
          setTabelaPrecos((p)=>{
            const sem = p.filter((r)=>!novos.some((n)=>n.produto===r.produto&&n.usuarios===r.usuarios))
            return [...sem,...novos].sort((a,b)=>a.produto.localeCompare(b.produto)||a.usuarios-b.usuarios)
          })
          alert(`${novos.length} linha(s) importadas com sucesso.`)
        } catch(err) { alert('Erro ao processar arquivo. Use CSV com colunas: produto,usuarios,valor,horas_treino,valor_treino') }
        e.target.value=''
      }
      reader.readAsText(file)
    }
    
    return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input value={tp.search} onChange={e=>{tp.search=e.target.value;rerender()}}
            placeholder="Buscar produto ou nº usuários..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"/>
        </div>
        <select value={tp.produto} onChange={e=>{tp.produto=e.target.value;rerender()}}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none bg-white">
          <option value="">Todos os produtos</option>
          {PRODS_VALIDOS.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 cursor-pointer">
          <Upload className="w-4 h-4"/>
          Importar CSV
          <input type="file" accept=".csv,.txt" className="hidden" onChange={handleCSV}/>
        </label>
      </div>
    
      <div className="text-[10px] text-gray-400 bg-gray-50 border rounded-lg px-3 py-2">
        Formato CSV esperado: <span className="font-mono">produto,usuarios,valor,horas_treino,valor_treino</span> — Produtos válidos: {PRODS_VALIDOS.join(' · ')}
      </div>
    
      {/* Tabela agrupada */}
      {PRODS_VALIDOS.filter(p=>!tp.produto||p===tp.produto).map(prod=>{
        const prodRows = rows.filter((r)=>r.produto===prod)
        if (!prodRows.length) return null
        return (
        <div key={prod} className="bg-white border rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b flex items-center justify-between">
            <p className="font-semibold text-sm">{prod}</p>
            <span className="text-[10px] text-gray-400">{prodRows.length} faixa{prodRows.length!==1?'s':''} de usuários</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                {['Nº Usuários','Valor Mensal','Horas Treino','Valor Treino','Lim. Desconto'].map(h=>(
                  <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold uppercase text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prodRows.map((r)=>(
                <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm font-semibold">{r.usuarios===0?'Sob consulta':`${r.usuarios} usuário${r.usuarios!==1?'s':''}`}</td>
                  <td className="px-4 py-2.5 text-sm font-bold text-emerald-700">{r.valor>0?`R$ ${fmtR(r.valor)}`:'—'}</td>
                  <td className="px-4 py-2.5 text-sm">{r.horasTreino>0?`${r.horasTreino}h`:'���'}</td>
                  <td className="px-4 py-2.5 text-sm">{r.vlTreino>0?`R$ ${fmtR(r.vlTreino)}`:'—'}</td>
                  <td className="px-4 py-2.5 text-sm text-amber-600 font-medium">{r.limDesconto}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )
      })}
      {rows.length===0 && <div className="bg-white border rounded-xl p-12 text-center text-gray-400 text-sm">Nenhum registro. Importe um CSV para começar.</div>}
    </div>
    )
  }

  const ModalAnot = () => {
    const cli = clients.find(c=>c.id===modalAnot)
    const lista = anotacoes[modalAnot]||[]
    const temSel = lista.some(a=>a.sgd)

    return (
      <Modal onClose={()=>setModalAnot(null)}>
        <div className="flex items-center justify-between p-5 border-b bg-gray-50">
          <div><h2 className="text-base font-bold flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-600"/> {cli?.name?.substring(0,30)}</h2><p className="text-xs text-gray-400 mt-0.5">{lista.length} anotações</p></div>
          <div className="flex items-center gap-2">
            <button onClick={()=>copiarSGD(modalAnot)} disabled={!temSel} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${temSel?"bg-teal-600 text-white hover:bg-teal-700":"bg-gray-100 text-gray-400 cursor-not-allowed"}`}>{copied===modalAnot?<CheckCheck className="w-3 h-3"/>:<Copy className="w-3 h-3"/>}{copied===modalAnot?"Copiado!":"Copiar SGD"}</button>
            <button onClick={()=>setModalAnot(null)} className="p-2 hover:bg-gray-200 rounded-lg"><X className="w-4 h-4"/></button>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-5 space-y-3">
          {lista.length===0 && <div className="text-center py-8 text-gray-400"><MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30"/><p className="text-sm">Nenhuma anotação</p></div>}
          {lista.map(a=>{const tm=ANOT_TIPOS[a.tipo]; return(
            <div key={a.id} className={`rounded-xl p-4 border ${a.sgd?"border-teal-400 bg-teal-50":"border-gray-100 bg-gray-50"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tm?.color||""}`}>{tm?.icon} {a.tipo}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-white border border-gray-200 text-gray-600">{a.subtipo}</span>
                    <span className="text-[10px] text-gray-400">{a.autor} · {a.data}</span>
                  </div>
                  <p className="text-sm">{a.texto}</p>
                </div>
                <button onClick={()=>toggleSGD(modalAnot,a.id)} className={`p-1.5 rounded-lg ${a.sgd?"bg-teal-500 text-white":"bg-gray-200 text-gray-500 hover:bg-teal-100"}`}><Copy className="w-3 h-3"/></button>
              </div>
            </div>
          )})}
        </div>
        <div className="p-5 border-t bg-gray-50">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Tipo</label>
              <select value={novaAnot.tipo} onChange={e=>setNovaAnot(p=>({...p,tipo:e.target.value,sub:ANOT_TIPOS[e.target.value]?.sub[0]||""}))} className="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:border-blue-500">
                {Object.keys(ANOT_TIPOS).map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Subtipo</label>
              <select value={novaAnot.sub} onChange={e=>setNovaAnot(p=>({...p,sub:e.target.value}))} className="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:border-blue-500">
                {(ANOT_TIPOS[novaAnot.tipo]?.sub||[]).map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <textarea value={novaAnot.texto} onChange={e=>setNovaAnot(p=>({...p,texto:e.target.value}))} placeholder="Descreva... (Ctrl+Enter para salvar)" rows={2} className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
              onKeyDown={e=>{if(e.key==="Enter"&&e.ctrlKey)addAnot(modalAnot)}}/>
            <button onClick={()=>addAnot(modalAnot)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 self-end"><Send className="w-4 h-4"/></button>
          </div>
        </div>
      </Modal>
    )
  }

  const ModalValItem = () => {
    const v = modalValItem
    const isAguardando = v.status === 'aguardando'
    
    const fmtVal = (n) => `R$ ${Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`
    
    const temDesconto = v.desconto==='sim' && v.descontoValor
    const vlOriginal = Number(v.vlTotal||v.valorContrato||0)
    const vlDesconto = temDesconto ? (
      v.descontoTipo==='percentual'
        ? vlOriginal * (Number(v.descontoValor)||0) / 100
        : Number((v.descontoValor||'').replace(',','.'))
    ) : 0
    const vlFinal = vlOriginal - vlDesconto
    
    const aprovarItem = () => {
      const updates = {status:'aprovado', validadoEm:nowDate(), validadoPor:user.name}
      if (temDesconto) {
        if (!window.__descDecision?.[v.id]) { toast('Defina a decisão sobre o desconto solicitado','red'); return }
        if (window.__descDecision[v.id]==='aprovar') {
          updates.descontoAprovado = true
          updates.descontoAprovadoPor = user.name
          updates.descontoAprovadoEm = nowDate()
          updates.vlFinalComDesconto = vlFinal
        } else {
          if (!window.__descMotivoRep?.[v.id]?.trim()) { toast('Informe o motivo da reprovação do desconto','red'); return }
          updates.descontoAprovado = false
          updates.descontoReprovadoPor = user.name
          updates.descontoReprovadoEm = nowDate()
          updates.descontoMotivoRep = window.__descMotivoRep[v.id]
        }
      }
      setValidacoes((p) => p.map((x) => x.id===v.id ? {...x, ...updates} : x))
      addCliente({...v, ...updates})
      setModalValItem(null)
      setValMotivoRep('')
      toast(`${v.razaoSocial?.split(' ')[0]} aprovado!`, 'green')
    }
    
    const reprovarItem = () => {
      if (!valMotivoRep.trim()) { toast('Informe a observação da reprovação','red'); return }
      setReprovados((p) => [{
        ...v, status:'em_observacao',
        reprovadoEm:nowDate(), reprovadoPor:user.name, observacao:valMotivoRep,
      }, ...p])
      setValidacoes((p) => p.filter((x) => x.id !== v.id))
      setModalValItem(null)
      setValMotivoRep('')
      toast('Solicitação de observação registrada.','red')
    }
    
    const statusCfg = {
      aguardando:{bg:'#fffbeb',txt:'#92400e',bdr:'#fde68a',label:'Aguardando',icon:'⏳'},
      aprovado:  {bg:'#ecfdf5',txt:'#065f46',bdr:'#6ee7b7',label:'Aprovado',  icon:'✅'},
      em_observacao: {bg:'#f5f3ff',txt:'#5b21b6',bdr:'#c4b5fd',label:'Em observação', icon:'🔍'},
    }
    const sc = statusCfg[v.status]||statusCfg.aguardando
    
    const _render5681 = () => {
      const histCli = [...historico].filter(h => h.clienteId === selClient.id).reverse()
      if (!histCli.length) return null
      return (
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span>🕐</span> Histórico de Status
              <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {histCli.length} registros
              </span>
            </h3>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {histCli.map((h, i) => {
              const isAtual = i === 0
              const sNome = STATUS_LIST.find(s => s.id === h.statusId)?.nome || '—'
              const sc = statusColor(h.statusId)
              return (
                <div key={h.id} className={`flex items-start gap-3 text-xs pb-3 ${i < histCli.length-1 ? 'border-b border-dashed border-gray-100' : ''} ${isAtual ? '' : 'opacity-70'}`}>
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-3 h-3 rounded-full ${isAtual ? sc.bg : 'bg-gray-200'}`}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${sc.bg} ${sc.text} ${sc.border}`}>{sNome}</span>
                      {isAtual && <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded">ATUAL</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-gray-400">
                      <span>{h.data}</span>
                      <span>·</span>
                      <span>{h.usuario}</span>
                    </div>
                    {h.observacao && !h.observacao.startsWith('Migrado automaticamente') && (
                      <p className="text-gray-500 italic mt-0.5">{h.observacao}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    const _render5576 = () => {
      const sid = statusAtual(selClient.id)
      const ultH = [...historico].reverse().find(h => h.clienteId === selClient.id)
      const sNome = STATUS_LIST.find(s => s.id === sid)?.nome
      const c = sid ? statusColor(sid) : null
      return (
        <div className="flex items-center gap-1.5">
          {c && sNome ? (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
              {sNome}
            </span>
          ) : <span className="px-2 py-0.5 rounded-full text-[10px] border bg-gray-100 text-gray-400">Sem status</span>}
          {ultH && (
            <span className="text-[10px] text-gray-400 hidden sm:inline">
              {ultH.data}
            </span>
          )}
        </div>
      )
    }

    return (
    <Modal onClose={()=>{setModalValItem(null);setValMotivoRep('')}} maxW="max-w-2xl">
    
      {/* Header */}
      <div className={`flex items-start justify-between p-5 border-b rounded-t-2xl`}
        style={{background:sc.bg}}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{background:sc.bg,color:sc.txt,borderColor:sc.bdr}}>
              {sc.icon} {sc.label}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">{v.id}</span>
          </div>
          <h2 className="text-lg font-bold truncate">{v.razaoSocial}</h2>
          <p className="text-xs text-gray-500 mt-0.5">Enviado por <b>{v.criadoPor}</b> em {v.criadoEm}</p>
          {/* Link SGD e código extraído */}
          {v.tipoSGD && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={"text-[10px] px-2 py-0.5 rounded-full font-semibold border " + (v.tipoSGD==='CLIENTE' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200')}>
                {v.tipoSGD === 'CLIENTE' ? '👤 Cliente SGD' : '🔧 Implantação SGD'}
              </span>
              {v.codigoSGD && (
                <code className="text-[11px] font-mono bg-white/80 border rounded px-1.5 py-0.5 text-gray-700">
                  #{v.codigoSGD}
                </code>
              )}
              {v.linkSGD && (
                <a href={v.linkSGD} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5">
                  🔗 Abrir no SGD
                </a>
              )}
            </div>
          )}
        </div>
        <button onClick={()=>{setModalValItem(null);setValMotivoRep('')}}
          className="p-2 hover:bg-black/10 rounded-lg ml-3 flex-shrink-0"><X className="w-4 h-4"/></button>
      </div>
    
      {/* Dados do prospect */}
      <div className="p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dados do Contrato</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['CNPJ',          v.cnpj||'—'],
            ['Pacote',        v.pacote||'—'],
            ['Valor Contrato',fmtVal(v.valorContrato)],
            ['Vendedor',      v.vendedor||'—'],
            ['E-mail',        v.email||'—'],
            ['Telefone',      v.telefone||'—'],
            ['Cidade / UF',   v.cidade?`${v.cidade} / ${v.estado}`:'—'],
            ['Assinatura',    v.dataAssinatura||'—'],
          ].map(([l,val])=>(
            <div key={l} className="bg-gray-50 border rounded-xl px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{l}</p>
              <p className="font-medium text-gray-800">{val}</p>
            </div>
          ))}
        </div>
    
        {/* Observações */}
        {v.obs && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
            <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-1">Observações</p>
            <p className="text-gray-700">{v.obs}</p>
          </div>
        )}
    
        {/* Desconto solicitado */}
        {temDesconto && (
          <div className="border border-orange-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-orange-50 border-b border-orange-200">
              <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Desconto Solicitado</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-50 border rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Valor Original</p>
                  <p className="font-bold">{fmtVal(vlOriginal)}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-orange-500 uppercase mb-1">
                    Desconto {v.descontoTipo==='percentual'?`${v.descontoValor}%`:''}
                  </p>
                  <p className="font-bold text-orange-700">- {fmtVal(vlDesconto)}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase mb-1">Valor Final</p>
                  <p className="font-bold text-emerald-700">{fmtVal(vlFinal)}</p>
                </div>
              </div>
              <div className="bg-gray-50 border rounded-xl px-3 py-2.5 text-sm">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Motivo do desconto</p>
                <p className="text-gray-700">{v.descontoMotivo}</p>
                <p className="text-[10px] text-gray-400 mt-1">Solicitado por: {v.criadoPor}</p>
              </div>
              {/* Histórico de decisão */}
              {v.descontoAprovado===true && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-sm">
                  <p className="font-semibold text-emerald-700">✅ Desconto aprovado por {v.descontoAprovadoPor} em {v.descontoAprovadoEm}</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Valor final aplicado: {fmtVal(v.vlFinalComDesconto)}</p>
                </div>
              )}
              {v.descontoAprovado===false && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm">
                  <p className="font-semibold text-red-700">❌ Desconto reprovado por {v.descontoReprovadoPor} em {v.descontoReprovadoEm}</p>
                  <p className="text-red-600 mt-0.5">{v.descontoMotivoRep}</p>
                </div>
              )}
              {/* Decisão pendente — só admin, só aguardando */}
              {isAguardando && isAdmin() && v.descontoAprovado===undefined && (
                <div className="border-t border-orange-200 pt-3 space-y-3">
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">Decisão sobre o desconto</p>
                  <div className="flex gap-3">
                    <button
                      onClick={()=>{if(!window.__descDecision)window.__descDecision={};window.__descDecision[v.id]='aprovar';setAnotacoes((p)=>({...p}))}}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${window.__descDecision?.[v.id]==='aprovar'?'bg-emerald-600 text-white border-emerald-600':'bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}>
                      ✅ Aprovar desconto
                    </button>
                    <button
                      onClick={()=>{if(!window.__descDecision)window.__descDecision={};window.__descDecision[v.id]='reprovar';setAnotacoes((p)=>({...p}))}}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${window.__descDecision?.[v.id]==='reprovar'?'bg-red-600 text-white border-red-600':'bg-white border-red-300 text-red-700 hover:bg-red-50'}`}>
                      ❌ Reprovar desconto
                    </button>
                  </div>
                  {window.__descDecision?.[v.id]==='reprovar' && (
                    <div>
                      <label className="text-[10px] font-semibold text-red-600 uppercase tracking-wide block mb-1">Motivo da reprovação do desconto *</label>
                      <textarea
                        value={window.__descMotivoRep?.[v.id]||''}
                        onChange={e=>{if(!window.__descMotivoRep)window.__descMotivoRep={};window.__descMotivoRep[v.id]=e.target.value;setAnotacoes((p)=>({...p}))}}
                        placeholder="Informe o motivo..." rows={2}
                        className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:border-red-400 bg-white resize-none"/>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
    
        {/* Status aprovado */}
        {v.status==='aprovado' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
            <p className="font-semibold text-emerald-700">✅ Aprovado por {v.validadoPor} em {v.validadoEm}</p>
            <p className="text-xs text-emerald-600 mt-0.5">Cliente adicionado à fila de execução</p>
          </div>
        )}
    
        {/* Status em observação */}
        {v.status==='em_observacao' && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
            <p className="font-semibold text-red-700">❌ Em observação por {v.reprovadoPor} em {v.reprovadoEm}</p>
            <div className="mt-2">
              <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wide mb-1">Observação solicitada</p>
              <p className="text-red-800 bg-white border border-red-200 rounded-lg px-3 py-2">{v.observacao}</p>
            </div>
          </div>
        )}
    
        {/* Área de ação — só para Aguardando */}
        {isAguardando && isAdmin() && (
          <div className="border-t pt-4 space-y-3">
            {/* Campo motivo reprovação */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Observação / Informação solicitada <span className="text-red-400">(obrigatório para reprovar)</span>
              </label>
              <textarea
                value={valMotivoRep}
                onChange={e=>setValMotivoRep(e.target.value)}
                placeholder="Descreva o que precisa ser complementado ou corrigido..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none resize-none transition-colors ${
                  valMotivoRep.trim() ? 'border-gray-300 focus:border-red-400' : 'border-gray-200 focus:border-red-400'
                }`}
              />
              {!valMotivoRep.trim() && (
                <p className="text-[10px] text-gray-400 mt-1">Preencha para habilitar o botão Observação</p>
              )}
            </div>
    
            {/* Botões de ação */}
            <div className="flex gap-3">
              <button onClick={aprovarItem}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                <CheckSquare className="w-4 h-4"/>
                Aprovar Contrato
              </button>
              <button onClick={reprovarItem}
                disabled={!valMotivoRep.trim()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                  valMotivoRep.trim()
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}>
                <XSquare className="w-4 h-4"/>
                Reprovar Contrato
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
    )
  }



  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-6 h-6 text-blue-600"/>
          <span className="text-2xl font-bold text-blue-600">OpsDash</span>
          <span className="ml-auto text-[10px] text-gray-400 font-mono">v6.0</span>
        </div>
        <p className="text-xs text-gray-400 mb-6">Sistema de Gestão de Implantação</p>

        {loginErr && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 mb-4">Credenciais incorretas ou usuário inativo.</div>}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</label>
            <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="nome@empresa.com"
              className="w-full mt-1 px-3 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Senha</label>
            <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="••••••••"
              className="w-full mt-1 px-3 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
          </div>
          <button onClick={doLogin} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700">Entrar</button>
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Acesso rápido</p>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {users.filter(u=>u.ativo).slice(0,10).map(u => {
              const rm = ROLE_META[u.role]
              return (
                <button key={u.id} onClick={()=>{setUser(u);toast(`Bem-vindo, ${u.name.split(" ")[0]}!`,"green")}}
                  className="w-full flex items-center justify-between p-2.5 bg-gray-50 border rounded-lg hover:border-blue-400 text-left transition-colors">
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-[10px] text-gray-400">{rm.icon} {rm.label}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${rm.color}`}>{u.password}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )


  const rm = ROLE_META[user.role]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <nav className="w-56 min-h-screen bg-white border-r fixed top-0 left-0 bottom-0 p-4 flex flex-col overflow-y-auto z-50 shadow-sm">
        <div className="flex items-center gap-2 px-1 mb-0.5">
          <Layers className="w-5 h-5 text-blue-600"/>
          <span className="text-lg font-bold text-blue-600">OpsDash</span>
        </div>
        <p className="text-[10px] text-gray-400 px-1 font-mono mb-3">v6.0 · 2026</p>

        <div className="flex items-center gap-2 mb-4 p-2.5 bg-gray-50 border rounded-xl">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${rm.color}`}>
            {user.name.split(" ").slice(0,2).map(n=>n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user.name.split(" ").slice(0,2).join(" ")}</p>
            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium border ${rm.color}`}>{rm.label}</span>
          </div>
          <button onClick={doLogout} className="text-[10px] text-gray-400 hover:text-red-500 px-1.5 py-1 border rounded">Sair</button>
        </div>

        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-1 pb-1">Principal</p>
          <NavBtn icon={<LayoutDashboard className="w-3.5 h-3.5"/>} label="Dashboard" active={page==="dashboard"} onClick={()=>goPage("dashboard")} locked={!canAccess("dashboard")} />
          <NavBtn icon={<FolderOpen className="w-3.5 h-3.5"/>} label="Cadastros" active={page==="cadastros"} onClick={()=>goPage("cadastros")} locked={!canAccess("cadastros")} />
          <NavBtn icon={<Users className="w-3.5 h-3.5"/>} label="Clientes" active={page==="clientes"} onClick={()=>goPage("clientes")} locked={!canAccess("clientes")} badge={!isTecnico() ? (clients.length||undefined) : (clients.filter(c=>c.responsavel===user?.id).length||undefined)}/>{!isTecnico() && null}
          <NavBtn icon={<AlertTriangle className="w-3.5 h-3.5"/>} label="Alertas" active={page==="alertas"} onClick={()=>goPage("alertas")} locked={!canAccess("alertas")} badge={((isTecnico() ? alertCli.filter(c=>c.responsavel===user?.id).length : alertCli.length) + (isAdmin()?pendVal.length:0))||undefined}/>
          <NavBtn icon={<ClipboardList className="w-3.5 h-3.5"/>} label="Validação" active={page==="validacao"} onClick={()=>goPage("validacao")} locked={!canAccess("validacao")} badge={pendVal.length||undefined}/>

          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-3 pb-1">Departamentos</p>
          <NavBtn icon={<ShoppingCart className="w-3.5 h-3.5"/>} label="Comercial" active={page==="comercial"} onClick={()=>goPage("comercial")} locked={!canAccess("comercial")} />
          <NavBtn icon={<Wrench className="w-3.5 h-3.5"/>} label="Operações" active={page==="operacoes"} onClick={()=>goPage("operacoes")} locked={!canAccess("operacoes")} />
          <NavBtn icon={<ClipboardList className="w-3.5 h-3.5"/>} label="Atendimentos" active={page==="atendimentos"} onClick={()=>goPage("atendimentos")} locked={!canAccess("atendimentos")} />
          <NavBtn icon={<Users className="w-3.5 h-3.5"/>} label="Colaboradores" active={page==="colaboradores"} onClick={()=>goPage("colaboradores")} locked={!canAccess("colaboradores")} />
          <NavBtn icon={<Package className="w-3.5 h-3.5"/>} label="Produtos" active={page==="produtos"} onClick={()=>goPage("produtos")} locked={!canAccess("produtos")} />
          {FEATURES.comissoes && <NavBtn icon={<DollarSign className="w-3.5 h-3.5"/>} label="Comissoes" active={page==="comissoes"} onClick={()=>goPage("comissoes")} locked={!canAccess("comissoes")} />}
          <NavBtn icon={<Zap className="w-3.5 h-3.5"/>} label="Qualidade IA" active={page==="qualidade"} onClick={()=>goPage("qualidade")} locked={!canAccess("qualidade")} badge={analises.length||undefined}/>

          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-3 pb-1">Gestão Ops</p>
          <NavBtn icon={<Play className="w-3.5 h-3.5"/>} label="Fila de Execução" active={page==="fila_execucao"} onClick={()=>goPage("fila_execucao")} locked={!canAccess("fila_execucao")} badge={!isTecnico()&&filaExec.length||undefined}/>
          <NavBtn icon={<MessageCircle className="w-3.5 h-3.5"/>} label="Anotações" active={page==="anotacoes"} onClick={()=>goPage("anotacoes")} locked={!canAccess("anotacoes")} />
          <NavBtn icon={<RefreshCw className="w-3.5 h-3.5"/>} label="Conversoes" active={page==="conversoes"} onClick={()=>goPage("conversoes")} locked={!canAccess("conversoes")} badge={clients.filter(c=>['Em Andamento','Convertendo','Validando'].includes(getConversao(c.id).statusConversao)).length||undefined}/>

          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-3 pb-1">Administração</p>
          <NavBtn icon={<ClipboardList className="w-3.5 h-3.5"/>} label="Implantação" active={page==="implantacao"} onClick={()=>goPage("implantacao")} locked={!canAccess("implantacao")} />
          <NavBtn icon={<Shield className="w-3.5 h-3.5"/>} label="Permissões" active={page==="permissoes"} onClick={()=>goPage("permissoes")} locked={!canAccess("permissoes")} />
        </div>
      </nav>
      <main className="ml-56 flex-1 p-6 min-h-screen">
        {(page==="dashboard") && <PageDashboard/>}
        {page==="cadastros" && (
          <div className="space-y-5">
            <div className="flex items-end justify-between">
              <div><h1 className="text-2xl font-bold">Cadastros</h1><p className="text-sm text-gray-500">Contratos, validações, usuários e pacotes</p></div>
              <button onClick={()=>{setModalVal(true);setValStep(1)}} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
                <ClipboardList className="w-4 h-4"/> Novo Contrato para Validação
              </button>
            </div>

            {/* Abas */}
            <div className="flex gap-2 border-b pb-2 flex-wrap">
              {[
                { k:"validacao",  l:`Validação de Contratos${isAdmin()&&pendVal.length>0?` (${pendVal.length})`:""}` },
                { k:"em_observacao", l:`Observações${reprovados.length>0?` (${reprovados.length})`:""}` },
                { k:"pacotes",    l:"Pacotes & Promoções" },
                { k:"tabela_precos", l:"Tabela de Preços" },
                ...(isAdmin() ? [{ k:"usuarios", l:`Usuários (${users.length})` }] : []),
                ...(isAdmin() ? [{ k:"status_impl", l:"Status de Implantação" }] : []),
              ].map(t=>(
                <button key={t.k} onClick={()=>setCadTab(t.k)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${cadTab===t.k?"bg-blue-600 text-white":"text-gray-500 hover:bg-gray-100"}`}>
                  {t.l}
                </button>
              ))}
            </div>

            {/* ── Aba: Validação ── */}
            {cadTab==="validacao" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <KPI label="Aguardando" value={validacoes.filter(v=>v.status==="aguardando").length} c="amber"/>
                  <KPI label="Aprovados"  value={validacoes.filter(v=>v.status==="aprovado").length}  c="green"/>
                  <KPI label="Observações" value={reprovados.length} c="red"/>
                </div>

                {validacoes.length===0 ? (
                  <div className="bg-white border rounded-xl p-14 text-center">
                    <ClipboardList className="w-14 h-14 mx-auto text-gray-200 mb-4"/>
                    <h2 className="font-semibold text-gray-500">Nenhum contrato registrado</h2>
                    <p className="text-sm text-gray-400 mt-1">Clique em "Novo Contrato para Validação" para iniciar.</p>
                    <button onClick={()=>{setModalVal(true);setValStep(1)}} className="mt-4 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">Criar agora</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {validacoes.map(v=>{
                      const sm = VAL_STATUS[v.status]
                      return (
                        <div key={v.id} className={`bg-white rounded-xl border overflow-hidden ${v.status==="aguardando"?"border-amber-200":v.status==="aprovado"?"border-emerald-200":"border-red-200"}`}>
                          <div className={`px-5 py-3 flex items-center justify-between flex-wrap gap-2 ${v.status==="aguardando"?"bg-amber-50":v.status==="aprovado"?"bg-emerald-50":"bg-red-50"}`}>
                            <div className="flex items-center gap-2">
                              <span>{sm.icon}</span>
                              <span className="font-semibold text-sm">{v.razaoSocial}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sm.color}`}>{sm.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {v.status==="aguardando" && isAdmin() && (
                                <>
                                  <button onClick={()=>aprovarVal(v)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"><CheckSquare className="w-3.5 h-3.5"/> Aprovar</button>
                                  <button onClick={()=>setModalReprovar(v)} className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700"><XSquare className="w-3.5 h-3.5"/> Observação</button>
                                </>
                              )}
                              {v.status==="aprovado" && <span className="text-xs text-emerald-700">Aprovado por {v.validadoPor} em {v.validadoEm} · Na fila de execução</span>}
                            </div>
                          </div>
                          <div className="px-5 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div><p className="text-gray-400">CNPJ</p><p className="font-medium">{v.cnpj||"—"}</p></div>
                            <div><p className="text-gray-400">Pacote</p><p className="font-medium">{v.pacote}</p></div>
                            <div><p className="text-gray-400">Valor</p><p className="font-medium">R$ {Number(v.valorContrato||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}</p></div>
                            <div><p className="text-gray-400">Vendedor</p><p className="font-medium">{v.vendedor||"—"}</p></div>
                            <div><p className="text-gray-400">Criado por</p><p className="font-medium">{v.criadoPor}</p></div>
                            <div><p className="text-gray-400">Data</p><p className="font-medium">{v.criadoEm}</p></div>
                            {v.obs && <div className="col-span-2"><p className="text-gray-400">Obs</p><p className="font-medium">{v.obs}</p></div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Aba: Observações ── */}
            {cadTab==="em_observacao" && (
              <div className="space-y-3">
                {reprovados.length===0 ? (
                  <div className="bg-white border rounded-xl p-14 text-center">
                    <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-300 mb-4"/>
                    <p className="text-gray-500 font-medium">Nenhum contrato em observação</p>
                  </div>
                ) : reprovados.map(v=>(
                  <div key={v.id} className="bg-white border border-red-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
                      <div className="flex items-center gap-2"><XSquare className="w-4 h-4 text-red-600"/><span className="font-semibold text-sm">{v.razaoSocial}</span></div>
                      <span className="text-xs text-red-600">Em observação por {v.reprovadoPor} em {v.reprovadoEm}</span>
                    </div>
                    <div className="px-5 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div><p className="text-gray-400">Pacote</p><p className="font-medium">{v.pacote}</p></div>
                      <div><p className="text-gray-400">Valor</p><p className="font-medium">R$ {Number(v.valorContrato||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}</p></div>
                      <div><p className="text-gray-400">Vendedor</p><p className="font-medium">{v.vendedor||"—"}</p></div>
                      <div className="col-span-2 md:col-span-4">
                        <p className="text-gray-400">Motivo</p>
                        <p className="font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-1">{v.observacao}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Aba: Pacotes ── */}
            {cadTab==="pacotes" && (
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">Configure horas, valor por hora e promoções. O preço final é calculado automaticamente.</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map(pkg=>{
                    const isEd = editingPkg===pkg.id
                    if (isEd) return (
                      <div key={pkg.id} className="bg-white border-2 border-blue-500 rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between"><span className="font-semibold text-sm">{pkg.name}</span><span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Editando</span></div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Horas do pacote</label>
                          <input type="number" min={0} value={editPkgForm.horas} onChange={e=>setEditPkgForm(f=>({...f,horas:Number(e.target.value)}))}
                            className="w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Valor da hora (R$)</label>
                          <input type="number" min={0} step={0.01} value={editPkgForm.valorHora} onChange={e=>setEditPkgForm(f=>({...f,valorHora:Number(e.target.value)}))} placeholder="0,00"
                            className="w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                          <div><p className="text-xs font-semibold">Ativar desconto</p><p className="text-[10px] text-gray-400">% sobre o total</p></div>
                          <button onClick={()=>setEditPkgForm(f=>({...f,descAtivo:!f.descAtivo}))} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${editPkgForm.descAtivo?"bg-blue-600":"bg-gray-200"}`}>
                            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5 ${editPkgForm.descAtivo?"translate-x-5":""}`}/>
                          </button>
                        </div>
                        {editPkgForm.descAtivo && (
                          <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Percent className="w-3 h-3"/> Desconto (%)</label>
                            <input type="number" min={0} max={100} step={0.5} value={editPkgForm.descPct} onChange={e=>setEditPkgForm(f=>({...f,descPct:Number(e.target.value)}))}
                              className="w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
                          </div>
                        )}
                        {editPkgForm.valorHora > 0 && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-0.5">
                            <p className="text-gray-500">Bruto: <span className="font-semibold">R$ {fmtR(editPkgForm.horas*editPkgForm.valorHora)}</span></p>
                            {editPkgForm.descAtivo && editPkgForm.descPct>0 && <p className="text-gray-500">Desconto: <span className="font-semibold text-red-500">-{editPkgForm.descPct}%</span></p>}
                            <p className="text-sm font-bold text-emerald-700">Final: R$ {fmtR(editPkgForm.horas*editPkgForm.valorHora*(editPkgForm.descAtivo&&editPkgForm.descPct>0?(1-editPkgForm.descPct/100):1))}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button onClick={savePkg} className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Save className="w-3.5 h-3.5"/> Salvar</button>
                          <button onClick={()=>setEditingPkg(null)} className="px-4 py-2.5 border rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
                        </div>
                      </div>
                    )
                    const preco = pkgPreco(pkg)
                    return (
                      <div key={pkg.id} className="bg-white border rounded-xl p-5 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold">{pkg.name}</p>
                          <button onClick={()=>{setEditingPkg(pkg.id);setEditPkgForm({...pkg})}} className="flex items-center gap-1 px-2.5 py-1 border rounded-lg text-[10px] text-gray-500 hover:border-blue-400 hover:text-blue-600"><Edit2 className="w-3 h-3"/> Editar</button>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between"><span className="text-gray-500">Horas</span><span className="font-semibold">{pkg.horas}h</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Valor/hora</span><span className="font-semibold">{pkg.valorHora>0?`R$ ${fmtR(pkg.valorHora)}`:"-"}</span></div>
                          {pkg.valorHora>0 && pkg.horas>0 && (
                            <>
                              <div className="flex justify-between"><span className="text-gray-500">Bruto</span><span className="font-semibold text-gray-700">R$ {fmtR(pkg.horas*pkg.valorHora)}</span></div>
                              {pkg.descAtivo && pkg.descPct>0 && <div className="flex justify-between"><span className="text-gray-500">Desconto</span><span className="font-semibold text-red-500">-{pkg.descPct}%</span></div>}
                              <div className="flex justify-between pt-1 border-t"><span className="font-bold">Preço final</span><span className="text-lg font-bold text-emerald-600">R$ {fmtR(preco)}</span></div>
                            </>
                          )}
                        </div>
                        {pkg.descAtivo && pkg.descPct>0 && <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg"><Percent className="w-3 h-3 text-amber-600"/><span className="text-[10px] text-amber-700 font-semibold">Promoção ativa: {pkg.descPct}% off</span></div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Aba: Tabela de Preços ── */}
            {(cadTab==="tabela_precos") && _render5353()}

            {/* ── Aba: Usuários (só admin) ── */}
            {cadTab==="usuarios" && isAdmin() && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{users.length} usuários cadastrados</p>
                  <button onClick={()=>setModalNewUser(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                    <UserPlus className="w-4 h-4"/> Novo Usuário
                  </button>
                </div>
                <div className="bg-white border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="bg-gray-50 border-b">{["Nome","E-mail","Perfil","Status","Ações"].map(h=><th key={h} className="px-4 py-2 text-left text-[10px] uppercase text-gray-400 font-semibold">{h}</th>)}</tr></thead>
                    <tbody>
                      {users.map(u=>{
                        const urm = ROLE_META[u.role]
                        return (
                          <tr key={u.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">{u.email}</td>
                            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${urm?.color||"bg-gray-100 text-gray-600"}`}>{urm?.icon} {urm?.label}</span></td>
                            <td className="px-4 py-3">
                              <button onClick={()=>u.id!==user.id&&toggleUserAtivo(u.id)} className={`flex items-center gap-1 text-xs font-medium ${u.ativo?"text-emerald-600":"text-gray-400"} ${u.id===user.id?"opacity-40 cursor-not-allowed":""}`}>
                                {u.ativo ? <><ToggleRight className="w-4 h-4"/> Ativo</> : <><ToggleLeft className="w-4 h-4"/> Inativo</>}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={()=>setModalEditUser({...u})} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><Edit2 className="w-3.5 h-3.5"/></button>
                                {u.id !== user.id && <button onClick={()=>excluirUser(u.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        {page==="clientes" && !selClient && (
          <PageClientes 
            clients={clients}
            showConcluidos={showConcluidos}
            setShowConcluidos={setShowConcluidos}
            isFinalizado={isFinalizado}
            isTecnico={isTecnico}
            isExecMgr={isExecMgr}
            user={user}
            search={search}
            setSearch={setSearch}
            goPage={goPage}
            setCadTab={setCadTab}
            setModalAnot={setModalAnot}
            setModalImpl={setModalImpl}
            setImplForm={setImplForm}
            setSelClient={setSelClient}
            anotacoes={anotacoes}
            pBar={pBar}
            clientSitBadge={clientSitBadge}
          />
        )}

        {/* ── Cliente detalhe ── */}
        {page==="clientes" && selClient && (
          <div className="space-y-5">
            <button onClick={()=>setSelClient(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft className="w-4 h-4"/> Voltar</button>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div><h1 className="text-xl font-bold">{selClient.name}</h1><p className="text-sm text-gray-500">{selClient.id} · {selClient.pacote} · Criado em {selClient.criadoEm}</p></div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Etapa 5: status atual com cor dinamica */}
                {(() => {
                  const sid = statusAtual(selClient.id)
                  const statusObj = STATUS_LIST.find(s => s.id === sid)
                  if (!statusObj) return <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">Sem status</span>
                  const c = statusColor(sid)
                  return <span className={`px-3 py-1 rounded-lg text-xs font-medium ${c.bg} ${c.text}`}>{statusObj.nome}</span>
                })()}
                {isExecMgr() && !selClient.responsavel && <button onClick={()=>{setModalExec(selClient)}} className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700"><Play className="w-3 h-3"/> Atribuir Tecnico</button>}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border rounded-xl p-5">
                  <h3 className="font-semibold mb-4 text-sm">Etapas de Implantação</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Etapas removidas — use o painel Implantação para acompanhar status */}
                    {STATUS_LIST.map(s => {
                      const sid = statusAtual(selClient.id)
                      const ativo = sid === s.id
                      const passado = sid !== null && s.id < sid
                      const c = statusColor(s.id)
                      return (
                        <div key={s.id} className="text-center">
                          <div className={`mx-auto w-6 h-6 rounded-full flex items-center justify-center text-[10px] mb-1
                            ${ativo ? `${c.bg} ${c.text} ring-2 ring-offset-1 ring-blue-400` : passado ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                            {passado ? '✓' : s.id}
                          </div>
                          <p className="text-[9px] text-gray-500 max-w-[50px] leading-tight">{s.nome.replace('Pré-boarding ','PB-')}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ── Etapa 5: Primeiro Contato (card aprimorado) ── */}
                {(selClient.dataPrimeiroContato || selClient.observacoesIniciais) && (
                  <div className="bg-white border rounded-xl p-5">
                    <h3 className="font-semibold mb-3 text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2"><span>📞</span> Primeiro Contato</span>
                      {/* Badge de origem */}
                      {selClient.origem && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ` +
                          (selClient.origem === 'importacao'  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                           selClient.origem === 'comercial'   ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                                'bg-gray-50 text-gray-600 border-gray-200')}>
                          {selClient.origem === 'importacao' ? '📥 Importação'
                           : selClient.origem === 'comercial' ? '🛒 Comercial'
                           : '✏️ Manual'}
                        </span>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {selClient.dataPrimeiroContato && (
                        <div>
                          <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5 text-[10px]">Data</p>
                          <p className="text-gray-800 font-semibold">{selClient.dataPrimeiroContato}</p>
                        </div>
                      )}
                      {selClient.responsavelPrimeiroContato && (
                        <div>
                          <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5 text-[10px]">Responsável</p>
                          <p className="text-gray-800 font-semibold">
                            {selClient.responsavelPrimeiroContato === 'sistema'
                              ? '⚙️ Sistema'
                              : SEED_USERS.find(u=>u.id===selClient.responsavelPrimeiroContato)?.name?.split(' ')[0]
                                || selClient.responsavelPrimeiroContato}
                          </p>
                        </div>
                      )}
                      {selClient.criadoPor && (
                        <div>
                          <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5 text-[10px]">Criado por</p>
                          <p className="text-gray-600">{selClient.criadoPor}</p>
                        </div>
                      )}
                      {selClient.criadoEm && (
                        <div>
                          <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5 text-[10px]">Criado em</p>
                          <p className="text-gray-600">{selClient.criadoEm}</p>
                        </div>
                      )}
                      {selClient.observacoesIniciais && (
                        <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <p className="text-amber-600 font-semibold mb-0.5 text-[10px] uppercase tracking-wide">Observações Iniciais</p>
                          <p className="text-amber-800">{selClient.observacoesIniciais}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Timeline de Status (novo modelo) ── */}
                {_render5681()}
                <div className="bg-white border rounded-xl p-5">
                  <h3 className="font-semibold mb-3 text-sm">Progresso</h3>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2"><div className={`h-full rounded-full ${selClient.pct>=70?"bg-emerald-500":selClient.pct>=30?"bg-amber-500":"bg-red-500"}`} style={{width:`${selClient.pct}%`}}/></div>
                  <div className="flex justify-between text-xs text-gray-500"><span>Início: {selClient.inicio||"—"}</span><span className="font-bold">{selClient.pct}%</span><span>Pacote: {selClient.pacote||"—"}</span></div>
                </div>
                <div className="bg-white border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-sm">Anotações</h3><button onClick={()=>setModalAnot(selClient.id)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium"><Plus className="w-3 h-3"/> Adicionar</button></div>
                  {(anotacoes[selClient.id]||[]).length===0 ? <p className="text-sm text-gray-400 text-center py-4">Sem anotações</p> :
                    (anotacoes[selClient.id]||[]).slice(-4).map(a=>{const tm=ANOT_TIPOS[a.tipo]; return(
                      <div key={a.id} className="p-3 bg-gray-50 rounded-lg flex items-start gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 mt-0.5 ${tm?.color||""}`}>{tm?.icon} {a.tipo}</span>
                        <div className="flex-1 min-w-0"><p className="text-xs font-medium">{a.subtipo}</p><p className="text-xs text-gray-600 truncate">{a.texto}</p></div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{a.data}</span>
                      </div>
                    )})
                  }
                </div>
              </div>
              <div className="bg-white border rounded-xl p-5 flex flex-col">
                <h3 className="font-semibold mb-3 text-sm">Informações</h3>
                <div className="space-y-2 text-xs mb-4">
                  {[["CNPJ",selClient.cnpj],["E-mail",selClient.email],["Telefone",selClient.telefone],["Cidade/UF",`${selClient.cidade||"—"}/${selClient.estado||"—"}`],["Vendedor",selClient.vendedor],["Valor",selClient.valorContrato?`R$ ${Number(selClient.valorContrato).toLocaleString("pt-BR",{minimumFractionDigits:2})}`:"—"],["Criado por",selClient.criadoPor]].map(([l,v])=>(
                    <div key={l} className="flex justify-between py-1.5 border-b last:border-0"><span className="text-gray-400">{l}</span><span className="font-medium">{v||"—"}</span></div>
                  ))}
                </div>
                <h3 className="font-semibold mb-3 text-sm mt-2">Questionamentos</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-3 flex-1">
                  {(messages[selClient.id]||[]).length===0 ? <p className="text-xs text-gray-400 text-center py-4">Sem mensagens</p> :
                    (messages[selClient.id]||[]).map(m=>(
                      <div key={m.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700 flex-shrink-0">{m.from.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-2"><p className="text-[9px] text-gray-400">{m.from} · {m.date}</p><p className="text-xs">{m.text}</p></div>
                      </div>
                    ))
                  }
                </div>
                <div className="flex gap-2">
                  <input id="msgInput" type="text" placeholder="Mensagem..." className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){const msg={id:Date.now().toString(),from:user.name,text:e.target.value,date:nowDate()};setMessages(p=>({...p,[selClient.id]:[...(p[selClient.id]||[]),msg]}));e.target.value=""}}}/>
                  <button onClick={()=>{const i=document.getElementById("msgInput");if(i?.value?.trim()){const msg={id:Date.now().toString(),from:user.name,text:i.value,date:nowDate()};setMessages(p=>({...p,[selClient.id]:[...(p[selClient.id]||[]),msg]}));i.value=""}}} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Send className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          </div>
        )}
        {(page==="alertas") && <PageAlertas/>}

        {/* ═════════ FILA EXECUÇÃO ═════════ */}
        {page==="fila_execucao" && (
          <div className="space-y-5">
            <div><h1 className="text-2xl font-bold">Fila de Execução</h1><p className="text-sm text-gray-500">Contratos aprovados aguardando atribuição técnica</p></div>
            <div className="grid grid-cols-3 gap-4">
              <KPI label="Aguardando" value={filaExec.length} c="violet"/>
              <KPI label="Em execução" value={clients.filter(c=>!isFinalizado(c.id)).length} c="green"/>
              <KPI label="Responsáveis" value={EXEC_RESPONSAVEIS.length} c="teal"/>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3">Responsáveis disponíveis</h3>
              <div className="grid grid-cols-2 gap-4">
                {EXEC_RESPONSAVEIS.map(resp=>{
                  const carga = clients.filter(c=>c.responsavel===resp.id&&!isFinalizado(c.id)).length
                  return (
                    <div key={resp.id} className="flex items-center gap-3 p-4 border rounded-xl bg-gray-50">
                      <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">{resp.iniciais}</div>
                      <div className="flex-1"><p className="font-semibold text-sm">{resp.nome}</p><p className="text-xs text-gray-400">{ROLE_META[users.find(u=>u.id===resp.id)?.role||"root"]?.label}</p></div>
                      <div className={`px-3 py-1.5 rounded-xl text-sm font-bold ${carga<=5?"bg-emerald-100 text-emerald-700":carga<=10?"bg-amber-100 text-amber-700":"bg-red-100 text-red-600"}`}>{carga} ativos</div>
                    </div>
                  )
                })}
              </div>
            </div>
            {filaExec.length===0 ? (
              <div className="bg-white border rounded-xl p-14 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4"/>
                <p className="font-semibold text-gray-600">Fila vazia!</p>
                <p className="text-sm text-gray-400">Todos os contratos foram atribuídos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filaExec.filter(c => isTecnico() ? c.responsavel === user?.id : true).map((c,idx)=>(
                  <div key={`fila-${c.id}-${idx}`} className="bg-white border rounded-xl p-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">{idx+1}</div>
                    <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{c.name}</p><p className="text-xs text-gray-400">{c.pacote} · Na fila desde {c.execEm}</p></div>
                    {clientSitBadge(c.id)}
                    {isExecMgr() && <button onClick={()=>setModalExec(c)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"><User className="w-3 h-3"/> Atribuir</button>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═════════ ANOTAÇÕES ═════════ */}
        {page==="anotacoes" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Central de Anotacoes</h1>
              {isAdmin() && (
                <button
                  onClick={() => setModalImportProd(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4"/>
                  Importar Produtividade
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(ANOT_TIPOS).map(([tipo,meta])=>{
                const total = Object.values(anotacoes).flat().filter(a=>a.tipo===tipo).length
                return <div key={tipo} className={`rounded-xl p-3 border ${meta.color} flex items-center gap-3`}><span className="text-xl">{meta.icon}</span><div><p className="text-xs font-semibold">{tipo}</p><p className="text-lg font-bold">{total}</p></div></div>
              })}
            </div>
            {Object.values(anotacoes).flat().length===0 ? (
              <div className="bg-white border rounded-xl p-14 text-center"><MessageCircle className="w-14 h-14 mx-auto text-gray-200 mb-4"/><p className="text-gray-500">Nenhuma anotação registrada</p></div>
            ) : (
              <div className="space-y-3">
                {clients.filter(c=>{
                  if (isTecnico() && c.responsavel !== user?.id) return false
                  return (anotacoes[c.id]||[]).length > 0
                }).map(c=>{
                  const lista = anotacoes[c.id]||[]
                  return (
                    <div key={`anot-${c.id}`} className="bg-white border rounded-xl overflow-hidden">
                      <button onClick={()=>setModalAnot(c.id)} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 text-left">
                        <div className="flex-1"><p className="font-medium text-sm">{c.name}</p><p className="text-xs text-gray-400">{c.id}</p></div>
                        <div className="flex items-center gap-2">
                          {[...new Set(lista.map(a=>a.tipo))].slice(0,3).map(t=><span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${ANOT_TIPOS[t]?.color}`}>{ANOT_TIPOS[t]?.icon} {t}</span>)}
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-medium">{lista.length}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400"/>
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ═════════ VALIDAÇÃO DE CONTRATOS ═════════ */}
        {(page==="validacao") && <PageValidacao/>}
        {(page==="qualidade") && <PageQualidade/>}

        {/* ═════════ PERMISSÕES ═════════ */}
        {page==="permissoes" && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold">Permissões</h1>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              As permissões definem quais páginas cada perfil pode acessar. Root, Admin e Diretor têm acesso irrestrito.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full bg-white border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-[10px] uppercase text-gray-400 font-semibold">Página</th>
                    {Object.entries(ROLE_META).map(([role,meta])=>(
                      <th key={role} className="px-3 py-3 text-center text-[10px] uppercase font-semibold">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${meta.color}`}>{meta.icon}</span>
                        <p className="mt-1 normal-case text-gray-500 font-normal">{meta.label.split(" ")[0]}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_PAGES.map(pg=>(
                    <tr key={pg} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-sm capitalize font-medium">{pg.replace("_"," ")}</td>
                      {Object.entries(ROLE_META).map(([role,meta])=>(
                        <td key={role} className="px-3 py-2.5 text-center">
                          {meta.pages.includes(pg)
                            ? <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-100 text-emerald-600 text-[10px] font-bold">✓</span>
                            : <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100 text-gray-300 text-[10px]">—</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═════════ COMERCIAL — VALIDAÇÃO COMERCIAL ═════════ */}
        {(page==="comercial") && <PageComercial/>}

        {/* ═════════ OPERAÇÕES ═════════ */}
        {(page==="operacoes") && <PageOperacoes/>}

        {/* ═════════ ATENDIMENTOS / IMPLANTAÇÕES ═════════ */}
        {(page==="atendimentos") && <PageAtendimentos/>}
        {(page==="colaboradores") && <PageColaboradores/>}
        {page==="produtos" && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold">Produtos</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map(pkg=>{
                const preco = pkgPreco(pkg)
                return (
                  <div key={pkg.id} className="bg-white border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold">{pkg.name}</p>
                      {canAccess("cadastros") && <button onClick={()=>{goPage("cadastros");setCadTab("pacotes")}} className="text-[10px] text-blue-600 hover:underline">Editar</button>}
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Horas</span><span className="font-semibold">{pkg.horas}h</span></div>
                      {pkg.valorHora>0 && <div className="flex justify-between"><span className="text-gray-500">Valor/hora</span><span>R$ {fmtR(pkg.valorHora)}</span></div>}
                      {preco>0 && <div className="flex justify-between pt-1 border-t"><span className="font-bold">Preço</span><span className="font-bold text-emerald-600">R$ {fmtR(preco)}</span></div>}
                    </div>
                    {pkg.descAtivo && pkg.descPct>0 && <div className="mt-2 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-700 font-medium">-{pkg.descPct}% promoção ativa</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═════════ COMISSÕES ═════════ */}
        {(page==="comissoes") && <PageComissoes/>}
        {(page==="implantacao") && <PageImplantacao/>}
        {(page==="conversoes") && <PageConversao/>}

      </main>

      {/* ══════════ MODAL: GESTÃO DE IMPLANTAÇÃO ══════════ */}
      {(modalImpl) && <ModalImpl/>}

      {/* ══════════ MODAL: ANOTAÇÕES ══════════ */}
      {(modalAnot) && <ModalAnot/>}

      {/* ══════════ MODAL: IMPORTAR PRODUTIVIDADE ══════════ */}
      {modalImportProd && (
        <Modal onClose={() => { setModalImportProd(false); setImportResult(null); setImportPreview(null) }} maxW="max-w-4xl">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-bold flex items-center gap-2"><Upload className="w-5 h-5 text-blue-600"/> Importar Produtividade</h2>
            <button onClick={() => { setModalImportProd(false); setImportResult(null); setImportPreview(null) }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4"/></button>
          </div>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Instrucoes */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">Colunas esperadas (CSV ou XLSX):</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span><strong>Numero</strong> - SGD ID</span>
                <span><strong>Data de entrada</strong> - Data</span>
                <span><strong>Cliente</strong> - Nome</span>
                <span><strong>Produto / Modulo</strong></span>
                <span><strong>Tipo</strong> - Acao</span>
                <span><strong>Responsavel</strong></span>
                <span><strong>Situacao</strong></span>
                <span><strong>Tempo Realizado</strong> - Horas</span>
                <span><strong>Local do Treinamento</strong></span>
              </div>
            </div>

            {/* Upload area */}
            {!importPreview && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    
                    try {
                      const text = await file.text()
                      const lines = text.split('\n').filter(l => l.trim())
                      if (lines.length < 2) {
                        toast('Arquivo vazio ou sem dados', 'red')
                        return
                      }
                      
                      // Parse header - handle various delimiters
                      const delimiter = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ','
                      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''))
                      
                      // Map columns
                      const colMap = {
                        numero: headers.findIndex(h => h.toLowerCase().includes('numero') || h.toLowerCase().includes('sgd')),
                        data: headers.findIndex(h => h.toLowerCase().includes('data')),
                        cliente: headers.findIndex(h => h.toLowerCase().includes('cliente')),
                        produto: headers.findIndex(h => h.toLowerCase().includes('produto') || h.toLowerCase().includes('modulo')),
                        tipo: headers.findIndex(h => h.toLowerCase() === 'tipo'),
                        responsavel: headers.findIndex(h => h.toLowerCase().includes('responsavel')),
                        situacao: headers.findIndex(h => h.toLowerCase().includes('situacao') || h.toLowerCase().includes('situação')),
                        tempo: headers.findIndex(h => h.toLowerCase().includes('tempo') || h.toLowerCase().includes('hora')),
                        local: headers.findIndex(h => h.toLowerCase().includes('local'))
                      }
                      
                      // Parse rows
                      const rows = []
                      const errors = []
                      
                      for (let i = 1; i < Math.min(lines.length, 501); i++) {
                        const cells = lines[i].split(delimiter).map(c => c.trim().replace(/"/g, ''))
                        const clienteNome = colMap.cliente !== -1 ? cells[colMap.cliente] : ''
                        
                        // Validate
                        let rowErrors = []
                        if (!clienteNome) rowErrors.push('Cliente vazio')
                        
                        // Find client
                        const cliente = clients.find(c => 
                          c.name?.toLowerCase().includes(clienteNome.toLowerCase()) ||
                          clienteNome.toLowerCase().includes(c.name?.toLowerCase()?.slice(0, 15))
                        )
                        if (clienteNome && !cliente) rowErrors.push('Cliente nao encontrado')
                        
                        // Parse time "01h 27min." to decimal
                        let tempoRaw = colMap.tempo !== -1 ? cells[colMap.tempo] : ''
                        let horasDecimal = 0
                        if (tempoRaw) {
                          const match = tempoRaw.match(/(\d+)h\s*(\d+)?/i)
                          if (match) {
                            horasDecimal = parseInt(match[1]) + (parseInt(match[2] || 0) / 60)
                          } else if (!isNaN(parseFloat(tempoRaw))) {
                            horasDecimal = parseFloat(tempoRaw)
                          }
                        }
                        
                        // Map tipo
                        const tipoRaw = colMap.tipo !== -1 ? cells[colMap.tipo] : ''
                        let subtipo = 'Checkpoint'
                        if (tipoRaw.toLowerCase().includes('treinamento')) subtipo = 'Treinamento'
                        else if (tipoRaw.toLowerCase().includes('suporte')) subtipo = 'Retrabalho'
                        else if (tipoRaw.toLowerCase().includes('atendimento')) subtipo = 'Checkpoint'
                        
                        rows.push({
                          linha: i + 1,
                          numero: colMap.numero !== -1 ? cells[colMap.numero] : '',
                          data: colMap.data !== -1 ? cells[colMap.data] : '',
                          clienteNome,
                          clienteId: cliente?.id,
                          produto: colMap.produto !== -1 ? cells[colMap.produto] : '',
                          tipo: tipoRaw,
                          subtipo,
                          responsavel: colMap.responsavel !== -1 ? cells[colMap.responsavel] : '',
                          situacao: colMap.situacao !== -1 ? cells[colMap.situacao] : '',
                          tempo: tempoRaw,
                          horasDecimal,
                          local: colMap.local !== -1 ? cells[colMap.local] : '',
                          errors: rowErrors,
                          valid: rowErrors.length === 0 && !!cliente
                        })
                        
                        if (rowErrors.length > 0) {
                          errors.push({ linha: i + 1, erros: rowErrors })
                        }
                      }
                      
                      setImportPreview({ headers, rows, errors, colMap, delimiter })
                      
                    } catch (err) {
                      toast(`Erro ao ler arquivo: ${err.message}`, 'red')
                    }
                  }}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-gray-300 mb-3"/>
                  <p className="text-gray-600 font-medium">Clique para selecionar arquivo</p>
                  <p className="text-xs text-gray-400 mt-1">CSV ou XLSX (max 500 linhas)</p>
                </label>
              </div>
            )}

            {/* Preview Table */}
            {importPreview && !importResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{importPreview.rows.length} linhas encontradas</span>
                    <span className="text-sm text-emerald-600">{importPreview.rows.filter(r => r.valid).length} validas</span>
                    <span className="text-sm text-red-600">{importPreview.errors.length} com erros</span>
                  </div>
                  <button onClick={() => setImportPreview(null)} className="text-sm text-gray-500 hover:text-gray-700">
                    Escolher outro arquivo
                  </button>
                </div>
                
                <div className="border rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-2 py-2 text-left font-medium text-gray-500">Linha</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-500">SGD</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-500">Data</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-500">Cliente</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-500">Tipo</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-500">Tempo</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {importPreview.rows.slice(0, 50).map((row, i) => (
                        <tr key={i} className={row.valid ? 'bg-white' : 'bg-red-50'}>
                          <td className="px-2 py-1.5 text-gray-400">{row.linha}</td>
                          <td className="px-2 py-1.5">{row.numero || '-'}</td>
                          <td className="px-2 py-1.5">{row.data || '-'}</td>
                          <td className="px-2 py-1.5 max-w-[150px] truncate" title={row.clienteNome}>{row.clienteNome || '-'}</td>
                          <td className="px-2 py-1.5">{row.subtipo}</td>
                          <td className="px-2 py-1.5">{row.horasDecimal > 0 ? `${row.horasDecimal.toFixed(2)}h` : '-'}</td>
                          <td className="px-2 py-1.5">
                            {row.valid ? (
                              <span className="text-emerald-600">OK</span>
                            ) : (
                              <span className="text-red-600" title={row.errors.join(', ')}>{row.errors.join(', ')}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {importPreview.rows.length > 50 && (
                  <p className="text-xs text-gray-400 text-center">Mostrando 50 de {importPreview.rows.length} linhas</p>
                )}
              </div>
            )}

            {/* Result */}
            {importResult && (
              <div className={`rounded-xl p-4 border ${importResult.loading ? 'bg-blue-50 border-blue-200' : importResult.success > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                {importResult.loading ? (
                  <p className="text-blue-700 font-medium flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin"/> Processando {importResult.current || 0} de {importResult.total}...
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm"><strong>Total:</strong> {importResult.total} linhas</span>
                      <span className="text-sm text-emerald-700"><strong>Importados:</strong> {importResult.success}</span>
                      <span className="text-sm text-red-700"><strong>Erros:</strong> {importResult.errors}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setModalImportProd(false); setImportResult(null); setImportPreview(null) }} className="flex-1 py-2.5 border rounded-lg text-sm hover:bg-gray-50">
                {importResult ? 'Fechar' : 'Cancelar'}
              </button>
              {importPreview && !importResult && (
                <button
                  onClick={async () => {
                    const validRows = importPreview.rows.filter(r => r.valid)
                    if (validRows.length === 0) {
                      toast('Nenhuma linha valida para importar', 'red')
                      return
                    }
                    
                    setImportResult({ loading: true, total: validRows.length, current: 0, success: 0, errors: 0 })
                    
                    let success = 0
                    let errors = 0
                    
                    for (let i = 0; i < validRows.length; i++) {
                      const row = validRows[i]
                      setImportResult(prev => ({ ...prev, current: i + 1 }))
                      
                      try {
                        // Build observacao from produto + situacao
                        let obs = ''
                        if (row.produto) obs += row.produto
                        if (row.situacao) obs += (obs ? ' - ' : '') + row.situacao
                        if (row.local) obs += (obs ? ' | ' : '') + row.local
                        
                        // Format hours
                        const h = Math.floor(row.horasDecimal)
                        const m = Math.round((row.horasDecimal - h) * 60)
                        const horasText = row.horasDecimal > 0 ? `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}min` : ''
                        
                        // Build texto
                        let texto = ''
                        if (row.numero) texto += `[SGD #${row.numero}] `
                        texto += row.subtipo
                        if (horasText) texto += ` - ${horasText}`
                        if (obs) texto += `. ${obs}`
                        
                        // Create annotation
                        const novaAnot = {
                          id: `imp_${Date.now()}_${i}`,
                          tipo: 'T&I',
                          subtipo: row.subtipo,
                          texto: texto.trim(),
                          autor: row.responsavel || user.name,
                          autorId: user.id,
                          data: row.data || nowDT(),
                          sgd: !!row.numero,
                          horasDecimal: row.horasDecimal
                        }
                        
                        // Add annotation to state
                        setAnotacoes((p) => ({...p, [row.clienteId]: [...(p[row.clienteId]||[]), novaAnot]}))
                        
                        // Update phases based on subtipo (integration with salvarAcao logic)
                        const hoje = new Date().toISOString().split('T')[0]
                        if (row.subtipo === 'Treinamento') {
                          setFaseCliente(row.clienteId, { onboardingStatus: 'Realizado', dataOnboarding: hoje })
                        } else if (row.subtipo === 'Checkpoint') {
                          const fase = getFaseCliente(row.clienteId)
                          if (fase.check1Status !== 'Realizado') {
                            setFaseCliente(row.clienteId, { check1Status: 'Realizado', dataCheck1: hoje })
                          } else if (fase.check2Status !== 'Realizado') {
                            setFaseCliente(row.clienteId, { check2Status: 'Realizado', dataCheck2: hoje })
                          }
                        } else if (row.subtipo === 'Retrabalho') {
                          setFaseCliente(row.clienteId, { check1Status: 'Risco' })
                        }
                        
                        success++
                      } catch (err) {
                        errors++
                      }
                      
                      // Small delay to prevent UI freeze
                      if (i % 10 === 0) await new Promise(r => setTimeout(r, 10))
                    }
                    
                    setImportResult({ loading: false, total: validRows.length, success, errors })
                    if (success > 0) toast(`${success} acoes importadas com sucesso!`, 'green')
                  }}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Importar {importPreview.rows.filter(r => r.valid).length} linhas validas
                </button>
              )}
              {!importPreview && !importResult && (
                <a 
                  href="data:text/csv;charset=utf-8,Numero;Data de entrada;Cliente;Produto / Modulo;Tipo;Responsavel;Situacao;Tempo Realizado;Local do Treinamento%0A12345;01/04/2026;EMPRESA TESTE LTDA;Dominio Plus;Treinamento;Joao Silva;Concluido;01h 30min.;Remoto"
                  download="modelo_produtividade.csv"
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 text-center"
                >
                  Baixar Modelo
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ══════════ MODAL: FILA EXECUÇÃO ══════════ */}
      {modalExec && (
        <Modal onClose={()=>setModalExec(null)} maxW="max-w-md">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-bold flex items-center gap-2"><Play className="w-5 h-5 text-violet-600"/> Atribuir Execução</h2>
            <button onClick={()=>setModalExec(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4"/></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg border"><p className="font-medium text-sm">{modalExec.name}</p><p className="text-xs text-gray-500">{modalExec.pacote}</p></div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Responsável</label>
              <div className="space-y-2">
                {EXEC_RESPONSAVEIS.map(resp=>{
                  const carga = clients.filter(c=>c.responsavel===resp.id&&!isFinalizado(c.id)).length
                  return (
                    <button key={resp.id} onClick={()=>setExecResp(resp.id)} className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${execResp===resp.id?"border-blue-500 bg-blue-50":"border-gray-200 hover:border-blue-300"}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">{resp.iniciais}</div>
                        <div className="text-left"><p className="font-semibold text-sm">{resp.nome}</p><p className="text-[10px] text-gray-400">{ROLE_META[users.find(u=>u.id===resp.id)?.role||"root"]?.label}</p></div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${carga<=5?"bg-emerald-100 text-emerald-700":carga<=10?"bg-amber-100 text-amber-700":"bg-red-100 text-red-600"}`}>{carga} contratos</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-3 p-5 border-t">
            <button onClick={()=>setModalExec(null)} className="flex-1 py-2.5 border rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
            <button onClick={atribuirExec} disabled={!execResp} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40">Atribuir</button>
          </div>
        </Modal>
      )}

      {/* ══════════ MODAL: NOVA VALIDAÇÃO ══════════ */}
      {modalVal && (
        <Modal onClose={()=>{ setModalVal(false); setValStep(1); setValForm({ razaoSocial: '', cnpj: '', email: '', telefone: '', cidade: '', estado: '', vendedor: '', pacote: '', valorContrato: '', dataAssinatura: '', obs: '' }) }}>
          <div className="flex items-center justify-between p-5 border-b bg-amber-50">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2"><ClipboardList className="w-5 h-5 text-amber-600"/> Validacao de Contrato</h2>
              <p className="text-xs text-gray-500 mt-0.5">Etapa {valStep} de 2</p>
            </div>
            <button onClick={()=>{ setModalVal(false); setValStep(1); setValForm({ razaoSocial: '', cnpj: '', email: '', telefone: '', cidade: '', estado: '', vendedor: '', pacote: '', valorContrato: '', dataAssinatura: '', obs: '' }) }} className="p-2 hover:bg-amber-100 rounded-lg"><X className="w-4 h-4"/></button>
          </div>
          <div className="flex p-4 border-b bg-gray-50 gap-2">
            {[1,2].map(s=>(
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${valStep>=s?"bg-amber-500 text-white":"bg-gray-200 text-gray-500"}`}>{s}</div>
                <span className={`text-xs ${valStep>=s?"font-medium":"text-gray-400"}`}>{s===1?"Dados da Empresa":"Dados Comerciais"}</span>
                {s<2 && <div className={`flex-1 h-0.5 ${valStep>s?"bg-amber-500":"bg-gray-200"}`}/>}
              </div>
            ))}
          </div>
          <div className="p-6 space-y-4">
            {valStep===1 && (
              <div className="grid grid-cols-2 gap-4">
                {[["Razao Social *","razaoSocial","EMPRESA LTDA"],["CNPJ","cnpj","00.000.000/0000-00"],["E-mail","email","contato@empresa.com"],["Telefone","telefone","(00) 00000-0000"]].map(([l,k,ph])=>(
                  <div key={k}>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">{l}</label>
                    <input value={valForm?.[k] || ''} onChange={e=>setValForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}
                      className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-amber-500 ${k==="razaoSocial"&&!valForm?.razaoSocial?"border-orange-300":""}`}/>
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Cidade</label>
                  <input value={valForm?.cidade || ''} onChange={e=>setValForm(f=>({...f,cidade:e.target.value}))} placeholder="Ex: Maraba"
                    className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-amber-500"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Estado</label>
                  <select value={valForm?.estado || ''} onChange={e=>setValForm(f=>({...f,estado:e.target.value}))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-amber-500">
                    <option value="">-</option>
                    <option value="PA">PA</option>
                    <option value="TO">TO</option>
                  </select>
                </div>
              </div>
            )}
            {valStep===2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Vendedor responsavel</label>
                  <select value={valForm?.vendedor || ''} onChange={e=>setValForm(f=>({...f,vendedor:e.target.value}))} className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-amber-500">
                    <option value="">Selecione</option>
                    {users.filter(u=>u.role==="vendedor"&&u.ativo).map(u=><option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Pacote *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {packages.map(pkg=>(
                      <button key={pkg.id} onClick={()=>setValForm(f=>({...f,pacote:pkg.name,valorContrato:pkgPreco(pkg)>0?pkgPreco(pkg).toFixed(2):(f?.valorContrato || '')}))}
                        className={`p-3 border rounded-xl text-left transition-all ${valForm?.pacote===pkg.name?"border-amber-500 bg-amber-50":"hover:border-amber-300"}`}>
                        <p className="font-semibold text-xs">{pkg.name}</p>
                        <p className="text-[10px] text-gray-400">{pkg.horas}h</p>
                        {pkgPreco(pkg)>0 && <p className="text-xs font-bold text-emerald-600 mt-1">R$ {fmtR(pkgPreco(pkg))}</p>}
                        {pkg.descAtivo&&pkg.descPct>0 && <p className="text-[9px] text-amber-600">-{pkg.descPct}%</p>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Valor do contrato (R$)</label>
                    <input type="number" value={valForm?.valorContrato || ''} onChange={e=>setValForm(f=>({...f,valorContrato:e.target.value}))} placeholder="0,00"
                      className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-amber-500"/>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Data de assinatura</label>
                    <input type="date" value={valForm?.dataAssinatura || ''} onChange={e=>setValForm(f=>({...f,dataAssinatura:e.target.value}))}
                      className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-amber-500"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Observacoes</label>
                  <textarea value={valForm?.obs || ''} onChange={e=>setValForm(f=>({...f,obs:e.target.value}))} rows={3} placeholder="Condicoes especiais, descontos negociados..."
                    className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-amber-500 resize-none"/>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                  <span>Apos o envio, admins receberao um alerta para validar. Se aprovado, o contrato vai automaticamente para a <strong>Fila de Execucao</strong>.</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between p-5 border-t bg-gray-50">
            <button onClick={()=>{ 
              if (valStep > 1) { setValStep(valStep - 1) } 
              else { setModalVal(false); setValStep(1); setValForm({ razaoSocial: '', cnpj: '', email: '', telefone: '', cidade: '', estado: '', vendedor: '', pacote: '', valorContrato: '', dataAssinatura: '', obs: '' }) }
            }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">{valStep===1?"Cancelar":"Voltar"}</button>
            <button onClick={()=>{
              if (valStep < 2) { 
                if (!valForm?.razaoSocial) { toast("Informe a Razao Social","red"); return }
                setValStep(2)
                return
              }
              submeterVal()
            }} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
              {valStep<2?<><span>Proximo</span><ChevronRight className="w-4 h-4"/></>:<><Send className="w-4 h-4"/> Enviar para Validacao</>}
            </button>
          </div>
        </Modal>
      )}

      {/* ══════════ MODAL: DETALHE VALIDAÇÃO ══════════ */}
      {(modalValItem) && <ModalValItem/>}

      {/* ══════════ MODAL: OBSERVAÇÃO ═══��══════ */}
      {modalReprovar && (
        <Modal onClose={()=>setModalReprovar(null)} maxW="max-w-md">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-bold text-red-700 flex items-center gap-2"><XSquare className="w-5 h-5"/> Reprovar Contrato</h2>
            <button onClick={()=>setModalReprovar(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4"/></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="font-medium text-sm">{modalReprovar.razaoSocial}</p><p className="text-xs text-gray-500">Pacote: {modalReprovar.pacote}</p></div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Motivo da reprovação *</label>
              <textarea value={motivoRep} onChange={e=>setMotivoRep(e.target.value)} rows={4} placeholder="Descreva o motivo..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-red-400 resize-none"/>
            </div>
          </div>
          <div className="flex gap-3 p-5 border-t">
            <button onClick={()=>setModalReprovar(null)} className="flex-1 py-2.5 border rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
            <button onClick={reprovarVal} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Confirmar Reprovação</button>
          </div>
        </Modal>
      )}
      {modalNewUser && (
        <Modal onClose={()=>setModalNewUser(false)} maxW="max-w-md">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-600"/> Novo Usuário</h2>
            <button onClick={()=>setModalNewUser(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4"/></button>
          </div>
          <div className="p-5 space-y-4">
            {[["Nome completo","name","text","João da Silva"],["E-mail","email","email","joao@empresa.com"],["Senha","password","password","Senha segura"]].map(([l,k,tp,ph])=>(
              <div key={k}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">{l}</label>
                <input type={tp} value={newUserForm[k]} onChange={e=>setNewUserForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Perfil</label>
              <select value={newUserForm.role} onChange={e=>setNewUserForm(f=>({...f,role:e.target.value}))} className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500">
                {Object.entries(ROLE_META).filter(([r])=>r!=="root").map(([r,m])=><option key={r} value={r}>{m.icon} {m.label}</option>)}
              </select>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              <strong>Páginas disponíveis para {ROLE_META[newUserForm.role]?.label}:</strong> {ROLE_META[newUserForm.role]?.pages.length} de {ALL_PAGES.length} páginas
            </div>
          </div>
          <div className="flex gap-3 p-5 border-t">
            <button onClick={()=>setModalNewUser(false)} className="flex-1 py-2.5 border rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
            <button onClick={criarUsuario} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Criar Usuário</button>
          </div>
        </Modal>
      )}
      {modalEditUser && (
        <Modal onClose={()=>setModalEditUser(null)} maxW="max-w-md">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-bold flex items-center gap-2"><Edit2 className="w-5 h-5 text-blue-600"/> Editar Usuário</h2>
            <button onClick={()=>setModalEditUser(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4"/></button>
          </div>
          <div className="p-5 space-y-4">
            {[["Nome","name","text"],["E-mail","email","email"],["Senha","password","password"]].map(([l,k,tp])=>(
              <div key={k}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">{l}</label>
                <input type={tp} value={modalEditUser[k]} onChange={e=>setModalEditUser(p=>({...p,[k]:e.target.value}))}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Perfil</label>
              <select value={modalEditUser.role} onChange={e=>setModalEditUser(p=>({...p,role:e.target.value}))} disabled={modalEditUser.id===user.id} className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50">
                {Object.entries(ROLE_META).filter(([r])=>r!=="root"||user.role==="root").map(([r,m])=><option key={r} value={r}>{m.icon} {m.label}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-xl">
              <span className="text-sm font-medium">Usuário ativo</span>
              <button onClick={()=>setModalEditUser(p=>({...p,ativo:!p.ativo}))} disabled={modalEditUser.id===user.id} className={`relative inline-flex h-6 w-11 rounded-full transition-colors disabled:opacity-40 ${modalEditUser.ativo?"bg-emerald-500":"bg-gray-300"}`}>
                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5 ${modalEditUser.ativo?"translate-x-5":""}`}/>
              </button>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              Páginas: {ROLE_META[modalEditUser.role]?.pages.join(", ")}
            </div>
          </div>
          <div className="flex gap-3 p-5 border-t">
            <button onClick={()=>setModalEditUser(null)} className="flex-1 py-2.5 border rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
            <button onClick={salvarEdicaoUser} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Salvar</button>
          </div>
        </Modal>
      )}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t=>(
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 bg-white border rounded-xl shadow-xl text-sm
            ${t.type==="green"?"border-emerald-200":t.type==="red"?"border-red-200":t.type==="amber"?"border-amber-200":"border-blue-200"}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.type==="green"?"bg-emerald-500":t.type==="red"?"bg-red-500":t.type==="amber"?"bg-amber-500":"bg-blue-500"}`}/>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  )
}
