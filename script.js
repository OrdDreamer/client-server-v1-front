(function () {
  var BASE = "https://client-server-v1-back.onrender.com";

  function getUserId() {
    var el = document.getElementById("backendUserId");
    return el && el.value ? el.value.trim() : null;
  }

  function buildUrl(path, query) {
    var url = BASE + path;
    var uid = getUserId();
    if (uid) {
      url += (path.indexOf("?") >= 0 ? "&" : "?") + "user_id=" + encodeURIComponent(uid);
    }
    if (query) {
      url += (url.indexOf("?") >= 0 ? "&" : "?") + query;
    }
    return url;
  }

  function setOutput(id, text, isError) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = "api-output" + (isError ? " error" : " success");
  }

  function handleGetRoot() {
    var out = "out-root";
    setOutput(out, "Запит...", false);
    fetch(buildUrl("/"))
      .then(function (r) {
        return r.json().then(function (data) {
          setOutput(out, JSON.stringify(data, null, 2), false);
        });
      })
      .catch(function (err) {
        setOutput(out, "Помилка: " + err.message, true);
      });
  }

  function handleGetHealth() {
    var out = "out-health";
    setOutput(out, "Запит...", false);
    fetch(buildUrl("/health"))
      .then(function (r) {
        return r.json().then(function (data) {
          setOutput(out, JSON.stringify(data, null, 2), false);
        });
      })
      .catch(function (err) {
        setOutput(out, "Помилка: " + err.message, true);
      });
  }

  function handleGetItems() {
    var out = "out-items";
    setOutput(out, "Запит...", false);
    fetch(buildUrl("/items"))
      .then(function (r) {
        return r.json().then(function (data) {
          setOutput(out, JSON.stringify(data, null, 2), false);
        });
      })
      .catch(function (err) {
        setOutput(out, "Помилка: " + err.message, true);
      });
  }

  function handleGetItem() {
    var idEl = document.getElementById("getItemId");
    var id = idEl && idEl.value ? idEl.value.trim() : "";
    var out = "out-item";
    if (!id) {
      setOutput(out, "Вкажіть item_id", true);
      return;
    }
    setOutput(out, "Запит...", false);
    fetch(buildUrl("/items/" + encodeURIComponent(id)))
      .then(function (r) {
        if (r.status === 404) {
          setOutput(out, "404 — елемент не знайдено", true);
          return;
        }
        return r.json().then(function (data) {
          setOutput(out, JSON.stringify(data, null, 2), false);
        });
      })
      .catch(function (err) {
        setOutput(out, "Помилка: " + err.message, true);
      });
  }

  function handlePostItem() {
    var nameEl = document.getElementById("postName");
    var descEl = document.getElementById("postDescription");
    var priceEl = document.getElementById("postPrice");
    var name = nameEl && nameEl.value ? nameEl.value.trim() : "";
    var description = descEl && descEl.value ? descEl.value.trim() : null;
    var priceRaw = priceEl && priceEl.value ? priceEl.value.trim() : "";
    var out = "out-post";
    if (!name) {
      setOutput(out, "Поле name обов'язкове", true);
      return;
    }
    var price = parseFloat(priceRaw);
    if (priceRaw !== "" && (isNaN(price) || price < 0)) {
      setOutput(out, "price має бути невід'ємним числом", true);
      return;
    }
    var body = { name: name };
    if (description !== null && description !== "") body.description = description;
    if (priceRaw !== "") body.price = price;
    setOutput(out, "Запит...", false);
    fetch(buildUrl("/items"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(function (r) {
        if (r.status === 422) {
          return r.json().then(function (data) {
            setOutput(out, "422: " + JSON.stringify(data, null, 2), true);
          });
        }
        return r.json().then(function (data) {
          setOutput(out, JSON.stringify(data, null, 2), false);
        });
      })
      .catch(function (err) {
        setOutput(out, "Помилка: " + err.message, true);
      });
  }

  function handleDeleteItem() {
    var idEl = document.getElementById("deleteItemId");
    var id = idEl && idEl.value ? idEl.value.trim() : "";
    var out = "out-delete";
    if (!id) {
      setOutput(out, "Вкажіть item_id", true);
      return;
    }
    setOutput(out, "Запит...", false);
    fetch(buildUrl("/items/" + encodeURIComponent(id)), { method: "DELETE" })
      .then(function (r) {
        if (r.status === 404) {
          setOutput(out, "404 — елемент не знайдено", true);
          return;
        }
        if (r.status === 204) {
          setOutput(out, "204 — елемент видалено", false);
          return;
        }
        setOutput(out, "Статус: " + r.status, false);
      })
      .catch(function (err) {
        setOutput(out, "Помилка: " + err.message, true);
      });
  }

  var BACKEND_OUTPUT_IDS = ["out-root", "out-health", "out-items", "out-item", "out-post", "out-delete"];

  function clearBackendResponses() {
    BACKEND_OUTPUT_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.textContent = "—";
        el.className = "api-output";
      }
    });
  }

  document.getElementById("clearBackendResponses").addEventListener("click", clearBackendResponses);

  // Backend buttons
  document.querySelectorAll(".api-btn[data-action]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var action = btn.getAttribute("data-action");
      if (action === "get-root") handleGetRoot();
      else if (action === "get-health") handleGetHealth();
      else if (action === "get-items") handleGetItems();
      else if (action === "get-item") handleGetItem();
      else if (action === "post-item") handlePostItem();
      else if (action === "delete-item") handleDeleteItem();
    });
  });

  // ——— Form & dataLayer (існуюча логіка) ———
  var form = document.getElementById("eventForm");
  var output = document.getElementById("dataLayerOutput");
  var refreshBtn = document.getElementById("refreshDataLayer");

  function pushEvent(eventName, eventData) {
    var payload = { event: eventName };
    if (eventData && typeof eventData === "object" && Object.keys(eventData).length) {
      for (var key in eventData) {
        if (eventData.hasOwnProperty(key)) {
          payload[key] = eventData[key];
        }
      }
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function updateDataLayerView() {
    try {
      var dl = window.dataLayer || [];
      output.textContent = JSON.stringify(dl, null, 2) || "[]";
    } catch (e) {
      output.textContent = "Помилка: " + e.message;
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameInput = document.getElementById("eventName");
    var dataInput = document.getElementById("eventData");
    var name = (nameInput.value || "").trim();
    var data = null;
    var dataStr = (dataInput.value || "").trim();
    if (dataStr) {
      try {
        data = JSON.parse(dataStr);
      } catch (err) {
        alert("Невірний JSON у полі «Дані події»: " + err.message);
        return;
      }
    }
    if (!name) {
      alert("Вкажіть назву події.");
      return;
    }
    pushEvent(name, data);
    nameInput.value = "";
    dataInput.value = "";
  });

  refreshBtn.addEventListener("click", updateDataLayerView);

  // Типові події — клік відправляє подію в dataLayer
  document.querySelectorAll(".typical-event-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var eventName = btn.getAttribute("data-event");
      var payloadStr = btn.getAttribute("data-payload");
      var eventData = null;
      if (payloadStr) {
        try {
          eventData = JSON.parse(payloadStr);
        } catch (e) {}
      }
      pushEvent(eventName, eventData);
    });
  });
})();
