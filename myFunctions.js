(function () {
  "use strict";

  var rentalCars = {
    "CR-001": { name: "Toyota Corolla", price: 250000 },
    "CR-002": { name: "Kia Sportage", price: 400000 },
    "CR-003": { name: "Hyundai Elantra", price: 300000 },
    "CR-004": { name: "Chevrolet Spark", price: 180000 },
    "CR-005": { name: "Nissan Sunny", price: 220000 }
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function selectedCars() {
    var boxes = document.getElementsByClassName("car-select");
    var chosen = [];
    var i;
    for (i = 0; i < boxes.length; i += 1) {
      if (boxes[i].checked && rentalCars[boxes[i].value]) {
        chosen.push(boxes[i].value);
      }
    }
    return chosen;
  }

  function isValidDate(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    var year;
    var month;
    var day;
    var date;
    if (!match) {
      return false;
    }
    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
    date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day;
  }

  function daysBetween(startValue, endValue) {
    var startParts = startValue.split("-");
    var endParts = endValue.split("-");
    var start = Date.UTC(Number(startParts[0]), Number(startParts[1]) - 1, Number(startParts[2]));
    var end = Date.UTC(Number(endParts[0]), Number(endParts[1]) - 1, Number(endParts[2]));
    return Math.round((end - start) / 86400000);
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat("en-US").format(amount) + " ل.س";
  }

  function setMessage(text) {
    var message = byId("selection-message");
    if (message) {
      message.textContent = text;
      message.style.display = "block";
    }
  }

  function validName(name) {
    if (name === "") {
      return true;
    }
    return /^[\u0621-\u064A\u066E-\u06D3\u06FA-\u06FC\u0640\s]+$/.test(name);
  }

  function showBookingSummary(event) {
    var name = byId("full-name").value.replace(/^\s+|\s+$/g, "");
    var nationalId = byId("national-id").value.replace(/\s+/g, "");
    var startDate = byId("start-date").value.replace(/^\s+|\s+$/g, "");
    var endDate = byId("end-date").value.replace(/^\s+|\s+$/g, "");
    var mobile = byId("mobile").value.replace(/[\s-]/g, "");
    var email = byId("email").value.replace(/^\s+|\s+$/g, "");
    var chosen = selectedCars();
    var duration;
    var subtotal = 0;
    var discount = 0;
    var total;
    var i;
    var result;
    var heading;
    var list;
    var item;
    var subtotalLine;
    var discountLine;
    var totalLine;

    event.preventDefault();

    if (!validName(name)) {
      window.alert("يرجى كتابة الاسم بأحرف عربية ومسافات فقط أو تركه فارغًا.");
      byId("full-name").focus();
      return;
    }
    if (!/^(0[1-9]|1[0-4])\d{9}$/.test(nationalId)) {
      window.alert("الرقم الوطني إلزامي، ويجب أن يتكون من 11 رقمًا وأن تبدأ أول خانتين من 01 إلى 14.");
      byId("national-id").focus();
      return;
    }
    if (!isValidDate(startDate)) {
      window.alert("أدخلي تاريخ بداية صحيحًا بصيغة yyyy-mm-dd.");
      byId("start-date").focus();
      return;
    }
    if (!isValidDate(endDate)) {
      window.alert("أدخلي تاريخ نهاية صحيحًا بصيغة yyyy-mm-dd.");
      byId("end-date").focus();
      return;
    }
    duration = daysBetween(startDate, endDate);
    if (duration <= 0) {
      window.alert("يجب أن يكون تاريخ النهاية بعد تاريخ البداية.");
      byId("end-date").focus();
      return;
    }
    if (mobile !== "" && !/^(093|098|099|094|095|096|097)\d{7}$/.test(mobile)) {
      window.alert("تحققي من رقم الموبايل؛ يجب أن يكون رقمًا سوريًا من 10 خانات وبادئة Syriatel أو MTN.");
      byId("mobile").focus();
      return;
    }
    if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      window.alert("أدخلي بريدًا إلكترونيًا صحيحًا أو اتركي الحقل فارغًا.");
      byId("email").focus();
      return;
    }
    if (chosen.length === 0) {
      window.alert("اختاري سيارة واحدة على الأقل من الجدول.");
      return;
    }

    result = byId("result-box");
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }
    heading = document.createElement("h3");
    heading.appendChild(document.createTextNode("ملخص طلب التأجير"));
    result.appendChild(heading);
    list = document.createElement("ul");

    for (i = 0; i < chosen.length; i += 1) {
      item = document.createElement("li");
      item.appendChild(document.createTextNode(
        chosen[i] + " — " + rentalCars[chosen[i]].name +
        "، المدة: " + duration + " يوم، المبلغ: " +
        formatMoney(rentalCars[chosen[i]].price * duration)
      ));
      list.appendChild(item);
      subtotal += rentalCars[chosen[i]].price * duration;
    }
    result.appendChild(list);
    if (duration > 10) {
      discount = subtotal * 0.05;
    }
    total = subtotal - discount;

    subtotalLine = document.createElement("p");
    subtotalLine.appendChild(document.createTextNode("المجموع قبل الخصم: " + formatMoney(subtotal)));
    result.appendChild(subtotalLine);
    discountLine = document.createElement("p");
    discountLine.appendChild(document.createTextNode(
      discount > 0 ? "الخصم (5% لأن المدة تتجاوز 10 أيام): " + formatMoney(discount) : "لا يوجد خصم؛ مدة التأجير لا تتجاوز 10 أيام."
    ));
    result.appendChild(discountLine);
    totalLine = document.createElement("p");
    totalLine.className = "total-line";
    totalLine.appendChild(document.createTextNode("الإجمالي النهائي: " + formatMoney(total)));
    result.appendChild(totalLine);
    result.style.display = "block";
  }

  function setupDetails() {
    var toggles = document.getElementsByClassName("details-toggle");
    var i;
    for (i = 0; i < toggles.length; i += 1) {
      toggles[i].addEventListener("change", function () {
        var target = byId(this.value);
        if (!target) {
          return;
        }
        if (window.jQuery) {
          window.jQuery(target).stop(true, true);
          if (this.checked) {
            window.jQuery(target).slideDown(180);
          } else {
            window.jQuery(target).slideUp(180);
          }
        } else {
          target.style.display = this.checked ? "table-row" : "none";
        }
      });
    }
  }

  function setupBooking() {
    var continueButton = byId("continue-button");
    var form = byId("booking-form");
    if (continueButton) {
      continueButton.addEventListener("click", function () {
        var chosen = selectedCars();
        var panel = byId("booking-panel");
        var message = byId("selection-message");
        if (chosen.length === 0) {
          setMessage("اختاري سيارة واحدة على الأقل قبل متابعة الطلب.");
          return;
        }
        if (message) {
          message.style.display = "none";
        }
        panel.style.display = "block";
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    if (form) {
      form.addEventListener("submit", showBookingSummary);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupDetails();
    setupBooking();
  });
}());
