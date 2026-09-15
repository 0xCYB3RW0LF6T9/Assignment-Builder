/* =========================================================
   0xCyb3rw0lf6T9 | Assignment Builder
   Complete JavaScript (Fixed)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const escapeHtml = (value = "") => {
        const div = document.createElement("div");
        div.textContent = value;
        return div.innerHTML;
    };

    const showToast = (message, type = "success") => {

        const toast = $("#toast");
        const toastMessage = $("#toastMessage");

        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;

        const icon = $("i", toast);

        if (icon) {
            icon.className =
                type === "error"
                    ? "fa-solid fa-circle-exclamation"
                    : "fa-solid fa-check-circle";
        }

        toast.classList.add("show");

        clearTimeout(window.toastTimer);

        window.toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    };


    /* =====================================================
       THEME
    ===================================================== */

    const themeBtn = $("#themeBtn");

    const savedTheme =
        localStorage.getItem("assignment-builder-theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }

    const updateThemeIcon = () => {

        if (!themeBtn) return;

        const icon = $("i", themeBtn);
        if (!icon) return;

        if (document.body.classList.contains("dark")) {
            icon.className = "fa-solid fa-sun";
            themeBtn.setAttribute("aria-label", "Switch to light theme");
        } else {
            icon.className = "fa-solid fa-moon";
            themeBtn.setAttribute("aria-label", "Switch to dark theme");
        }
    };

    updateThemeIcon();

    themeBtn?.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const theme =
            document.body.classList.contains("dark")
                ? "dark"
                : "light";

        localStorage.setItem("assignment-builder-theme", theme);

        updateThemeIcon();
    });


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    const menuBtn = $("#menuBtn");
    const navLinks = $(".nav-links");

    menuBtn?.addEventListener("click", () => {

        navLinks?.classList.toggle("mobile-open");

        const icon = $("i", menuBtn);
        if (!icon) return;

        const isOpen = navLinks?.classList.contains("mobile-open");

        icon.className = isOpen
            ? "fa-solid fa-xmark"
            : "fa-solid fa-bars";
    });

    $$(".nav-links a").forEach(link => {

        link.addEventListener("click", () => {

            navLinks?.classList.remove("mobile-open");

            const icon = $("i", menuBtn);
            if (icon) icon.className = "fa-solid fa-bars";
        });
    });


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const sections = $$("main section[id]");
    const navigationLinks = $$(".nav-links a");

    const updateActiveNavigation = () => {

        const scrollPosition = window.scrollY + 150;
        let currentSection = "home";

        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop) {
                currentSection = section.id;
            }
        });

        navigationLinks.forEach(link => {
            link.classList.toggle(
                "active",
                link.getAttribute("href") === `#${currentSection}`
            );
        });
    };

    window.addEventListener("scroll", updateActiveNavigation, { passive: true });
    updateActiveNavigation();


    /* =====================================================
       ASSIGNMENT FORM
    ===================================================== */

    const formFields = {
        institution: $("#institution"),
        subject: $("#subject"),
        course: $("#course"),
        title: $("#title"),
        studentName: $("#studentName"),
        studentId: $("#studentId"),
        date: $("#date"),
        difficulty: $("#difficulty")

    };
    /* =====================================================
   LOGO UPLOAD
===================================================== */

    const logoInput = $("#logoInput");
    const logoPreviewBox = $("#logoPreviewBox");
    const removeLogoBtn = $("#removeLogo");
    const previewLogo = $("#previewLogo");
    const previewLogoWrap = $("#previewLogoWrap");

    const LOGO_STORAGE_KEY = "assignment-builder-logo";
    const LOGO_MAX_SIZE = 1024 * 1024; // 1 MB

    let currentLogoDataUrl = null;

    const previewFields = {
        institution: $("#previewInstitution"),
        subject: $("#previewSubject"),
        course: $("#previewCourse"),
        title: $("#previewTitle"),
        studentName: $("#previewStudent"),
        studentId: $("#previewId"),
        date: $("#previewDate"),
        difficulty: $("#previewDifficulty")
    };

    const formatDate = value => {

        if (!value) return "—";

        const date = new Date(value + "T00:00:00");

        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };/* =====================================================
   LOGO HELPERS
===================================================== */

    const applyLogoToPreview = dataUrl => {

        if (!previewLogo) return;

        if (dataUrl) {
            previewLogo.src = dataUrl;
            previewLogo.hidden = false;
        } else {
            previewLogo.removeAttribute("src");
            previewLogo.hidden = true;
        }
    };


    const applyLogoToUploader = dataUrl => {

        if (!logoPreviewBox) return;

        if (dataUrl) {
            logoPreviewBox.innerHTML =
                `<img src="${dataUrl}" alt="Logo preview">`;
        } else {
            logoPreviewBox.innerHTML =
                `<i class="fa-regular fa-image"></i>`;
        }

        if (removeLogoBtn) {
            removeLogoBtn.disabled = !dataUrl;
        }
    };


    const setLogo = (dataUrl, { persist = true } = {}) => {

        currentLogoDataUrl = dataUrl || null;

        applyLogoToPreview(currentLogoDataUrl);
        applyLogoToUploader(currentLogoDataUrl);

        if (persist) {
            if (currentLogoDataUrl) {
                try {
                    localStorage.setItem(
                        LOGO_STORAGE_KEY,
                        currentLogoDataUrl
                    );
                } catch (err) {
                    console.warn("Could not save logo (storage full?).", err);
                    showToast("Logo too large to save locally.", "error");
                }
            } else {
                localStorage.removeItem(LOGO_STORAGE_KEY);
            }
        }
    };


    const loadSavedLogo = () => {

        const saved = localStorage.getItem(LOGO_STORAGE_KEY);
        if (saved) setLogo(saved, { persist: false });
    };


    /* Handle file selection */

    logoInput?.addEventListener("change", event => {

        const file = event.target.files?.[0];
        if (!file) return;

        // Validate type
        if (!file.type.startsWith("image/")) {
            showToast("Please choose an image file.", "error");
            logoInput.value = "";
            return;
        }

        // Validate size
        if (file.size > LOGO_MAX_SIZE) {
            showToast("Logo must be smaller than 1 MB.", "error");
            logoInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = e => {
            setLogo(e.target.result);
            showToast("Logo added.");
        };

        reader.onerror = () => {
            showToast("Could not read the image file.", "error");
        };

        reader.readAsDataURL(file);

        // Allow re-selecting the same file later
        logoInput.value = "";
    });


    /* Remove logo */

    removeLogoBtn?.addEventListener("click", () => {
        setLogo(null);
        showToast("Logo removed.");
    });


    /* Restore saved logo on page load */

    loadSavedLogo();


    /* =====================================================
       DOCUMENT EDITOR
    ===================================================== */

    const wordEditor = $("#wordEditor");
    const previewDocument = $("#previewDocument");
    const fontSize = $("#fontSize");


    /* =====================================================
       FIX: MISSING REFERENCES
       These variables were referenced but never declared,
       which threw a ReferenceError and aborted the entire
       script — preventing the Print / DOCX / PDF buttons
       from ever being bound.
    ===================================================== */

    const addOwnQuestion = $("#addOwnQuestion");
    const generateQuestions = $("#generateQuestions");

    const questionTemplates = window.questionTemplates || {
        Easy: [
            "Define the main concept introduced in this chapter.",
            "List three key features of the topic discussed.",
            "Explain the term in your own words.",
            "Give one real-world example of the concept.",
            "State whether the statement is true or false and justify your answer."
        ],
        Medium: [
            "Compare and contrast the two approaches discussed.",
            "Explain how the concept applies to a real-world example.",
            "Describe the step-by-step process involved.",
            "Analyze the advantages and disadvantages of the given method.",
            "Illustrate the concept with a diagram and explain each part."
        ],
        Hard: [
            "Critically evaluate the advantages and disadvantages of the approach.",
            "Design a solution to the given problem and justify your design choices.",
            "Analyze the relationship between the two systems and discuss trade-offs.",
            "Propose an optimized algorithm and prove its complexity.",
            "Discuss the ethical and practical implications of the technology."
        ]
    };


    /* =====================================================
       QUESTION HELPERS
    ===================================================== */

    const getQuestionBlocks = () => {
        if (!wordEditor) return [];
        return $$(".question-block", wordEditor);
    };

    const renumberQuestions = () => {

        const blocks = getQuestionBlocks();

        blocks.forEach((block, index) => {
            const number = $(".question-number", block);
            if (number) {
                number.textContent = `Question ${index + 1}`;
            }
        });
    };


    /* =====================================================
       PREVIEW
    ===================================================== */

    const updatePreviewDocument = () => {

        if (!wordEditor || !previewDocument) return;

        const content = wordEditor.innerHTML.trim();

        if (!content) {
            previewDocument.innerHTML = `
                <div class="preview-empty">
                    Your questions and answers will appear here.
                </div>
            `;
            return;
        }

        previewDocument.innerHTML = content;
    };


    const updatePreview = () => {

        if (previewFields.institution) {
            previewFields.institution.textContent =
                formFields.institution?.value.trim() || "Your Institution";
        }

        if (previewFields.subject) {
            previewFields.subject.textContent =
                formFields.subject?.value.trim() || "—";
        }

        if (previewFields.course) {
            previewFields.course.textContent =
                formFields.course?.value.trim() || "—";
        }

        if (previewFields.title) {
            previewFields.title.textContent =
                formFields.title?.value.trim() || "Assignment Title";
        }

        if (previewFields.studentName) {
            previewFields.studentName.textContent =
                formFields.studentName?.value.trim() || "____________________";
        }

        if (previewFields.studentId) {
            previewFields.studentId.textContent =
                formFields.studentId?.value.trim() || "____________________";
        }

        if (previewFields.date) {
            previewFields.date.textContent =
                formatDate(formFields.date?.value);
        }

        if (previewFields.difficulty) {
            previewFields.difficulty.textContent =
                formFields.difficulty?.value || "Medium";
        }

        updatePreviewDocument();
    };


    Object.values(formFields).forEach(field => {
        field?.addEventListener("input", updatePreview);
        field?.addEventListener("change", updatePreview);
    });


    /* =====================================================
       SAVE EDITOR
    ===================================================== */

    const saveEditor = () => {

        if (!wordEditor) return;

        localStorage.setItem(
            "assignment-builder-editor",
            wordEditor.innerHTML
        );

        updatePreviewDocument();
    };


    /* =====================================================
       LOAD EDITOR
    ===================================================== */

    const savedEditor =
        localStorage.getItem("assignment-builder-editor");

    if (savedEditor && wordEditor) {
        wordEditor.innerHTML = savedEditor;
        renumberQuestions();
    }


    /* =====================================================
       EDITOR INPUT
    ===================================================== */

    wordEditor?.addEventListener("input", () => {
        renumberQuestions();
        saveEditor();
    });

    wordEditor?.addEventListener("keyup", saveEditor);


    /* =====================================================
       FONT SIZE
    ===================================================== */

    fontSize?.addEventListener("change", () => {

        if (!wordEditor) return;

        wordEditor.focus();

        document.execCommand("fontSize", false, fontSize.value);

        saveEditor();
    });


    /* =====================================================
       PLACEHOLDER
    ===================================================== */

    wordEditor?.addEventListener("focus", () => {

        const placeholder = $(".editor-placeholder", wordEditor);

        if (
            placeholder &&
            placeholder.textContent.includes("Start writing your assignment")
        ) {
            placeholder.style.display = "none";
        }
    });


    wordEditor?.addEventListener("blur", () => {

        const placeholder = $(".editor-placeholder", wordEditor);

        if (
            placeholder &&
            wordEditor.textContent.trim() === ""
        ) {
            placeholder.style.display = "";
        }
    });


    /* =====================================================
       CLEAR EDITOR
    ===================================================== */

    $("#clearEditor")?.addEventListener("click", () => {

        if (!wordEditor) return;

        if (!confirm("Clear the entire assignment document?")) return;

        wordEditor.innerHTML = `
            <h1>
                Assignment Questions & Answers
            </h1>

            <p class="editor-placeholder">
                Start writing your assignment here...
            </p>
        `;

        saveEditor();

        showToast("Assignment document cleared.");
    });


    /* =====================================================
       CREATE QUESTION HTML
    ===================================================== */

    const createQuestionHtml = (number, question = "") => {

        const questionText = question || "Type your question here...";

        return `
            <div
                class="question-block"
                data-question-type="${question ? "generated" : "manual"}"
            >
                <p>
                    <span class="question-number">
                        Question ${number}
                    </span>
                </p>

                <p
                    class="question-text"
                    contenteditable="true"
                    spellcheck="true"
                >
                    ${escapeHtml(questionText)}
                </p>

                <div
                    class="answer-area"
                    contenteditable="true"
                    spellcheck="true"
                    data-placeholder="Write your answer here..."
                >
                    Write your answer here...
                </div>

                <div class="question-actions">
                    <button type="button" class="remove-question">
                        <i class="fa-solid fa-trash"></i>
                        Remove
                    </button>
                </div>
            </div>
        `;
    };


    /* =====================================================
       ADD QUESTION
    ===================================================== */

    const addQuestion = (question = "", number = null) => {

        if (!wordEditor) return;

        const existing = getQuestionBlocks().length;
        const questionNumber = number || existing + 1;

        wordEditor.insertAdjacentHTML(
            "beforeend",
            createQuestionHtml(questionNumber, question)
        );

        renumberQuestions();
        saveEditor();

        return getQuestionBlocks().at(-1);
    };


    /* =====================================================
       ADD OWN QUESTION
    ===================================================== */

    addOwnQuestion?.addEventListener("click", () => {

        if (!wordEditor) return;

        const newQuestion = addQuestion();
        if (!newQuestion) return;

        const questionText = $(".question-text", newQuestion);

        if (questionText) {
            questionText.focus();

            const range = document.createRange();
            range.selectNodeContents(questionText);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        showToast("Your own question was added. Type your question now.");
    });


    /* =====================================================
       GENERATE QUESTIONS
    ===================================================== */

    generateQuestions?.addEventListener("click", () => {

        const difficulty =
            formFields.difficulty?.value || "Medium";

        const questions = questionTemplates[difficulty];

        if (!questions) return;

        const existing = getQuestionBlocks().length;

        generateQuestions.classList.add("loading");
        generateQuestions.disabled = true;

        setTimeout(() => {

            questions.forEach((question, index) => {
                addQuestion(question, existing + index + 1);
            });

            renumberQuestions();
            saveEditor();

            generateQuestions.classList.remove("loading");
            generateQuestions.disabled = false;

            showToast(
                `${questions.length} ${difficulty.toLowerCase()} questions generated.`
            );

        }, 500);
    });


    /* =====================================================
       REMOVE QUESTIONS
    ===================================================== */

    wordEditor?.addEventListener("click", event => {

        const button = event.target.closest(".remove-question");
        if (!button) return;

        const block = button.closest(".question-block");
        if (!block) return;

        if (!confirm("Remove this question?")) return;

        block.remove();
        renumberQuestions();
        saveEditor();

        showToast("Question removed.");
    });


    /* =====================================================
       QUESTION PLACEHOLDER
    ===================================================== */

    wordEditor?.addEventListener("focusin", event => {

        const question = event.target.closest(".question-text");

        if (
            question &&
            question.textContent.trim() === "Type your question here..."
        ) {
            question.textContent = "";
        }

        const answer = event.target.closest(".answer-area");

        if (
            answer &&
            answer.textContent.trim() === "Write your answer here..."
        ) {
            answer.textContent = "";
        }
    });


    wordEditor?.addEventListener("focusout", event => {

        const question = event.target.closest(".question-text");

        if (question && !question.textContent.trim()) {
            question.textContent = "Type your question here...";
        }

        const answer = event.target.closest(".answer-area");

        if (answer && !answer.textContent.trim()) {
            answer.textContent = "Write your answer here...";
        }

        saveEditor();
    });


    /* =====================================================
       PRINT ASSIGNMENT  (shared by Print button + Ctrl+P)
    ===================================================== */

    const printAssignment = () => {

        updatePreview();
        updatePreviewDocument();

        // Let the browser paint the latest preview before printing
        requestAnimationFrame(() => {
            setTimeout(() => window.print(), 100);
        });
    };

    $("#printBtn")?.addEventListener("click", printAssignment);


    /* =====================================================
       DOC EXPORT
    ===================================================== */

    const downloadDocx = $("#downloadDocx");

    const buildDocumentHtml = () => {

        const institution = escapeHtml(
            formFields.institution?.value || "Your Institution"
        );

        const subject = escapeHtml(
            formFields.subject?.value || "—"
        );

        const course = escapeHtml(
            formFields.course?.value || "—"
        );

        const title = escapeHtml(
            formFields.title?.value || "Assignment Title"
        );

        const student = escapeHtml(
            formFields.studentName?.value || "____________________"
        );

        const studentId = escapeHtml(
            formFields.studentId?.value || "____________________"
        );

        const date = escapeHtml(
            formatDate(formFields.date?.value)
        );

        const difficulty = escapeHtml(
            formFields.difficulty?.value || "Medium"
        );

        // Clone editor content and strip editor-only UI
        const clone = wordEditor?.cloneNode(true);

        if (clone) {
            clone
                .querySelectorAll(
                    ".question-actions, .editor-placeholder"
                )
                .forEach(el => el.remove());

            clone
                .querySelectorAll("[contenteditable]")
                .forEach(el => el.removeAttribute("contenteditable"));
        }

        const content = clone?.innerHTML || "";
        const logoHtml = currentLogoDataUrl
            ? `<img src="${currentLogoDataUrl}" alt="Logo"
            style="max-height:80px;max-width:200px;
                   object-fit:contain;margin-bottom:10px;">`
            : "";
        return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
    @page { size: A4; margin: 2cm; }
    body { font-family: Arial, sans-serif; color: #111827; line-height: 1.6; }
    h1, h2, h3 { font-family: Arial, sans-serif; }
    .header {
        text-align: center;
        border-bottom: 2px solid #111827;
        padding-bottom: 20px;
    }
    .header h2 { margin: 0 0 5px; }
    .header p { margin: 0 0 10px; font-size: 11px; letter-spacing: 2px; color: #64748b; }
    .header h1 { margin: 0; }
    .meta {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    .meta td {
        padding: 8px;
        border: 1px solid #ddd;
        vertical-align: top;
    }
    .label {
        color: #64748b;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .instructions {
        margin-top: 20px;
        padding: 12px;
        background: #f8fafc;
        border-left: 4px solid #ef4444;
    }
    .instructions p { margin: 5px 0 0; font-size: 12px; }
    .document { margin-top: 30px; }
    .question-block {
        margin: 20px 0;
        padding: 15px;
        border: 1px solid #ddd;
        page-break-inside: avoid;
    }
    .question-number { color: #ef4444; font-weight: bold; }
    .question-text { font-weight: bold; margin-top: 5px; }
    .answer-area {
        min-height: 100px;
        margin-top: 15px;
        padding: 12px;
        border: 1px dashed #aaa;
    }
    .question-actions { display: none !important; }
</style>
</head>
<body>
    <div class="header">
    ${logoHtml}
    <h2>${institution}</h2>
    <p>ASSIGNMENT</p>
    <h1>${title}</h1>
</div>

    <table class="meta">
        <tr>
            <td><span class="label">Subject</span><br>${subject}</td>
            <td><span class="label">Course</span><br>${course}</td>
            <td><span class="label">Due Date</span><br>${date}</td>
            <td><span class="label">Difficulty</span><br>${difficulty}</td>
        </tr>
        <tr>
            <td colspan="2"><span class="label">Student Name</span><br>${student}</td>
            <td colspan="2"><span class="label">Student ID</span><br>${studentId}</td>
        </tr>
    </table>

    <div class="instructions">
        <strong>Instructions</strong>
        <p>Answer all questions carefully. Show your work where necessary
        and provide clear explanations for your answers.</p>
    </div>

    <div class="document">${content}</div>
</body>
</html>`;
    };


    downloadDocx?.addEventListener("click", () => {

        const html = buildDocumentHtml();

        const blob = new Blob(
            ["\ufeff", html],
            { type: "application/msword;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);

        const filename =
            (formFields.title?.value || "assignment")
                .trim()
                .replace(/[^a-z0-9]+/gi, "-")
                .replace(/^-|-$/g, "")
                .toLowerCase() || "assignment";

        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.doc`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        showToast("Word document downloaded.");
    });


    /* =====================================================
       PDF EXPORT  (uses browser "Save as PDF")
    ===================================================== */

    $("#downloadPdf")?.addEventListener("click", () => {

        updatePreview();
        updatePreviewDocument();

        showToast("Choose 'Save as PDF' in the print dialog.");

        requestAnimationFrame(() => {
            setTimeout(() => window.print(), 150);
        });
    });


    /* =====================================================
       FORM RESET
    ===================================================== */

    $("#assignmentForm")?.addEventListener("reset", () => {
        setTimeout(updatePreview, 0);
    });


    /* =====================================================
       START BUILDING BUTTON
    ===================================================== */

    $$(".btn-primary, .nav-create").forEach(button => {

        button.addEventListener("click", () => {

            setTimeout(() => {
                formFields.institution?.focus();
            }, 500);
        });
    });


    /* =====================================================
       KEYBOARD SHORTCUTS
    ===================================================== */

    document.addEventListener("keydown", event => {

        // Ctrl / Cmd + S
        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "s"
        ) {
            event.preventDefault();
            saveEditor();
            showToast("Assignment saved locally.");
        }

        // Ctrl / Cmd + P
        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "p"
        ) {
            event.preventDefault();
            printAssignment();
        }
    });


    /* =====================================================
       AUTO SAVE FORM DATA
    ===================================================== */

    const saveFormData = () => {

        const data = {};

        Object.entries(formFields).forEach(([key, field]) => {
            if (field) data[key] = field.value;
        });

        localStorage.setItem(
            "assignment-builder-form",
            JSON.stringify(data)
        );
    };


    const loadFormData = () => {

        const saved = localStorage.getItem("assignment-builder-form");
        if (!saved) return;

        try {
            const data = JSON.parse(saved);

            Object.entries(data).forEach(([key, value]) => {

                if (formFields[key] && value !== undefined) {
                    formFields[key].value = value;
                }
            });

        } catch (error) {
            console.warn("Could not restore assignment data.", error);
        }
    };


    loadFormData();


    Object.values(formFields).forEach(field => {
        field?.addEventListener("input", saveFormData);
        field?.addEventListener("change", saveFormData);
    });


    /* =====================================================
       INITIAL PREVIEW
    ===================================================== */

    updatePreview();


    /* =====================================================
       SMOOTH SCROLL
    ===================================================== */

    $$('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = $(targetId);
            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    console.log(
        "%c0xCyb3rw0lf6T9 Assignment Builder",
        "color:#ef4444;font-size:18px;font-weight:bold;"
    );

    console.log(
        "%cAssignment Builder initialized successfully.",
        "color:#22c55e;font-weight:bold;"
    );

});