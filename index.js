const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Web Server عشان UptimeRobot
app.get('/', (req, res) => {
  res.send('Bot is alive');
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// Discord Bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

let data = {};

if (fs.existsSync("data.json")) {
  data = JSON.parse(fs.readFileSync("data.json"));
}

function saveData() {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  if (!data[userId]) {
    data[userId] = { balance: 0 };
  }

  // مكافأة كل رسالة
  data[userId].balance += 5;
  saveData();

  if (message.content === "!رصيدي") {
    message.reply(`رصيدك: ${data[userId].balance} 💰`);
  }

  if (message.content.startsWith("!حول")) {
    const args = message.content.split(" ");
    const member = message.mentions.users.first();
    const amount = parseInt(args[2]);

    if (!member || isNaN(amount) || amount <= 0) {
      return message.reply("الاستخدام: !حول @شخص 100");
    }

    if (data[userId].balance < amount) {
      return message.reply("رصيدك لا يكفي.");
    }

    if (!data[member.id]) {
      data[member.id] = { balance: 0 };
    }

    data[userId].balance -= amount;
    data[member.id].balance += amount;
    saveData();

    message.reply(`تم تحويل ${amount} 💰 إلى ${member.username}`);
  }
});

client.login(TOKEN);
