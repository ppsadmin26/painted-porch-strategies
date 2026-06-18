/**
 * Shared JSX walker for body-typography scripts.
 *
 * Tracks a tag-name stack as it scans a .tsx file so callers can ask:
 * "is this <p>/<li>/<blockquote> inside an exempt ancestor (Card, Alert,
 * Dialog, blockquote, ...) or is it standard section body text?"
 *
 * Standard section body text MUST use `text-body`. Exempt elements may use
 * any token (text-lead / text-body-sm / text-caption / text-pullquote) — the
 * author is signaling a deliberate non-standard size.
 */

const VOID_TAGS = new Set([
  "img","br","hr","input","meta","link","source","area","base","col","embed","param","track","wbr",
]);

// Ancestors that exempt a body element from the "must be text-body" rule.
// Anything inside a card / callout / tooltip / dialog / list-item etc. is
// considered a stylized container, not standard section flow.
export const EXEMPT_ANCESTORS = new Set([
  // HTML
  "blockquote","table","thead","tbody","tfoot","tr","td","th","caption","figcaption","aside","figure","details","summary","dl","dt","dd",
  // shadcn / radix primitives
  "Card","CardHeader","CardContent","CardFooter","CardTitle","CardDescription",
  "Alert","AlertTitle","AlertDescription",
  "Badge",
  "Tooltip","TooltipContent","TooltipTrigger","TooltipProvider",
  "HoverCard","HoverCardContent","HoverCardTrigger",
  "Popover","PopoverContent","PopoverTrigger",
  "Dialog","DialogContent","DialogHeader","DialogFooter","DialogTitle","DialogDescription","DialogTrigger",
  "AlertDialog","AlertDialogContent","AlertDialogHeader","AlertDialogFooter","AlertDialogTitle","AlertDialogDescription",
  "Sheet","SheetContent","SheetHeader","SheetFooter","SheetTitle","SheetDescription","SheetTrigger",
  "Drawer","DrawerContent","DrawerHeader","DrawerFooter","DrawerTitle","DrawerDescription","DrawerTrigger",
  "Toast","ToastTitle","ToastDescription","ToastAction",
  "Accordion","AccordionItem","AccordionTrigger","AccordionContent",
  "Tabs","TabsList","TabsTrigger","TabsContent",
  "DropdownMenu","DropdownMenuContent","DropdownMenuItem","DropdownMenuLabel","DropdownMenuGroup","DropdownMenuSub","DropdownMenuSubContent",
  "ContextMenu","ContextMenuContent","ContextMenuItem",
  "Menubar","MenubarContent","MenubarItem",
  "NavigationMenu","NavigationMenuContent","NavigationMenuItem","NavigationMenuLink",
  "Command","CommandList","CommandItem","CommandGroup","CommandEmpty",
  "Select","SelectContent","SelectItem","SelectTrigger","SelectValue",
  "Form","FormItem","FormLabel","FormDescription","FormMessage","FormControl","FormField",
  "RadioGroup","RadioGroupItem","Checkbox","Switch","Toggle","ToggleGroup",
  "ScrollArea","Separator","Skeleton","Progress","Slider","AspectRatio","Avatar","AvatarImage","AvatarFallback",
  "Collapsible","CollapsibleContent","CollapsibleTrigger",
  "Resizable","ResizableHandle","ResizablePanel","ResizablePanelGroup",
  // Project-specific stylized wrappers
  "Eyebrow","TierBadge","SourcedTooltip","StatCard","StatMarquee","ClientLogoMarquee","ParallaxCTA","HandwrittenUnderline","FloatingThoughtBubbles","SoundMeter","PartnershipPromise",
]);

const BODY_TAGS = new Set(["p","li","blockquote"]);
const TAG_RE = /<(\/)?([A-Za-z][\w.]*)/g;

/** Read JSX opening-tag attribute blob, brace/quote/template aware. */
export function readAttrs(src, start) {
  let i = start;
  let braceDepth = 0;
  const len = src.length;
  while (i < len) {
    const c = src[i];
    if (braceDepth === 0) {
      if (c === ">") return { end: i, selfClose: src[i - 1] === "/" };
      if (c === "{") { braceDepth++; i++; continue; }
      if (c === '"' || c === "'") {
        i++;
        while (i < len && src[i] !== c) i += src[i] === "\\" ? 2 : 1;
        i++; continue;
      }
      if (c === "`") {
        i++;
        while (i < len) {
          if (src[i] === "\\") { i += 2; continue; }
          if (src[i] === "`") { i++; break; }
          if (src[i] === "$" && src[i + 1] === "{") { braceDepth++; i += 2; break; }
          i++;
        }
        continue;
      }
      i++; continue;
    }
    if (c === "{") { braceDepth++; i++; continue; }
    if (c === "}") { braceDepth--; i++; continue; }
    if (c === '"' || c === "'") {
      i++;
      while (i < len && src[i] !== c) i += src[i] === "\\" ? 2 : 1;
      i++; continue;
    }
    if (c === "`") {
      i++;
      while (i < len) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === "`") { i++; break; }
        if (src[i] === "$" && src[i + 1] === "{") { braceDepth++; i += 2; break; }
        i++;
      }
      continue;
    }
    i++;
  }
  return null;
}

/**
 * Walk all JSX tags in `src`, maintaining a tag-name stack. Yields one entry
 * per <p>/<li>/<blockquote> opening tag with its current ancestor stack so
 * the caller can decide if it's "section body" or stylized.
 */
export function* walkBodyElements(src) {
  const stack = [];
  TAG_RE.lastIndex = 0;
  let m;
  while ((m = TAG_RE.exec(src)) !== null) {
    const isClose = m[1] === "/";
    const tag = m[2];
    if (isClose) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i] === tag) { stack.length = i; break; }
      }
      continue;
    }
    const attrStart = m.index + 1 + tag.length;
    // If next char isn't whitespace or `>` or `/`, this isn't a real tag (e.g. `a<b`).
    const nextCh = src[attrStart];
    if (nextCh !== " " && nextCh !== "\t" && nextCh !== "\n" && nextCh !== "\r" && nextCh !== ">" && nextCh !== "/") {
      continue;
    }
    const closed = readAttrs(src, attrStart);
    if (!closed) continue;
    const rawAttrs = src.slice(attrStart, closed.end - (closed.selfClose ? 1 : 0));

    if (BODY_TAGS.has(tag)) {
      const line = src.slice(0, m.index).split("\n").length;
      const exemptAncestor = stack.find((t) => EXEMPT_ANCESTORS.has(t));
      yield {
        tag,
        line,
        attrs: rawAttrs,
        attrStart,
        attrEnd: closed.end,
        selfClose: closed.selfClose,
        openStart: m.index,
        openEnd: closed.end + 1,
        stack: stack.slice(),
        exempt: Boolean(exemptAncestor) || tag === "blockquote",
        exemptReason: exemptAncestor ?? (tag === "blockquote" ? "blockquote" : null),
      };
    }

    if (!closed.selfClose && !VOID_TAGS.has(tag)) {
      stack.push(tag);
    }
    TAG_RE.lastIndex = closed.end + 1;
  }
}

export const CLASSNAME_RE = /className=(?:"([^"]*)"|`([^`]*)`|\{([\s\S]*)\})/;
export const RAW_SIZE = /\btext-(?:xs|sm|base|lg|xl|2xl|3xl)\b/;
export const BODY_TOKEN_RE = /\btext-(?:lead|body|body-sm|caption|pullquote)\b/g;
export const BODY_TOKENS = ["text-lead","text-body","text-body-sm","text-caption","text-pullquote"];

/** True when the attr blob declares an explicit override (`data-body-allow`). */
export function hasBodyAllowOverride(attrs) {
  return /\bdata-body-allow\b/.test(attrs);
}
