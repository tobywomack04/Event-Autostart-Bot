const { Client, GatewayIntentBits } = require('discord.js');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  setInterval(async () => {
    try {
      const res = await fetch(
        `https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`,
        { headers: { Authorization: `Bot ${TOKEN}` } }
      );

      const events = await res.json();
      const now = new Date();

      for (const event of events) {
        if (
          event.status === 1 && // Scheduled
          new Date(event.scheduled_start_time) <= now
        ) {
          await fetch(
            `https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events/${event.id}`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bot ${TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 2 }) // Start the event
            }
          );

          console.log(`Started event: ${event.name}`);
        }
      }
    } catch (err) {
      console.error('Error checking events:', err);
    }
  }, 30000); // Check every 30 seconds
});

client.login(TOKEN);