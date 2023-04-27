addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);

    // If the request path starts with /bot, handle it with the bot function
    if (url.pathname.startsWith("/bot")) {
      return handleRequestBot(request.clone());
    }

    // Otherwise, handle the request with the main function
    return handleMainRequest(request.clone());
}

async function handleRequestBot(request) {
  const body = await request.json();

  // Check if it's an incoming message from a user to the bot
  if (body.message && body.message.chat.id == "-1001574965898") {
    const chatID = body.message.chat.id;
    const userID = body.message.from.id;

    // Check if the incoming message is the /start command
    if (body.message && body.message.text && body.message.text.toLowerCase() === "/start") {

      const responseMessage = "Hello! Welcome to the bot.";

      return new Response(
        JSON.stringify({
          method: "sendMessage",
          chat_id: chatID,
          text: responseMessage,
          parse_mode: "MARKDOWN",
          reply_to_message_id: body.message.message_id,
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8'
          }
        })
      
    }

    // Check if the incoming message is the /mycount command
    if (body.message && body.message.text && body.message.text.toLowerCase() === "/mycount") {

      // Get the user's message count from the KV store
      let messageCount = parseInt(await ppu.get(userID.toString()), 10);

      const responseMessage = `Your message count is ${messageCount}.`;

      return new Response(
        JSON.stringify({
          method: "sendMessage",
          chat_id: chatID,
          text: responseMessage,
          parse_mode: "MARKDOWN",
          reply_to_message_id: body.message.message_id,
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8'
          }
        })
    }

    // Increment the user's message count and save the user ID in the KV store if it hasn't been saved already
    await incrementMessageCount(userID);
  }

  // Return an empty 200 status response for messages we don't know how to handle
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    }
  });
}

async function handleMainRequest(request) {
  const responseMessage = "baka";
  return new Response(responseMessage, { status: 200 });
}

async function incrementMessageCount(userID) {
  // Check if the user ID is already in the KV store
  const kvValue = await ppu.get(userID.toString());

  // If the user ID is not in the KV store, save it with an initial message count of 0
  if (kvValue === null) {
    await ppu.put(userID.toString(), '0', { expirationTtl: 86400 * 7 });
  }

  // Get the user's message count from the KV store and increment it
  let messageCount = parseInt(await ppu.get(userID.toString()), 10);
  messageCount++;

  // Save the updated message count to the KV store
  await ppu.put(userID.toString(), messageCount.toString(), { expirationTtl: 86400 * 7 });
}
