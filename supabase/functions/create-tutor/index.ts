import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Verify admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      throw new Error('User is not an admin');
    }

    // Parse request body
    const {
      email,
      prenom,
      nom,
      bio,
      matieres_enseignees,
      diplomes,
      tarif_horaire_eur,
      annees_experience,
      password,
    } = await req.json();

    console.log('Creating tutor with email:', email);

    // Create auth user
    const { data: newUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: prenom,
        last_name: nom,
        role: 'tuteur',
      },
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      throw createUserError;
    }

    console.log('User created:', newUser.user.id);

    // Create profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email,
        prenom,
        nom,
        role: 'tuteur',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Rollback user creation
      await supabaseClient.auth.admin.deleteUser(newUser.user.id);
      throw profileError;
    }

    console.log('Profile created');

    // Create tutor entry
    const { data: tutor, error: tutorError } = await supabaseClient
      .from('tutors')
      .insert({
        user_id: newUser.user.id,
        bio,
        matieres_enseignees,
        diplomes,
        tarif_horaire_eur,
        annees_experience,
        statut_approbation: 'approuve',
      })
      .select()
      .single();

    if (tutorError) {
      console.error('Error creating tutor:', tutorError);
      // Rollback
      await supabaseClient.from('profiles').delete().eq('id', newUser.user.id);
      await supabaseClient.auth.admin.deleteUser(newUser.user.id);
      throw tutorError;
    }

    console.log('Tutor created successfully');

    return new Response(
      JSON.stringify({ success: true, tutor }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-tutor function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
