import emailjs from '@emailjs/browser'

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

if (serviceId && publicKey) {
  emailjs.init(publicKey)
}

export const emailjsConfig = {
  serviceId,
  templates: {
    welcome: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_WELCOME,
    summary: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_SUMMARY,
    report: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_REPORT,
  },
}

export default emailjs




