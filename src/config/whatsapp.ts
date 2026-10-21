import axios from "axios";

/* WhatsApp Business Cloud API (Meta)
   Needs in .env:
     WHATSAPP_TOKEN            – permanent access token (System User token)
     WHATSAPP_PHONE_NUMBER_ID  – ID of the business phone number in Meta Business
     WHATSAPP_BUSINESS_ACCOUNT_ID – optional, lets the admin pick from approved templates
     WHATSAPP_API_VERSION      – optional, defaults to v25.0 */

const apiVersion = () => process.env.WHATSAPP_API_VERSION || "v25.0";
const authHeaders = () => ({ Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` });

export const isWhatsAppConfigured = () =>
  Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

export type TemplateSummary = {
  name: string;
  language: string;
  category: string;
  header?: string; // header text, if any
  headerFormat?: string; // TEXT | IMAGE | VIDEO | DOCUMENT
  body: string;
  footer?: string;
  variableCount: number; // number of {{n}} blanks in the body
};

// Approved templates that this sender supports (body variables + optional image header)
export const listApprovedTemplates = async (): Promise<TemplateSummary[]> => {
  const res = await axios.get(
    `https://graph.facebook.com/${apiVersion()}/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
    {
      params: { fields: "name,language,status,category,components", limit: 200 },
      headers: authHeaders(),
      timeout: 15000,
    }
  );

  return (res.data?.data || [])
    .filter((t: any) => t.status === "APPROVED")
    .filter((t: any) => !t.components?.some((c: any) => c.type === "CAROUSEL"))
    .map((t: any) => {
      const part = (type: string) => t.components?.find((c: any) => c.type === type);
      const header = part("HEADER");
      const body = part("BODY")?.text || "";
      const vars = new Set(body.match(/\{\{\d+\}\}/g) || []);
      return {
        name: t.name,
        language: t.language,
        category: t.category,
        header: header?.text,
        headerFormat: header?.format,
        body,
        footer: part("FOOTER")?.text,
        variableCount: vars.size,
      };
    })
    // text headers with variables / video / document headers aren't supported by the sender
    .filter(
      (t: TemplateSummary) =>
        !t.headerFormat ||
        t.headerFormat === "IMAGE" ||
        (t.headerFormat === "TEXT" && !/\{\{\d+\}\}/.test(t.header || ""))
    );
};

type TemplateMessage = {
  to: string; // digits with country code, e.g. 919876543210
  templateName: string;
  language: string;
  params?: string[];
  headerImage?: string;
};

export const sendWhatsAppTemplate = async ({
  to,
  templateName,
  language,
  params = [],
  headerImage,
}: TemplateMessage) => {
  const components: any[] = [];

  if (headerImage) {
    components.push({
      type: "header",
      parameters: [{ type: "image", image: { link: headerImage } }],
    });
  }
  if (params.length) {
    components.push({
      type: "body",
      parameters: params.map((text) => ({ type: "text", text })),
    });
  }

  const res = await axios.post(
    `https://graph.facebook.com/${apiVersion()}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        ...(components.length && { components }),
      },
    },
    {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      timeout: 15000,
    }
  );

  return res.data;
};

// message id from a successful send response
export const messageIdOf = (data: any): string | undefined => data?.messages?.[0]?.id;

// readable error from a failed Meta API call
export const whatsAppError = (error: any): string =>
  error?.response?.data?.error?.error_data?.details ||
  error?.response?.data?.error?.message ||
  error?.message ||
  "Unknown error";
