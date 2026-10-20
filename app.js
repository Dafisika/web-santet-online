const state = {
    name: "",
    photo: null,
    organs: new Set(),
};

const steps = Array.from(document.querySelectorAll(".step"));
const dots = Array.from(document.querySelectorAll("#step-dots .dot"));

const nameInput = document.getElementById("name-input");
const photoInput = document.getElementById("photo-input");
const photoPreview = document.getElementById("photo-preview");
const photoPlaceholder = document.getElementById("photo-placeholder");
const photoRemove = document.getElementById("photo-remove");
const error1 = document.getElementById("error-1");

const organCards = Array.from(document.querySelectorAll(".organ-card"));
const organCount = document.getElementById("organ-count");
const error2 = document.getElementById("error-2");
const sendButton = document.getElementById("send-santet");

const progressBar = document.getElementById("progress-bar");
const progressValue = document.getElementById("progress-value");
const progressText = document.getElementById("progress-text");

const resultName = document.getElementById("result-name");
const resultOrgans = document.getElementById("result-organs");
const checkCircle = document.querySelector(".check-circle");

let progressTimer = null;

/* ---------- Step navigation ---------- */
function showStep(number) {
    steps.forEach((step) => {
        step.classList.toggle("is-active", step.dataset.step === String(number));
    });
    dots.forEach((dot, index) => dot.classList.toggle("active", index < number));
}

function showError(element, message) {
    if (message) {
        element.querySelector("span").textContent = message;
    }
    element.classList.remove("hidden");
}

function hideError(element) {
    element.classList.add("hidden");
}

/* ---------- Step 1: nama & foto ---------- */
function setPhoto(dataUrl) {
    state.photo = dataUrl;
    photoPreview.src = dataUrl;
    photoPreview.classList.remove("hidden");
    photoPlaceholder.classList.add("hidden");
    photoRemove.classList.remove("hidden");
    photoRemove.classList.add("inline-flex");
    hideError(error1);
}

function clearPhoto() {
    state.photo = null;
    photoPreview.removeAttribute("src");
    photoPreview.classList.add("hidden");
    photoPlaceholder.classList.remove("hidden");
    photoRemove.classList.add("hidden");
    photoRemove.classList.remove("inline-flex");
    photoInput.value = "";
}

photoInput.addEventListener("change", () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        showError(error1, "File itu bukan gambar. Pilih foto yang benar.");
        photoInput.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => setPhoto(event.target.result);
    reader.readAsDataURL(file);
});

photoRemove.addEventListener("click", clearPhoto);

nameInput.addEventListener("input", () => {
    state.name = nameInput.value.trim();
    if (state.name) hideError(error1);
});

document.getElementById("next-1").addEventListener("click", () => {
    state.name = nameInput.value.trim();

    if (!state.name && !state.photo) {
        showError(error1, "Nama dan foto wajib diisi dulu, bro.");
        return;
    }
    if (!state.name) {
        showError(error1, "Nama korban masih kosong.");
        nameInput.focus();
        return;
    }
    if (!state.photo) {
        showError(error1, "Foto korban belum dipilih.");
        return;
    }

    hideError(error1);
    showStep(2);
});

/* ---------- Step 2: organ (multi-select) ---------- */
function refreshOrgans() {
    const selected = Array.from(state.organs);
    sendButton.disabled = selected.length === 0;

    if (selected.length === 0) {
        organCount.textContent = "Belum ada organ dipilih.";
        return;
    }

    organCount.textContent = `${selected.length} organ dipilih: ${selected.join(", ")}.`;
    hideError(error2);
}

organCards.forEach((card) => {
    card.addEventListener("click", () => {
        const organ = card.dataset.organ;
        const isSelected = card.getAttribute("aria-pressed") === "true";

        card.setAttribute("aria-pressed", String(!isSelected));
        if (isSelected) {
            state.organs.delete(organ);
        } else {
            state.organs.add(organ);
        }
        refreshOrgans();
    });
});

document.getElementById("back-2").addEventListener("click", () => showStep(1));

/* ---------- Step 3: progress ala-ala ---------- */
const phases = [
    { at: 0, text: "Menyiapkan sesajen & lilin hitam..." },
    { at: 14, text: "Mengunci target lewat foto..." },
    { at: 32, text: "Menyalakan dupa & membaca mantra..." },
    { at: 52, text: "Mengirim jarum halus ke {organ}..." },
    { at: 72, text: "Mengikat tenaga gelap pada nama..." },
    { at: 88, text: "Menutup mantra terakhir..." },
    { at: 100, text: "Ritual sempurna. Santet meluncur!" },
];

function phaseFor(value) {
    let current = phases[0].text;
    phases.forEach((phase) => {
        if (value >= phase.at) current = phase.text;
    });
    const organs = Array.from(state.organs);
    return current.replace("{organ}", organs[0] || "target");
}

function startProgress() {
    let progress = 0;
    progressBar.style.setProperty("--progress", 0);
    progressValue.textContent = "0%";

    const organLabel = Array.from(state.organs)[0] || "target";
    progressText.textContent = phaseFor(0).replace("{organ}", organLabel);

    progressTimer = setInterval(() => {
        const step = progress < 70 ? 2 + Math.random() * 4 : 1 + Math.random() * 2.4;
        progress = Math.min(progress + step, 100);

        const rounded = Math.floor(progress);
        progressBar.style.setProperty("--progress", rounded);
        progressValue.textContent = `${rounded}%`;
        progressText.textContent = phaseFor(rounded).replace("{organ}", organLabel);

        if (progress >= 100) {
            clearInterval(progressTimer);
            progressTimer = null;
            window.setTimeout(finishRitual, 700);
        }
    }, 110);
}

function finishRitual() {
    const organs = Array.from(state.organs);
    resultName.textContent = state.name;
    resultOrgans.textContent = organs.length > 1
        ? organs.slice(0, -1).join(", ") + " dan " + organs[organs.length - 1]
        : organs[0];

    showStep(4);
    checkCircle.classList.remove("is-playing");
    void checkCircle.getBoundingClientRect();
    checkCircle.classList.add("is-playing");
}

sendButton.addEventListener("click", () => {
    if (state.organs.size === 0) {
        showError(error2, "Pilih minimal satu organ dulu.");
        return;
    }
    showStep(3);
    startProgress();
});

/* ---------- Step 4: reset ---------- */
document.getElementById("restart").addEventListener("click", () => {
    state.name = "";
    state.organs.clear();

    nameInput.value = "";
    clearPhoto();
    organCards.forEach((card) => card.setAttribute("aria-pressed", "false"));

    sendButton.disabled = true;
    organCount.textContent = "Belum ada organ dipilih.";
    progressBar.style.setProperty("--progress", 0);
    progressValue.textContent = "0%";
    hideError(error1);
    hideError(error2);

    showStep(1);
});

refreshOrgans();
