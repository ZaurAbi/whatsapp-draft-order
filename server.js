const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔧 ЗАМЕНИ на свои данные:
const SHOPIFY_ACCESS_TOKEN = 'ТВОЙ_SHOPIFY_ACCESS_TOKEN';
const SHOPIFY_STORE = 'tcczxm-uc.myshopify.com'; // БЕЗ https://
const WHATSAPP_NUMBER = '994XXXXXXXXX'; // В международном формате, без плюса

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

    const itemsText = lineItems
      .map(i => `- Variant ID ${i.variant_id} x${i.quantity}`)
      .join('%0A');

    const message = `Salam, bu məhsulları sifariş etmək istəyirəm:%0A${itemsText}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    res.json({ success: true, whatsappUrl });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log('✅ Server started on port 3000');
});
