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
  activeSlug,
}: {
  children: ReactNode;
  activeSlug?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [willCollapse, setWillCollapse] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const widthRef = useRef(DEFAULT_SIDEBAR_WIDTH);
  widthRef.current = sidebarWidth;
  const isResizingRef = useRef(false);
  const preDragWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);
  const lastClientXRef = useRef(DEFAULT_SIDEBAR_WIDTH);

  const mainRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerWasOpen = useRef(false);

  const { favorites } = useFavorites();
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const activeTool = useMemo(() => (activeSlug ? getTool(activeSlug) : undefined), [activeSlug]);
  const activeCategory = activeTool?.category;

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
      : activeSlug
      ? (activeTool?.name ?? "Tool")
      : "All tools";

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
          setSidebarWidth(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const open = () => setCommandOpen(true);
    window.addEventListener("devhub:command", open);
    return () => window.removeEventListener("devhub:command", open);
  }, []);

  useEffect(() => {
    if (activeSlug) void recordHistory(activeSlug);
  }, [activeSlug]);

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
      const restored = Math.max(MIN_SIDEBAR_WIDTH, preDragWidthRef.current);
      setSidebarWidth(restored);
      widthRef.current = restored;
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
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(finalWidth));
      } catch {}
    }
  }

  function handleResizerDoubleClick() {
    setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    widthRef.current = DEFAULT_SIDEBAR_WIDTH;
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(DEFAULT_SIDEBAR_WIDTH));
    } catch {}
  }

  function handleResizerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (sidebarWidth <= MIN_SIDEBAR_WIDTH) {
        setSidebarOpen(false);
      } else {
        const next = Math.max(MIN_SIDEBAR_WIDTH, sidebarWidth - SIDEBAR_STEP);
        setSidebarWidth(next);
        widthRef.current = next;
        try {
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
        } catch {}
      }
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = Math.min(MAX_SIDEBAR_WIDTH, sidebarWidth + SIDEBAR_STEP);
      setSidebarWidth(next);
      widthRef.current = next;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
    } else if (event.key === "Home") {
      event.preventDefault();
      setSidebarWidth(MIN_SIDEBAR_WIDTH);
      widthRef.current = MIN_SIDEBAR_WIDTH;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(MIN_SIDEBAR_WIDTH));
      } catch {}
    } else if (event.key === "End") {
      event.preventDefault();
      setSidebarWidth(MAX_SIDEBAR_WIDTH);
      widthRef.current = MAX_SIDEBAR_WIDTH;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(MAX_SIDEBAR_WIDTH));
      } catch {}
    }
  }

  return (
    <div
      className={`${styles.app} ${!sidebarOpen ? styles.noSidebar : ""}`}
      data-resizing={isResizing}
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
            title="Close navigation"
            onClick={() => setMobileOpen(false)}
            prefix={<X size={17} />}
          />
        </div>
        <div className={styles.scroll}>
          <nav className={styles.primary} aria-label="Workspace navigation">
            <Link href="/dashboard" data-active={pathname === "/dashboard"}>
              <span className={styles.primaryIcon}>
                <Grid2X2 size={18} />
              </span>
              All tools<small>{tools.length}</small>
            </Link>
            <Link href="/favorites" data-active={pathname === "/favorites"}>
              <span className={styles.primaryIcon}>
                <Heart size={18} fill={pathname === "/favorites" ? "currentColor" : "none"} />
              </span>
              Favorites<small>{favorites.length}</small>
            </Link>
            <Link href="/workbench" data-active={pathname === "/workbench"} onClick={() => setMobileOpen(false)}>
              <span className={styles.primaryIcon}>
                <Columns2 size={18} />
              </span>
              Workbench
            </Link>
            <Link href="/recipes" data-active={pathname === "/recipes"} onClick={() => setMobileOpen(false)}>
              <span className={styles.primaryIcon}>
                <Workflow size={18} />
              </span>
              Recipes
            </Link>
            <Link href="/assistant" data-active={pathname === "/assistant"} onClick={() => setMobileOpen(false)}>
              <span className={styles.primaryIcon}>
                <Sparkles size={18} />
              </span>
              Assistant
            </Link>
            <Link href="/recent" data-active={pathname === "/recent"} onClick={() => setMobileOpen(false)}>
              <span className={styles.primaryIcon}>
                <Clock3 size={18} />
              </span>
              Recent
            </Link>
          </nav>
          <div className={styles.divider} />
          <div className={styles.sectionLabel}>Tool categories</div>
          {categories.map((category, index) => {
            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] ?? Shapes;
            const categoryTools = toolsByCategory[category] ?? [];
            return (
              <details key={category} open={activeCategory ? activeCategory === category : index === 0}>
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
                        data-active={activeSlug === tool.slug}
                        onClick={() => setMobileOpen(false)}
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
              title="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              prefix={<Menu size={18} />}
            />
            <Button
              className={styles.collapse}
              variant="tertiary"
              size="medium"
              shape="square"
              aria-label={sidebarOpen ? "Hide navigation" : "Show navigation"}
              title={sidebarOpen ? "Hide navigation" : "Show navigation"}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((value) => !value)}
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
              title="Search tools (⌘K)"
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
