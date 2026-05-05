import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Image as ImageIcon, Youtube as YoutubeIcon,
  Link as LinkIcon, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, Undo, Redo, Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

interface TiptapEditorProps {
  content: any;
  onChange: (json: any) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing your post..." }),
      Youtube.configure({ width: 640, height: 360 }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    const ext = file.name.split(".").pop();
    const path = `posts/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("blog-images")
      .upload(path, file);
    if (error) return;
    const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
    editor.chain().focus().setImage({ src: data.publicUrl }).run();
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter YouTube URL:");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  }, [editor]);

  // Sync content when prop changes (e.g. async post load)
  useEffect(() => {
    if (editor && content && !editor.isDestroyed) {
      const currentContent = editor.getJSON();
      // Only update if content actually differs (avoid cursor reset)
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  if (!editor) return null;

  const ToolbarButton = ({ onClick, active, children, title }: any) => (
    <Toggle
      size="sm"
      pressed={active}
      onPressedChange={() => onClick()}
      aria-label={title}
      className="h-8 w-8 p-0 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
    >
      {children}
    </Toggle>
  );

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 p-2 border-b border-input bg-muted/50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-8 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-8 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-8 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-8 bg-border mx-1" />

        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Insert Link">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            active={false}
            title="Remove Link"
          >
            <Unlink className="h-4 w-4" />
          </ToolbarButton>
        )}
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          active={false}
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addYoutube} active={false} title="Insert YouTube Video">
          <YoutubeIcon className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-8 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Area */}
      <EditorContent
        editor={editor}
        className="prose prose-lg max-w-none p-6 min-h-[400px] focus:outline-none
          [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]
          [&_.ProseMirror_p]:mb-4 [&_.ProseMirror_p]:leading-relaxed
          [&_.ProseMirror_h1]:mt-8 [&_.ProseMirror_h1]:mb-4
          [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-3
          [&_.ProseMirror_h3]:mt-5 [&_.ProseMirror_h3]:mb-2
          [&_.ProseMirror_ul]:my-4 [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:list-disc
          [&_.ProseMirror_ol]:my-4 [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:list-decimal
          [&_.ProseMirror_li]:mb-1
          [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-primary/30 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:my-4 [&_.ProseMirror_blockquote]:italic
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:max-w-full
          [&_.ProseMirror_iframe]:rounded-lg [&_.ProseMirror_iframe]:max-w-full
          [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:decoration-primary/50 [&_.ProseMirror_a]:underline-offset-2 [&_.ProseMirror_a]:cursor-pointer"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
