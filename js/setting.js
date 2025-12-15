/* ===== setting.js =====
   Custom behaviors for Pengaturan page:
   - sidebar toggle
   - custom time picker with AM/PM, Cancel/OK, outside click close
   - formatting (leading zero)
   - buttons alignment already handled in HTML/CSS
*/

(function () {
  // Sidebar toggle (desktop & mobile)
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menu-btn');
  menuBtn?.addEventListener('click', function () {
    // toggle class for mobile; for desktop this will hide
    sidebar.classList.toggle('open');
  });

  /* ---------- TIME PICKER IMPLEMENTATION ---------- */
  // List of time inputs to wire
  const timeInputs = ['start-time', 'end-time'];

  // helper pad
  function pad2(v) { return String(v).padStart(2, '0'); }

  // Close any open picker except optional keepId
  function closeAllPickers(keepId) {
    document.querySelectorAll('.time-input-wrapper.open').forEach(w => {
      const inp = w.querySelector('.time-input');
      const tid = inp && inp.id;
      if (tid !== keepId) {
        const box = w.querySelector('.time-box');
        if (box) box.remove();
        w.classList.remove('open');
      }
    });
  }

  // Parse a time string like "05:00 AM" => {h,m,ampm}
  function parseTimeString(s) {
    if (!s) return { h: '05', m: '00', ampm: 'AM' };
    const parts = s.trim().split(' ');
    const hm = parts[0] || '05:00';
    const [h, m] = hm.split(':');
    const ampm = parts[1] ? parts[1].toUpperCase() : 'AM';
    return { h: pad2(Number(h || 5)), m: pad2(Number(m || 0)), ampm: (ampm === 'PM' ? 'PM' : 'AM') };
  }

  // Create picker for a wrapper (div .time-input-wrapper) and input element
  function openPickerFor(inputEl) {
    const wrapper = inputEl.closest('.time-input-wrapper');
    if (!wrapper) return;
    // close others
    closeAllPickers(inputEl.id);

    // if already open, do nothing
    if (wrapper.classList.contains('open')) return;

    // mark open
    wrapper.classList.add('open');

    // create box
    const box = document.createElement('div');
    box.className = 'time-box';
    // read current value as fallback
    const cur = parseTimeString(inputEl.value);
    // inner HTML — structured for easy query
    box.innerHTML = `
      <div class="time-row">
        <input class="time-field" type="number" inputmode="numeric" id="${inputEl.id}-h" min="1" max="12" value="${parseInt(cur.h,10)}" />
        <div class="time-sep">:</div>
        <input class="time-field" type="number" inputmode="numeric" id="${inputEl.id}-m" min="0" max="59" value="${parseInt(cur.m,10)}" />
        <div style="flex:1"></div>
        <div class="ampm">
          <button type="button" id="${inputEl.id}-am">AM</button>
          <button type="button" id="${inputEl.id}-pm">PM</button>
        </div>
      </div>
      <div class="time-actions">
        <button class="cancel" id="${inputEl.id}-cancel">Cancel</button>
        <button class="ok" id="${inputEl.id}-ok">Ok</button>
      </div>
    `;
    // append
    wrapper.appendChild(box);

    // make sure fields show two-digit style when focused
    const fh = box.querySelector(`#${inputEl.id}-h`);
    const fm = box.querySelector(`#${inputEl.id}-m`);
    const bam = box.querySelector(`#${inputEl.id}-am`);
    const bpm = box.querySelector(`#${inputEl.id}-pm`);
    const bok = box.querySelector(`#${inputEl.id}-ok`);
    const bcancel = box.querySelector(`#${inputEl.id}-cancel`);

    // set AM/PM selected visual
    function setAMPM(which) {
      if (which === 'AM') {
        bam.classList.add('selected');
        bpm.classList.remove('selected');
      } else {
        bpm.classList.add('selected');
        bam.classList.remove('selected');
      }
    }
    setAMPM(cur.ampm);

    // normalize values on input change
    function normalizeNumberField(field, min, max) {
      let v = parseInt(field.value || 0, 10);
      if (isNaN(v)) v = min;
      if (v < min) v = min;
      if (v > max) v = max;
      field.value = v;
    }

    // focus handlers to toggle active style
    fh.addEventListener('focus', () => fh.classList.add('active'));
    fh.addEventListener('blur', () => fh.classList.remove('active'));
    fm.addEventListener('focus', () => fm.classList.add('active'));
    fm.addEventListener('blur', () => fm.classList.remove('active'));

    // ensure min/max on blur
    fh.addEventListener('blur', () => {
      normalizeNumberField(fh, 1, 12);
      fh.value = pad2(fh.value);
    });
    fm.addEventListener('blur', () => {
      normalizeNumberField(fm, 0, 59);
      fm.value = pad2(fm.value);
    });

    // also keep pad when typing (simple)
    fh.addEventListener('input', () => {
      // allow partial but clamp on overflow
      let v = fh.value.replace(/\D/g,'');
      if (v === '') return;
      v = Math.min(Math.max(parseInt(v,10), 1), 12);
      fh.value = v;
    });
    fm.addEventListener('input', () => {
      let v = fm.value.replace(/\D/g,'');
      if (v === '') return;
      v = Math.min(Math.max(parseInt(v,10), 0), 59);
      fm.value = v;
    });

    // AM/PM click
    bam.addEventListener('click', () => setAMPM('AM'));
    bpm.addEventListener('click', () => setAMPM('PM'));

    // Cancel => close and restore original value (no change)
    bcancel.addEventListener('click', (ev) => {
      ev.stopPropagation();
      closeAllPickers(); // will remove box
    });

    // Ok => set formatted value and close
    bok.addEventListener('click', (ev) => {
      ev.stopPropagation();
      normalizeNumberField(fh, 1, 12);
      normalizeNumberField(fm, 0, 59);
      const hh = pad2(fh.value);
      const mm = pad2(fm.value);
      const ampm = bam.classList.contains('selected') ? 'AM' : 'PM';
      inputEl.value = `${hh}:${mm} ${ampm}`;
      closeAllPickers();
    });

    // ensure two-digit display in fields
    fh.value = pad2(fh.value);
    fm.value = pad2(fm.value);

    // position adjustment (if near right edge) - simple: keep left:0; CSS handles right align on small screens
    // Add listener to stop propagation to document click
    box.addEventListener('click', (e) => e.stopPropagation());
  }

  // open on click or focus of input or click of chevron
  timeInputs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    // allow typing — but clicking will open picker to help format
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openPickerFor(el);
    });
    el.addEventListener('focus', (e) => {
      // open picker when focused via keyboard
      openPickerFor(el);
    });

    // also handle chev button (icon)
    const chev = document.querySelector(`.chev-btn[data-target="${id}"]`);
    chev?.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapper = el.closest('.time-input-wrapper');
      if (wrapper.classList.contains('open')) {
        // close it
        closeAllPickers();
      } else {
        openPickerFor(el);
      }
    });

    // format input on blur if typed manually ("9:5 am" -> "09:05 AM")
    el.addEventListener('blur', () => {
      const val = el.value.trim();
      if (!val) return;
      // try to parse flexible formats
      // accept: "9:5", "09:05", "9:05 pm", "9 05 pm"
      let s = val.replace(/\s+/g, ' ').trim();
      let ampm = '';
      const m = s.match(/\b(am|pm|AM|PM)\b/);
      if (m) { ampm = m[0].toUpperCase(); s = s.replace(m[0],'').trim(); }
      s = s.replace(/\s+/g,':');
      const parts = s.split(':').filter(Boolean);
      let h = parts[0] || '05';
      let m2 = parts[1] || '00';
      h = pad2(Number(h));
      m2 = pad2(Number(m2));
      if (!ampm) ampm = 'AM';
      el.value = `${h}:${m2} ${ampm}`;
    });
  });

  // close pickers on clicking outside
  document.addEventListener('click', (ev) => {
    // if click inside any .time-box or .time-input, do nothing
    if (ev.target.closest && (ev.target.closest('.time-box') || ev.target.closest('.time-input-wrapper'))) {
      return;
    }
    closeAllPickers();
  });

  // pressing Escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllPickers();
  });

  // Example hookup for Save/Cancel/Sync buttons (stubs)
  document.getElementById('btn-cancel')?.addEventListener('click', () => {
    // clear form (example)
    document.getElementById('token').value = '';
    document.getElementById('chatid').value = '';
    document.getElementById('start-time').value = '';
    document.getElementById('end-time').value = '';
  });
  document.getElementById('btn-save')?.addEventListener('click', () => {
    // read values — you'll replace with actual save (AJAX/Firebase)
    const payload = {
      token: document.getElementById('token').value,
      chatid: document.getElementById('chatid').value,
      start_time: document.getElementById('start-time').value,
      end_time: document.getElementById('end-time').value,
      duration: document.getElementById('duration').value
    };
    console.log('Save payload', payload);
    alert('Simpan: lihat console (contoh stub)');
  });
  document.getElementById('btn-sync')?.addEventListener('click', () => {
    alert('Sinkronisasi perangkat (stub)');
  });
  document.getElementById('btn-restart')?.addEventListener('click', () => {
    if (confirm('Restart perangkat?')) {
      alert('Perintah restart dikirim (stub)');
    }
  });

})();
