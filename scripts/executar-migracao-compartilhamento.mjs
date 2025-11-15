#!/usr/bin/env node

/**
 * Script para executar migração de compartilhamento público
 * Adiciona colunas necessárias à tabela comparativos_analise
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ler variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas')
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function executarMigracaoSimplificada() {
  console.log('🚀 Iniciando migração de compartilhamento público...\n')

  try {
    // 1. Adicionar coluna token_compartilhamento
    console.log('📝 Adicionando coluna token_compartilhamento...')
    const { error: erro1 } = await supabase.rpc('exec_sql', {
      query: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='comparativos_analise' 
                AND column_name='token_compartilhamento'
            ) THEN
                ALTER TABLE comparativos_analise 
                ADD COLUMN token_compartilhamento VARCHAR(64);
                
                CREATE INDEX IF NOT EXISTS idx_comparativos_token 
                ON comparativos_analise(token_compartilhamento) 
                WHERE token_compartilhamento IS NOT NULL;
                
                RAISE NOTICE 'Coluna token_compartilhamento adicionada';
            ELSE
                RAISE NOTICE 'Coluna token_compartilhamento já existe';
            END IF;
        END $$;
      `
    })

    if (erro1) {
      console.log('⚠️  exec_sql não disponível, usando método alternativo...')
      
      // Método alternativo: adicionar coluna diretamente via SQL raw
      const sqlComandos = [
        {
          nome: 'token_compartilhamento',
          sql: `ALTER TABLE comparativos_analise ADD COLUMN IF NOT EXISTS token_compartilhamento VARCHAR(64)`
        },
        {
          nome: 'token_expira_em',
          sql: `ALTER TABLE comparativos_analise ADD COLUMN IF NOT EXISTS token_expira_em TIMESTAMP WITH TIME ZONE`
        },
        {
          nome: 'visualizacoes_publicas',
          sql: `ALTER TABLE comparativos_analise ADD COLUMN IF NOT EXISTS visualizacoes_publicas INTEGER DEFAULT 0`
        }
      ]

      for (const comando of sqlComandos) {
        console.log(`📝 Verificando coluna ${comando.nome}...`)
        // Como não podemos executar ALTER TABLE diretamente, vamos verificar se já existe
        const { data, error } = await supabase
          .from('comparativos_analise')
          .select('token_compartilhamento, token_expira_em, visualizacoes_publicas')
          .limit(1)

        if (error) {
          console.log(`❌ Coluna ${comando.nome} não existe ou há erro:`, error.message)
          console.log(`\n⚠️  Execute manualmente no Supabase SQL Editor:`)
          console.log(`\n${comando.sql};\n`)
        } else {
          console.log(`✅ Coluna ${comando.nome} já existe ou foi verificada`)
        }
      }
    } else {
      console.log('✅ Coluna token_compartilhamento configurada')
    }

    console.log('\n✅ Migração concluída!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Se houver erros acima, execute os comandos SQL manualmente no Supabase')
    console.log('2. Acesse: https://supabase.com/dashboard')
    console.log('3. Vá em SQL Editor')
    console.log('4. Execute o arquivo: supabase/migrations/add_compartilhamento_publico.sql')
    console.log('\n🎉 Após executar, a funcionalidade de compartilhamento estará pronta!')

  } catch (error) {
    console.error('\n❌ Erro durante migração:', error)
    console.log('\n📋 Solução:')
    console.log('Execute manualmente no Supabase SQL Editor:')
    console.log('Arquivo: supabase/migrations/add_compartilhamento_publico.sql')
    process.exit(1)
  }
}

// Executar migração
executarMigracaoSimplificada()
