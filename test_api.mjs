async function run() {
  try {
    const response = await fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formData: {
          fullName: "Test User",
          email: "test@example.com",
          phone: "123",
          streetAddress: "123 Main St",
          city: "Test City",
          state: "NJ",
          zipCode: "12345",
          orderNotes: ""
        },
        cartItems: [
          {
            name: "Test Product",
            quantity: 1,
            price: 10,
            options: {},
            addons: []
          }
        ],
        cartSubtotal: 10
      })
    });
    const result = await response.json();
    console.log("Status:", response.status);
    console.log("Result:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}
run();
