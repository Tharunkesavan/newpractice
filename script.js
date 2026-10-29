"use strict";

/* =========================================
   1. CONFIGURATION AND STORAGE
========================================= */

const STORAGE_KEYS = {
    preferences: "shopifive_preferences_v1",
    submissions: "shopifive_demo_submissions_v1"
};

const API_URL = "https://dummyjson.com/products?limit=30";
const PRODUCTS_PER_PAGE = 6;
const MAX_SUBMISSIONS = 100;

const pageIds = [
    "home",
    "products",
    "solutions",
    "pricing",
    "resources",
    "contact"
];


/* =========================================
   2. LOCAL PRODUCT DATA
========================================= */

const localProducts = [
    {
        id: 1,
        name: "Email Marketing",
        description:
            "Send useful updates, offers, and campaign emails to customers.",
        price: 499,
        category: "Marketing",
        icon: "✉",
        featured: 1
    },
    {
        id: 2,
        name: "SMS Campaigns",
        description:
            "Plan timely customer messages and promotional campaigns.",
        price: 399,
        category: "Marketing",
        icon: "⌁",
        featured: 2
    },
    {
        id: 3,
        name: "SEO Tools",
        description:
            "Organise search optimisation tasks and improve product visibility.",
        price: 599,
        category: "Marketing",
        icon: "⌕",
        featured: 3
    },
    {
        id: 4,
        name: "Online Store",
        description:
            "Build and organise a storefront for your products.",
        price: 999,
        category: "Store",
        icon: "▧",
        featured: 4
    },
    {
        id: 5,
        name: "Discounts and Coupons",
        description:
            "Plan offers and discount codes for your customers.",
        price: 299,
        category: "Store",
        icon: "%",
        featured: 5
    },
    {
        id: 6,
        name: "Sales Analytics",
        description:
            "Review sales activity and spot useful business patterns.",
        price: 799,
        category: "Analytics",
        icon: "↗",
        featured: 6
    }
];

let products = localProducts.slice();


/* =========================================
   3. RESOURCE DATA
========================================= */

const resources = [
    {
        id: 1,
        title: "Getting started with your online store",
        description:
            "A practical introduction to planning products, store pages, and the customer journey.",
        category: "Learning",
        readTime: "6 min read",
        icon: "↗"
    },
    {
        id: 2,
        title: "A simple guide to ecommerce SEO",
        description:
            "Learn the basics of product titles, useful descriptions, and search-friendly pages.",
        category: "Learning",
        readTime: "8 min read",
        icon: "⌕"
    },
    {
        id: 3,
        title: "Payments and order support checklist",
        description:
            "A checklist of common topics to review when planning a smoother order experience.",
        category: "Support",
        readTime: "4 min read",
        icon: "✓"
    },
    {
        id: 4,
        title: "How growing stores organise their work",
        description:
            "Explore a sample story about improving store operations and tracking progress.",
        category: "Stories",
        readTime: "5 min read",
        icon: "▦"
    }
];


/* =========================================
   4. DOM ELEMENTS AND STATE
========================================= */

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("[data-page]");
const goButtons = document.querySelectorAll("[data-go]");

const mainNav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");
const toast = document.getElementById("toast");

const productList = document.getElementById("productList");
const productCount = document.getElementById("productCount");
const productSearch = document.getElementById("productSearch");
const productSort = document.getElementById("productSort");
const productEmpty = document.getElementById("productEmpty");
const pagination = document.getElementById("pagination");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const pageNumbers = document.getElementById("pageNumbers");

const productFilterButtons =
    document.querySelectorAll("[data-category]");

const clearProductFilters =
    document.getElementById("clearProductFilters");

const clearProductFiltersFallback =
    document.getElementById("clearProductFiltersFallback");

const resourceList = document.getElementById("resourceList");
const resourceSearch = document.getElementById("resourceSearch");
const resourceCount = document.getElementById("resourceCount");
const resourceEmpty = document.getElementById("resourceEmpty");
const resourceMessage = document.getElementById("resourceMessage");

const resourceFilterButtons =
    document.querySelectorAll("[data-resource-category]");

const clearResourceFilters =
    document.getElementById("clearResourceFilters");

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const saveSubmissionCheckbox = document.getElementById("saveSubmission");
const messageCount = document.getElementById("messageCount");
const selectedPlanInput = document.getElementById("selectedPlan");
const pricingMessage = document.getElementById("pricingMessage");

const fields = {
    name: document.getElementById("customerName"),
    email: document.getElementById("customerEmail"),
    phone: document.getElementById("customerPhone"),
    subject: document.getElementById("customerSubject"),
    message: document.getElementById("customerMessage")
};

const errorElements = {
    name: document.getElementById("nameError"),
    email: document.getElementById("emailError"),
    phone: document.getElementById("phoneError"),
    subject: document.getElementById("subjectError"),
    message: document.getElementById("messageError")
};

let activeProductCategory = "All";
let activeResourceCategory = "All";
let currentPage = 1;
let toastTimer = null;
let productLoadController = null;


/* =========================================
   5. COMMON HELPERS
========================================= */

function showToast(message) {
    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(toastTimer);

    toastTimer = window.setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}


function setFeedback(element, message, type = "") {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.remove("success", "error");

    if (type) {
        element.classList.add(type);
    }
}


function safeReadJSON(key, fallbackValue) {
    try {
        const value = localStorage.getItem(key);

        if (value === null) {
            return fallbackValue;
        }

        return JSON.parse(value);
    } catch (error) {
        console.warn(
            "Could not read localStorage data:",
            error.message
        );

        return fallbackValue;
    }
}


function safeWriteJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(
            "Could not write localStorage data:",
            error.message
        );

        return false;
    }
}


function isValidPlainObject(value) {
    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
}


function prefersReducedMotion() {
    return (
        typeof window.matchMedia === "function" &&
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    );
}


/* =========================================
   6. MOBILE NAVIGATION
========================================= */

function closeMobileMenu() {
    if (mainNav) {
        mainNav.classList.remove("open");
    }

    if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );
    }

    document.body.classList.remove("menu-open");
}


function toggleMobileMenu() {
    if (!mainNav || !menuToggle) {
        return;
    }

    const willOpen = !mainNav.classList.contains("open");

    mainNav.classList.toggle("open", willOpen);

    menuToggle.setAttribute(
        "aria-expanded",
        String(willOpen)
    );

    menuToggle.setAttribute(
        "aria-label",
        willOpen
            ? "Close navigation menu"
            : "Open navigation menu"
    );

    document.body.classList.toggle("menu-open", willOpen);
}


if (menuToggle) {
    menuToggle.addEventListener("click", toggleMobileMenu);
}


document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && mainNav?.classList.contains("open")) {
        closeMobileMenu();
        menuToggle?.focus();
    }
});


document.addEventListener("click", function (event) {
    if (
        mainNav &&
        menuToggle &&
        mainNav.classList.contains("open") &&
        !mainNav.contains(event.target) &&
        !menuToggle.contains(event.target)
    ) {
        closeMobileMenu();
    }
});


/* =========================================
   7. PAGE NAVIGATION
========================================= */

function openPage(pageId, options = {}) {
    const targetId = pageIds.includes(pageId)
        ? pageId
        : "home";

    const targetPage = document.getElementById(targetId);

    if (!targetPage) {
        console.error("Page not found:", targetId);
        return;
    }

    pages.forEach(function (page) {
        const isActive = page.id === targetId;

        page.classList.toggle("active", isActive);
        page.hidden = !isActive;
        page.setAttribute("aria-hidden", String(!isActive));
    });

    navLinks.forEach(function (link) {
        const isActive = link.dataset.page === targetId;

        link.classList.toggle("active-link", isActive);

        if (isActive && link.closest("nav")) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    document.title =
        `Shopifive | ${targetPage.dataset.title || "Build and Grow"}`;

    closeMobileMenu();

    if (options.updateHistory) {
        const nextUrl = `#${targetId}`;

        if (window.location.hash !== nextUrl) {
            window.history.pushState(
                { page: targetId },
                "",
                nextUrl
            );
        }
    }

    if (options.scroll !== false) {
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion() ? "auto" : "smooth"
        });
    }
}


function navigateTo(pageId) {
    if (!pageIds.includes(pageId)) {
        showToast("That section is not available.");
        return;
    }

    openPage(pageId, { updateHistory: true });
}


navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
        const pageId = link.dataset.page;

        if (!pageIds.includes(pageId)) {
            return;
        }

        event.preventDefault();
        navigateTo(pageId);
    });
});


goButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        navigateTo(button.dataset.go);
    });
});


window.addEventListener("popstate", function () {
    openPage(
        window.location.hash.slice(1) || "home",
        { scroll: false }
    );
});


window.addEventListener("hashchange", function () {
    const hashPage = window.location.hash.slice(1);

    if (!pageIds.includes(hashPage)) {
        return;
    }

    const targetPage = document.getElementById(hashPage);

    if (targetPage && !targetPage.classList.contains("active")) {
        openPage(hashPage, { scroll: false });
    }
});


/* =========================================
   8. HOME PAGE ACTION
========================================= */

const startTrialBtn = document.getElementById("startTrialBtn");
const heroMessage = document.getElementById("heroMessage");

if (startTrialBtn) {
    startTrialBtn.addEventListener("click", function () {
        setFeedback(
            heroMessage,
            "Choose a demo plan to explore the available options."
        );

        navigateTo("pricing");
    });
}


/* =========================================
   9. PRODUCT CATALOGUE
========================================= */

function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product-card";

    const top = document.createElement("div");
    top.className = "product-card-top";

    const icon = document.createElement("span");
    icon.className = "product-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = product.icon || "▧";

    const category = document.createElement("span");
    category.className = "product-category";
    category.textContent = product.category;

    top.append(icon, category);

    const title = document.createElement("h3");
    title.textContent = product.name;

    const description = document.createElement("p");
    description.textContent = product.description;

    const bottom = document.createElement("div");
    bottom.className = "product-card-bottom";

    const price = document.createElement("span");
    price.className = "product-price";

    price.append(
        document.createTextNode(
            `₹${Number(product.price).toLocaleString("en-IN")}`
        )
    );

    const period = document.createElement("small");
    period.textContent = " / month";
    price.appendChild(period);

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "product-select";
    selectButton.textContent = "Select tool";

    selectButton.addEventListener("click", function () {
        selectProduct(product.id);
    });

    bottom.append(price, selectButton);

    card.append(top, title, description, bottom);

    return card;
}


function getVisibleProducts() {
    const query = productSearch
        ? productSearch.value.trim().toLowerCase()
        : "";

    const sortMode = productSort
        ? productSort.value
        : "featured";

    const visibleProducts = products.filter(function (product) {
        const matchesCategory =
            activeProductCategory === "All" ||
            product.category === activeProductCategory;

        const searchableText =
            `${product.name} ${product.description} ${product.category}`
                .toLowerCase();

        return (
            matchesCategory &&
            searchableText.includes(query)
        );
    });

    visibleProducts.sort(function (a, b) {
        if (sortMode === "price-low") {
            return a.price - b.price;
        }

        if (sortMode === "price-high") {
            return b.price - a.price;
        }

        if (sortMode === "name") {
            return a.name.localeCompare(b.name);
        }

        return a.featured - b.featured;
    });

    return visibleProducts;
}


function renderProducts() {
    if (!productList) {
        return;
    }

    const visibleProducts = getVisibleProducts();

    const totalPages = Math.ceil(
        visibleProducts.length / PRODUCTS_PER_PAGE
    );

    currentPage = Math.min(
        Math.max(1, currentPage),
        Math.max(1, totalPages)
    );

    const startIndex =
        (currentPage - 1) * PRODUCTS_PER_PAGE;

    const paginatedProducts = visibleProducts.slice(
        startIndex,
        startIndex + PRODUCTS_PER_PAGE
    );

    const fragment = document.createDocumentFragment();

    paginatedProducts.forEach(function (product) {
        fragment.appendChild(createProductCard(product));
    });

    productList.replaceChildren(fragment);

    if (productCount) {
        productCount.textContent =
            `${visibleProducts.length} ${
                visibleProducts.length === 1
                    ? "tool"
                    : "tools"
            } found`;
    }

    if (productEmpty) {
        productEmpty.hidden = visibleProducts.length !== 0;
    }

    productList.hidden = visibleProducts.length === 0;

    renderPagination(totalPages);
}


function renderPagination(totalPages) {
    if (!pagination || !pageNumbers) {
        return;
    }

    pagination.hidden = totalPages <= 1;
    pageNumbers.replaceChildren();

    if (prevPage) {
        prevPage.disabled =
            currentPage <= 1 || totalPages === 0;
    }

    if (nextPage) {
        nextPage.disabled =
            currentPage >= totalPages || totalPages === 0;
    }

    const fragment = document.createDocumentFragment();

    for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = String(page);
        button.setAttribute(
            "aria-label",
            `Go to product page ${page}`
        );

        const isCurrentPage = page === currentPage;

        button.classList.toggle("active", isCurrentPage);

        if (isCurrentPage) {
            button.setAttribute("aria-current", "page");
        }

        button.addEventListener("click", function () {
            currentPage = page;
            renderProducts();

            productList.scrollIntoView({
                behavior: prefersReducedMotion() ? "auto" : "smooth",
                block: "start"
            });
        });

        fragment.appendChild(button);
    }

    pageNumbers.appendChild(fragment);
}


if (prevPage) {
    prevPage.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
        }
    });
}


if (nextPage) {
    nextPage.addEventListener("click", function () {
        const totalPages = Math.ceil(
            getVisibleProducts().length / PRODUCTS_PER_PAGE
        );

        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
        }
    });
}


function updateProductFilterButtons() {
    productFilterButtons.forEach(function (button) {
        const isActive =
            button.dataset.category === activeProductCategory;

        button.classList.toggle("active", isActive);

        button.setAttribute(
            "aria-pressed",
            String(isActive)
        );
    });
}


function resetProductFilters() {
    if (productSearch) {
        productSearch.value = "";
    }

    if (productSort) {
        productSort.value = "featured";
    }

    activeProductCategory = "All";
    currentPage = 1;

    updateProductFilterButtons();
    renderProducts();
    savePreferences();
}


if (productSearch) {
    productSearch.addEventListener("input", function () {
        currentPage = 1;
        renderProducts();
    });
}


if (productSort) {
    productSort.addEventListener("change", function () {
        currentPage = 1;
        renderProducts();
        savePreferences();
    });
}


productFilterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        activeProductCategory = button.dataset.category;
        currentPage = 1;

        updateProductFilterButtons();
        renderProducts();
        savePreferences();
    });
});


if (clearProductFilters) {
    clearProductFilters.addEventListener(
        "click",
        resetProductFilters
    );
}


if (clearProductFiltersFallback) {
    clearProductFiltersFallback.addEventListener(
        "click",
        resetProductFilters
    );
}


/* =========================================
   10. PRODUCT SELECTION
========================================= */

function selectProduct(productId) {
    const product = products.find(function (item) {
        return item.id === productId;
    });

    if (!product) {
        showToast("We could not find that tool. Please try again.");
        return;
    }

    if (fields.subject) {
        fields.subject.value = "Products";
    }

    if (fields.message) {
        fields.message.value =
            `I would like to learn more about ${product.name}.`;
    }

    if (selectedPlanInput) {
        selectedPlanInput.value = "";
    }

    updateMessageCount();

    navigateTo("contact");

    fields.name?.focus({ preventScroll: true });

    showToast(`${product.name} added to your enquiry.`);
}


/* =========================================
   11. PRICING AND PLAN SELECTION
========================================= */

const validPlans = ["Starter", "Growth", "Pro"];


function choosePlan(planName) {
    if (!validPlans.includes(planName)) {
        setFeedback(
            pricingMessage,
            "Please select a valid plan.",
            "error"
        );

        return;
    }

    if (selectedPlanInput) {
        selectedPlanInput.value = planName;
    }

    if (fields.subject) {
        fields.subject.value = "Pricing";
    }

    if (fields.message) {
        fields.message.value =
            `I would like to know more about the ${planName} plan.`;
    }

    updateMessageCount();

    setFeedback(
        pricingMessage,
        `${planName} selected. Your contact form is ready.`,
        "success"
    );

    navigateTo("contact");

    fields.name?.focus({ preventScroll: true });

    showToast(`${planName} plan selected.`);
}


document.querySelectorAll("[data-plan]").forEach(function (button) {
    button.addEventListener("click", function () {
        choosePlan(button.dataset.plan);
    });
});


document.querySelectorAll("[data-plan-select]").forEach(function (button) {
    button.addEventListener("click", function () {
        choosePlan(button.dataset.planSelect);
    });
});


/* =========================================
   12. RESOURCE LIBRARY
========================================= */

function createResourceCard(resource) {
    const card = document.createElement("article");
    card.className = "resource-card";

    const top = document.createElement("div");
    top.className = "resource-card-top";

    const icon = document.createElement("span");
    icon.className = "feature-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = resource.icon;

    const category = document.createElement("span");
    category.className = "resource-type";
    category.textContent = resource.category;

    top.append(icon, category);

    const title = document.createElement("h3");
    title.textContent = resource.title;

    const description = document.createElement("p");
    description.textContent = resource.description;

    const time = document.createElement("p");
    time.className = "resource-type";
    time.textContent = resource.readTime;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "text-link";
    button.textContent = "Open resource →";

    button.addEventListener("click", function () {
        setFeedback(
            resourceMessage,
            `"${resource.title}" is sample content in this frontend demo.`,
            ""
        );

        showToast("This demo resource does not link to a full article yet.");
    });

    card.append(top, title, description, time, button);

    return card;
}


function renderResources() {
    if (!resourceList) {
        return;
    }

    const query = resourceSearch
        ? resourceSearch.value.trim().toLowerCase()
        : "";

    const visibleResources = resources.filter(function (resource) {
        const matchesCategory =
            activeResourceCategory === "All" ||
            resource.category === activeResourceCategory;

        const searchableText =
            `${resource.title} ${resource.description} ${resource.category}`
                .toLowerCase();

        return (
            matchesCategory &&
            searchableText.includes(query)
        );
    });

    const fragment = document.createDocumentFragment();

    visibleResources.forEach(function (resource) {
        fragment.appendChild(createResourceCard(resource));
    });

    resourceList.replaceChildren(fragment);

    if (resourceCount) {
        resourceCount.textContent =
            `${visibleResources.length} ${
                visibleResources.length === 1
                    ? "resource"
                    : "resources"
            } found`;
    }

    if (resourceEmpty) {
        resourceEmpty.hidden = visibleResources.length !== 0;
    }

    resourceList.hidden = visibleResources.length === 0;
}


function updateResourceFilterButtons() {
    resourceFilterButtons.forEach(function (button) {
        const isActive =
            button.dataset.resourceCategory === activeResourceCategory;

        button.classList.toggle("active", isActive);

        button.setAttribute(
            "aria-pressed",
            String(isActive)
        );
    });
}


function resetResourceFilters() {
    if (resourceSearch) {
        resourceSearch.value = "";
    }

    activeResourceCategory = "All";

    updateResourceFilterButtons();

    setFeedback(resourceMessage, "");

    renderResources();
    savePreferences();
}


if (resourceSearch) {
    resourceSearch.addEventListener("input", renderResources);
}


resourceFilterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        activeResourceCategory = button.dataset.resourceCategory;

        updateResourceFilterButtons();
        renderResources();
        savePreferences();
    });
});


if (clearResourceFilters) {
    clearResourceFilters.addEventListener(
        "click",
        resetResourceFilters
    );
}


/* =========================================
   13. CONTACT FORM FIELD ERRORS
========================================= */

function setFieldError(fieldName, message) {
    const field = fields[fieldName];
    const errorElement = errorElements[fieldName];

    if (!field || !errorElement) {
        return;
    }

    errorElement.textContent = message;

    if (message) {
        field.setAttribute("aria-invalid", "true");
    } else {
        field.removeAttribute("aria-invalid");
    }
}


function clearAllFieldErrors() {
    Object.keys(errorElements).forEach(function (fieldName) {
        setFieldError(fieldName, "");
    });
}


function updateMessageCount() {
    if (!messageCount || !fields.message) {
        return;
    }

    messageCount.textContent =
        `${fields.message.value.length} / 2000`;
}


Object.keys(fields).forEach(function (fieldName) {
    const field = fields[fieldName];

    if (!field) {
        return;
    }

    field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") {
            setFieldError(fieldName, "");
        }

        if (fieldName === "message") {
            updateMessageCount();
        }
    });

    field.addEventListener("change", function () {
        if (field.getAttribute("aria-invalid") === "true") {
            setFieldError(fieldName, "");
        }
    });
});


/* =========================================
   14. CONTACT FORM VALIDATION
========================================= */

function validateContactForm() {
    let isValid = true;

    clearAllFieldErrors();

    const name = fields.name?.value.trim() || "";
    const email = fields.email?.value.trim() || "";
    const phone = fields.phone?.value.trim() || "";
    const subject = fields.subject?.value || "";
    const message = fields.message?.value.trim() || "";

    // Name validation.

    if (name.length < 2) {
        setFieldError(
            "name",
            "Enter at least 2 characters for your name."
        );

        isValid = false;
    } else if (name.length > 80) {
        setFieldError(
            "name",
            "Your name must be 80 characters or fewer."
        );

        isValid = false;
    }

    // Email validation.

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        email.length > 254 ||
        !emailPattern.test(email)
    ) {
        setFieldError(
            "email",
            "Enter a valid email address."
        );

        isValid = false;
    }

    // Optional phone validation.

    if (
        phone &&
        !/^[0-9+\s().-]{7,25}$/.test(phone)
    ) {
        setFieldError(
            "phone",
            "Enter a valid phone number or leave it blank."
        );

        isValid = false;
    }

    // Subject validation.

    const validSubjects = [
        "Products",
        "Solutions",
        "Pricing",
        "Technical Support",
        "Other"
    ];

    if (!validSubjects.includes(subject)) {
        setFieldError(
            "subject",
            "Choose a topic from the list."
        );

        isValid = false;
    }

    // Message validation.

    if (message.length < 10) {
        setFieldError(
            "message",
            "Enter at least 10 characters in your message."
        );

        isValid = false;
    } else if (message.length > 2000) {
        setFieldError(
            "message",
            "Your message must be 2,000 characters or fewer."
        );

        isValid = false;
    }

    return isValid;
}


/* =========================================
   15. CONTACT FORM SUBMISSION
========================================= */

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        setFeedback(formMessage, "");

        if (!validateContactForm()) {
            setFeedback(
                formMessage,
                "Please correct the highlighted fields and try again.",
                "error"
            );

            const firstInvalid =
                contactForm.querySelector('[aria-invalid="true"]');

            firstInvalid?.focus();

            return;
        }

        const contactDetails = {
            id:
                typeof crypto !== "undefined" &&
                typeof crypto.randomUUID === "function"
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()
                        .toString(16)
                        .slice(2)}`,

            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            phone: fields.phone.value.trim(),
            subject: fields.subject.value,
            plan: selectedPlanInput
                ? selectedPlanInput.value
                : "",
            message: fields.message.value.trim(),
            submittedAt: new Date().toISOString()
        };

        if (saveSubmissionCheckbox?.checked) {
            const savedSubmissions = safeReadJSON(
                STORAGE_KEYS.submissions,
                []
            );

            if (!Array.isArray(savedSubmissions)) {
                setFeedback(
                    formMessage,
                    "Saved browser data is invalid. Clear the saved demo data and try again.",
                    "error"
                );

                return;
            }

            // Limit saved entries to avoid unbounded localStorage growth.

            const updatedSubmissions = [
                ...savedSubmissions,
                contactDetails
            ].slice(-MAX_SUBMISSIONS);

            const saved = safeWriteJSON(
                STORAGE_KEYS.submissions,
                updatedSubmissions
            );

            if (!saved) {
                setFeedback(
                    formMessage,
                    "Your browser could not save this submission. Check your storage settings.",
                    "error"
                );

                return;
            }

            setFeedback(
                formMessage,
                `Thanks, ${contactDetails.name}. Your demo submission was saved in this browser. No email was sent.`,
                "success"
            );
        } else {
            setFeedback(
                formMessage,
                `Thanks, ${contactDetails.name}. Your form passed validation. No message was sent to a server.`,
                "success"
            );
        }

        showToast("Contact form validated successfully.");

        contactForm.reset();

        clearAllFieldErrors();
        updateMessageCount();
    });


    contactForm.addEventListener("reset", function () {
        window.setTimeout(function () {
            clearAllFieldErrors();
            setFeedback(formMessage, "");
            updateMessageCount();
        }, 0);
    });
}


/* =========================================
   16. PREFERENCES
========================================= */

function savePreferences() {
    const preferences = {
        productCategory: activeProductCategory,
        resourceCategory: activeResourceCategory,
        productSort: productSort
            ? productSort.value
            : "featured"
    };

    safeWriteJSON(
        STORAGE_KEYS.preferences,
        preferences
    );
}


function restorePreferences() {
    const preferences = safeReadJSON(
        STORAGE_KEYS.preferences,
        {}
    );

    if (!isValidPlainObject(preferences)) {
        return;
    }

    const validProductCategories = [
        "All",
        "Marketing",
        "Store",
        "Analytics"
    ];

    const validResourceCategories = [
        "All",
        "Learning",
        "Support",
        "Stories"
    ];

    const validSortModes = [
        "featured",
        "price-low",
        "price-high",
        "name"
    ];

    if (
        validProductCategories.includes(
            preferences.productCategory
        )
    ) {
        activeProductCategory = preferences.productCategory;
    }

    if (
        validResourceCategories.includes(
            preferences.resourceCategory
        )
    ) {
        activeResourceCategory = preferences.resourceCategory;
    }

    if (
        productSort &&
        validSortModes.includes(preferences.productSort)
    ) {
        productSort.value = preferences.productSort;
    }

    updateProductFilterButtons();
    updateResourceFilterButtons();
}


/* =========================================
   17. LOAD PRODUCTS FROM API
========================================= */

function mapApiProduct(item, index) {
    const apiCategory = String(
        item.category || ""
    ).toLowerCase();

    let category = "Store";

    if (
        [
            "beauty",
            "fragrances",
            "skin-care",
            "makeup"
        ].some(function (value) {
            return apiCategory.includes(value);
        })
    ) {
        category = "Marketing";
    } else if (
        [
            "laptops",
            "smartphones",
            "tablets",
            "mobile-accessories"
        ].includes(apiCategory)
    ) {
        category = "Analytics";
    }

    const rawPrice = Number(item.price);

    if (
        !Number.isFinite(rawPrice) ||
        rawPrice < 0 ||
        !item.title ||
        !item.description
    ) {
        return null;
    }

    return {
        id: `api-${item.id}`,
        name: String(item.title),
        description: String(item.description),
        price: Math.round(rawPrice * 85),
        category: category,
        icon: "🛍️",
        featured: index + 1
    };
}


async function loadProductsFromAPI() {
    if (typeof fetch !== "function") {
        console.info(
            "Fetch is unavailable. Using local products."
        );

        return;
    }

    if (productLoadController) {
        productLoadController.abort();
    }

    productLoadController = new AbortController();

    try {
        const response = await fetch(API_URL, {
            signal: productLoadController.signal
        });

        if (!response.ok) {
            throw new Error(
                `API request failed with status ${response.status}.`
            );
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.products)) {
            throw new Error(
                "The API returned an unexpected response."
            );
        }

        const apiProducts = data.products
            .map(mapApiProduct)
            .filter(Boolean);

        if (apiProducts.length === 0) {
            throw new Error(
                "The API did not return any valid products."
            );
        }

        products = apiProducts;
        currentPage = 1;

        renderProducts();

        // Do not show a toast every time the page loads.
        console.info(
            `${products.length} API demo products loaded.`
        );
    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        console.warn(
            "Could not load API products. Using local products instead:",
            error.message
        );

        products = localProducts.slice();
        currentPage = 1;

        renderProducts();
    } finally {
        productLoadController = null;
    }
}


/* =========================================
   18. INITIALISE WEBSITE
========================================= */

function initialiseWebsite() {
    // Restore preferences first.

    restorePreferences();

    // Display local products immediately.

    renderProducts();

    // Render resources.

    renderResources();

    // Update the contact message counter.

    updateMessageCount();

    // Display the current year.

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = String(
            new Date().getFullYear()
        );
    }

    // Open the page specified in the URL hash.

    const initialPage = window.location.hash.slice(1);

    openPage(
        pageIds.includes(initialPage)
            ? initialPage
            : "home",
        { scroll: false }
    );

    // Load API products in the background.

    loadProductsFromAPI();

    console.info("Shopifive initialised successfully.");
}


initialiseWebsite();
