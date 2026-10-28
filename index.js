const bodyItems = document.body.querySelectorAll(
    '*:not(.top):not(.empty):not(.top *):not(.empty *)'
);

const homeBtn = document.getElementById("home");
const projectsBtn = document.getElementById("projects");
const experienceBtn = document.getElementById("experience");
const blogsBtn = document.getElementById("blogs");
const project1 = document.getElementById("project-1");
const overview = document.getElementById("overview");
const catcafe = document.getElementById("catcafe");
const chaum = document.getElementById("chaum");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let currentPage = null;
let navigating = false;

// Treat a phone as a scaled desktop artboard. This intentionally preserves
// every desktop proportion (including flex rows and text) instead of allowing
// individual elements to reflow and become mismatched.
const DESKTOP_CANVAS_WIDTH = 1440;
const PHONE_BREAKPOINT = 768;

const updateViewportLayout = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const root = document.documentElement;
    const isPhone = width < PHONE_BREAKPOINT;
    const scale = isPhone ? width / DESKTOP_CANVAS_WIDTH : 1;

    root.style.setProperty("--viewport-width", `${width}px`);
    root.style.setProperty("--viewport-height", `${height}px`);
    root.style.setProperty("--page-scale", scale.toFixed(4));
    document.body.classList.toggle("scaled-phone", isPhone);
    root.classList.remove("compact-layout", "phone-layout");
};

updateViewportLayout();
window.addEventListener("resize", updateViewportLayout, { passive: true });


// Detect which page is currently active
const checkbtns = () => {
    switch (window.location.pathname) {
        case "/index.html":
        case "/":
            currentPage = homeBtn;
            break;
        case "/blogs.html":
            currentPage = blogsBtn;
            break;
    }

    if (currentPage) {
        currentPage.style.color = "rgb(0, 0, 0)";
    }
};


const fadeIn = () => {
    let delay = 0;

    for (const child of bodyItems) {
        child.classList.remove("fade-out");
        child.classList.remove("fade-bounce");
        child.classList.remove("fade-in")

        // Force the browser to reset the animation
        void child.offsetWidth;

        child.style.animationDelay = `${delay}s`;

        if (!window.location.href.includes("blogs")) {
            child.classList.add("fade-bounce");
        } else {
            child.classList.add("fade-in");
        }

        delay += (1 / bodyItems.length);
    }
};


window.addEventListener("pageshow", () => {
    navigating = false;
    fadeIn();
});


const isFadingIn = () => {
    return [...bodyItems].some(child =>
        child.getAnimations().some(animation =>
            animation.animationName === "fade-in" &&
            animation.playState === "running"
        )
    );
};


// Shared exit animation
const fadeOut = () => {
    for (const child of bodyItems) {
        child.classList.remove("fade-bounce");
        child.classList.remove("fade-in");
        child.classList.add("fade-out");
        child.style.animationDelay = "0s";
    }
};


// Navigation for regular buttons
// Scroll to named sections. Native scrolling keeps anchor locations correct
// when the complete desktop canvas is scaled on a phone.
const scrollToTarget = (target) => {
    if (typeof target === "number") {
        window.scrollTo({ top: target, left: 0, behavior: "smooth" });
        return;
    }

    const el = document.getElementById(target);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// Mark a button as the active one
const setActive = (btn) => {
    if (currentPage && currentPage !== btn) {
        currentPage.classList.remove("no-transition");
        currentPage.style.color = "rgb(104, 96, 96)";
    }
    btn.style.color = "rgb(0, 0, 0)";
    currentPage = btn;
};

const navBtn = (btn, target, useHref = false) => {
    if (!btn) return;

    btn.addEventListener("click", async () => {
        if (!useHref) {
            setActive(btn);
            scrollToTarget(target);
            return;
        }

        const currentPath = window.location.pathname;
        const targetPath = new URL(target, window.location.href).pathname;

        // Already on this page: scroll to the top instead
        if (currentPath === targetPath) {
            scrollToTarget(0);
            return;
        }

        if (isFadingIn() || navigating) return;

        navigating = true;
        fadeOut();

        // Keep the clicked button black during the exit animation
        if (btn.id != 'overview') btn.style.color = "rgb(0, 0, 0)";

        if (currentPage) {
            currentPage.classList.remove("no-transition");
            currentPage.style.color = "rgb(104, 96, 96)";
        }

        await sleep(500);

        window.location.href = target + "?from=" + encodeURIComponent(btn.id);
    });
};



// Identify which button navigated to this page
const from = new URLSearchParams(window.location.search).get("from");
const fromBtn = from ? document.getElementById(from) : null;


// Disable the color transition before setting the active button
if (fromBtn) {
    fromBtn.classList.add("no-transition");
}


// Set the active navigation button
checkbtns();


// Restore the normal hover transition after the initial color is applied
if (fromBtn) {
    void fromBtn.offsetHeight;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            fromBtn.classList.remove("no-transition");
        });
    });
}

navBtn(homeBtn, 'index.html', true);
navBtn(experienceBtn, "experience-section");
navBtn(projectsBtn, "projects-section");
navBtn(blogsBtn, 'blogs.html', true);
navBtn(project1, 'project-1.html', true);
navBtn(catcafe, 'project-1.html', true);
navBtn(chaum, 'project-2.html', true);
navBtn(overview, 'overview.html', true);
