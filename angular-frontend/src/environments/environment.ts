export const environment = {
  production: false,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_KEY || '',
  sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  supabaseStorage: {
    bucket: 'villas_and_apartments'
  }
};
