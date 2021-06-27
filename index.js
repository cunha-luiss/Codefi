import 'dotenv/config'
import Discord from 'discord.js'
import YTDL from 'ytdl-core'

const url = 'https://www.youtube.com/watch?v=_DYAnU3H7RI'
const channelId = '858420360441364500';
let playing = false

const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"]
})

const play = async (connection) =>
  new Promise((resolve, reject) => {
    playing = true;
    const stream = YTDL(url, { filter: 'audioonly' });
    const dj = connection.play(stream, { seek: 0, volume: 1.5 });
    dj.on('finish', () => {
      playing = false;
      resolve()
    })
    dj.on('error', () => {
      playing = false;
      connection.disconnect()
      reject()
    })
    dj.on('unpipe', () => {
      playing = false;
      reject()
    })
  })

const connect = async () => {
  const voiceChannel = await client.channels.fetch(channelId);
  if (!voiceChannel) {
    throw new Error("Canal não encontrado");
  }
  return await voiceChannel.join();
}

async function replay() {
  const voiceConnection = await connect();
  try {
    while (!playing) {
      await play(voiceConnection);
    }
  } finally {
    playing = false;
    voiceConnection.disconnect()
  }
}

client.on('ready', async () => {
  console.log("Codefi on")
  await replay()
})

client.on('message', async message => {
  if (message.content === '<3replay') {
    if (!playing) {
      await replay()
    }
  }
})

client.login(process.env.token)
