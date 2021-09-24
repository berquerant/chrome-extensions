export function Write(text: string): void {
  const area = document.createElement("textarea");
  document.body.appendChild(area);
  area.value = text;
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}
