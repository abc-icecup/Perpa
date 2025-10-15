// Toggle Sidebar
document.addEventListener("click", e => {
  const sidebar = document.getElementById("sidebar");
  if (e.target.id === "menu-btn") {
    sidebar.classList.toggle("active");
  }
});

// Time Picker (Custom)
function createTimePicker(inputId) {
  const input = document.getElementById(inputId);
  input.addEventListener("click", () => {
    const box = document.createElement("div");
    box.className = "time-box";
    box.innerHTML = `
      <input type="number" min="0" max="12" value="05" id="${inputId}-h">
      :
      <input type="number" min="0" max="59" value="00" id="${inputId}-m">
      <button id="${inputId}-am">AM</button>
      <button id="${inputId}-pm">PM</button>
      <button id="${inputId}-ok">OK</button>
    `;
    input.parentNode.appendChild(box);

    box.querySelector(`#${inputId}-ok`).onclick = () => {
      let h = box.querySelector(`#${inputId}-h`).value.padStart(2, "0");
      let m = box.querySelector(`#${inputId}-m`).value.padStart(2, "0");
      let ampm = box.querySelector(`#${inputId}-am`).classList.contains("active") ? "AM" : "PM";
      input.value = `${h}:${m} ${ampm}`;
      box.remove();
    };

    box.querySelector(`#${inputId}-am`).onclick = () => {
      box.querySelector(`#${inputId}-am`).classList.add("active");
      box.querySelector(`#${inputId}-pm`).classList.remove("active");
    };
    box.querySelector(`#${inputId}-pm`).onclick = () => {
      box.querySelector(`#${inputId}-pm`).classList.add("active");
      box.querySelector(`#${inputId}-am`).classList.remove("active");
    };
  });
}

createTimePicker("start-time");
createTimePicker("end-time");
