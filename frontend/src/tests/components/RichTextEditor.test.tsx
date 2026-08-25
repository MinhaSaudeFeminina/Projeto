import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { RichTextEditor } from "@/components/content/RichTextEditor";

function EditorHarness({ initial = "", disabled = false }: { initial?: string; disabled?: boolean }) {
  const [value, setValue] = useState(initial);

  return (
    <>
      <span id="body-label">Conteúdo educativo</span>
      <RichTextEditor id="body" labelledBy="body-label" disabled={disabled} value={value} onChange={setValue} />
      <output data-testid="html">{value}</output>
    </>
  );
}

function typeInBody(text: string) {
  const editor = screen.getByLabelText("Conteúdo educativo");
  const paragraph = editor.querySelector("p");

  if (paragraph) {
    paragraph.textContent = text;
  }

  fireEvent.input(editor);

  return editor;
}

test("wraps typed text in a paragraph", async () => {
  render(<EditorHarness />);
  typeInBody("Orientações sobre o ciclo.");

  await waitFor(() => expect(screen.getByTestId("html")).toHaveTextContent("<p>Orientações sobre o ciclo.</p>"));
});

test("marks the bold control as active when it is toggled on", async () => {
  render(<EditorHarness />);
  typeInBody("Procure a UBS.");
  await waitFor(() => expect(screen.getByTestId("html")).toHaveTextContent("<p>Procure a UBS.</p>"));

  expect(screen.getByLabelText("Negrito")).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(screen.getByLabelText("Negrito"));

  await waitFor(() => expect(screen.getByLabelText("Negrito")).toHaveAttribute("aria-pressed", "true"));
});

test("preserves bold markup that arrives from the API", async () => {
  render(<EditorHarness initial="<p>Procure a <strong>UBS</strong>.</p>" />);

  await waitFor(() => expect(screen.getByLabelText("Conteúdo educativo").querySelector("strong")).not.toBeNull());
  expect(screen.getByTestId("html").textContent).toContain("<strong>UBS</strong>");
});

test("turns the current block into a section heading", async () => {
  render(<EditorHarness />);
  typeInBody("Sinais de alerta");
  await waitFor(() => expect(screen.getByTestId("html")).toHaveTextContent("<p>Sinais de alerta</p>"));

  fireEvent.click(screen.getByLabelText("Título de seção"));

  await waitFor(() => expect(screen.getByTestId("html")).toHaveTextContent("<h2>Sinais de alerta</h2>"));
});

test("renders content loaded from the API", async () => {
  render(<EditorHarness initial="<h2>Climatério</h2><p>Orientações educativas.</p>" />);

  await waitFor(() => expect(screen.getByLabelText("Conteúdo educativo")).toHaveTextContent("Climatério"));
  expect(screen.getByLabelText("Conteúdo educativo")).toHaveTextContent("Orientações educativas.");
});

test("blocks editing when the content is no longer a draft", async () => {
  render(<EditorHarness initial="<p>Conteúdo aprovado.</p>" disabled />);

  await waitFor(() => expect(screen.getByLabelText("Conteúdo educativo")).toHaveAttribute("contenteditable", "false"));
  expect(screen.getByLabelText("Negrito")).toBeDisabled();
});

test("does not reset the document when the parent echoes the value back", async () => {
  // O pai é controlado: cada edição volta como `value`. Reaplicar esse eco
  // reescreveria o documento e derrubaria o cursor a cada tecla.
  const setContentCalls: string[] = [];

  function EchoParent() {
    const [value, setValue] = useState("");
    return (
      <>
        <span id="body-label">Conteúdo educativo</span>
        <RichTextEditor id="body" labelledBy="body-label" value={value} onChange={(html) => { setContentCalls.push(html); setValue(html); }} />
        <output data-testid="html">{value}</output>
      </>
    );
  }

  render(<EchoParent />);
  typeInBody("Versão completa do conteúdo.");
  await waitFor(() => expect(screen.getByTestId("html")).toHaveTextContent("<p>Versão completa do conteúdo.</p>"));

  const emissionsAfterTyping = setContentCalls.length;
  await new Promise((resolve) => setTimeout(resolve, 50));

  // O eco não pode gerar novas emissões: isso indicaria reescrita em laço.
  expect(setContentCalls.length).toBe(emissionsAfterTyping);
  expect(screen.getByLabelText("Conteúdo educativo")).toHaveTextContent("Versão completa do conteúdo.");
});

test("loads content that arrives from the API after mounting", async () => {
  function LateLoadParent() {
    const [value, setValue] = useState("");
    return (
      <>
        <span id="body-label">Conteúdo educativo</span>
        <RichTextEditor id="body" labelledBy="body-label" value={value} onChange={setValue} />
        <button type="button" onClick={() => setValue("<h2>Climatério</h2><p>Orientações.</p>")}>carregar</button>
      </>
    );
  }

  render(<LateLoadParent />);
  expect(screen.getByLabelText("Conteúdo educativo")).not.toHaveTextContent("Climatério");

  fireEvent.click(screen.getByRole("button", { name: "carregar" }));

  await waitFor(() => expect(screen.getByLabelText("Conteúdo educativo")).toHaveTextContent("Climatério"));
  expect(screen.getByLabelText("Conteúdo educativo")).toHaveTextContent("Orientações.");
});

test("does not let toolbar buttons steal focus from the editor", async () => {
  render(<EditorHarness />);
  typeInBody("Procure a UBS.");
  // Desfazer só fica habilitado depois de uma edição.
  await waitFor(() => expect(screen.getByLabelText("Desfazer")).toBeEnabled());

  // O mousedown precisa ser cancelado: é isso que mantém foco e seleção no
  // editor ao clicar na barra, em vez de perder a primeira tecla seguinte.
  for (const label of ["Negrito", "Lista com marcadores", "Desfazer", "Inserir link"]) {
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    screen.getByLabelText(label).dispatchEvent(event);
    expect(event.defaultPrevented, `${label} deveria cancelar o mousedown`).toBe(true);
  }
});
