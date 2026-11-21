
const API_URL = "/api/notes";

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const pageTitle = document.getElementById("pageTitle");

const titles = {
    dashboard: "Dashboard",
    notes: "Notes",
    users: "Users",
    security: "Security",
    database: "Database",
    settings: "Settings"
};

// Menyularni boshqarish
navLinks.forEach(link => {
    link.addEventListener("click", () => {
        const page = link.dataset.page;

        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");

        pages.forEach(item => item.classList.remove("active"));

        const selectedPage = document.getElementById(page);

        if (selectedPage) {
            selectedPage.classList.add("active");
            pageTitle.textContent = titles[page] || "Dashboard";
        }

        if (page === "notes") loadNotes();
        if (page === "dashboard") loadNotes();
    });
});

// Xavfsiz matn chiqarish
function createCell(value) {
    const td = document.createElement("td");
    td.textContent = value ?? "";
    return td;
}

// Ma'lumotlarni olish
async function loadNotes() {
    const table = document.getElementById("notesTable");

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Ma'lumotlarni olishda xatolik");
        }

        const result = await response.json();

        const notes = result.data || [];

        table.replaceChildren();

        document.getElementById("totalNotes").textContent = notes.length;
        document.getElementById("noteCount").textContent =
            notes.length + " ta";

        const today = new Date().toDateString();

        const todayCount = notes.filter(note => {
            if (!note.createdAt) return false;

            return new Date(note.createdAt).toDateString() === today;
        }).length;

        document.getElementById("todayNotes").textContent = todayCount;

        if (notes.length === 0) {
            const tr = document.createElement("tr");
            const td = createCell("Hozircha ma'lumot yo'q");
            td.colSpan = 4;
            tr.appendChild(td);
            table.appendChild(tr);
            return;
        }

        notes.forEach(note => {
            const tr = document.createElement("tr");

            tr.appendChild(createCell(note.id));
            tr.appendChild(createCell(note.name));
            tr.appendChild(createCell(note.description));

            const actions = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.textContent = "Tahrirlash";
            editButton.className = "secondary";

            editButton.addEventListener("click", () => editNote(note));

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "O'chirish";
            deleteButton.className = "danger";

            deleteButton.addEventListener("click", () => deleteNote(note.id));

            actions.append(editButton, deleteButton);
            tr.appendChild(actions);

            table.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        table.replaceChildren();

        const tr = document.createElement("tr");
        const td = createCell("Ma'lumotlarni yuklab bo'lmadi");
        td.colSpan = 4;
        tr.appendChild(td);
        table.appendChild(tr);
    }
}

// Yangi ma'lumot qo'shish
document.getElementById("noteForm").addEventListener("submit", async event => {
    event.preventDefault();

    const name = document.getElementById("noteName").value.trim();
    const description =
        document.getElementById("noteDescription").value.trim();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, description })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Qo'shishda xatolik");
        }

        event.target.reset();
        await loadNotes();

        alert("Ma'lumot muvaffaqiyatli qo'shildi");

    } catch (error) {
        alert("Xatolik: " + error.message);
    }
});

// Tahrirlash
async function editNote(note) {
    const name = prompt("Yangi ism:", note.name);

    if (name === null) return;

    const description = prompt("Yangi tavsif:", note.description || "");

    if (description === null) return;

    try {
        const response = await fetch(`${API_URL}/${note.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name.trim(),
                description: description.trim()
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Tahrirlashda xatolik");
        }

        await loadNotes();
        alert("Ma'lumot yangilandi");

    } catch (error) {
        alert(error.message);
    }
}

// O'chirish
async function deleteNote(id) {
    if (!confirm("Ushbu ma'lumotni o'chirmoqchimisiz?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "O'chirishda xatolik");
        }

        await loadNotes();
        alert("Ma'lumot o'chirildi");

    } catch (error) {
        alert(error.message);
    }
}

// Dastlabki yuklash
loadNotes();
