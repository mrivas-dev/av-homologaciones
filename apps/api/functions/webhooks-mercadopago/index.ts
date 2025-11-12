import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MercadoPagoConfig, Payment } from 'https://esm.sh/mercadopago@2.0.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { data, type } = body

    console.log('Webhook received:', { type, data })

    if (type === 'payment') {
      const paymentId = data.id

      // Initialize MercadoPago
      const client = new MercadoPagoConfig({
        accessToken: Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!,
      })

      const payment = new Payment(client)
      const paymentData = await payment.get({ id: paymentId })

      console.log('Payment data:', paymentData)

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Find payment record by MercadoPago payment ID
      const { data: paymentRecord, error: paymentError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('mercadopago_payment_id', paymentId.toString())
        .single()

      if (paymentError || !paymentRecord) {
        console.error('Payment record not found:', paymentError)
        return new Response(
          JSON.stringify({ error: 'Payment record not found' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        )
      }

      // Update payment status
      const statusMap: { [key: string]: 'pending' | 'approved' | 'rejected' | 'refunded' } = {
        'pending': 'pending',
        'approved': 'approved',
        'authorized': 'approved',
        'in_process': 'pending',
        'rejected': 'rejected',
        'cancelled': 'rejected',
        'refunded': 'refunded',
        'charged_back': 'refunded',
      }

      const newStatus = statusMap[paymentData.status as string] || 'pending'

      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          status: newStatus,
          mercadopago_payment_id: paymentId.toString(),
        })
        .eq('id', paymentRecord.id)

      if (updateError) {
        console.error('Error updating payment:', updateError)
        throw updateError
      }

      // If payment is approved, update homologation status
      if (newStatus === 'approved') {
        const { error: homologationError } = await supabaseClient
          .from('homologations')
          .update({
            payment_status: 'paid',
            status: 'submitted',
            submission_date: new Date().toISOString(),
          })
          .eq('id', paymentRecord.homologation_id)

        if (homologationError) {
          console.error('Error updating homologation:', homologationError)
        }
      }

      console.log('Payment processed successfully')
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
