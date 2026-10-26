/* ===== CEGO 메인 JS (h2o 디자인 시스템) ===== */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const halo = document.querySelector('.header-halo');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. 헤더 반달 낙하 ──────────────────────────
  const drop = () => {
    if (!halo || reduce) return;
    halo.classList.remove('drop'); void halo.offsetWidth; halo.classList.add('drop');
  };
  drop();

  // ── 2. 현재 메뉴 표시 ──────────────────────────
  const page = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.gnb > a').forEach(a => {
    const pages = (a.dataset.pages || '').split(' ');
    if (pages.includes(page)) a.classList.add('cur');
  });

  // ── 3. 메가 메뉴 ──────────────────────────────
  const gnb = document.querySelector('.gnb');
  const mega = document.querySelector('.mega');
  if (gnb && mega) {
    let closeT;
    const cols = [...mega.querySelectorAll('.mega-col')];
    const links = [...gnb.querySelectorAll(':scope > a')];
    const setHot = (i) => {
      links.forEach((l, k) => l.classList.toggle('hot', k === i));
      cols.forEach((c, k) => c.classList.toggle('hot', k === i));
      mega.classList.toggle('has-hot', i >= 0);
    };
    const open = (i) => { clearTimeout(closeT); mega.classList.add('open'); setHot(i); };
    const close = () => { closeT = setTimeout(() => { mega.classList.remove('open'); setHot(-1); }, 120); };
    links.forEach((l, i) => {
      l.addEventListener('mouseenter', () => open(i));
      l.addEventListener('focus', () => open(i));
    });
    cols.forEach((c, i) => {
      c.addEventListener('mouseenter', () => open(i));
      c.addEventListener('focusin', () => open(i));
    });
    [gnb, mega].forEach(el => { el.addEventListener('mouseleave', close); });
    mega.addEventListener('focusout', (e) => { if (!mega.contains(e.relatedTarget) && !gnb.contains(e.relatedTarget)) close(); });
    gnb.addEventListener('focusout', (e) => { if (!mega.contains(e.relatedTarget) && !gnb.contains(e.relatedTarget)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { mega.classList.remove('open'); setHot(-1); } });
    mega.querySelectorAll('a').forEach(a => a.addEventListener('click', drop));
    links.forEach(a => a.addEventListener('click', drop));
  }

  // ── 4. 모바일 전체화면 메뉴 ─────────────────────
  const burger = document.querySelector('.burger');
  const mnav = document.getElementById('mnav');
  if (burger && mnav) {
    const set = (on) => {
      burger.setAttribute('aria-expanded', on);
      burger.setAttribute('aria-label', on ? '메뉴 닫기' : '메뉴 열기');
      mnav.hidden = !on;
      document.body.classList.toggle('lock', on);
    };
    burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
    mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    window.matchMedia('(min-width: 961px)').addEventListener('change', (m) => { if (m.matches) set(false); });
  }

  // ── 5. 스크롤 등장 (.rv) ───────────────────────
  const rvs = document.querySelectorAll('.rv');
  rvs.forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
    el.style.setProperty('--i', Math.min(sibs.indexOf(el), 5));
  });
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(el => io.observe(el));
  } else {
    rvs.forEach(el => el.classList.add('in'));
  }

  // ── 6. 홈 영상 카드 히어로 ─────────────────────
  const vhero = document.querySelector('.vhero');
  if (vhero) {
    const v = vhero.querySelector('video');
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    if (v && !reduce) {
      v.poster = mobile ? v.dataset.posterMobile : v.dataset.posterDesktop;
      v.src = mobile ? v.dataset.srcMobile : v.dataset.srcDesktop;
      const tryPlay = () => {
        const p = v.play();
        if (p && p.then) p.then(() => vhero.classList.remove('no-video')).catch(() => vhero.classList.add('no-video'));
      };
      tryPlay();
      ['touchstart', 'click', 'keydown'].forEach(ev => window.addEventListener(ev, () => { if (v.paused) tryPlay(); }, { once: true, passive: true }));
    } else {
      vhero.classList.add('no-video');
    }
    if (!reduce) {
      const maxI = mobile ? 10 : 16;
      const onScroll = () => {
        const r = vhero.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / (r.height * 0.55)));
        vhero.style.setProperty('--vi', (maxI * (1 - p)).toFixed(2) + 'px');
        vhero.style.setProperty('--vr', (28 * (1 - p)).toFixed(2) + 'px');
        vhero.style.setProperty('--vs', (1 + 0.08 * p).toFixed(4));
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
    }
  }

  // ── 7. SCROLL 표시 클릭 ────────────────────────
  document.querySelectorAll('.scroll-cue').forEach(cue => {
    cue.addEventListener('click', () => {
      const next = cue.closest('section').nextElementSibling;
      if (next) next.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // ── 8. 숫자 카운트업 ───────────────────────────
  const nums = document.querySelectorAll('[data-target]');
  if (nums.length && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver((es) => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = parseInt(el.dataset.target, 10), suf = el.dataset.suffix || '';
        co.unobserve(el);
        if (reduce) { el.textContent = target.toLocaleString() + suf; return; }
        let t0;
        const step = (t) => {
          if (!t0) t0 = t;
          const k = Math.min((t - t0) / 1600, 1);
          el.textContent = Math.floor((1 - Math.pow(1 - k, 4)) * target).toLocaleString() + suf;
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    nums.forEach(el => co.observe(el));
  }

  // ── 9. 견적 폼: ?type= 값으로 문의 유형 미리 선택 ──
  const typeSel = document.getElementById('inquiry_type');
  if (typeSel) {
    const t = new URLSearchParams(location.search).get('type');
    if (t && [...typeSel.options].some(o => o.value === t)) typeSel.value = t;
  }

  // ── 6. 견적 폼 제출 ──────────────────────────────
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = quoteForm.querySelector('[name="name"]').value.trim();
      const phone = quoteForm.querySelector('[name="phone"]').value.trim();
      const message = quoteForm.querySelector('[name="message"]').value.trim();
      if (!name || !phone) {
        alert('이름과 연락처는 필수 입력 항목입니다.');
        return;
      }
      if (!message) {
        alert('문의 내용을 입력해 주세요.');
        return;
      }

      const submitBtn = quoteForm.querySelector('.form-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ 전송 중...';

      const inquiryType = quoteForm.querySelector('[name="inquiry_type"]')?.value || '';
      const industry = quoteForm.querySelector('[name="industry"]')?.value || '';
      const scale = quoteForm.querySelector('[name="scale"]')?.value.trim() || '';

      // SMS 발송 함수
      const sendSMS = async () => {
        const smsText = `[CEGO 견적요청]\n이름: ${name}\n연락처: ${phone}\n유형: ${inquiryType}\n업종: ${industry}${scale ? '\n규모: ' + scale : ''}\n내용: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`;
        try {
          await fetch('https://tphagookafjldzvxaxui.supabase.co/functions/v1/send-sms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer sb_publishable_IqYQq0XqJCz6ZdROfokIMA_GeltPVZq'
            },
            body: JSON.stringify({ receiver: '01051041648', message: smsText })
          });
        } catch (e) {
          console.warn('SMS 발송 실패:', e);
        }
      };

      // Formspree 이메일 전송
      const action = quoteForm.getAttribute('action');
      if (action && !action.includes('YOUR_FORM_ID')) {
        try {
          const formData = new FormData(quoteForm);
          const [res] = await Promise.all([
            fetch(action, {
              method: 'POST',
              body: formData,
              headers: { 'Accept': 'application/json' }
            }),
            sendSMS()
          ]);
          if (res.ok) {
            submitBtn.textContent = '전송 완료!';
            alert(`견적 문의가 접수되었습니다!\n\n이름: ${name}\n연락처: ${phone}\n\n빠른 시일 내에 연락드리겠습니다.\n감사합니다!`);
            quoteForm.reset();
          } else {
            throw new Error('전송 실패');
          }
        } catch {
          alert('전송 중 오류가 발생했습니다. 전화(031-947-1648)로 문의해 주세요.');
          submitBtn.disabled = false;
          submitBtn.textContent = '견적 요청 제출하기';
        }
      } else {
        await sendSMS();
        alert(`견적 문의가 접수되었습니다!\n\n이름: ${name}\n연락처: ${phone}\n\n빠른 시일 내에 연락드리겠습니다.\n감사합니다!`);
        quoteForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = '견적 요청 제출하기';
      }
    });
  }

});
