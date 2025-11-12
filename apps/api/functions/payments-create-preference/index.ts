import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2.0.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { homologationId, amount, description } = await req.json()

    if (!homologationId || !amount) {
      throw new Error('Missing required parameters: homologationId, amount')
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

    // Get homologation details
    const { data: homologation, error: homologationError } = await supabaseClient
      .from('homologations')
      .select('*')
      .eq('id', homologationId)
      .single()

    if (homologationError || !homologation) {
      throw new Error('Homologation not found')
    }

    // Initialize MercadoPago
    const client = new MercadoPagoConfig({
      accessToken: Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!,
    })

    const preference = new Preference(client)

    const preferenceData = {
      items: [
        {
          id: homologationId,
          title: description || `Homologación ${homologationId}`,
          quantity: 1,
          unit_price: amount,
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: `${req.headers.get('origin')}/homologar/${homologationId}/payment/success`,
        failure: `${req.headers.get('origin')}/homologar/${homologationId}/payment/failure`,
        pending: `${req.headers.get('origin')}/homologar/${homologationId}/payment/pending`,
      },
      auto_return: 'approved',
      external_reference: homologationId,
      notification_url: `${req.headers.get('origin')}/api/webhooks/mercadopago`,
    }

    const result = await preference.create({ body: preferenceData })

    // Update payment record with preference ID
    const { error: updateError } = await supabaseClient
      .from('payments')
      .upsert({
        homologation_id: homologationId,
        amount,
        currency: 'ARS',
        mercadopago_preference_id: result.id,
        status: 'pending',
      })

    if (updateError) {
      console.error('Error updating payment record:', updateError)
    }

    return new Response(
      JSON.stringify({
        preferenceId: result.id,
        initPoint: result.init_point,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating payment preference:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
