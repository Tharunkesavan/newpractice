"use strict";

// ========================================
// 1. STORAGE KEYS
// ========================================

const STORAGE_KEYS = {
    preferences: "shopifive_preferences_v1",
    submissions: "shopifive_demo_submissions_v1"
};


// ========================================
// 2. PRODUCT DATA
// ========================================

let products = [
    {
        id: 1,
        name: "Email ",
        description: "Send useful updates, offers, and campaign emails to customers.",
        price: 499,
        category: "Marketing",
        icon: "✉",
        featured: 1
    },
    {
        id: 2,
        name: "SMS Campaigns",
        description: "Plan timely customer messages and promotional campaigns.",
        price: 399,
        category: "Marketing",
        icon: "⌁",
        featured: 2
    },
    {
        id: 3,
        name: "SEO Tools",
        description: "Organise search optimisation tasks and improve product visibility.",
        price: 599,
        category: "Marketing",
        icon: "⌕",
        featured: 3
    },
    {
        id: 4,
        name: "Online Store",
        description: "Build and organise a storefront for your products.",
        price: 999,
        category: "Store",
        icon: "▧",
        featured: 4
    },
    {
        id: 5,
        name: "Discounts and Coupons",
        description: "Plan offers and discount codes for your customers.",
        price: 299,
        category: "Store",
        icon: "%",
        featured: 5
    },
    {
        id: 6,
        name: "Sales Analytics",
        description: "Review sales activity and spot useful business patterns.",
        price: 799,
        category: "Analytics",
        icon: "↗",
        featured: 6
    }
];


// ========================================
// 3. RESOURCE DATA
// ========================================

const resources = [
    {
        id: 1,
        title: "Getting started with your online store",
        description: "A practical introduction to planning products, store pages, and the customer journey.",
        category: "Learning",
        readTime: "6 min read",
        icon: "↗"
    },
    {
        id: 2,
        title: "A simple guide to ecommerce SEO",
        description: "Learn the basics of product titles, useful descriptions, and search-friendly pages.",
        category: "Learning",
        readTime: "8 min read",
        icon: "⌕"
    },
    {
        id: 3,
        title: "Payments and order support checklist",
        description: "A checklist of common topics to review when planning a smoother order experience.",
        category: "Support",
        readTime: "4 min read",
        icon: "✓"
    },
    {
        id: 4,
        title: "How growing stores organise their work",
        description: "Explore a sample story about improving store operations and tracking progress.",
        category: "Stories",
        readTime: "5 min read",
        icon: "▦"
    }
];


// ========================================
// 4. COMMON VARIABLES
// ========================================

const pageIds = [
    "home",
    "products",
    "solutions",
    "pricing",
    "resources",
    "contact"
];

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("[data-page]");
const goButtons = document.querySelectorAll("[data-go]");

const mainNav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");
const toast = document.getElementById("toast");

let activeProductCategory = "All";
let activeResourceCategory = "All";
let toastTimer = null;


// ========================================
// 5. COMMON HELPER FUNCTIONS
// ========================================

// Display a temporary notification.

function showToast(message) {
    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(toastTimer);

    toastTimer = window.setTimeout(function () {
        toast.classList.remove("show");
    }, 3200);
}


// Read JSON data from Local Storage.

function safeReadJSON(key, fallbackValue) {
    try {
        const storedValue = localStorage.getItem(key);

        if (storedValue === null) {
            return fallbackValue;
        }

        return JSON.parse(storedValue);

    } catch (error) {
        console.warn(
            "Could not read saved demo data:",
            error.message
        );

        return fallbackValue;
    }
}


// Convert JavaScript data into JSON and save it.

function safeWriteJSON(key, value) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {
        console.warn(
            "Could not save demo data:",
            error.message
        );

        return false;
    }
}


// Display success or error messages.

function setFeedback(element, message, type) {
    if (!element) {
        return;
    }

    element.textContent = message;

    element.classList.remove(
        "success",
        "error"
    );

    if (type) {
        element.classList.add(type);
    }
}


// Close the mobile navigation menu.

function closeMobileMenu() {
    if (mainNav) {
        mainNav.classList.remove("open");
    }

    if (menuToggle) {
        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );
    }

    document.body.classList.remove("menu-open");
}


// ========================================
// 6. PAGE NAVIGATION
// ========================================

function openPage(pageId, options = {}) {

    const targetId = pageIds.includes(pageId)
        ? pageId
        : "home";

    const targetPage = document.getElementById(targetId);

    if (!targetPage) {
        console.error(
            "Requested page is missing:",
            targetId
        );

        return;
    }

    // Show the selected page and hide the others.

    pages.forEach(function (page) {
        const isActive = page.id === targetId;

        page.classList.toggle(
            "active",
            isActive
        );

        page.hidden = !isActive;

        page.setAttribute(
            "aria-hidden",
            String(!isActive)
        );
    });

    // Update the active navigation link.

    navLinks.forEach(function (link) {
        const isActive = link.dataset.page === targetId;

        link.classList.toggle(
            "active-link",
            isActive
        );

        if (isActive && link.closest("nav")) {
            link.setAttribute(
                "aria-current",
                "page"
            );
        } else {
            link.removeAttribute("aria-current");
        }
    });

    closeMobileMenu();

    // Update browser tab title.

    document.title =
        `Shopifive | ${targetPage.dataset.title || "Build and Grow"}`;

    // Update the URL.

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

    // Scroll to the top.

    if (options.scroll !== false) {
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        window.scrollTo({
            top: 0,
            behavior: reduceMotion ? "auto" : "smooth"
        });
    }
}


// Navigate to a page.

function navigateTo(pageId) {
    if (!pageIds.includes(pageId)) {
        showToast("That section is not available.");
        return;
    }

    openPage(pageId, {
        updateHistory: true
    });
}


// ========================================
// 7. NAVIGATION EVENTS
// ========================================

// Main navigation links.

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


// Buttons that navigate to another section.

goButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        navigateTo(button.dataset.go);
    });
});


// Open and close the mobile menu.

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
        const willOpen = !mainNav.classList.contains("open");

        mainNav.classList.toggle(
            "open",
            willOpen
        );

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

        document.body.classList.toggle(
            "menu-open",
            willOpen
        );
    });
}


// Close the mobile menu when Escape is pressed.

document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        mainNav &&
        mainNav.classList.contains("open")
    ) {
        closeMobileMenu();

        if (menuToggle) {
            menuToggle.focus();
        }
    }
});


// Close the mobile menu when clicking outside.

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


// Support the browser Back button.

window.addEventListener("popstate", function () {
    openPage(
        window.location.hash.slice(1) || "home",
        { scroll: false }
    );
});


// Support direct hash changes.

window.addEventListener("hashchange", function () {
    const hashPage = window.location.hash.slice(1);

    if (!pageIds.includes(hashPage)) {
        return;
    }

    const targetPage = document.getElementById(hashPage);

    if (
        targetPage &&
        !targetPage.classList.contains("active")
    ) {
        openPage(hashPage, {
            scroll: false
        });
    }
});


// ========================================
// 8. HOME PAGE ACTION
// ========================================

const startTrialBtn =
    document.getElementById("startTrialBtn");

if (startTrialBtn) {
    startTrialBtn.addEventListener("click", function () {
        const heroMessage =
            document.getElementById("heroMessage");

        if (heroMessage) {
            heroMessage.textContent =
                "Welcome to Shopifive. Choose a demo plan to continue.";
        }

        navigateTo("pricing");
    });
}


// ========================================
// 9. PRODUCT CATALOGUE
// ========================================

const productList =
    document.getElementById("productList");

const productCount =
    document.getElementById("productCount");

const productSearch =
    document.getElementById("productSearch");

const productSort =
    document.getElementById("productSort");

const productEmpty =
    document.getElementById("productEmpty");

const productsPerPage = 6;

let currentPage = 1;

const pagination =
    document.getElementById("pagination");

const prevPage =
    document.getElementById("prevPage");

const nextPage =
    document.getElementById("nextPage");

const pageNumbers =
    document.getElementById("pageNumbers");

const clearProductFilters =
    document.getElementById("clearProductFilters");

const productFilterButtons =
    document.querySelectorAll("[data-category]");


// Create a product card.

function createProductCard(product) {
    const card = document.createElement("article");

    card.className = "product-card";

    // Product card top.

    const top = document.createElement("div");

    top.className = "product-card-top";

    // Product icon.

    const icon = document.createElement("span");

    icon.className = "product-icon";

    icon.setAttribute("aria-hidden", "true");

    icon.textContent = product.icon;

    // Product category.

    const category = document.createElement("span");

    category.className = "product-category";

    category.textContent = product.category;

    top.append(icon, category);

    // Product name.

    const title = document.createElement("h3");

    title.textContent = product.name;

    // Product description.

    const description = document.createElement("p");

    description.textContent = product.description;

    // Price and button container.

    const bottom = document.createElement("div");

    bottom.className = "product-card-bottom";

    // Product price.

    const price = document.createElement("span");

    price.className = "product-price";

    price.textContent = `₹${product.price}`;

    const pricePeriod = document.createElement("small");

    pricePeriod.textContent = " / month";

    price.appendChild(pricePeriod);

    // Select product button.

    const selectButton = document.createElement("button");

    selectButton.type = "button";

    selectButton.className = "product-select";

    selectButton.textContent = "Select tool";

    selectButton.addEventListener("click", function () {
        selectProduct(product.id);
    });

    bottom.append(price, selectButton);

    card.append(
        top,
        title,
        description,
        bottom
    );

    return card;
}


// Search, filter, and sort products.

function getVisibleProducts() {
    const query = productSearch
        ? productSearch.value.trim().toLowerCase()
        : "";

    let visibleProducts = products.filter(function (product) {
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

    // Copy the array before sorting.

    visibleProducts = visibleProducts.slice();

    // Sort products.

    const sortMode = productSort
        ? productSort.value
        : "featured";

    if (sortMode === "price-low") {
        visibleProducts.sort(function (a, b) {
            return a.price - b.price;
        });

    } else if (sortMode === "price-high") {
        visibleProducts.sort(function (a, b) {
            return b.price - a.price;
        });

    } else if (sortMode === "name") {
        visibleProducts.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });

    } else {
        visibleProducts.sort(function (a, b) {
            return a.featured - b.featured;
        });
    }

    return visibleProducts;
}


// Display products using pagination.

function renderProducts() {
    if (!productList) {
        return;
    }

    const visibleProducts = getVisibleProducts();

    const totalPages = Math.ceil(
        visibleProducts.length / productsPerPage
    );

    // Keep the current page within the valid range.

    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }

    if (currentPage < 1) {
        currentPage = 1;
    }

    // Calculate product indexes.

    const startIndex =
        (currentPage - 1) * productsPerPage;

    const endIndex =
        startIndex + productsPerPage;

    const paginatedProducts = visibleProducts.slice(
        startIndex,
        endIndex
    );

    // Clear previously displayed products.

    productList.replaceChildren();

    // Display products for the current page.

    paginatedProducts.forEach(function (product) {
        productList.appendChild(
            createProductCard(product)
        );
    });

    // Update the product count.

    if (productCount) {
        productCount.textContent =
            `${visibleProducts.length} ${
                visibleProducts.length === 1
                    ? "tool"
                    : "tools"
            } found`;
    }

    // Display the empty state.

    if (productEmpty) {
        productEmpty.hidden =
            visibleProducts.length !== 0;
    }

    productList.hidden =
        visibleProducts.length === 0;

    // Update pagination.

    renderPagination(totalPages);
}


// Create pagination buttons.

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

    for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement("button");

        button.type = "button";

        button.textContent = page;

        button.classList.toggle(
            "active",
            page === currentPage
        );

        if (page === currentPage) {
            button.setAttribute(
                "aria-current",
                "page"
            );
        }

        button.addEventListener("click", function () {
            currentPage = page;

            renderProducts();

            productList.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });

        pageNumbers.appendChild(button);
    }
}


// Previous page.

if (prevPage) {
    prevPage.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;

            renderProducts();
        }
    });
}


// Next page.

if (nextPage) {
    nextPage.addEventListener("click", function () {
        const totalPages = Math.ceil(
            getVisibleProducts().length / productsPerPage
        );

        if (currentPage < totalPages) {
            currentPage++;

            renderProducts();
        }
    });
}


// Update category buttons.

function updateProductFilterButtons() {
    productFilterButtons.forEach(function (button) {
        const isActive =
            button.dataset.category === activeProductCategory;

        button.classList.toggle(
            "active",
            isActive
        );

        button.setAttribute(
            "aria-pressed",
            String(isActive)
        );
    });
}


// Reset product filters.

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


// Product search.

if (productSearch) {
    productSearch.addEventListener("input", function () {
        currentPage = 1;

        renderProducts();
    });
}


// Product sorting.

if (productSort) {
    productSort.addEventListener("change", function () {
        currentPage = 1;

        renderProducts();

        savePreferences();
    });
}


// Product category filtering.

productFilterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        activeProductCategory =
            button.dataset.category;

        currentPage = 1;

        updateProductFilterButtons();

        renderProducts();

        savePreferences();
    });
});


// Clear product filters.

if (clearProductFilters) {
    clearProductFilters.addEventListener(
        "click",
        resetProductFilters
    );
}


// Select a product and prepare the contact form.

function selectProduct(productId) {
    const selectedProduct = products.find(function (product) {
        return product.id === productId;
    });

    if (!selectedProduct) {
        showToast(
            "We could not find that tool. Please try again."
        );

        return;
    }

    const subject =
        document.getElementById("customerSubject");

    const message =
        document.getElementById("customerMessage");

    if (subject) {
        subject.value = "Products";
    }

    if (message) {
        message.value =
            `I would like to learn more about ${selectedProduct.name}.`;
    }

    updateMessageCount();

    navigateTo("contact");

    const customerName =
        document.getElementById("customerName");

    if (customerName) {
        customerName.focus({
            preventScroll: true
        });
    }

    showToast(
        `${selectedProduct.name} added to your enquiry.`
    );
}


// ========================================
// 10. PRICING AND PLAN SELECTION
// ========================================

const pricingMessage =
    document.getElementById("pricingMessage");

const selectedPlanInput =
    document.getElementById("selectedPlan");

const customerSubjectInput =
    document.getElementById("customerSubject");

const customerMessageInput =
    document.getElementById("customerMessage");


// Select a plan.

function choosePlan(planName) {
    const validPlans = [
        "Starter",
        "Growth",
        "Pro"
    ];

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

    if (customerSubjectInput) {
        customerSubjectInput.value = "Pricing";
    }

    if (customerMessageInput) {
        customerMessageInput.value =
            `I would like to know more about the ${planName} plan.`;
    }

    updateMessageCount();

    setFeedback(
        pricingMessage,
        `${planName} selected. Your contact form has been prepared.`,
        "success"
    );

    navigateTo("contact");

    const customerName =
        document.getElementById("customerName");

    if (customerName) {
        customerName.focus({
            preventScroll: true
        });
    }

    showToast(`${planName} plan selected.`);
}


// Pricing page plan buttons.

document.querySelectorAll("[data-plan]").forEach(function (button) {
    button.addEventListener("click", function () {
        choosePlan(button.dataset.plan);
    });
});


// Solution page plan buttons.

document.querySelectorAll("[data-plan-select]").forEach(function (button) {
    button.addEventListener("click", function () {
        choosePlan(button.dataset.planSelect);
    });
});


// ========================================
// 11. RESOURCE LIBRARY
// ========================================

const resourceList =
    document.getElementById("resourceList");

const resourceSearch =
    document.getElementById("resourceSearch");

const resourceCount =
    document.getElementById("resourceCount");

const resourceEmpty =
    document.getElementById("resourceEmpty");

const resourceMessage =
    document.getElementById("resourceMessage");

const resourceFilterButtons =
    document.querySelectorAll("[data-resource-category]");


// Create a resource card.

function createResourceCard(resource) {
    const card = document.createElement("article");

    card.className = "resource-card";

    const top = document.createElement("div");

    top.className = "resource-card-top";

    const icon = document.createElement("span");

    icon.className = "feature-icon";

    icon.setAttribute("aria-hidden", "true");

    icon.textContent = resource.icon;

    const type = document.createElement("span");

    type.className = "resource-type";

    type.textContent = resource.category;

    top.append(icon, type);

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
            `${resource.title} is a sample resource in this frontend demo.`,
            ""
        );

        showToast(
            "This demo resource does not link to a full article yet."
        );
    });

    card.append(
        top,
        title,
        description,
        time,
        button
    );

    return card;
}


// Search and filter resources.

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

    resourceList.replaceChildren();

    visibleResources.forEach(function (resource) {
        resourceList.appendChild(
            createResourceCard(resource)
        );
    });

    if (resourceCount) {
        resourceCount.textContent =
            `${visibleResources.length} ${
                visibleResources.length === 1
                    ? "resource"
                    : "resources"
            }`;
    }

    if (resourceEmpty) {
        resourceEmpty.hidden =
            visibleResources.length !== 0;
    }

    resourceList.hidden =
        visibleResources.length === 0;
}


// Update resource category buttons.

function updateResourceFilterButtons() {
    resourceFilterButtons.forEach(function (button) {
        const isActive =
            button.dataset.resourceCategory === activeResourceCategory;

        button.classList.toggle(
            "active",
            isActive
        );

        button.setAttribute(
            "aria-pressed",
            String(isActive)
        );
    });
}


// Reset resource filters.

function resetResourceFilters() {
    if (resourceSearch) {
        resourceSearch.value = "";
    }

    activeResourceCategory = "All";

    updateResourceFilterButtons();

    setFeedback(
        resourceMessage,
        "",
        ""
    );

    renderResources();

    savePreferences();
}


// Resource search.

if (resourceSearch) {
    resourceSearch.addEventListener(
        "input",
        renderResources
    );
}


// Resource category filtering.

resourceFilterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        activeResourceCategory =
            button.dataset.resourceCategory;

        updateResourceFilterButtons();

        renderResources();

        savePreferences();
    });
});


// Clear resource filters.

const clearResourceFilters =
    document.getElementById("clearResourceFilters");

if (clearResourceFilters) {
    clearResourceFilters.addEventListener(
        "click",
        resetResourceFilters
    );
}


// ========================================
// 12. CONTACT FORM ELEMENTS
// ========================================

const contactForm =
    document.getElementById("contactForm");

const formMessage =
    document.getElementById("formMessage");

const saveSubmissionCheckbox =
    document.getElementById("saveSubmission");

const messageCount =
    document.getElementById("messageCount");

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


// ========================================
// 13. FORM FIELD ERROR HANDLING
// ========================================

function setFieldError(fieldName, message) {
    const field = fields[fieldName];

    const errorElement = errorElements[fieldName];

    if (!field || !errorElement) {
        return;
    }

    errorElement.textContent = message;

    if (message) {
        field.setAttribute(
            "aria-invalid",
            "true"
        );
    } else {
        field.removeAttribute("aria-invalid");
    }
}


// ========================================
// 14. CONTACT FORM VALIDATION
// ========================================

function validateContactForm() {
    let isValid = true;

    // Clear previous errors.

    Object.keys(errorElements).forEach(function (fieldName) {
        setFieldError(fieldName, "");
    });

    // Read form values.

    const name = fields.name.value.trim();

    const email = fields.email.value.trim();

    const phone = fields.phone.value.trim();

    const subject = fields.subject.value;

    const message = fields.message.value.trim();

    // Validate name.

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

    // Validate email.

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        setFieldError(
            "email",
            "Enter a valid email address."
        );

        isValid = false;
    }

    // Validate optional phone number.

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

    // Validate subject.

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

    // Validate message.

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


// ========================================
// 15. MESSAGE CHARACTER COUNTER
// ========================================

function updateMessageCount() {
    if (!messageCount || !fields.message) {
        return;
    }

    messageCount.textContent =
        `${fields.message.value.length} / 2000`;
}


// Message input event.

if (fields.message) {
    fields.message.addEventListener("input", function () {
        updateMessageCount();

        if (
            fields.message.getAttribute("aria-invalid") === "true"
        ) {
            setFieldError("message", "");
        }
    });
}


// Clear field errors when the user edits a field.

Object.keys(fields).forEach(function (fieldName) {
    const field = fields[fieldName];

    if (!field) {
        return;
    }

    field.addEventListener("input", function () {
        if (
            fieldName !== "message" &&
            field.getAttribute("aria-invalid") === "true"
        ) {
            setFieldError(fieldName, "");
        }
    });

    field.addEventListener("change", function () {
        if (
            field.getAttribute("aria-invalid") === "true"
        ) {
            setFieldError(fieldName, "");
        }
    });
});


// ========================================
// 16. CONTACT FORM SUBMISSION
// ========================================

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        setFeedback(
            formMessage,
            "",
            ""
        );

        try {
            // Validate form.

            if (!validateContactForm()) {
                setFeedback(
                    formMessage,
                    "Please correct the highlighted fields and try again.",
                    "error"
                );

                const firstInvalid =
                    contactForm.querySelector(
                        '[aria-invalid="true"]'
                    );

                if (firstInvalid) {
                    firstInvalid.focus();
                }

                return;
            }

            // Create the submission object.

            const contactDetails = {
                id:
                    window.crypto &&
                    typeof window.crypto.randomUUID === "function"
                        ? window.crypto.randomUUID()
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

            // Save only when the checkbox is selected.

            if (
                saveSubmissionCheckbox &&
                saveSubmissionCheckbox.checked
            ) {
                const savedSubmissions = safeReadJSON(
                    STORAGE_KEYS.submissions,
                    []
                );

                if (!Array.isArray(savedSubmissions)) {
                    throw new Error(
                        "Saved demo data is not in the expected format."
                    );
                }

                savedSubmissions.push(contactDetails);

                const saved = safeWriteJSON(
                    STORAGE_KEYS.submissions,
                    savedSubmissions
                );

                if (!saved) {
                    throw new Error(
                        "The browser could not save this submission. Check your browser storage settings."
                    );
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

            showToast(
                "Contact form validated successfully."
            );

            // Reset form after successful validation.

            contactForm.reset();

            clearAllFieldErrors();

            updateMessageCount();

        } catch (error) {
            console.error(
                "Contact form error:",
                error
            );

            setFeedback(
                formMessage,
                error.message ||
                    "Something went wrong. Please try again.",
                "error"
            );

        } finally {
            console.log(
                "Contact form processing finished."
            );
        }
    });
}


// ========================================
// 17. CLEAR FORM ERRORS
// ========================================

function clearAllFieldErrors() {
    Object.keys(errorElements).forEach(function (fieldName) {
        setFieldError(fieldName, "");
    });
}


// Reset form event.

if (contactForm) {
    contactForm.addEventListener("reset", function () {
        window.setTimeout(function () {
            clearAllFieldErrors();

            setFeedback(
                formMessage,
                "",
                ""
            );

            updateMessageCount();
        }, 0);
    });
}


// ========================================
// 18. RESTORE SAVED PREFERENCES
// ========================================

function restorePreferences() {
    const preferences = safeReadJSON(
        STORAGE_KEYS.preferences,
        {}
    );

    if (
        !preferences ||
        typeof preferences !== "object" ||
        Array.isArray(preferences)
    ) {
        return;
    }

    // Restore product category.

    if (typeof preferences.productCategory === "string") {
        const validCategories = [
            "All",
            "Marketing",
            "Store",
            "Analytics"
        ];

        if (
            validCategories.includes(
                preferences.productCategory
            )
        ) {
            activeProductCategory =
                preferences.productCategory;

            updateProductFilterButtons();
        }
    }

    // Restore resource category.

    if (typeof preferences.resourceCategory === "string") {
        const validCategories = [
            "All",
            "Learning",
            "Support",
            "Stories"
        ];

        if (
            validCategories.includes(
                preferences.resourceCategory
            )
        ) {
            activeResourceCategory =
                preferences.resourceCategory;

            updateResourceFilterButtons();
        }
    }

    // Restore product sorting preference.

    if (
        productSort &&
        typeof preferences.productSort === "string" &&
        [
            "featured",
            "price-low",
            "price-high",
            "name"
        ].includes(preferences.productSort)
    ) {
        productSort.value = preferences.productSort;
    }

    // Render resources immediately.
    // Products will render after the API finishes loading.

    renderResources();
}


// ========================================
// 19. SAVE PREFERENCES
// ========================================

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


// ========================================
// 20. FETCH PRODUCTS FROM DUMMYJSON API
// ========================================

async function loadProductsFromAPI() {
    const productGrid =
        document.getElementById("productList");

    const countElement =
        document.getElementById("productCount");

    // Hide the product area until the API responds.

    if (productGrid) {
        productGrid.style.visibility = "hidden";
    }

    if (countElement) {
        countElement.hidden = true;
    }

    try {
        console.log("Loading products from API...");

        // Fetch products.

        const response = await fetch(
            "https://dummyjson.com/products?limit=30"
        );

        // Check response.

        if (!response.ok) {
            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }

        // Convert JSON into JavaScript data.

        const data = await response.json();

        // Validate API data.

        if (!Array.isArray(data.products)) {
            throw new Error(
                "Invalid product data received from API."
            );
        }

        // Convert API products into the website format.

        products = data.products.map(function (item, index) {
            const apiCategory = String(
                item.category || ""
            ).toLowerCase();

            let demoCategory = "Store";

            if (
                [
                    "beauty",
                    "fragrances",
                    "skin-care",
                    "makeup"
                ].some(function (category) {
                    return apiCategory.includes(category);
                })
            ) {
                demoCategory = "Marketing";

            } else if (
                [
                    "laptops",
                    "smartphones",
                    "tablets",
                    "mobile-accessories"
                ].includes(apiCategory)
            ) {
                demoCategory = "Analytics";
            }

            return {
                id: item.id,
                name: item.title,
                description: item.description,
                price: Math.round(Number(item.price) * 85),
                category: demoCategory,
                icon: "🛍️",
                featured: index + 1
            };
        });

        // Reset pagination.

        currentPage = 1;

        // Render API products.

        renderProducts();

        if (countElement) {
            countElement.hidden = false;
        }

        console.log(
            "Products loaded successfully:",
            products
        );

        showToast(
            `${products.length} demo products loaded from API.`
        );

    } catch (error) {
        console.error(
            "Failed to load products:",
            error.message
        );

        // Use local products if the API fails.

        currentPage = 1;

        renderProducts();

        if (countElement) {
            countElement.hidden = false;
        }

        showToast(
            "Could not load API products. Showing local products."
        );

    } finally {
        // Show the product area after rendering.

        if (productGrid) {
            productGrid.style.visibility = "visible";
        }

        console.log(
            "Product loading process completed."
        );
    }
}


// ========================================
// 21. INITIALISE THE WEBSITE
// ========================================

// Restore saved preferences before loading products.

restorePreferences();

// Set the initial character count.

updateMessageCount();

// Open the correct page.

const initialPage = window.location.hash.slice(1);

openPage(
    pageIds.includes(initialPage)
        ? initialPage
        : "home",
    { scroll: false }
);

// Load products from the API.
// The function displays local products if the API fails.

loadProductsFromAPI();

// Feature Practice

function showMessage() {
    console.log("My first Git branch is working!");
}

showMessage();