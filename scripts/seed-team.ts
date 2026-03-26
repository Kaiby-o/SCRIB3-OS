// Seed script — creates auth accounts + profiles for all 25 remaining team members
// Run with: npx tsx scripts/seed-team.ts
// DO NOT COMMIT THIS FILE — contains service role key

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dzufyjiczbgsvjyinpks.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dWZ5amljemJnc3ZqeWlucGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ0MzEzOCwiZXhwIjoyMDg5MDE5MTM4fQ.xGLUU7gD-vKZ3I_CMQn70sSz_Vla-OaW_H86D_6kV0U'
);

const AVATAR_BASE = 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/';
const DEFAULT_PASSWORD = 'Scrib3Dev2026!';

const teamMembers = [
  { email: 'jb@scrib3.co', display_name: 'JB', role: 'csuite', title: 'Chief Executive Officer', unit: 'C-Suite', location: 'Chicago, USA', timezone: 'America/Chicago', avatar: 'JB.png', xp: 500, bandwidth: 40, bio: '', skillsets: ['Leadership', 'Business Development', 'Web3'], joined: '2021-01-01' },
  { email: 'ross@scrib3.co', display_name: 'Ross Booth', role: 'csuite', title: 'Co-Founder', unit: 'C-Suite', location: 'USA', timezone: 'America/New_York', avatar: 'Ross_Booth.jpg', xp: 400, bandwidth: 20, bio: '', skillsets: ['Business Development', 'Partnerships'], joined: '2021-01-01' },
  { email: 'arthur@scrib3.co', display_name: 'Arthur Stern', role: 'csuite', title: 'Co-Founder / COO', unit: 'C-Suite', location: 'USA', timezone: 'America/New_York', avatar: 'Arthur_Stern.png', xp: 400, bandwidth: 25, bio: '', skillsets: ['Operations', 'Finance', 'Partnerships'], joined: '2021-01-01' },
  { email: 'ishan@scrib3.co', display_name: 'Ishan Bhaidani', role: 'csuite', title: 'Co-Founder', unit: 'C-Suite', location: 'USA', timezone: 'America/New_York', avatar: 'Ishan_Bhaidani.png', xp: 350, bandwidth: 15, bio: '', skillsets: ['Technology', 'Web3', 'Product'], joined: '2021-01-01' },
  { email: 'elena@scrib3.co', display_name: 'Elena Zheng', role: 'team', title: 'Senior Account Lead', unit: 'Accounts', location: 'USA', timezone: 'America/New_York', avatar: 'Elena_Zheng.jpg', xp: 620, bandwidth: 85, bio: 'Managing SCRIB3\'s largest client relationships.', skillsets: ['Account Management', 'Client Relations', 'Strategy', 'Project Management'], joined: '2023-06-01' },
  { email: 'omar@scrib3.co', display_name: 'Omar Anwar', role: 'team', title: 'Account Lead', unit: 'Accounts', location: 'UK', timezone: 'Europe/London', avatar: 'Omar_Anwar.jpg', xp: 480, bandwidth: 75, bio: 'Leading the Rootstock and Midnight accounts.', skillsets: ['Account Management', 'Client Relations', 'Web3'], joined: '2024-01-15' },
  { email: 'haley@scrib3.co', display_name: 'Haley Stewart Torculas', role: 'team', title: 'People & Operations', unit: 'Ops', location: 'USA', timezone: 'America/New_York', avatar: 'Haley_Stewart_Torculas.jpg', xp: 310, bandwidth: 60, bio: 'Running people operations, onboarding, and team culture initiatives.', skillsets: ['HR', 'Operations', 'Onboarding', 'Culture'], joined: '2023-09-01' },
  { email: 'camila@scrib3.co', display_name: 'Camila', role: 'team', title: 'Operations — Invoicing POC', unit: 'Ops', location: 'USA', timezone: 'America/New_York', avatar: 'Camila.jpg', xp: 180, bandwidth: 55, bio: 'Processing vendor invoices and managing payment workflows.', skillsets: ['Finance', 'Invoicing', 'Operations'], joined: '2024-06-01' },
  { email: 'matt@scrib3.co', display_name: 'Matthew Brannon', role: 'team', title: 'PR Lead', unit: 'PR', location: 'USA', timezone: 'America/New_York', avatar: 'Matthew_Brannon.png', xp: 540, bandwidth: 80, bio: 'Leading PR strategy and media relations across all client engagements.', skillsets: ['PR Strategy', 'Media Relations', 'Crisis Comms', 'Web3 PR'], joined: '2023-04-01' },
  { email: 'jenny@scrib3.co', display_name: 'Jenny', role: 'team', title: 'PR / Broadcast', unit: 'PR', location: 'USA', timezone: 'America/New_York', avatar: 'Jenny.png', xp: 220, bandwidth: 65, bio: '', skillsets: ['PR', 'Broadcast', 'Media'], joined: '2024-02-01' },
  { email: 'destini@scrib3.co', display_name: 'Destini', role: 'team', title: 'PR', unit: 'PR', location: 'USA', timezone: 'America/New_York', avatar: null, xp: 190, bandwidth: 50, bio: '', skillsets: ['PR', 'Media Relations'], joined: '2024-03-01' },
  { email: 'janelle@scrib3.co', display_name: 'Janelle', role: 'team', title: 'PR', unit: 'PR', location: 'USA', timezone: 'America/New_York', avatar: 'Janelle.png', xp: 160, bandwidth: 45, bio: '', skillsets: ['PR', 'Content'], joined: '2024-05-01' },
  { email: 'hugh@scrib3.co', display_name: 'Hugh', role: 'team', title: 'PR / Podcasts', unit: 'PR', location: 'USA', timezone: 'America/New_York', avatar: 'Hugh.png', xp: 280, bandwidth: 70, bio: '', skillsets: ['PR', 'Podcasts', 'Audio'], joined: '2024-01-01' },
  { email: 'kevin@scrib3.co', display_name: 'Kevin Moran', role: 'team', title: 'Brand Designer', unit: 'Brand', location: 'USA', timezone: 'America/New_York', avatar: 'Kevin_Moran.jpg', xp: 580, bandwidth: 90, bio: 'Designing brand systems and visual identities for SCRIB3 clients.', skillsets: ['Brand Design', 'Visual Identity', 'Typography', 'Figma'], joined: '2023-07-01' },
  { email: 'kevin.arteaga@scrib3.co', display_name: 'Kevin Arteaga', role: 'team', title: 'PR Account Manager', unit: 'PR', location: 'USA', timezone: 'America/New_York', avatar: 'Kevin_Arteaga.png', xp: 140, bandwidth: 60, bio: '', skillsets: ['PR', 'Account Management'], joined: '2024-08-01' },
  { email: 'sam@scrib3.co', display_name: 'Samantha Kelly', role: 'team', title: 'Brand Strategy / Creative', unit: 'Brand', location: 'USA', timezone: 'America/New_York', avatar: 'Samantha_Kelly.jpg', xp: 650, bandwidth: 95, bio: 'Bridging strategy and creative execution.', skillsets: ['Brand Strategy', 'Creative Direction', 'Content Strategy', 'Web3'], joined: '2023-05-01' },
  { email: 'cynthia@scrib3.co', display_name: 'Cynthia Gentry', role: 'team', title: 'Creative Copywriter', unit: 'Brand', location: 'USA', timezone: 'America/New_York', avatar: 'Cynthia_Gentry.jpg', xp: 420, bandwidth: 95, bio: 'Crafting copy that converts. Specializing in Web3 messaging.', skillsets: ['Copywriting', 'Brand Voice', 'Content Strategy', 'Web3'], joined: '2023-11-01' },
  { email: 'amanda@scrib3.co', display_name: 'Amanda Eyer', role: 'team', title: 'Creative', unit: 'Brand', location: 'Brazil', timezone: 'America/Sao_Paulo', avatar: 'Amanda_Eyer.jpg', xp: 240, bandwidth: 55, bio: '', skillsets: ['Design', 'Creative', 'Illustration'], joined: '2024-04-01' },
  { email: 'jake@scrib3.co', display_name: 'Jake Embleton', role: 'team', title: 'Content / Social', unit: 'Brand', location: 'Philippines', timezone: 'Asia/Manila', avatar: 'Jake_Embleton.png', xp: 340, bandwidth: 90, bio: 'Creating social content that drives engagement in the Web3 space.', skillsets: ['Social Media', 'Content Creation', 'Community', 'Web3'], joined: '2024-02-15' },
  { email: 'stef@scrib3.co', display_name: 'Stef Luthin', role: 'team', title: 'Content', unit: 'Brand', location: 'USA', timezone: 'America/New_York', avatar: 'Stefanie.png', xp: 200, bandwidth: 50, bio: '', skillsets: ['Content', 'Writing', 'Research'], joined: '2024-06-01' },
  { email: 'luke@scrib3.co', display_name: 'Luke', role: 'team', title: 'Content / Social', unit: 'Brand', location: 'USA', timezone: 'America/New_York', avatar: 'Luke_Bateman.png', xp: 150, bandwidth: 45, bio: '', skillsets: ['Content', 'Social Media'], joined: '2024-07-01' },
  { email: 'tolani@scrib3.co', display_name: 'Tolani Daniel', role: 'team', title: 'Motion Graphic Designer', unit: 'Brand', location: 'Nigeria', timezone: 'Africa/Lagos', avatar: 'Tolani_Daniel.jpg', xp: 510, bandwidth: 95, bio: 'Bringing brand stories to life through motion.', skillsets: ['Motion Graphics', 'Animation', 'After Effects', 'Cinema 4D'], joined: '2023-08-01' },
  { email: 'taylor@scrib3.co', display_name: 'Taylor Hadden', role: 'team', title: '—', unit: 'Brand', location: 'USA', timezone: 'America/New_York', avatar: 'Taylor_Hadden.png', xp: 80, bandwidth: 30, bio: '', skillsets: ['Brand'], joined: '2024-09-01' },
  { email: 'madisen@scrib3.co', display_name: 'Madisen', role: 'team', title: 'Account Manager', unit: 'Accounts', location: 'USA', timezone: 'America/New_York', avatar: 'Madisen_Kopfer.jpg', xp: 120, bandwidth: 55, bio: '', skillsets: ['Account Management', 'Client Relations'], joined: '2024-10-01' },
  { email: 'kim@scrib3.co', display_name: 'Kim', role: 'team', title: 'Account Manager', unit: 'Accounts', location: 'Dubai', timezone: 'Asia/Dubai', avatar: 'Kim.jpg', xp: 100, bandwidth: 50, bio: '', skillsets: ['Account Management', 'MENA Markets'], joined: '2024-11-01' },
];

async function seed() {
  console.log(`Seeding ${teamMembers.length} team members...\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const member of teamMembers) {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: member.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`⏭  ${member.display_name} (${member.email}) — already exists, updating profile...`);
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            display_name: member.display_name,
            role: member.role,
            title: member.title,
            unit: member.unit,
            location: member.location,
            timezone: member.timezone,
            bio: member.bio,
            skillsets: member.skillsets,
            joined_date: member.joined,
            xp: member.xp,
            bandwidth: member.bandwidth,
            avatar_url: member.avatar ? AVATAR_BASE + member.avatar : null,
          })
          .eq('email', member.email);

        if (updateError) {
          console.log(`   ❌ Update failed: ${updateError.message}`);
          errors++;
        } else {
          console.log(`   ✅ Profile updated`);
          skipped++;
        }
        continue;
      }
      console.log(`❌ ${member.display_name}: ${authError.message}`);
      errors++;
      continue;
    }

    const userId = authData.user.id;

    // 2. Update the auto-created profile row with full data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: member.display_name,
        email: member.email,
        role: member.role,
        title: member.title,
        unit: member.unit,
        location: member.location,
        timezone: member.timezone,
        bio: member.bio,
        skillsets: member.skillsets,
        joined_date: member.joined,
        xp: member.xp,
        bandwidth: member.bandwidth,
        avatar_url: member.avatar ? AVATAR_BASE + member.avatar : null,
      })
      .eq('id', userId);

    if (profileError) {
      console.log(`⚠  ${member.display_name}: Auth created but profile update failed: ${profileError.message}`);
      errors++;
    } else {
      console.log(`✅ ${member.display_name} (${member.email})`);
      created++;
    }
  }

  console.log(`\n--- Done ---`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nAll accounts use password: ${DEFAULT_PASSWORD}`);
}

seed();
