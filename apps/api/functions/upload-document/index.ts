import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: DenoRequest) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const homologationId = formData.get('homologationId') as string
    const documentType = formData.get('documentType') as string
    const documentName = formData.get('documentName') as string

    if (!file || !homologationId || !documentType || !documentName) {
      throw new Error('Missing required parameters')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${homologationId}/${documentType}_${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabaseClient.storage
      .from('homologation-documents')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('homologation-documents')
      .getPublicUrl(fileName)

    // Create document record
    const { data: documentData, error: documentError } = await supabaseClient
      .from('documents')
      .insert({
        homologation_id: homologationId,
        name: documentName,
        type: documentType,
        file_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (documentError) {
      throw documentError
    }

    // Update homologation documents array
    const { data: homologation, error: homologationError } = await supabaseClient
      .from('homologations')
      .select('documents')
      .eq('id', homologationId)
      .single()

    if (!homologationError && homologation) {
      const documents = homologation.documents || []
      documents.push(documentData.id)
      
      await supabaseClient
        .from('homologations')
        .update({ documents })
        .eq('id', homologationId)
    }

    return new Response(
      JSON.stringify({
        success: true,
        document: documentData,
        url: urlData.publicUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
