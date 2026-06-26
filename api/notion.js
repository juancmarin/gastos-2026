// api/notion.js
// Proxy serverless entre el dashboard y la API de Notion.
// El token vive en las variables de entorno de Vercel (NUNCA en el repo).

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    return res.status(500).json({
      error: 'Faltan variables de entorno NOTION_TOKEN o NOTION_DATABASE_ID en Vercel'
    });
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json'
  };

  try {
    if (req.method === 'GET') {
      const { mes } = req.query;
      const body = mes
        ? {
            filter: { property: 'Mes', select: { equals: mes } },
            sorts: [{ property: 'Fecha de Pago', direction: 'descending' }]
          }
        : { sorts: [{ property: 'Fecha de Pago', direction: 'descending' }] };

      const response = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      const gastos = data.results.map((page) => ({
        id: page.id,
        gasto: page.properties.Gasto?.title?.[0]?.plain_text || '',
        monto: page.properties.Monto?.number || 0,
        categoria: page.properties['Categoría']?.select?.name || '',
        subcategoria: page.properties['Subcategoría']?.select?.name || '',
        mes: page.properties.Mes?.select?.name || '',
        tipo: page.properties['Tipo de Gasto']?.select?.name || '',
        metodoPago: page.properties['Método de Pago']?.select?.name || '',
        estado: page.properties.Estado?.select?.name || '',
        fechaPago: page.properties['Fecha de Pago']?.created_time || '',
        notas: page.properties.Notas?.rich_text?.[0]?.plain_text || ''
      }));

      return res.status(200).json({ gastos });
    }

    if (req.method === 'POST') {
      const { gasto, monto, categoria, subcategoria, mes, tipo, metodoPago, estado, notas } = req.body || {};

      if (!gasto) {
        return res.status(400).json({ error: 'El campo "gasto" es obligatorio' });
      }

      const properties = {
        Gasto: { title: [{ text: { content: gasto } }] },
        Monto: { number: Number(monto) || 0 }
      };

      if (categoria) properties['Categoría'] = { select: { name: categoria } };
      if (subcategoria) properties['Subcategoría'] = { select: { name: subcategoria } };
      if (mes) properties['Mes'] = { select: { name: mes } };
      if (tipo) properties['Tipo de Gasto'] = { select: { name: tipo } };
      if (metodoPago) properties['Método de Pago'] = { select: { name: metodoPago } };
      if (estado) properties['Estado'] = { select: { name: estado } };
      if (notas) properties['Notas'] = { rich_text: [{ text: { content: notas } }] };

      const response = await fetch(`${NOTION_API}/pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties
        })
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      return res.status(201).json({ id: data.id, ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Falta el parámetro "id"' });

      const response = await fetch(`${NOTION_API}/pages/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ archived: true })
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);

      return res.status(200).json({ archived: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
