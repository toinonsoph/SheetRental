export const environment = {
    production: false,
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_KEY || '',
    sendgridApiKey: '',
    supabaseStorage: {
      bucket: 'villas_and_apartments',
      folder: '',
    }
  };