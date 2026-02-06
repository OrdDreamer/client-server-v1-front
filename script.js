(function () {
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
})();
