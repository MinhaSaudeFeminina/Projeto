import { useEffect, useRef } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  id: string;
  /** Id do elemento que rotula o editor; `label htmlFor` não associa contenteditable. */
  labelledBy: string;
  value: string;
  disabled?: boolean;
  onChange: (html: string) => void;
};

type ToolbarKey = "bold" | "italic" | "heading2" | "heading3" | "bulletList" | "orderedList";

type ToolbarButton = {
  key: ToolbarKey;
  label: string;
  icon: typeof Bold;
  run: (editor: Editor) => void;
};

/** O documento vazio do TipTap ainda produz markup; normalizamos para "". */
function normalizeHtml(editor: Editor): string {
  return editor.isEmpty ? "" : editor.getHTML();
}

const toolbarButtons: ToolbarButton[] = [
  { key: "bold", label: "Negrito", icon: Bold, run: (editor) => editor.chain().focus().toggleBold().run() },
  { key: "italic", label: "Itálico", icon: Italic, run: (editor) => editor.chain().focus().toggleItalic().run() },
  { key: "heading2", label: "Título de seção", icon: Heading2, run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { key: "heading3", label: "Subtítulo", icon: Heading3, run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  { key: "bulletList", label: "Lista com marcadores", icon: List, run: (editor) => editor.chain().focus().toggleBulletList().run() },
  { key: "orderedList", label: "Lista numerada", icon: ListOrdered, run: (editor) => editor.chain().focus().toggleOrderedList().run() },
];

/**
 * Impede que o clique tire o foco do editor: sem isso a seleção é perdida e a
 * primeira tecla digitada logo após usar a barra se perde no meio do refoco.
 */
function keepEditorFocus(event: { preventDefault: () => void }): void {
  event.preventDefault();
}

const toolbarButtonClass =
  "rounded p-2 text-muted-foreground hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

/**
 * Editor de texto rico do conteúdo educativo. O valor trafega como HTML, com o
 * mesmo conjunto de tags aceito pelo sanitizador do backend.
 */
export function RichTextEditor({ id, labelledBy, value, disabled = false, onChange }: RichTextEditorProps) {
  /** Último HTML emitido daqui; o pai apenas o devolve como `value`. */
  const lastEmittedRef = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Recursos sem uso editorial no painel, removidos para manter o HTML previsível.
        codeBlock: false,
        code: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: false },
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: current }) => {
      const html = normalizeHtml(current);
      lastEmittedRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": labelledBy,
        class: cn(
          "min-h-[18rem] w-full rounded-b-md bg-background px-3 py-2 text-sm outline-none",
          "[&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold",
          "[&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold",
          "[&_p]:mt-2 [&_ul]:mt-2 [&_ol]:mt-2 [&_li]:ml-6",
          "[&_ul]:list-disc [&_ol]:list-decimal",
          "[&_a]:text-primary [&_a]:underline",
        ),
      },
    },
  });

  /**
   * No TipTap 3 o `useEditor` não re-renderiza a cada transação: sem esta
   * assinatura os botões da barra não refletiriam a formatação sob o cursor.
   */
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      heading2: current?.isActive("heading", { level: 2 }) ?? false,
      heading3: current?.isActive("heading", { level: 3 }) ?? false,
      bulletList: current?.isActive("bulletList") ?? false,
      orderedList: current?.isActive("orderedList") ?? false,
      link: current?.isActive("link") ?? false,
      canUndo: current?.can().undo() ?? false,
      canRedo: current?.can().redo() ?? false,
    }),
  });

  /**
   * Aplica conteúdo vindo de fora (ex.: rascunho carregado da API). O `value`
   * que o próprio editor acabou de emitir é ignorado: reaplicá-lo reescreveria
   * o documento e derrubaria o cursor a cada tecla.
   */
  useEffect(() => {
    if (!editor || editor.isDestroyed || value === lastEmittedRef.current) {
      return;
    }

    if (value !== normalizeHtml(editor)) {
      lastEmittedRef.current = value;
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor || !toolbarState) {
    return null;
  }

  function applyLink(current: Editor) {
    const previous = current.getAttributes("link").href as string | undefined;
    const href = window.prompt("Endereço do link", previous ?? "https://");

    if (href === null) {
      return;
    }

    if (href === "") {
      current.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    current.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  return (
    <div className={cn("rounded-md border", disabled && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-1" role="toolbar" aria-label="Formatação do conteúdo">
        {toolbarButtons.map((button) => (
          <button
            key={button.key}
            type="button"
            title={button.label}
            aria-label={button.label}
            aria-pressed={toolbarState[button.key]}
            disabled={disabled}
            onMouseDown={keepEditorFocus}
            onClick={() => button.run(editor)}
            className={cn(toolbarButtonClass, toolbarState[button.key] && "bg-background text-primary")}
          >
            <button.icon className="h-4 w-4" />
          </button>
        ))}

        <span className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          title="Inserir link"
          aria-label="Inserir link"
          aria-pressed={toolbarState.link}
          disabled={disabled}
          onMouseDown={keepEditorFocus}
          onClick={() => applyLink(editor)}
          className={cn(toolbarButtonClass, toolbarState.link && "bg-background text-primary")}
        >
          <Link2 className="h-4 w-4" />
        </button>

        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" title="Desfazer" aria-label="Desfazer" onMouseDown={keepEditorFocus} disabled={disabled || !toolbarState.canUndo} onClick={() => editor.chain().focus().undo().run()} className={toolbarButtonClass}>
          <Undo2 className="h-4 w-4" />
        </button>
        <button type="button" title="Refazer" aria-label="Refazer" onMouseDown={keepEditorFocus} disabled={disabled || !toolbarState.canRedo} onClick={() => editor.chain().focus().redo().run()} className={toolbarButtonClass}>
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
