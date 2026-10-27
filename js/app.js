/* =========================================================
   DigiVeritaz — Performance Marketing Audit funnel
   Step-by-step lead form: one question per screen.
   ========================================================= */
(function () {
  "use strict";

  // ---- Lead delivery ----
  // Set a webhook URL (Google Apps Script, Zapier, Make, CRM) to receive leads.
  // Left empty, leads are only logged to the browser console.
  var WEBHOOK_URL = "";

  // ---- Screen indexes (match data-i in index.html) ----
  var HERO = 0;
  var TIMELINE = 6;
  var CONTACT = 9;     // last question
  var SUCCESS = 10;
  var EXPLORING = 11;  // shown instead of the rest when timeline = "Just exploring"
  var TOTAL = CONTACT + 1; // steps shown in the header, hero included

  var $ = function (id) { return document.getElementById(id); };

  var screens = [].slice.call(document.querySelectorAll(".screen"));
  var form = $("f");
  var nextBtn = $("next");
  var backBtn = $("back");
  var stepno = $("stepno");
  var prog = $("prog");
  var cta = $("cta");

  var problem = $("problem");
  var problemCount = $("pc");
  var site = $("site");
  var siteErr = $("siteErr");
  var firstName = $("fn");
  var lastName = $("ln");
  var phone = $("ph");
  var phoneErr = $("phErr");
  var email = $("em");
  var emailErr = $("emErr");
  var whatsapp = $("wa");

  // Answers from the option-button screens
  var data = { goal: "", industry: "", budget: "", platforms: [], timeline: "", slot: "" };
  var cur = HERO;
  var sending = false;

  // ---------- Navigation ----------
  function show(i) {
    cur = i;
    screens.forEach(function (s) { s.classList.toggle("active", +s.dataset.i === i); });
    window.scrollTo(0, 0);

    var done = i >= SUCCESS;
    stepno.textContent = done ? "Done" : "Step " + (i + 1) + " of " + TOTAL;
    prog.style.width = done ? "100%" : ((i + 1) / TOTAL) * 100 + "%";
    backBtn.classList.toggle("hidden", i === HERO || done);
    cta.classList.toggle("hidden", done);
    nextBtn.textContent = i === HERO ? "Check my eligibility"
      : i === CONTACT ? "Confirm my free audit"
      : "Continue";
    validate();
  }

  function go() {
    if (sending || !valid()) return;
    if (cur === TIMELINE && data.timeline === "Just exploring") { show(EXPLORING); return; }
    if (cur === CONTACT) { submit(); return; }
    show(cur + 1);
  }

  nextBtn.addEventListener("click", go);
  backBtn.addEventListener("click", function () { if (cur > HERO) show(cur - 1); });
  form.addEventListener("submit", function (e) { e.preventDefault(); });

  // ---------- Validation ----------
  function phoneOk() { return /^[6-9]\d{9}$/.test(phone.value); }
  function emailOk() { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()); }
  function siteOk() { return site.value.trim().length >= 3; }

  function valid() {
    switch (cur) {
      case 0: return true;
      case 1: return !!data.goal;
      case 2: return !!data.industry;
      case 3: return !!data.budget;
      case 4: return data.platforms.length > 0;
      case 5: return problem.value.trim().length >= 3;
      case 6: return !!data.timeline;
      case 7: return siteOk();
      case 8: return !!data.slot;
      case 9: return phoneOk() && emailOk() && !!firstName.value.trim() && !!lastName.value.trim();
    }
    return false;
  }

  function validate() { nextBtn.disabled = sending || !valid(); }

  // Show or hide an input's red border and error message
  function flag(input, errEl, bad) {
    input.classList.toggle("bad", bad);
    errEl.classList.toggle("show", bad);
  }

  // ---------- Option buttons ----------
  document.querySelectorAll(".opts").forEach(function (group) {
    var key = group.dataset.key;
    var multi = group.dataset.multi === "1";

    group.querySelectorAll(".opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (multi) {
          btn.classList.toggle("sel");
          data[key] = [].slice.call(group.querySelectorAll(".opt.sel"))
            .map(function (x) { return x.dataset.v; });
          validate();
          return;
        }

        group.querySelectorAll(".opt").forEach(function (x) { x.classList.remove("sel"); });
        btn.classList.add("sel");
        data[key] = btn.dataset.v;
        validate();

        // Auto-advance on single choice, unless the user already moved on
        var from = cur;
        setTimeout(function () { if (cur === from) go(); }, 220);
      });
    });
  });

  // ---------- Problem text + quick chips ----------
  function updateCount() {
    problemCount.textContent = problem.value.length;
    validate();
  }

  problem.addEventListener("input", updateCount);

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var t = chip.textContent;
      if (problem.value.indexOf(t) === -1) {
        problem.value = (problem.value ? problem.value.replace(/[,\s]+$/, "") + ", " : "") + t;
      }
      problem.value = problem.value.slice(0, 200);
      updateCount();
    });
  });

  // ---------- Text inputs ----------
  [firstName, lastName].forEach(function (el) { el.addEventListener("input", validate); });

  site.addEventListener("input", function () { flag(site, siteErr, false); validate(); });
  site.addEventListener("blur", function () { if (site.value && !siteOk()) flag(site, siteErr, true); });

  // Keep digits only; also handles pasted "+91 98765 43210" or "098765 43210"
  function cleanPhone(v) {
    var d = v.replace(/\D/g, "");
    if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2);
    else if (d.length === 11 && d.charAt(0) === "0") d = d.slice(1);
    return d.slice(0, 10);
  }

  phone.addEventListener("input", function () {
    phone.value = cleanPhone(phone.value);
    flag(phone, phoneErr, false);
    validate();
  });
  phone.addEventListener("blur", function () { if (phone.value && !phoneOk()) flag(phone, phoneErr, true); });

  email.addEventListener("input", function () { flag(email, emailErr, false); validate(); });
  email.addEventListener("blur", function () { if (email.value && !emailOk()) flag(email, emailErr, true); });

  // Block browser autofill: inputs stay readonly until the user actually touches them
  document.querySelectorAll("input[type=text], textarea").forEach(function (el) {
    el.setAttribute("readonly", "readonly");
    var unlock = function () { el.removeAttribute("readonly"); };
    el.addEventListener("focus", unlock);
    el.addEventListener("touchstart", unlock, { passive: true });
    el.addEventListener("mousedown", unlock);
  });

  // ---------- Submit ----------
  function submit() {
    var payload = {
      source: "digiveritaz-performance-funnel",
      submitted_at: new Date().toISOString(),
      goal: data.goal,
      industry: data.industry,
      monthly_budget: data.budget,
      platforms: data.platforms.join(", "),
      problem: problem.value.trim(),
      timeline: data.timeline,
      website_or_instagram: site.value.trim(),
      callback_slot: data.slot,
      first_name: firstName.value.trim(),
      last_name: lastName.value.trim(),
      phone: "+91" + phone.value,
      email: email.value.trim(),
      whatsapp_opt_in: whatsapp.checked,
      page: location.href
    };

    sending = true;
    nextBtn.disabled = true;
    nextBtn.textContent = "Booking…";

    var finish = function () {
      sending = false;
      $("okTitle").textContent = "You're booked, " + payload.first_name + "!";
      $("okSub").textContent = payload.callback_slot === "Call me now"
        ? "Our specialist will call you shortly to start your free performance marketing audit."
        : "Our specialist will call you in your " + payload.callback_slot + " window to start your free performance marketing audit.";
      show(SUCCESS);
    };

    if (WEBHOOK_URL) {
      // no-cors + text/plain avoids a CORS preflight (works with Google Apps Script)
      fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      }).then(finish, finish);
    } else {
      console.log("DigiVeritaz lead (set WEBHOOK_URL to deliver):", payload);
      finish();
    }
  }

  show(HERO);
})();
