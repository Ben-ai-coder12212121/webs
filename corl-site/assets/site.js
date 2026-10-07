(function () {
  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Projects filter
  var filters = document.querySelectorAll("[data-filter]");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var market = btn.getAttribute("data-filter");
      filters.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      document.querySelectorAll("[data-market]").forEach(function (card) {
        card.hidden = market !== "all" && card.getAttribute("data-market") !== market;
      });
    });
  });

  // Forms: the site is static, so a submission opens the visitor's email
  // program with the request filled in, addressed to the right inbox.
  document.querySelectorAll("form[data-mailto]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var error = form.querySelector(".form-error");

      var groups = form.querySelectorAll("[data-required-group]");
      for (var i = 0; i < groups.length; i++) {
        if (!groups[i].querySelector("input:checked")) {
          if (error) {
            error.textContent = "Please choose at least one option under “" + groups[i].getAttribute("data-required-group") + "”.";
            error.classList.add("show");
          }
          return;
        }
      }
      if (error) error.classList.remove("show");

      var lines = [];
      form.querySelectorAll("[data-label]").forEach(function (el) {
        var label = el.getAttribute("data-label");
        var value;
        if (el.tagName === "FIELDSET") {
          value = Array.prototype.map.call(el.querySelectorAll("input:checked"), function (c) { return c.value; }).join(", ");
        } else if (el.type === "checkbox") {
          value = el.checked ? "Yes" : "No";
        } else {
          value = el.value.trim();
        }
        lines.push(label + ": " + (value || "—"));
      });

      var subject = form.getAttribute("data-subject");
      var nameField = form.querySelector("[name=name]");
      var companyField = form.querySelector("[name=company]");
      if (companyField && companyField.value.trim()) subject += " – " + companyField.value.trim();
      else if (nameField && nameField.value.trim()) subject += " – " + nameField.value.trim();

      var attachNote = form.getAttribute("data-attach-note");
      if (attachNote) lines.push("", attachNote);

      var href = "mailto:" + form.getAttribute("data-mailto") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      window.location.href = href;

      var status = form.parentNode.querySelector(".form-status");
      if (status) {
        status.classList.add("show");
        status.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
})();
