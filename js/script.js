// ===================== Spax · script principal =====================
document.addEventListener('DOMContentLoaded', () => {

  // Forzar que la página inicie exactamente en la parte superior (Hero) al cargar o recargar
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Función robusta para limpiar cualquier scroll-state y forzar la posición (0,0)
  const forceScrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Forzar inmediatamente en DOMContentLoaded
  forceScrollToTop();

  // Escuchar el evento 'load' e interceder varias veces durante el ciclo de renderizado
  // para neutralizar cualquier carga asíncrona de iframes, imágenes o restauración de hash del navegador
  window.addEventListener('load', () => {
    forceScrollToTop();
    setTimeout(forceScrollToTop, 20);
    setTimeout(forceScrollToTop, 80);
    setTimeout(forceScrollToTop, 250);
    setTimeout(forceScrollToTop, 500);
  });

  // Limpiar hash de la URL si se ingresa/recarga con #contacto para asegurar inicio limpio desde arriba
  // sin interferir con las navegaciones internas posteriores
  if (window.location.hash) {
    // Si queremos preservar el hash para un anchor legítimo pero que comience arriba, 
    // la secuencia asíncrona lo asegura. De lo contrario, opcionalmente se puede limpiar.
    setTimeout(forceScrollToTop, 10);
  }

  // Header flotante sofisticado - se desvanece al salir del Hero, y vuelve a aparecer al regresar
  const header = document.getElementById('siteHeader');
  const heroSection = document.getElementById('inicio');
  const onScrollHeader = () => {
    if (!heroSection) return;
    const heroHeight = heroSection.offsetHeight;
    // Se desvanece al salir de la sección Hero y vuelve a aparecer al regresar al inicio
    if (window.scrollY > (heroHeight - 120)) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
  };
  document.addEventListener('scroll', onScrollHeader);
  onScrollHeader();

  // ScrollSpy - Resaltado dinámico del menú al hacer scroll
  const sections = document.querySelectorAll('section[id], header[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-main a');

  const scrollspy = () => {
    const scrollPos = window.scrollY || document.documentElement.scrollTop;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 110;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });

    // Fallback para inicio cuando estamos arriba del todo
    if (scrollPos < 100 && navLinks[0]) {
      navLinks.forEach(l => l.classList.remove('active'));
      navLinks[0].classList.add('active');
    }
  };
  document.addEventListener('scroll', scrollspy);
  scrollspy();

  // FAQ dynamic master-detail handling
  const faqButtons = document.querySelectorAll('.faq-selector-btn');
  const faqTitle = document.getElementById('faq-display-title');
  const faqText = document.getElementById('faq-display-text');

  if (faqButtons.length > 0 && faqTitle && faqText) {
    const faqData = [
      {
        q: "¿Qué tipo de tratamientos ofrecen?",
        a: "Ofrecemos una amplia gama de tratamientos dermatológicos, incluyendo cuidado del acné, manejo de la psoriasis, chequeos de cáncer de piel y procedimientos estéticos como botox."
      },
      {
        q: "¿Necesito una consulta antes de iniciar un tratamiento?",
        a: "Sí, realizamos una evaluación inicial para diseñar un plan de tratamiento personalizado según tu tipo de piel y objetivos."
      },
      {
        q: "¿Sus tratamientos son aptos para todo tipo de piel?",
        a: "Adaptamos cada procedimiento según las características individuales de tu piel para obtener resultados óptimos y seguros."
      },
      {
        q: "¿Ofrecen servicios de dermatología cosmética?",
        a: "Sí, contamos con tratamientos estéticos como reducción de arrugas, reafirmación de piel y revisión de cicatrices."
      },
      {
        q: "¿Qué debo esperar en mi primera visita?",
        a: "Realizamos una evaluación completa de tu piel y conversamos sobre tus objetivos para definir el mejor plan de acción."
      }
    ];

    faqButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'), 10);
        if (isNaN(index) || index < 0 || index >= faqData.length) return;

        // Toggle active button
        faqButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Apply animated transition to the display panel content
        const displayCardContent = document.querySelector('.faq-display-content');
        if (displayCardContent) {
          displayCardContent.style.opacity = '0';
          displayCardContent.style.transform = 'translateY(12px)';
          
          setTimeout(() => {
            faqTitle.textContent = faqData[index].q;
            faqText.textContent = faqData[index].a;
            displayCardContent.style.opacity = '1';
            displayCardContent.style.transform = 'translateY(0)';
          }, 200); // Wait for fade-out to complete
        } else {
          faqTitle.textContent = faqData[index].q;
          faqText.textContent = faqData[index].a;
        }
      });
    });
  }

  // Animación de aparición al hacer scroll (Reveal)
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => io.observe(el));

  // Slider antes/después (arrastrar para comparar)
  document.querySelectorAll('.ba-item').forEach(item => {
    const handle = item.querySelector('.ba-handle');
    const divider = item.querySelector('.ba-divider');
    let dragging = false;

    const setPos = (clientX) => {
      const rect = item.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(8, Math.min(92, pct));
      handle.style.left = pct + '%';
      divider.style.left = pct + '%';
      item.style.setProperty('--position', pct + '%');
    };

    handle.addEventListener('mousedown', () => dragging = true);
    window.addEventListener('mouseup', () => dragging = false);
    window.addEventListener('mousemove', (e) => { if (dragging) setPos(e.clientX); });

    handle.addEventListener('touchstart', () => dragging = true, { passive: true });
    window.addEventListener('touchend', () => dragging = false);
    window.addEventListener('touchmove', (e) => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  });

  // Menú móvil premium e inteligente (cierra el menú al hacer clic en enlaces)
  const toggle = document.querySelector('.menu-toggle');
  if (toggle && header) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      header.classList.toggle('menu-open');
    });

    // Cerrar menú al hacer clic fuera del mismo
    document.addEventListener('click', (e) => {
      if (header.classList.contains('menu-open') && !header.contains(e.target)) {
        header.classList.remove('menu-open');
      }
    });

    // Cerrar menú al presionar un enlace de la navegación
    document.querySelectorAll('.nav-main a').forEach(link => {
      link.addEventListener('click', () => {
        header.classList.remove('menu-open');
      });
    });
  }

  // Envío de formularios vía Formspree (AJAX, sin recargar la página)
  const handleFormspreeSubmit = (form, feedbackId, messages) => {
    if (!form) return;
    const feedback = document.getElementById(feedbackId);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const action = form.getAttribute('action') || '';
      if (action.includes('TU_FORM_ID')) {
        feedback.textContent = 'Configuración pendiente: Reemplaza TU_FORM_ID en index.html con tu Form ID de Formspree.';
        feedback.className = 'form-feedback show error' + (feedback.classList.contains('on-dark') ? ' on-dark' : '');
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '.7'; }
      try {
        const res = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          feedback.textContent = messages.success;
          feedback.className = 'form-feedback show success' + (feedback.classList.contains('on-dark') ? ' on-dark' : '');
          form.reset();
        } else {
          feedback.textContent = messages.error;
          feedback.className = 'form-feedback show error' + (feedback.classList.contains('on-dark') ? ' on-dark' : '');
        }
      } catch (err) {
        feedback.textContent = messages.error;
        feedback.className = 'form-feedback show error' + (feedback.classList.contains('on-dark') ? ' on-dark' : '');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = '1'; submitBtn.innerHTML = originalLabel; }
      }
    });
  };

  handleFormspreeSubmit(document.getElementById('contactForm'), 'contactFeedback', {
    success: '¡Gracias! Tu solicitud fue enviada. Te contactaremos muy pronto.',
    error: 'No pudimos enviar tu mensaje. Intenta nuevamente o escríbenos a hola@spax.pe.'
  });

  handleFormspreeSubmit(document.getElementById('newsletterForm'), 'newsletterFeedback', {
    success: '¡Listo! Ya estás suscrito a nuestras novedades.',
    error: 'No pudimos completar la suscripción. Intenta de nuevo.'
  });

  // ===================== Carrusel de Servicios de Estilo Framer =====================
  const track = document.querySelector('.services-track');
  const cards = document.querySelectorAll('.services-track .service-card');
  const wrapper = document.querySelector('.services-carousel-wrapper');
  const prevBtn = document.getElementById('services-prev');
  const nextBtn = document.getElementById('services-next');
  const counterEl = document.getElementById('services-counter');

  if (track && wrapper && cards.length > 0) {
    let currentIndex = 0;

    const getCarouselParams = () => {
      let visibleCards = 3; // 3 elegant cards on large screens
      if (window.innerWidth <= 1024) {
        visibleCards = 2; // 2 cards on medium screens / tablets
      }
      if (window.innerWidth <= 640) {
        visibleCards = 1; // 1 card on mobile
      }
      const gap = window.innerWidth <= 640 ? 16 : 32; // Generous 32px gap for elegant breathing room
      return { visibleCards, gap };
    };

    const updateCarousel = () => {
      const { visibleCards, gap } = getCarouselParams();
      
      // Calculate wrapper inner width to account for elegant responsive padding
      const style = window.getComputedStyle(wrapper);
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;
      const wrapperInnerWidth = wrapper.offsetWidth - paddingLeft - paddingRight;
      
      // Apply physical gap structure so elements are actually separated visually
      track.style.gap = `${gap}px`;
      
      // Calculate card width precisely based on content area width
      const cardWidth = (wrapperInnerWidth - (visibleCards - 1) * gap) / visibleCards;

      // Max sliding index
      const maxIndex = cards.length - visibleCards;
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      // Apply widths and toggle active states for sophisticated focus effect
      cards.forEach((card, idx) => {
        card.style.minWidth = `${cardWidth}px`;
        card.style.width = `${cardWidth}px`;
        
        if (idx >= currentIndex && idx < currentIndex + visibleCards) {
          card.classList.add('active-slide');
        } else {
          card.classList.remove('active-slide');
        }
      });

      // Calculate sliding offset
      const translateX = -currentIndex * (cardWidth + gap);
      track.style.transform = `translateX(${translateX}px)`;

      // Update button disabled state
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === maxIndex;

      // Render counter state
      updateCounter(maxIndex + 1);
    };

    const updateCounter = (totalPages) => {
      if (!counterEl) return;
      const currentStr = String(currentIndex + 1).padStart(2, '0');
      const totalStr = String(totalPages).padStart(2, '0');
      counterEl.textContent = `${currentStr} / ${totalStr}`;
    };

    // Navigation triggers
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const { visibleCards } = getCarouselParams();
        const maxIndex = cards.length - visibleCards;
        if (currentIndex < maxIndex) {
          currentIndex++;
          updateCarousel();
        }
      });
    }

    // Touch and mouse dragging support with premium tactile feel
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const dragStart = (clientX) => {
      startX = clientX;
      currentX = clientX;
      isDragging = true;
      track.style.transition = 'none'; // remove transitions for responsive feed
      track.style.cursor = 'grabbing';
    };

    const dragMove = (clientX) => {
      if (!isDragging) return;
      currentX = clientX;
      const diffX = currentX - startX;
      
      const { visibleCards, gap } = getCarouselParams();
      const style = window.getComputedStyle(wrapper);
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;
      const wrapperInnerWidth = wrapper.offsetWidth - paddingLeft - paddingRight;

      const cardWidth = (wrapperInnerWidth - (visibleCards - 1) * gap) / visibleCards;
      const baseTranslate = -currentIndex * (cardWidth + gap);
      
      // Calculate elastic translation
      let dragTranslate = baseTranslate + diffX;
      const maxIndex = cards.length - visibleCards;
      const minTranslate = 0;
      const maxTranslate = -maxIndex * (cardWidth + gap);

      if (dragTranslate > minTranslate) {
        dragTranslate = minTranslate + (dragTranslate - minTranslate) * 0.3;
      } else if (dragTranslate < maxTranslate) {
        dragTranslate = maxTranslate + (dragTranslate - maxTranslate) * 0.3;
      }

      track.style.transform = `translateX(${dragTranslate}px)`;
    };

    const dragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
      track.style.cursor = 'grab';
      
      const diffX = currentX - startX;
      const threshold = 55; // threshold to switch index
      const { visibleCards } = getCarouselParams();
      const maxIndex = cards.length - visibleCards;

      if (diffX < -threshold && currentIndex < maxIndex) {
        currentIndex++;
      } else if (diffX > threshold && currentIndex > 0) {
        currentIndex--;
      }
      
      updateCarousel();
    };

    // Events registration
    wrapper.style.cursor = 'grab';

    // Touch
    wrapper.addEventListener('touchstart', (e) => {
      dragStart(e.touches[0].clientX);
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
      dragMove(e.touches[0].clientX);
    }, { passive: true });

    wrapper.addEventListener('touchend', dragEnd);

    // Mouse
    wrapper.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Prevents image default outline/dragging behaviour
      dragStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        dragMove(e.clientX);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        dragEnd();
      }
    });

    // Handle window resize dynamically
    window.addEventListener('resize', updateCarousel);
    
    // Initial display call
    updateCarousel();
  }
});
