// Animate Text Engine - Based on pixel-point/animate-text catalog specs
// Supports: soft-blur-in, per-character-rise, typewriter, kinetic-center-build, shimmer-sweep, micro-scale-fade

export class AnimateText {
  /**
   * Split text into spans for character, word, or line animation
   */
  static split(element, mode = 'character') {
    const text = element.dataset.originalText || element.innerText;
    element.dataset.originalText = text;
    element.innerHTML = '';

    if (mode === 'character') {
      const chars = Array.from(text);
      chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'anim-char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--char-index', index);
        span.style.display = 'inline-block';
        element.appendChild(span);
      });
    } else if (mode === 'word') {
      const words = text.split(' ');
      words.forEach((word, index) => {
        const span = document.createElement('span');
        span.className = 'anim-word';
        span.textContent = word;
        span.style.setProperty('--word-index', index);
        span.style.display = 'inline-block';
        span.style.marginRight = '0.28em';
        element.appendChild(span);
      });
    }
  }

  /**
   * Soft Blur In (Apple-style per-character fade with gentle blur and upward motion)
   */
  static softBlurIn(element, durationMs = 800, staggerMs = 28) {
    this.split(element, 'character');
    const chars = element.querySelectorAll('.anim-char');
    
    chars.forEach((char, i) => {
      char.style.opacity = '0';
      char.style.filter = 'blur(12px)';
      char.style.transform = 'translateY(16px) scale(0.95)';
      char.style.transition = `all ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${i * staggerMs}ms`;
      
      requestAnimationFrame(() => {
        char.style.opacity = '1';
        char.style.filter = 'blur(0px)';
        char.style.transform = 'translateY(0px) scale(1)';
      });
    });
  }

  /**
   * Per-Character Rise (Crisp kinetic bottom-up letter reveal with zero blur)
   */
  static perCharacterRise(element, durationMs = 600, staggerMs = 24) {
    this.split(element, 'character');
    const chars = element.querySelectorAll('.anim-char');
    
    chars.forEach((char, i) => {
      char.style.opacity = '0';
      char.style.filter = 'none';
      char.style.transform = 'translateY(28px)';
      char.style.transition = `all ${durationMs}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * staggerMs}ms`;
      
      requestAnimationFrame(() => {
        char.style.opacity = '1';
        char.style.transform = 'translateY(0px)';
      });
    });
  }

  /**
   * Typewriter Effect (Step-by-step kinetic typing rhythm with active cursor)
   */
  static typewriter(element, speedMs = 38, callback = null) {
    const text = element.dataset.originalText || element.innerText;
    element.dataset.originalText = text;
    element.innerHTML = '';
    
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'anim-cursor';
    cursor.textContent = '█';
    cursor.style.display = 'inline-block';
    cursor.style.color = 'var(--tui-accent)';
    cursor.style.animation = 'cursorBlink 0.8s infinite';
    
    const textContainer = document.createElement('span');
    element.appendChild(textContainer);
    element.appendChild(cursor);

    function type() {
      if (i < text.length) {
        textContainer.textContent += text.charAt(i);
        i++;
        setTimeout(type, speedMs);
      } else {
        if (callback) callback();
      }
    }
    type();
  }

  /**
   * Shimmer Sweep Effect (Radiant gradient sweep gliding across characters)
   */
  static shimmerSweep(element) {
    const text = element.dataset.originalText || element.innerText;
    element.dataset.originalText = text;
    element.classList.add('anim-shimmer-sweep');
  }

  /**
   * Kinetic Center Build (Per-word entry with centered physics push)
   */
  static kineticCenterBuild(element, durationMs = 700, staggerMs = 120) {
    this.split(element, 'word');
    const words = element.querySelectorAll('.anim-word');
    
    words.forEach((word, i) => {
      word.style.opacity = '0';
      word.style.filter = 'blur(8px)';
      word.style.transform = 'scale(0.7) translateY(12px)';
      word.style.transition = `all ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) ${i * staggerMs}ms`;
      
      requestAnimationFrame(() => {
        word.style.opacity = '1';
        word.style.filter = 'blur(0px)';
        word.style.transform = 'scale(1) translateY(0px)';
      });
    });
  }

  /**
   * Animate Numeric Counters (0 -> Target with smooth cubic easing)
   */
  static counter(element, target, durationMs = 1200, prefix = '', suffix = '') {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * ease);
      element.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = `${prefix}${target}${suffix}`;
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * Apply named effect from catalog
   */
  static apply(element, effectId = 'soft-blur-in') {
    if (!element) return;
    switch (effectId) {
      case 'soft-blur-in':
        this.softBlurIn(element);
        break;
      case 'per-character-rise':
        this.perCharacterRise(element);
        break;
      case 'typewriter':
        this.typewriter(element);
        break;
      case 'shimmer-sweep':
        this.shimmerSweep(element);
        break;
      case 'kinetic-center-build':
        this.kineticCenterBuild(element);
        break;
      default:
        this.softBlurIn(element);
    }
  }
}
