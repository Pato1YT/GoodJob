// Servicio de Inteligencia Artificial para GoodJob conectando directamente con OpenAI
// Soporta tanto texto como visión por computadora (fotos del problema técnico)

export interface AIDiagnosisResult {
  summary: string;
  category: string;
  categoryName: string;
  urgency: 'baja' | 'media' | 'alta';
  estimatedCostRange: string;
  estimatedTime: string;
  recommendedMaterials: string[];
  explanation: string;
}

export const aiService = {
  /**
   * Diagnostica un problema a partir de una descripción en texto y opcionalmente una foto en base64
   */
  async diagnoseJob(
    description: string,
    imageBase64?: string
  ): Promise<AIDiagnosisResult> {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'No se ha configurado EXPO_PUBLIC_OPENAI_API_KEY en las variables de entorno.'
      );
    }

    const systemPrompt = `Eres el asistente experto de diagnóstico técnico de "GoodJob", una plataforma de servicios del hogar y oficios (Plomería, Electricidad, Cerrajería, Pintura, Carpintería, Climatización/AC, Limpieza, Construcción, Albañilería, etc.).

Tu objetivo es analizar la consulta del usuario (y la imagen si la proporciona) y devolver un JSON EXACTO con el diagnóstico técnico, costo aproximado en Pesos Mexicanos (MXN), urgencia, tiempo estimado y categoría idónea de profesional.

Debes responder ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin comillas de markdown, sin texto adicional):
{
  "summary": "Título conciso del problema (máximo 6 palabras)",
  "category": "ID_CATEGORIA (ej: plomeria, electricidad, cerrajeria, pintura, carpinteria, climatizacion, limpieza, albañileria)",
  "categoryName": "Nombre legible de la categoría (ej: Plomería, Electricidad)",
  "urgency": "baja | media | alta",
  "estimatedCostRange": "$XXX - $YYY MXN (mano de obra aproximada)",
  "estimatedTime": "ej. 1 a 2 horas",
  "recommendedMaterials": ["Material o refacción 1", "Material 2"],
  "explanation": "Explicación clara y accesible para el cliente de qué ocurre, por qué sucede y qué hará el especialista para solucionarlo."
}`;

    // Construcción del contenido del mensaje de usuario
    const userContent: any[] = [
      {
        type: 'text',
        text: description.trim()
          ? description
          : 'Por favor analiza la imagen adjunta e indícame qué problema hay, qué especialista necesito y el costo estimado.',
      },
    ];

    if (imageBase64) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: imageBase64.startsWith('data:')
            ? imageBase64
            : `data:image/jpeg;base64,${imageBase64}`,
          detail: 'low',
        },
      });
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error:', errorText);
        throw new Error(`OpenAI error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Respuesta vacía de OpenAI');
      }

      const parsed: AIDiagnosisResult = JSON.parse(content);
      return parsed;
    } catch (err: any) {
      console.error('Error al consultar OpenAI:', err);
      throw err;
    }
  },

  /**
   * Asistente en modo chat continuo para resolver dudas y cotizaciones rápidas
   */
  async chatWithAssistant(
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
  ): Promise<string> {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      return 'No se ha configurado la API Key de OpenAI. Por favor verifica tu archivo de entorno.';
    }

    const systemMessage = {
      role: 'system',
      content:
        'Eres GoodJob AI, el asistente inteligente y amigable de GoodJob en México. Ayudas a los clientes a entender fallas en su casa, estimar costos justos de oficios (plomería, electricidad, cerrajería, pintura, etc.), dar consejos de prevención y recomendarles contratar especialistas confiables en la plataforma.',
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [systemMessage, ...messages],
          temperature: 0.6,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI status ${response.status}`);
      }

      const data = await response.json();
      return (
        data.choices?.[0]?.message?.content ||
        'No pude procesar la respuesta en este momento.'
      );
    } catch (err) {
      console.error('Error in chatWithAssistant:', err);
      return 'Lo siento, hubo un problema al conectar con el servidor de inteligencia artificial. Inténtalo de nuevo.';
    }
  },
};
