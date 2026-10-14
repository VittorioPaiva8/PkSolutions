// =====================================================
//  CONFIGURAÇÃO DO SUPABASE
//  No painel do Supabase: Project Settings → API
//  (ou "Connect" → "App Frameworks").
//  Cole a "Project URL" e a chave "anon" / "publishable".
//  Essa chave é pública e pode ficar aqui sem problema:
//  quem protege os dados são as regras do setup.sql.
//  NUNCA cole aqui a chave "service_role" / "secret".
// =====================================================
window.PK = window.PK || {};

PK.config = {
  supabaseUrl: "https://fhrrdmxcxgbfkvphwzku.supabase.co",
  supabaseChave: "sb_publishable_9AzooA6gEOVrCjR948hyTA_HISwhOB8",
};
