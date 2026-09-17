

async function testSolaKey() {
  const apiKey = process.env.SOLA_API_KEY;
  if (!apiKey) {
    console.error("SOLA_API_KEY not found in .env.local");
    return;
  }

  console.log("Testing API Key ending with:", apiKey.slice(-4));

  const payload = new URLSearchParams({
    xKey: apiKey,
    xVersion: "4.5.9",
    xSoftwareName: "Dandicraft Test",
    xSoftwareVersion: "1.0",
    xCommand: "cc:sale",
    xAmount: "1.00",
    // Leaving card details empty to see what kind of error we get.
    // If the key is invalid, we usually get an authentication error first.
  });

  try {
    const res = await fetch("https://x1.cardknox.com/gateway", {
      method: "POST",
      body: payload.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    
    const text = await res.text();
    console.log("\nRaw Gateway Response:");
    console.log(text);


  } catch (error) {
    console.error("Fetch error:", error);
  }
}

testSolaKey();
