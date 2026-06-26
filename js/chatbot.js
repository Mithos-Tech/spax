// ============================================================================
// js/chatbot.js — Widget de chat IA (Spax Assistant)
// Llama a /api/chat (función serverless de Vercel), que a su vez consulta
// la API de Gemini. La API key nunca toca este archivo ni el navegador.
// ============================================================================
(function () {
  const toggleBtn = document.getElementById('spax-chat-toggle');
  const chatWindow = document.getElementById('spax-chat-window');
  const closeBtn = document.getElementById('spax-chat-close');
  const messagesEl = document.getElementById('spax-chat-messages');
  const form = document.getElementById('spax-chat-form');
  const input = document.getElementById('spax-chat-input');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  // El widget puede no estar presente si esta página no lo incluye.
  if (!toggleBtn || !chatWindow || !form || !input) return;

  const WELCOME_MESSAGE =
    '¡Hola! 👋 Soy el asistente virtual de Spax. Puedo contarte sobre nuestros servicios de dermatología, horarios y cómo agendar una cita. ¿En qué puedo ayudarte?';

  let history = []; // [{ role: 'user' | 'model', text: string }]
  let isOpen = false;
  let isSending = false;

  // Icono pequeño reutilizado en el avatar del asistente (mismo glifo que el botón flotante)
  const AVATAR_ICON =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5c0 4.69-4.03 8.5-9 8.5-1.06 0-2.07-.16-3-.46L3 21l1.6-4.18C3.59 15.4 3 13.52 3 11.5 3 6.81 7.03 3 12 3s9 3.81 9 8.5Z" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function buildAvatar() {
    const avatar = document.createElement('div');
    avatar.className = 'spax-avatar';
    avatar.innerHTML = AVATAR_ICON;
    return avatar;
  }

  function appendMessage(role, text) {
    const row = document.createElement('div');
    row.className = `spax-row spax-row-${role}`;
    if (role === 'model') row.appendChild(buildAvatar());

    const bubble = document.createElement('div');
    bubble.className = `spax-msg spax-msg-${role}`;
    bubble.textContent = text; // textContent evita inyección de HTML
    row.appendChild(bubble);

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'spax-row spax-row-model';
    row.id = 'spax-typing-indicator';
    row.appendChild(buildAvatar());

    const typing = document.createElement('div');
    typing.className = 'spax-msg spax-msg-model spax-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    row.appendChild(typing);

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('spax-typing-indicator');
    if (typing) typing.remove();
  }

  function openChat() {
    isOpen = true;
    chatWindow.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    if (messagesEl.childElementCount === 0) {
      appendMessage('model', WELCOME_MESSAGE);
    }
    input.focus();
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', () => (isOpen ? closeChat() : openChat()));
  if (closeBtn) closeBtn.addEventListener('click', closeChat);

  // Cerrar con la tecla Escape (accesibilidad + respaldo si el botón X falla)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) closeChat();
  });

  // Cerrar al hacer clic fuera del widget (patrón estándar en chats comerciales)
  document.addEventListener('click', (event) => {
    if (isOpen && !chatWindow.contains(event.target) && !toggleBtn.contains(event.target)) {
      closeChat();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || isSending) return;

    appendMessage('user', text);
    input.value = '';
    isSending = true;
    if (submitBtn) submitBtn.disabled = true;
    showTyping();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await response.json().catch(() => ({}));
      hideTyping();

      if (!response.ok) {
        appendMessage('model', data.error || 'Ocurrió un error. Intenta de nuevo en unos segundos.');
        return;
      }

      appendMessage('model', data.reply);
      history.push({ role: 'user', text });
      history.push({ role: 'model', text: data.reply });
    } catch (err) {
      hideTyping();
      appendMessage('model', 'No pude conectarme. Revisa tu conexión e intenta de nuevo.');
    } finally {
      isSending = false;
      if (submitBtn) submitBtn.disabled = false;
      input.focus();
    }
  });
})();
