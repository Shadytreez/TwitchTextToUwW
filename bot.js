const tmi = require("tmi.js");
const axios = require("axios");
const { openAiKey, userName, password, channel } = require("./keys.json");
const opts = {
  identity: {
    username: userName,
    password: password,
  },
  channels: channel,
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

// Connect to Twitch:
client.connect();

const prompt = 'In a cringe UwU voice say "';
// Called every time a message comes in
async function onMessageHandler(target, context, msg, self) {
  if (self) {
    return;
  } // Ignore messages from the bot

  //get the first for character
  const commandName = msg.slice(0, 4);
  console.log("msg ", msg);
  console.log("commandName ", commandName);
  const userPrompt = msg.slice(4, msg.length).trim();
  console.log("userPrompt ", userPrompt);
  // If the command is known, let's execute it
  if (commandName === "!uwu" && userPrompt.length != 0) {
    try {
      const result = await chatGPTCall(userPrompt);
      client.say(target, result);
    } catch (err) {
      console.log("eeror ", err);
    }
  } else {
    console.log(`* Unknown command ${commandName}`);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

/**
 * Api call to chat GPT
 * @param {string} userPrompt
 * @returns {string} the chat GPT text response
 */
async function chatGPTCall(userPrompt) {
  const bodyProperty = {
    model: "text-davinci-003",
    prompt: prompt + userPrompt + '"',
    max_tokens: 257,
    temperature: 0.9,
    top_p: 1,
    n: 1,
    stream: false,
    logprobs: null,
  };
  const result = await axios.post(
    "https://api.openai.com/v1/completions",
    bodyProperty,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + openAiKey,
      },
    }
  );
  console.log("result");
  console.log(result.data.choices[0].text.trim());
  const toReturn = result.data.choices[0].text.trim();
  return toReturn;
}
