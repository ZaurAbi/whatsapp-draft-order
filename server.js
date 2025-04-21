const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Используем переменные окружения (без ошибок)
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN?.trim();
const SHOPIFY_STORE = process.env.SHOPIFY_STORE?.trim();
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER?.trim();

app.post('/create-order', async (req, res) => {
  const lineItems = req.body.line_items;

  try {
    const response = await axios.post(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/draft_orders.json`,
      {
        draft_order: {
          line_items: lineItems,
          note: 'Sifariş WhatsApp vasitəsilə',
          tags: 'whatsapp'
        }
      },
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    // 🟢 Успешно отправлено в Shopify
    const itemsText = lineItems
      .map(i => `- Variant ID ${i.variant_id} x${i.quantity}`)
      .join('%0A');

    const message = `Salam, bu məhsulları sifariş etmək istəyirəm:%0A${itemsText}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    res.json({ success: true, whatsappUrl });
  } catch (err) {
    console.error('❌ Shopify API Error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log('✅ Server started on port 3000');
});
