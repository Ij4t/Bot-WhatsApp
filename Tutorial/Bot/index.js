/*
  Made By Lenwy
  Base : Lenwy
  WhatsApp : wa.me/6283829814737
  Telegram : t.me/ilenwy
  Youtube : @Lenwy
  Channel : https://whatsapp.com/channel/0029VaGdzBSGZNCmoTgN2K0u

  Copy Code?, Recode?, Rename?, Reupload?, Reseller? Taruh Credit Ya :D
  Mohon Untuk Tidak Menghapus Watermark Di Dalam Kode Ini
*/

// Import Module
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("baileys");
const pino = require("pino");
const chalk = require("chalk");
const readline = require("readline");
const { proto } = require("@whiskeysockets/baileys");

// Metode Pairing
const usePairingCode = true;

// Prompt Input Terminal
async function question(prompt) {
  process.stdout.write(prompt);
  const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    r1.question("", (ans) => {
      r1.close();
      resolve(ans);
    })
  );
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./LenwySesi');

  // Versi Terbaru
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Lenwy Using WA v${version.join('.')}, isLatest: ${isLatest}`);

  const lenwy = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: !usePairingCode,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    version: version,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      return proto.Message.fromObject({});
    }
  });

  // Loop Pairing Code
  if (usePairingCode && !state.creds.registered) {
    try {
      const phoneNumber = await question('☘️ Masukan Nomor Yang Diawali Dengan 62 :\n');
      const loopPairing = async () => {
        while (!state.creds.registered) {
          try {
            const code = await lenwy.requestPairingCode(phoneNumber.trim());
            console.log(`🎁 Pairing Code : ${code}`);
          } catch (err) {
            console.log("⏳ Gagal pairing. Mencoba lagi dalam 10 detik...");
          }
          await new Promise(resolve => setTimeout(resolve, 10000)); // jeda 10 detik
        }
      }
      loopPairing();
    } catch (err) {
      console.error('❌ Gagal memulai pairing:', err);
    }
  }

  // Simpan sesi
  lenwy.ev.on("creds.update", saveCreds);

  // Status koneksi
  lenwy.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      console.log(chalk.red("❌  Koneksi Terputus, Mencoba Menyambung Ulang"));
      connectToWhatsApp();
    } else if (connection === "open") {
      console.log(chalk.green("✔  Bot Berhasil Terhubung Ke WhatsApp"));
    }
  });

  // Event pesan masuk
  lenwy.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.remoteJid;
    const pushname = msg.pushName || "Lenwy";

    const listColor = ["red", "green", "yellow", "magenta", "cyan", "white", "blue"];
    const randomColor = listColor[Math.floor(Math.random() * listColor.length)];

    console.log(
      chalk.yellow.bold("Credit : Lenwy"),
      chalk.green.bold("[ WhatsApp ]"),
      chalk[randomColor](pushname),
      chalk[randomColor](" : "),
      chalk.white(body)
    );

    require("./lenwy")(lenwy, m);
  });
}

// Jalankan bot
connectToWhatsApp();
