export class Document {

    // --- Attributs ---

  PMID: number;
  title: string;
  abstract: string;
  references: Array<number>;


    // --- Constructeur ---

  constructor() {
    this.PMID = 0,
    this.title = "",
    this.abstract = "",
    this.references = []
  }


    // --- Méthodes ---

  toXML(): string {
    return "<document>" +
      `<id>${this.escapeXML(`${this.PMID}`)}</id>` +
      `<title>${this.escapeXML(this.title)}</title>` +
      `<abstract>${this.escapeXML(this.abstract)}</abstract>` +
      "<refs>" +
        this.references.map((v) => `<ref>${this.escapeXML(`${v}`)}</ref>`).join("") +
      "</refs>" +
    "</document>\n"
  }

  toJSON(): string {
    return JSON.stringify({
      id: this.PMID,
      title: this.title,
      abstract: this.abstract,
      refs: this.references
    }) + "," + "\n";
  }

  toResumeTXT(): string {
    return `${this.PMID}/${this.title} ${this.abstract}\n`;
  }

  toReferencesTXT(): string {
    return `${this.PMID}/${this.references.join("/")}\n`;
  }

    // --- Outil ---

  private escapeXML(input: string): string {
    return input.replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

}
