export const insertStyles = (styles: string, id: string) => {
  const head = document.head;

  const current = head.querySelector(`#${id}`);

  if (current) return;

  const style = document.createElement("style");
  style.setAttribute("id", id);
  style.appendChild(document.createTextNode(styles));

  const existing = head.querySelector("style, link");

  if (existing) head.insertBefore(style, existing);
  else head.appendChild(style);
};

export const getStyle = (
  el: Element | undefined | null,
  rule: keyof CSSStyleDeclaration
) => {
  if (!el) return "";

  const val = window?.getComputedStyle(el)[rule];

  return typeof val === "string" ? val : "";
};
