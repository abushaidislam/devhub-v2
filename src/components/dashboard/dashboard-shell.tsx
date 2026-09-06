"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BookOpen,
  Braces,
  ChevronRight,
  ChevronsUpDown,
  Clock3,
  Columns2,
  FileCode2,
  Github,
  Grid2X2,
  Heart,
  Menu,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Shield,
  Shapes,
  Sparkles,
  Type,
  Workflow,
  X,
} from "lucide-react";
import { CommandPalette } from "./command-palette";
import { categories, getTool, tools, toolsByCategory } from "@/lib/tools";
import { recordHistory } from "@/lib/history";
import { useFavorites } from "@/lib/use-favorites";
import styles from "./dashboard-shell.module.css";
import { Button, ButtonLink } from "../ui/button";
import { ThemeToggle } from "../core/theme-toggle";

const DEFAULT_SIDEBAR_WIDTH = 256;
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 420;
const SNAP_COLLAPSE_THRESHOLD = 150;
const SIDEBAR_STEP = 10;
const SIDEBAR_STORAGE_KEY = "devhub:sidebar-width";
const SIDEBAR_OPEN_STORAGE_KEY = "devhub:sidebar-open";

// Module-level persistent state across SPA navigations within the session
let cachedSidebarWidth: number | null = null;
let cachedSidebarOpen: boolean | null = null;
let cachedScrollTop = 0;
let cachedOpenCategories: Set<string> | null = null;

export function _resetDashboardShellCacheForTests() {
  cachedSidebarWidth = null;
  cachedSidebarOpen = null;
  cachedScrollTop = 0;
  cachedOpenCategories = null;
}

function getInitialSidebarWidth(): number {
  if (cachedSidebarWidth !== null) {
    return cachedSidebarWidth;
  }
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
          cachedSidebarWidth = parsed;
          return parsed;
        }
      }
    } catch {}
  }
  cachedSidebarWidth = DEFAULT_SIDEBAR_WIDTH;
  return DEFAULT_SIDEBAR_WIDTH;
}

function getInitialSidebarOpen(): boolean {
  if (cachedSidebarOpen !== null) {
    return cachedSidebarOpen;
  }
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY);
      if (saved !== null) {
        const isOpen = saved === "true";
        cachedSidebarOpen = isOpen;
        return isOpen;
      }
    } catch {}
  }
  cachedSidebarOpen = true;
  return true;
}

function getInitialOpenCategories(activeCategory?: string): Set<string> {
  if (cachedOpenCategories !== null) {
    if (activeCategory && !cachedOpenCategories.has(activeCategory)) {
      cachedOpenCategories.add(activeCategory);
    }
    return new Set(cachedOpenCategories);
  }
  const initial = new Set<string>();
  if (activeCategory) {
    initial.add(activeCategory);
  } else {
    initial.add(categories[0]);
  }
  cachedOpenCategories = new Set(initial);
  return initial;
}

const categoryIcons = {
  Formatters: Braces,
  Converters: ArrowLeftRight,
  Security: Shield,
  Generators: Sparkles,
  Text: Type,
  Design: Palette,
  Editors: FileCode2,
  Reference: BookOpen,
} as const;

export function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebarOpen);
  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [willCollapse, setWillCollapse] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveSlug = useMemo(() => {
    if (pathname?.startsWith("/tools/")) {
      const segment = pathname.split("/")[2];
      return segment || undefined;
    }
    return undefined;
  }, [pathname]);

  const activeTool = useMemo(
    () => (effectiveSlug ? getTool(effectiveSlug) : undefined),
    [effectiveSlug]
  );
  const activeCategory = activeTool?.category;

  const [openCategories, setOpenCategories] = useState<Set<string>>(() =>
    getInitialOpenCategories(activeCategory)
  );

  const widthRef = useRef(DEFAULT_SIDEBAR_WIDTH);
  widthRef.current = sidebarWidth;
  const isResizingRef = useRef(false);
  const preDragWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);
  const lastClientXRef = useRef(DEFAULT_SIDEBAR_WIDTH);

  const mainRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerWasOpen = useRef(false);

  const { favorites } = useFavorites();
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const pageTitle =
    pathname === "/favorites"
      ? "Favorite tools"
      : pathname === "/recent"
      ? "Recent tools"
      : pathname === "/recipes"
      ? "Saved recipes"
      : pathname === "/assistant"
      ? "AI assistant"
      : pathname === "/workbench"
      ? "Dual Workbench"
      : effectiveSlug
      ? (activeTool?.name ?? "Tool")
      : "All tools";

  useEffect(() => {
    if (activeCategory) {
      setOpenCategories((prev) => {
        if (prev.has(activeCategory)) return prev;
        const next = new Set(prev);
        next.add(activeCategory);
        cachedOpenCategories = next;
        return next;
      });
    }
  }, [activeCategory]);

  useEffect(() => {
    if (cachedScrollTop > 0) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = cachedScrollTop;
      }
      const raf = requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = cachedScrollTop;
        }
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [pathname]);

  function handleNavClick() {
    if (scrollRef.current) {
      cachedScrollTop = scrollRef.current.scrollTop;
    }
    setMobileOpen(false);
  }

  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
          setSidebarWidth(parsed);
          cachedSidebarWidth = parsed;
        }
      }
      const savedOpen = localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY);
      if (savedOpen !== null) {
        const isOpen = savedOpen === "true";
        setSidebarOpen(isOpen);
        cachedSidebarOpen = isOpen;
      }
    } catch {}
  }, []);

  useEffect(() => {
    const open = () => setCommandOpen(true);
    window.addEventListener("devhub:command", open);
    return () => window.removeEventListener("devhub:command", open);
  }, []);

  useEffect(() => {
    if (effectiveSlug) void recordHistory(effectiveSlug);
  }, [effectiveSlug]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobileViewport(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const hidden = isMobileViewport && !mobileOpen;
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    sidebar.inert = hidden;
    if (hidden) sidebar.setAttribute("aria-hidden", "true");
    else sidebar.removeAttribute("aria-hidden");
  }, [isMobileViewport, mobileOpen]);

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      drawerWasOpen.current = true;
      closeButtonRef.current?.focus();
    } else if (drawerWasOpen.current) {
      drawerWasOpen.current = false;
      menuButtonRef.current?.focus();
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!isResizing) return;
    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    return () => {
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
    };
  }, [isResizing]);

  function handleResizerPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (isMobileViewport) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    isResizingRef.current = true;
    setIsResizing(true);
    preDragWidthRef.current = sidebarWidth;
    lastClientXRef.current = sidebarWidth;
    setWillCollapse(false);
  }

  function handleResizerPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isResizingRef.current) return;
    const clientX =
      typeof event.clientX === "number" && !Number.isNaN(event.clientX)
        ? Math.round(event.clientX)
        : 0;
    lastClientXRef.current = clientX;
    if (clientX < SNAP_COLLAPSE_THRESHOLD) {
      setWillCollapse(true);
      const compressed = Math.max(0, clientX);
      widthRef.current = compressed;
      setSidebarWidth(compressed);
    } else {
      setWillCollapse(false);
      const newWidth = Math.min(
        Math.max(clientX, MIN_SIDEBAR_WIDTH),
        MAX_SIDEBAR_WIDTH
      );
      widthRef.current = newWidth;
      setSidebarWidth(newWidth);
    }
  }

  function handleResizerPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    isResizingRef.current = false;
    setIsResizing(false);
    const shouldCollapse = lastClientXRef.current < SNAP_COLLAPSE_THRESHOLD;
    setWillCollapse(false);
    if (shouldCollapse) {
      setSidebarOpen(false);
      cachedSidebarOpen = false;
      try {
        localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, "false");
      } catch {}
      const restored = Math.max(MIN_SIDEBAR_WIDTH, preDragWidthRef.current);
      setSidebarWidth(restored);
      widthRef.current = restored;
      cachedSidebarWidth = restored;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(restored));
      } catch {}
    } else {
      const finalWidth = Math.min(
        Math.max(widthRef.current, MIN_SIDEBAR_WIDTH),
        MAX_SIDEBAR_WIDTH
      );
      setSidebarWidth(finalWidth);
      widthRef.current = finalWidth;
      cachedSidebarWidth = finalWidth;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(finalWidth));
      } catch {}
    }
  }

  function handleResizerDoubleClick() {
    setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    widthRef.current = DEFAULT_SIDEBAR_WIDTH;
    cachedSidebarWidth = DEFAULT_SIDEBAR_WIDTH;
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(DEFAULT_SIDEBAR_WIDTH));
    } catch {}
  }

  function handleResizerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (sidebarWidth <= MIN_SIDEBAR_WIDTH) {
        setSidebarOpen(false);
        cachedSidebarOpen = false;
        try {
          localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, "false");
        } catch {}
      } else {
        const next = Math.max(MIN_SIDEBAR_WIDTH, sidebarWidth - SIDEBAR_STEP);
        setSidebarWidth(next);
        widthRef.current = next;
        cachedSidebarWidth = next;
        try {
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
        } catch {}
      }
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = Math.min(MAX_SIDEBAR_WIDTH, sidebarWidth + SIDEBAR_STEP);
      setSidebarWidth(next);
      widthRef.current = next;
      cachedSidebarWidth = next;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
    } else if (event.key === "Home") {
      event.preventDefault();
      setSidebarWidth(MIN_SIDEBAR_WIDTH);
      widthRef.current = MIN_SIDEBAR_WIDTH;
      cachedSidebarWidth = MIN_SIDEBAR_WIDTH;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(MIN_SIDEBAR_WIDTH));
      } catch {}
    } else if (event.key === "End") {
      event.preventDefault();
      setSidebarWidth(MAX_SIDEBAR_WIDTH);
      widthRef.current = MAX_SIDEBAR_WIDTH;
      cachedSidebarWidth = MAX_SIDEBAR_WIDTH;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(MAX_SIDEBAR_WIDTH));
      } catch {}
    }
  }

  function handleToggleSidebar() {
    setIsCollapsing(true);
    if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
    collapseTimeoutRef.current = setTimeout(() => {
      setIsCollapsing(false);
    }, 250);

    setSidebarOpen((value) => {
      const next = !value;
      cachedSidebarOpen = next;
      try {
        localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    cachedScrollTop = event.currentTarget.scrollTop;
  }

  return (
    <div
      className={`${styles.app} ${!sidebarOpen ? styles.noSidebar : ""}`}
      data-resizing={isResizing}
      data-collapsing={isCollapsing}
      suppressHydrationWarning
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${mobileOpen ? styles.open : ""}`}
        data-will-collapse={willCollapse}
      >
        <div className={styles.workspaceSwitcher}>
          <Image
            className={styles.workspaceLogo}
            src="/icon.png"
            alt=""
            width={22}
            height={22}
            aria-hidden
          />
          <div className={styles.workspaceIdentity}>
            <strong>DevHub</strong>
            <span>Toolkit</span>
          </div>
          <ChevronsUpDown size={15} />
          <Button
            ref={closeButtonRef}
            className={styles.drawerClose}
            variant="tertiary"
            size="medium"
            shape="square"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            prefix={<X size={17} />}
          />
        </div>
        <div ref={scrollRef} className={styles.scroll} onScroll={handleScroll}>
          <nav className={styles.primary} aria-label="Workspace navigation">
            <Link href="/dashboard" data-active={pathname === "/dashboard"} onClick={handleNavClick}>
              <span className={styles.primaryIcon}>
                <Grid2X2 size={18} />
              </span>
              All tools<small>{tools.length}</small>
            </Link>
            <Link href="/favorites" data-active={pathname === "/favorites"} onClick={handleNavClick}>
              <span className={styles.primaryIcon}>
                <Heart size={18} fill={pathname === "/favorites" ? "currentColor" : "none"} />
              </span>
              Favorites<small>{favorites.length}</small>
            </Link>
            <Link href="/workbench" data-active={pathname === "/workbench"} onClick={handleNavClick}>
              <span className={styles.primaryIcon}>
                <Columns2 size={18} />
              </span>
              Workbench
            </Link>
            <Link href="/recipes" data-active={pathname === "/recipes"} onClick={handleNavClick}>
              <span className={styles.primaryIcon}>
                <Workflow size={18} />
              </span>
              Recipes
            </Link>
            <Link href="/assistant" data-active={pathname === "/assistant"} onClick={handleNavClick}>
              <span className={styles.primaryIcon}>
                <Sparkles size={18} />
              </span>
              Assistant
            </Link>
            <Link href="/recent" data-active={pathname === "/recent"} onClick={handleNavClick}>
              <span className={styles.primaryIcon}>
                <Clock3 size={18} />
              </span>
              Recent
            </Link>
          </nav>
          <div className={styles.divider} />
          <div className={styles.sectionLabel}>Tool categories</div>
          {categories.map((category) => {
            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] ?? Shapes;
            const categoryTools = toolsByCategory[category] ?? [];
            const isOpen = openCategories.has(category);
            return (
              <details
                key={category}
                open={isOpen}
                onToggle={(event) => {
                  const nowOpen = event.currentTarget.open;
                  setOpenCategories((prev) => {
                    if (prev.has(category) === nowOpen) return prev;
                    const next = new Set(prev);
                    if (nowOpen) {
                      next.add(category);
                    } else {
                      next.delete(category);
                    }
                    cachedOpenCategories = next;
                    return next;
                  });
                }}
              >
                <summary>
                  <span className={styles.primaryIcon}>
                    <CategoryIcon size={18} />
                  </span>
                  <span>{category}</span>
                  <small>{categoryTools.length}</small>
                  <ChevronRight className={styles.chevron} size={15} />
                </summary>
                <div className={styles.toolChildren}>
                  {categoryTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        data-active={effectiveSlug === tool.slug}
                        onClick={handleNavClick}
                      >
                        <span className={styles.toolIcon}>
                          <Icon size={15} />
                        </span>
                        <span className={styles.toolName}>{tool.name}</span>
                        {tool.isNew && <span className={styles.newBadge}>New</span>}
                        {favoriteSet.has(tool.slug) && (
                          <Heart className={styles.favoriteMark} size={13} fill="currentColor" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
        <footer>
          <div className={styles.avatar}>D</div>
          <div>
            <strong>DevHub workspace</strong>
            <small>Local-first tools</small>
          </div>
          <ButtonLink
            href="https://github.com/abushaidislam/devhub-v2"
            variant="tertiary"
            size="small"
            shape="circle"
            aria-label="GitHub repository"
            prefix={<Github size={15} />}
          />
        </footer>
        <div
          role="separator"
          tabIndex={0}
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          aria-valuenow={sidebarWidth}
          aria-valuemin={MIN_SIDEBAR_WIDTH}
          aria-valuemax={MAX_SIDEBAR_WIDTH}
          className={styles.resizer}
          data-resizing={isResizing}
          data-will-collapse={willCollapse}
          onPointerDown={handleResizerPointerDown}
          onPointerMove={handleResizerPointerMove}
          onPointerUp={handleResizerPointerUp}
          onPointerCancel={handleResizerPointerUp}
          onDoubleClick={handleResizerDoubleClick}
          onKeyDown={handleResizerKeyDown}
        />
      </aside>
      {mobileOpen && (
        <button
          className={styles.backdrop}
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topLead}>
            <Button
              ref={menuButtonRef}
              className={styles.menu}
              variant="tertiary"
              size="medium"
              shape="square"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              prefix={<Menu size={18} />}
            />
            <Button
              className={styles.collapse}
              variant="tertiary"
              size="medium"
              shape="square"
              aria-label={sidebarOpen ? "Hide navigation" : "Show navigation"}
              onClick={handleToggleSidebar}
              prefix={sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
            />
            <Link href="/dashboard" className={styles.crumb}>
              DevHub <span>/</span> {pageTitle}
            </Link>
          </div>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <div className={styles.topActions}>
            <button
              ref={searchButtonRef}
              className={styles.search}
              type="button"
              aria-label="Search tools"
              onClick={() => setCommandOpen(true)}
            >
              <Search size={15} aria-hidden="true" />
              <span>Search tools…</span>
              <kbd>⌘K</kbd>
            </button>
            <ThemeToggle className={styles.themeToggle} size="small" />
            <ButtonLink href="/" className={styles.home} variant="tertiary" size="small">
              Landing page
            </ButtonLink>
          </div>
        </header>
        <main id="main-content" ref={mainRef} tabIndex={-1} className={styles.content}>
          {children}
        </main>
      </div>
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        returnFocusRef={searchButtonRef}
      />
    </div>
  );
}
